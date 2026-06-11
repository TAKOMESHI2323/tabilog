import { useEffect, useMemo, useState } from 'react'
import { MapContainer, GeoJSON } from 'react-leaflet'
import { feature } from 'topojson-client'
import { countryJa } from '../countries.js'
import { PREFECTURES } from '../prefectures.js'

const VISITED_STYLE = {
  fillColor: '#e76f51',
  fillOpacity: 0.85,
  color: '#9c4530',
  weight: 0.8,
}
const UNVISITED_STYLE = {
  fillColor: '#dfd8c8',
  fillOpacity: 0.6,
  color: '#b6ad99',
  weight: 0.6,
}

export default function CoverageMap({ trips }) {
  const [mode, setMode] = useState('japan') // 'japan' | 'world'
  const [geo, setGeo] = useState({ japan: null, world: null })

  useEffect(() => {
    const base = import.meta.env.BASE_URL
    Promise.all([
      fetch(`${base}data/japan.topojson`).then((r) => r.json()),
      fetch(`${base}data/world-110m.json`).then((r) => r.json()),
    ]).then(([jp, world]) => {
      setGeo({
        japan: feature(jp, jp.objects.japan),
        world: feature(world, world.objects.countries),
      })
    })
  }, [])

  // 訪問済みの名称 → 回数
  const counts = useMemo(() => {
    const pref = new Map()
    const country = new Map()
    for (const t of trips) {
      if (t.country) country.set(t.country, (country.get(t.country) ?? 0) + 1)
      if (t.country === 'Japan' && t.prefecture)
        pref.set(t.prefecture, (pref.get(t.prefecture) ?? 0) + 1)
    }
    return { pref, country }
  }, [trips])

  const isJapan = mode === 'japan'
  const data = isJapan ? geo.japan : geo.world
  const nameOf = (f) => (isJapan ? f.properties.nam_ja : f.properties.name)
  const visitMap = isJapan ? counts.pref : counts.country

  const visitedCount = isJapan
    ? PREFECTURES.filter((p) => counts.pref.has(p)).length
    : counts.country.size
  const total = isJapan ? 47 : 177

  return (
    <div className="coverage">
      <div className="list-head">
        <h2>制覇マップ</h2>
        <div className="toggle">
          <button className={`tab ${isJapan ? 'active' : ''}`} onClick={() => setMode('japan')}>
            🗾 日本
          </button>
          <button className={`tab ${!isJapan ? 'active' : ''}`} onClick={() => setMode('world')}>
            🌏 世界
          </button>
        </div>
      </div>

      <div className="coverage-score card">
        <span className="score-big">{visitedCount}</span>
        <span className="score-total">/ {total}</span>
        <span className="score-label">{isJapan ? '都道府県を制覇' : 'カ国・地域を制覇'}</span>
        <div className="score-bar">
          <div className="score-fill" style={{ width: `${(visitedCount / total) * 100}%` }} />
        </div>
      </div>

      <div className="big-map card plain-bg">
        {data ? (
          <MapContainer
            key={mode}
            center={isJapan ? [37.5, 137.0] : [25, 10]}
            zoom={isJapan ? 5 : 2}
            minZoom={isJapan ? 4 : 1}
            style={{ height: '100%', background: '#cfe3e8' }}
            attributionControl={false}
          >
            <GeoJSON
              // 訪問状況が変わったら塗り直すために key を変える
              key={`${mode}-${visitMap.size}-${trips.length}`}
              data={data}
              style={(f) => (visitMap.has(nameOf(f)) ? VISITED_STYLE : UNVISITED_STYLE)}
              onEachFeature={(f, layer) => {
                const name = nameOf(f)
                const label = isJapan ? name : countryJa(name)
                const n = visitMap.get(name)
                layer.bindTooltip(n ? `${label}（${n}回）` : label, { sticky: true })
              }}
            />
          </MapContainer>
        ) : (
          <p className="muted center" style={{ paddingTop: '3rem' }}>
            地図データを読み込み中…
          </p>
        )}
      </div>
    </div>
  )
}

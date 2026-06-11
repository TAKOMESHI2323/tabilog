import { useEffect, useRef, useState } from 'react'
import { loadTrips, saveTrips, exportTrips, parseImported } from './storage.js'
import TripList from './components/TripList.jsx'
import TripForm from './components/TripForm.jsx'
import MapView from './components/MapView.jsx'
import CoverageMap from './components/CoverageMap.jsx'
import Stats from './components/Stats.jsx'

const TABS = [
  { id: 'diary', label: '旅日記', icon: '📖' },
  { id: 'map', label: '地図', icon: '📍' },
  { id: 'coverage', label: '制覇マップ', icon: '🗾' },
  { id: 'stats', label: '統計', icon: '📊' },
]

export default function App() {
  const [trips, setTrips] = useState(loadTrips)
  const [tab, setTab] = useState('diary')
  const [editing, setEditing] = useState(null) // null=閉 / 'new' / trip object
  const importRef = useRef(null)

  useEffect(() => {
    saveTrips(trips)
  }, [trips])

  const upsertTrip = (trip) => {
    setTrips((prev) => {
      const i = prev.findIndex((t) => t.id === trip.id)
      if (i === -1) return [trip, ...prev]
      const next = [...prev]
      next[i] = trip
      return next
    })
    setEditing(null)
    setTab('diary')
  }

  const deleteTrip = (id) => {
    if (!confirm('この旅の記録を削除しますか？')) return
    setTrips((prev) => prev.filter((t) => t.id !== id))
  }

  const onImportFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const imported = parseImported(await file.text())
      if (
        !confirm(
          `${imported.length} 件の記録を読み込みます。現在の記録は置き換えられます。よろしいですか？`
        )
      )
        return
      setTrips(imported)
    } catch {
      alert('ファイルを読み込めませんでした。旅ログのエクスポートファイル（JSON）を選んでください。')
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <h1>
              旅ログ<span className="brand-stamp">TABI LOG</span>
            </h1>
            <p className="tagline">あなたの旅を、ぜんぶこの一冊に。</p>
          </div>
          <div className="header-actions">
            <button className="btn ghost" onClick={() => exportTrips(trips)}>
              ⬇ エクスポート
            </button>
            <button className="btn ghost" onClick={() => importRef.current?.click()}>
              ⬆ インポート
            </button>
            <input
              ref={importRef}
              type="file"
              accept="application/json"
              hidden
              onChange={onImportFile}
            />
          </div>
        </div>
        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => {
                setTab(t.id)
                setEditing(null)
              }}
            >
              <span className="tab-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="main">
        {tab === 'diary' && !editing && (
          <TripList
            trips={trips}
            onAdd={() => setEditing('new')}
            onEdit={(t) => setEditing(t)}
            onDelete={deleteTrip}
          />
        )}
        {tab === 'diary' && editing && (
          <TripForm
            trip={editing === 'new' ? null : editing}
            onSave={upsertTrip}
            onCancel={() => setEditing(null)}
          />
        )}
        {tab === 'map' && <MapView trips={trips} />}
        {tab === 'coverage' && <CoverageMap trips={trips} />}
        {tab === 'stats' && <Stats trips={trips} />}
      </main>

      <footer className="footer">
        データはこのブラウザの中だけに保存されます。バックアップにはエクスポートをご利用ください。
      </footer>
    </div>
  )
}

import { useMemo } from 'react'
import { countryJa } from '../countries.js'

function tripDays(t) {
  if (t.startDate && t.endDate) {
    const d =
      (new Date(t.endDate) - new Date(t.startDate)) / 86400000 + 1
    return d > 0 ? d : 1
  }
  return t.startDate || t.endDate ? 1 : 0
}

export default function Stats({ trips }) {
  const s = useMemo(() => {
    const countries = new Set()
    const prefs = new Set()
    const byYear = new Map()
    let days = 0
    let photos = 0
    for (const t of trips) {
      if (t.country) countries.add(t.country)
      if (t.country === 'Japan' && t.prefecture) prefs.add(t.prefecture)
      days += tripDays(t)
      photos += t.photos?.length ?? 0
      const y = (t.startDate || t.createdAt || '').slice(0, 4)
      if (y) byYear.set(y, (byYear.get(y) ?? 0) + 1)
    }
    const years = [...byYear.entries()].sort((a, b) => a[0].localeCompare(b[0]))
    const maxYear = Math.max(1, ...years.map(([, n]) => n))
    return { countries, prefs, days, photos, years, maxYear }
  }, [trips])

  const KPIS = [
    { label: '旅の回数', value: trips.length, unit: '回', icon: '🧳' },
    { label: '訪問国・地域', value: s.countries.size, unit: 'カ国', icon: '🌏' },
    { label: '都道府県', value: `${s.prefs.size}`, unit: '/ 47', icon: '🗾' },
    { label: '旅した日数', value: s.days, unit: '日', icon: '📅' },
    { label: '写真', value: s.photos, unit: '枚', icon: '📷' },
  ]

  return (
    <div className="stats">
      <div className="list-head">
        <h2>旅の統計</h2>
      </div>

      <div className="kpis">
        {KPIS.map((k) => (
          <div className="kpi card" key={k.label}>
            <span className="kpi-icon">{k.icon}</span>
            <span className="kpi-value">
              {k.value}
              <small> {k.unit}</small>
            </span>
            <span className="kpi-label">{k.label}</span>
          </div>
        ))}
      </div>

      {s.years.length > 0 && (
        <div className="card chart-card">
          <h3>年別の旅行回数</h3>
          <div className="bars">
            {s.years.map(([y, n]) => (
              <div className="bar-row" key={y}>
                <span className="bar-year">{y}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(n / s.maxYear) * 100}%` }} />
                </div>
                <span className="bar-num">{n}回</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {s.countries.size > 0 && (
        <div className="card chart-card">
          <h3>訪れた国・地域</h3>
          <div className="chips">
            {[...s.countries].map((c) => (
              <span className="badge" key={c}>
                {countryJa(c)}
              </span>
            ))}
          </div>
        </div>
      )}

      {trips.length === 0 && (
        <p className="muted center">記録を追加すると統計が表示されます。</p>
      )}
    </div>
  )
}

import { countryJa } from '../countries.js'

function fmtRange(start, end) {
  if (!start && !end) return '日付未設定'
  const f = (s) => s?.replaceAll('-', '/')
  if (start && end && start !== end) return `${f(start)} 〜 ${f(end)}`
  return f(start || end)
}

export default function TripList({ trips, onAdd, onEdit, onDelete }) {
  const sorted = [...trips].sort((a, b) =>
    (b.startDate || b.createdAt || '').localeCompare(a.startDate || a.createdAt || '')
  )

  return (
    <div className="trip-list">
      <div className="list-head">
        <h2>旅日記</h2>
        <button className="btn primary" onClick={onAdd}>
          ＋ 旅を記録する
        </button>
      </div>

      {sorted.length === 0 && (
        <div className="empty card">
          <p className="empty-emoji">🧳</p>
          <p>まだ記録がありません。</p>
          <p>最初の旅を記録してみましょう！</p>
        </div>
      )}

      <div className="cards">
        {sorted.map((t) => (
          <article className="trip-card card" key={t.id}>
            {t.photos?.[0] && (
              <div className="trip-photo">
                <img src={t.photos[0]} alt="" />
                {t.photos.length > 1 && (
                  <span className="photo-count">+{t.photos.length - 1}</span>
                )}
              </div>
            )}
            <div className="trip-body">
              <div className="trip-meta">
                <span className="badge">
                  {t.country === 'Japan' && t.prefecture
                    ? t.prefecture
                    : countryJa(t.country)}
                </span>
                <span className="trip-dates">{fmtRange(t.startDate, t.endDate)}</span>
              </div>
              <h3 className="trip-title">{t.title}</h3>
              {t.place && <p className="trip-place">📍 {t.place}</p>}
              {t.rating > 0 && (
                <p className="trip-rating">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</p>
              )}
              {t.text && <p className="trip-text">{t.text}</p>}
              <div className="trip-actions">
                <button className="btn ghost small" onClick={() => onEdit(t)}>
                  編集
                </button>
                <button className="btn danger small" onClick={() => onDelete(t.id)}>
                  削除
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

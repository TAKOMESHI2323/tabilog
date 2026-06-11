import { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { COUNTRY_OPTIONS, countryJa } from '../countries.js'
import { PREFECTURES } from '../prefectures.js'

const MAX_PHOTOS = 4

// 写真は localStorage に収めるため縮小して JPEG dataURL 化する
function compressImage(file, maxEdge = 1000, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('image load failed'))
    }
    img.src = url
  })
}

function PinPicker({ pin, setPin }) {
  useMapEvents({
    click(e) {
      setPin({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return pin ? <Marker position={[pin.lat, pin.lng]} /> : null
}

export default function TripForm({ trip, onSave, onCancel }) {
  const [title, setTitle] = useState(trip?.title ?? '')
  const [startDate, setStartDate] = useState(trip?.startDate ?? '')
  const [endDate, setEndDate] = useState(trip?.endDate ?? '')
  const [country, setCountry] = useState(trip?.country ?? 'Japan')
  const [prefecture, setPrefecture] = useState(trip?.prefecture ?? '')
  const [place, setPlace] = useState(trip?.place ?? '')
  const [rating, setRating] = useState(trip?.rating ?? 0)
  const [text, setText] = useState(trip?.text ?? '')
  const [photos, setPhotos] = useState(trip?.photos ?? [])
  const [pin, setPin] = useState(
    trip?.lat != null ? { lat: trip.lat, lng: trip.lng } : null
  )

  const addPhotos = async (e) => {
    const files = [...(e.target.files ?? [])]
    e.target.value = ''
    const room = MAX_PHOTOS - photos.length
    if (files.length > room) alert(`写真は1件につき${MAX_PHOTOS}枚までです。`)
    const added = []
    for (const f of files.slice(0, room)) {
      try {
        added.push(await compressImage(f))
      } catch {
        alert(`「${f.name}」を読み込めませんでした。`)
      }
    }
    if (added.length) setPhotos((p) => [...p, ...added])
  }

  const submit = (e) => {
    e.preventDefault()
    if (!title.trim()) return alert('タイトルを入力してください。')
    if (startDate && endDate && endDate < startDate)
      return alert('終了日は開始日より後にしてください。')
    onSave({
      id: trip?.id ?? crypto.randomUUID(),
      title: title.trim(),
      startDate,
      endDate,
      country,
      prefecture: country === 'Japan' ? prefecture : '',
      place: place.trim(),
      rating,
      text,
      photos,
      lat: pin?.lat ?? null,
      lng: pin?.lng ?? null,
      createdAt: trip?.createdAt ?? new Date().toISOString(),
    })
  }

  return (
    <form className="trip-form card" onSubmit={submit}>
      <h2 className="form-title">{trip ? '記録を編集' : '新しい旅を記録'}</h2>

      <label className="field">
        <span>タイトル *</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例：はじめての屋久島ひとり旅"
          maxLength={80}
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span>開始日</span>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label className="field">
          <span>終了日</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span>国・地域</span>
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            {COUNTRY_OPTIONS.map((en) => (
              <option key={en} value={en}>
                {countryJa(en)}
              </option>
            ))}
          </select>
        </label>
        {country === 'Japan' && (
          <label className="field">
            <span>都道府県</span>
            <select value={prefecture} onChange={(e) => setPrefecture(e.target.value)}>
              <option value="">選択してください</option>
              {PREFECTURES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <label className="field">
        <span>場所メモ</span>
        <input
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          placeholder="例：白谷雲水峡、千尋の滝"
          maxLength={120}
        />
      </label>

      <div className="field">
        <span>地図でピンを置く（クリックで位置を指定）</span>
        <div className="form-map">
          <MapContainer
            center={pin ? [pin.lat, pin.lng] : [36.2, 138.25]}
            zoom={pin ? 8 : 5}
            scrollWheelZoom={true}
            style={{ height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <PinPicker pin={pin} setPin={setPin} />
          </MapContainer>
        </div>
        {pin && (
          <button type="button" className="btn ghost small" onClick={() => setPin(null)}>
            ピンを消す
          </button>
        )}
      </div>

      <div className="field">
        <span>評価</span>
        <div className="stars" role="radiogroup" aria-label="評価">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={`star ${n <= rating ? 'on' : ''}`}
              onClick={() => setRating(n === rating ? 0 : n)}
              aria-label={`星${n}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span>写真（最大{MAX_PHOTOS}枚 / 自動で縮小されます）</span>
        <input type="file" accept="image/*" multiple onChange={addPhotos} />
        {photos.length > 0 && (
          <div className="photo-grid">
            {photos.map((src, i) => (
              <div className="photo-thumb" key={i}>
                <img src={src} alt={`写真${i + 1}`} />
                <button
                  type="button"
                  className="photo-remove"
                  onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                  aria-label="写真を削除"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <label className="field">
        <span>旅の記録</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="食べたもの、出会った人、心に残った景色…"
        />
      </label>

      <div className="form-actions">
        <button type="button" className="btn ghost" onClick={onCancel}>
          キャンセル
        </button>
        <button type="submit" className="btn primary">
          保存する
        </button>
      </div>
    </form>
  )
}

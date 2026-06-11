import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { countryJa } from '../countries.js'

export default function MapView({ trips }) {
  const pinned = trips.filter((t) => t.lat != null && t.lng != null)

  return (
    <div className="mapview">
      <div className="list-head">
        <h2>旅の地図</h2>
        <span className="muted">{pinned.length} 件のピン</span>
      </div>
      <div className="big-map card">
        <MapContainer center={[36.2, 138.25]} zoom={5} style={{ height: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {pinned.map((t) => (
            <Marker key={t.id} position={[t.lat, t.lng]}>
              <Popup>
                <div className="popup">
                  {t.photos?.[0] && <img src={t.photos[0]} alt="" />}
                  <strong>{t.title}</strong>
                  <div>
                    {t.country === 'Japan' && t.prefecture
                      ? t.prefecture
                      : countryJa(t.country)}
                    {t.startDate && ` ・ ${t.startDate.replaceAll('-', '/')}`}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      {pinned.length === 0 && (
        <p className="muted center">
          旅の記録にピンを置くと、ここに表示されます。
        </p>
      )}
    </div>
  )
}

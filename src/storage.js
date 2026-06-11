const KEY = 'tabilog.trips.v1'

export function loadTrips() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export function saveTrips(trips) {
  try {
    localStorage.setItem(KEY, JSON.stringify(trips))
    return true
  } catch {
    // 写真の入れすぎ等で localStorage の容量 (約5MB) を超えた場合
    alert(
      '保存容量の上限に達しました。写真の枚数を減らすか、古い記録を削除してください。\n（今回の変更は保存されていません）'
    )
    return false
  }
}

export function exportTrips(trips) {
  const blob = new Blob([JSON.stringify(trips, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const d = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  a.href = url
  a.download = `tabilog-${d}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function parseImported(text) {
  const data = JSON.parse(text)
  if (!Array.isArray(data)) throw new Error('not an array')
  return data.filter((t) => t && typeof t === 'object' && t.id && t.title)
}

# 旅ログ（TABI LOG）

> A simple, server-less travel journal web app — diary, map pins, a "conquest" map of visited prefectures/countries, and stats. Built with React + Vite + Leaflet. No API keys, no backend.

シンプルな旅の記録アプリです。人気の旅ログアプリの定番機能をひとつにまとめました。

## 機能

- **📖 旅日記** — タイトル・日付・場所・写真（自動縮小、最大4枚）・★評価・本文で旅を記録
- **📍 地図** — 記録した旅をピンとして地図に表示（Leaflet + OpenStreetMap）
- **🗾 制覇マップ** — 訪れた都道府県（47）と国・地域（177）を塗りつぶして可視化
- **📊 統計** — 旅の回数、訪問国数、都道府県制覇数、総旅日数、年別グラフなど

## データの保存

- データはブラウザの `localStorage` に保存されます（サーバー不要・その端末内のみ）
- ヘッダーの **エクスポート / インポート** で JSON ファイルとしてバックアップ・復元できます
- 写真は保存容量（約5MB）に収まるよう自動的に縮小されます

## 使い方

```bash
npm install
npm run dev      # 開発サーバー (http://localhost:5173)
npm run build    # 本番ビルド (dist/ に出力)
npm run preview  # ビルド結果の確認
```

`vite.config.js` で `base: './'` を指定しているため、ビルド成果物は GitHub Pages などのサブパス配信でもそのまま動きます。

## 技術構成

- React 19 + Vite
- react-leaflet / Leaflet（地図表示）
- topojson-client + world-atlas / dataofjapan の地形データ（`public/data/`）
- 外部 API キー不要（地図タイルは OpenStreetMap）

## ライセンス

[MIT License](./LICENSE) © 2026 TAKOMESHI2323

地図タイルは [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors、地形データは [world-atlas](https://github.com/topojson/world-atlas) および [dataofjapan/land](https://github.com/dataofjapan/land) を利用しています。

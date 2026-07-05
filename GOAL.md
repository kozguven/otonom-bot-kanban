# Hedef

Sıfırdan çalışan bir Kanban board web uygulaması yap.

## Kapsam
- Kolonlar (Yapılacak / Yapılıyor / Bitti)
- Kart ekle / düzenle / sil
- Kartları kolonlar arasında sürükle-bırak ile taşı
- Kalıcı kayıt (sayfa yenilenince veriler durmalı)

## Stack (zorunlu)
- Vite + React
- Sürükle-bırak: dnd-kit
- Kalıcı kayıt: SQLite ya da JSON dosyası
- Tek repo, `npm run dev` ile ayağa kalkmalı

## Doğrulama
- `npm test` (Vitest) ve `npm run build` geçmeli
- UI için Playwright headless smoke testi geçmeli

## Kapsam dışı
- Auth, çoklu board, gerçek zamanlı senkron, deploy — YOK

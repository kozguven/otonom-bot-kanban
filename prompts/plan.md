GOAL.md dosyasını oku. Bu hedefi, her biri tek başına doğrulanabilir küçük görevlere böl ve PLAN.md dosyasına Markdown checklist olarak yaz (her görev tek bir `- [ ]` satırı).

Kurallar:
- Görevleri mantıklı sıraya diz: (1) proje iskeleti (Vite + React kurulumu, Vitest, Playwright), (2) veri/kalıcılık katmanı (SQLite ya da JSON), (3) kolon + kart CRUD arayüzü, (4) sürükle-bırak (dnd-kit), (5) kalıcı kaydın uçtan uca çalıştığının doğrulanması.
- Her görev test + build + (UI ise) Playwright smoke ile doğrulanabilir olmalı.
- Görevleri küçük tut: bir görev ≈ bir mantıksal bileşen.
- SADECE PLAN.md'yi üret ve commit at ("chore: PLAN.md oluştur"). Bu turda kod yazma.

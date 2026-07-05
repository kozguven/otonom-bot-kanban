# Plan: Kanban Board Web Uygulaması

GOAL.md'deki hedefin, her biri tek başına doğrulanabilir küçük görevlere bölünmüş hali. Her görev tamamlandığında `npm test` (Vitest) ve `npm run build` geçmeli; UI görevlerinde ek olarak Playwright headless smoke testi geçmeli.

## 1. Proje iskeleti

- [x] Vite + React projesini kur; `npm run dev` ile boş uygulama ayağa kalksın ve `npm run build` geçsin
- [x] Vitest'i kur ve örnek bir birim test ekle; `npm test` geçsin
- [x] Playwright'ı headless kur ve ana sayfanın yüklendiğini doğrulayan smoke testi ekle; Playwright testi geçsin

## 2. Veri / kalıcılık katmanı

- [x] JSON dosyası tabanlı kalıcılık modülünü yaz (board verisini oku/yaz); birim testleriyle doğrula
- [x] Board verisini okuyup yazan API uçlarını ekle (GET/PUT, `npm run dev` ile aynı süreçte çalışsın); API'yi testle doğrula
- [x] Frontend'de API ile konuşan veri erişim katmanını (fetch/save) yaz; birim testleriyle doğrula

## 3. Kolon + kart CRUD arayüzü

- [x] Üç sabit kolonu (Yapılacak / Yapılıyor / Bitti) API'den gelen verilerle render eden Board bileşenini yaz; bileşen testi + Playwright smoke ile doğrula
- [x] Kart ekleme özelliğini yaz (kolona yeni kart, API'ye kaydedilsin); bileşen testi + Playwright ile doğrula
- [x] Kart düzenleme özelliğini yaz (başlık/metin güncelleme, API'ye kaydedilsin); bileşen testi + Playwright ile doğrula
- [x] Kart silme özelliğini yaz (API'den de silinsin); bileşen testi + Playwright ile doğrula

## 4. Sürükle-bırak (dnd-kit)

- [ ] dnd-kit'i entegre et: kart bir kolon içinde sürükle-bırak ile sıralanabilsin; birim/bileşen testi ile doğrula
- [ ] Kartların kolonlar arasında sürükle-bırak ile taşınmasını ekle ve sonucu API'ye kaydet; test + Playwright ile doğrula

## 5. Uçtan uca kalıcılık doğrulaması

- [ ] Playwright uçtan uca testi yaz: kart ekle → kolonlar arası taşı → sayfayı yenile → kartın yeni yerinde durduğunu doğrula
- [ ] Son doğrulama: `npm test`, `npm run build` ve tüm Playwright testlerinin temiz bir kurulumda geçtiğini doğrula

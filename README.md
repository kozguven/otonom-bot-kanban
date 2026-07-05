# Kendi Kendine Çalışan Bot — Otonom Kanban İnşası

Bu repo, **arayüzsüz (headless) Claude Code'u bir döngüde çalıştırıp orta ölçekli bir
projeyi baştan sona kendi kendine bitiren** bir düzeneği içerir. Örnek olarak bot,
sıfırdan çalışan bir **Kanban board** uygulaması inşa etti — planladı, kodladı, test
etti, hatalarını buldu, düzeltti ve commit'ledi. İnsan tek satır kod yazmadı.

> 📺 Videosu: **[LINK — açıklamaya eklenecek]**

## Nasıl çalışıyor?

Üç parça, birkaç kısa dosya:

```
GOAL.md            # bota verilen tek cümlelik hedef
prompts/plan.md    # ilk tur: hedeften PLAN.md üret
prompts/task.md    # her tur: bir görev yap + DOĞRULA + commit
run-bot.sh         # döngü: işaretsiz görev kaldıkça claude -p çağır
```

Döngünün kalbi:

```bash
for ((i=1; i<=MAX_ITERS; i++)); do
  if   [ ! -f PLAN.md ];      then prompt=plan.md
  elif [ -n "$(next_task)" ]; then prompt=task.md   # sıradaki işaretsiz görev
  else echo "Tümü bitti 🎉"; break                   # görev kalmadı → dur
  fi
  claude -p "$prompt" --dangerously-skip-permissions
done
```

**İşin sırrı — doğrulama kapısı** (`prompts/task.md`): bot bir görevi "bitti"
diyemiyor. Önce `npm test` ve `npm run build` geçmeli, arayüz görevlerinde Playwright
smoke testi geçmeli. Geçmezse commit yok; geri dönüp düzeltiyor. Böylece "sahte bitti"
mümkün değil. Ayrıca koruyucular var: tur limiti, tur zaman aşımı ve **takılma tespiti**
(aynı görevde 3 tur ilerleyemezse bot kendini durdurur).

## Çalıştırma

Gereksinimler: `claude` CLI (Claude Code), `git`, `asciinema`, ve macOS'ta
`coreutils` (`brew install asciinema coreutils`).

```bash
# rig'i API yakmadan test et (sahte claude stub'ı ile)
bash test/test-loop.sh     # döngü tüm görevleri bitiriyor mu
bash test/test-stuck.sh    # takılma tespiti çalışıyor mu

# gerçek çalıştırma (API kullanır, izole workspace/ içinde inşa eder, asciinema kaydeder)
bash start-real-run.sh
```

Ayarlar (ortam değişkenleri): `MAX_ITERS` (40), `ITER_TIMEOUT` (600 sn),
`STUCK_LIMIT` (3).

## `ornek-kanban/` — botun ürettiği uygulama

Botun bu düzenekle sıfırdan ürettiği Kanban uygulaması burada, **gerçek commit
geçmişiyle** birlikte. `ornek-kanban/` klasörünün git geçmişine bakarsan botun her
görevi tek tek nasıl inşa ettiğini görebilirsin: iskelet → veri katmanı → kart CRUD →
sürükle-bırak → uçtan uca doğrulama → görsel tasarım.

- Stack: Vite + React + dnd-kit, JSON tabanlı kalıcılık
- 66/66 birim testi (Vitest) + 7 Playwright e2e testi geçiyor
- Çalıştırmak için: `cd ornek-kanban && npm install && npm run dev`

## Not

Bu, deneysel/eğitici bir düzenektir. `--dangerously-skip-permissions` kullanıldığı için
bot **yalnızca izole bir klasörde** çalıştırılmalıdır.

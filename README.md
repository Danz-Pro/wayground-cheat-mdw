# Wayground Cheat MDW

Cheat untuk [wayground.com](https://wayground.com) - menyorot jawaban benar secara otomatis.

## Fitur

- Menyorot jawaban benar dengan garis hijau
- Meredupkan jawaban salah (20% opacity)
- Support MCQ dan MSQ
- Matching 3 strategi: index, teks, dan class name

## Pemasangan

### Metode 1: Console Browser

1. Buka [wayground.com/join](https://wayground.com/join) dan join game
2. Tekan **F12** → tab **Console**
3. Paste kode ini:

```js
fetch("https://raw.githubusercontent.com/Danz-Pro/wayground-cheat-mdw/main/dist/bundle.js").then(r=>r.text()).then(t=>eval(t))
```

4. Jawaban benar otomatis disorot

### Metode 2: Tampermonkey (Otomatis)

1. Install [Tampermonkey](https://www.tampermonkey.net/)
2. Buat script baru, paste isi file [scripts/tampermonkey-alternative-method.js](scripts/tampermonkey-alternative-method.js)
3. Simpan (Ctrl+S)

### Metode 3: Bookmarklet

1. Buat bookmark baru
2. URL isi dengan:

```js
javascript:void(fetch("https://raw.githubusercontent.com/Danz-Pro/wayground-cheat-mdw/main/dist/bundle.js").then(r=>r.text()).then(t=>eval(t)))
```

## Build

```bash
npm install --legacy-peer-deps
npm run build
```

## Lisensi

AGPL-3.0

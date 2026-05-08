# Wayground Cheat MDW

Cheat untuk [wayground.com](https://wayground.com) - menyorot jawaban benar secara otomatis.

## Cara Pakai

### Metode: Console Browser (Recommended)

1. Join quiz/game di [wayground.com](https://wayground.com)
2. Buka browser console (F12 → Console)
3. Paste kode ini:

```ts
fetch("https://raw.githubusercontent.com/Danz-Pro/wayground-cheat-mdw/main/dist/bundle.js")
.then((res) => res.text()
.then((t) => eval(t)))
```

4. Jawaban benar akan disorot dengan **garis hijau**, jawaban salah akan diredupkan (20% opacity).

### Otomatis dengan Tampermonkey

1. Install [Tampermonkey](https://www.tampermonkey.net/)
2. Buat user script baru dan paste isi file [scripts/tampermonkey-alternative-method.js](scripts/tampermonkey-alternative-method.js)
3. Script akan otomatis aktif setiap kali masuk quiz di wayground.com

## Build

```bash
npm install
npm run build
```

Output ada di `dist/bundle.js`.

## Teknis

- **Vue 3 + Pinia**: Akses game state via Pinia store
- **Pinia Stores**: `gameData` → `roomHash`, `gameQuestions` → `currentId`
- **API**: `GET https://wayground.com/_api/main/game/{roomHash}`
- **Matching**: Index, teks, dan class name untuk reliabel

## Lisensi

AGPL-3.0

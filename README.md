# Wayground Cheat MDW

Cheat untuk [wayground.com](https://wayground.com) - menyorot jawaban benar secara otomatis.

## Fitur

- Menyorot jawaban benar dengan garis hijau
- Meredupkan jawaban salah (20% opacity)
- Support MCQ (pilihan ganda) dan MSQ (pilihan ganda banyak)
- Matching 3 strategi: index, teks, dan class name

---

## Pemasangan

### Metode 1: Console Browser

Cara termudah, tanpa install apapun. Cukup paste kode di console browser.

1. Buka [wayground.com](https://wayground.com) dan join game/quiz
2. Tekan **F12** untuk buka DevTools
3. Klik tab **Console**
4. Paste kode berikut lalu tekan **Enter**:

```js
fetch("https://raw.githubusercontent.com/Danz-Pro/wayground-cheat-mdw/main/dist/bundle.js").then(r=>r.text()).then(t=>eval(t))
```

5. Done! Jawaban benar otomatis disorot setiap pertanyaan baru muncul

> Catatan: Kode ini harus dipaste ulang setiap kali refresh halaman atau pindah game.

---

### Metode 2: Tampermonkey (Otomatis)

Cara ini membuat cheat berjalan otomatis setiap kali kamu masuk game di wayground.com.

1. **Install Tampermonkey**
   - Chrome/Edge: [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - Firefox: [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
   - Safari: [App Store](https://apps.apple.com/app/tampermonkey/id1482490089)

2. **Buat User Script Baru**
   - Klik ikon Tampermonkey di toolbar browser
   - Pilih **"Buat script baru"** / **"Create a new script"**
   - Hapus semua kode yang ada
   - Paste kode berikut:

```js
// ==UserScript==
// @name         Wayground Cheat MDW
// @namespace    https://github.com/Danz-Pro/wayground-cheat-mdw
// @version      2.0
// @description  Menyorot jawaban benar di wayground.com
// @author       MDW
// @match        https://wayground.com/*
// @icon         https://wayground.com/favicon.ico
// @require      https://gist.githubusercontent.com/BrockA/2625891/raw/9c97aa67ff9c5d56be34a55ad6c18a314e5eb548/waitForKeyElements.js
// @require      http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @grant        none
// ==/UserScript==

waitForKeyElements("[data-testid='options-grid'], .options-container, [data-testid='game-question']", onGameCreate)
let isGameCreated = false

function onGameCreate() {
    if (isGameCreated) return
    isGameCreated = true
    console.log("[Wayground Cheat MDW] Game elements detected, loading script...")
    fetch("https://raw.githubusercontent.com/Danz-Pro/wayground-cheat-mdw/main/dist/bundle.js")
        .then((res) => res.text()
        .then((t) => eval(t)))
}
```

3. **Simpan**
   - Tekan **Ctrl + S** atau klik **File > Save**
4. Done! Script akan otomatis aktif saat kamu join game

---

### Metode 3: Bookmarklet

Cara paling ringkas, cukup klik bookmark untuk mengaktifkan cheat.

1. Buat bookmark baru di browser kamu
2. Isi **Nama**: `Wayground Cheat`
3. Isi **URL/Alamat** dengan kode berikut:

```js
javascript:void(fetch("https://raw.githubusercontent.com/Danz-Pro/wayground-cheat-mdw/main/dist/bundle.js").then(r=>r.text()).then(t=>eval(t)))
```

4. Simpan bookmark
5. Saat bermain di wayground.com, klik bookmark tersebut untuk mengaktifkan cheat

---

## Build dari Source

Kalau mau build sendiri dari source code:

```bash
git clone https://github.com/Danz-Pro/wayground-cheat-mdw.git
cd wayground-cheat-mdw
npm install --legacy-peer-deps
npm run build
```

Output ada di `dist/bundle.js`.

## Teknis

- **Vue 3 + Pinia**: Akses game state via Pinia store
- **Pinia Stores**: `gameData` (roomHash), `gameQuestions` (currentId)
- **API**: `GET https://wayground.com/_api/main/game/{roomHash}`
- **Answer Matching**: 3 strategi - index, teks, class name

## Lisensi

AGPL-3.0

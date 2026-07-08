// =========================================================================
// 📘 DAY 2 - MATERI 2: Handlebars Expression
// =========================================================================
// Studi Kasus: Aplikasi Daftar Film Favorit 🎬 (Lanjutan)
// =========================================================================

/*
  ============================
  APA ITU HANDLEBARS EXPRESSION?
  ============================

  Expression di Handlebars adalah cara kita "menyisipkan data" atau 
  "menjalankan logika sederhana" di dalam file template (.hbs).

  Ada 3 jenis utama:
  1. Output Expression   -> {{variabel}}     (Menampilkan data)
  2. Block Expression    -> {{#helper}}...{{/helper}} (Logika blok)
  3. Comment Expression  -> {{!-- komentar --}} (Komentar yang tidak muncul di HTML)

  ⚠️ YANG HARUS DIPERHATIKAN:
  - Handlebars BUKAN JavaScript. Anda TIDAK BISA menulis JS bebas di dalamnya.
  - Semua logika kompleks harus dilakukan di SERVER (file .js), bukan di template.
  - Expression hanya untuk MENAMPILKAN data yang sudah diproses server.
*/


// =========================================================================
// SECTION 1: OUTPUT EXPRESSION {{ }}
// =========================================================================

/*
  ==============================
  1a. Double Curly Braces: {{variabel}}
  ==============================
  Menampilkan nilai variabel ke HTML dengan HTML ESCAPING (aman dari XSS).
  Artinya, jika nilai berisi tag HTML seperti <script>, tag tersebut akan
  ditampilkan sebagai TEKS biasa dan TIDAK dieksekusi.

  Contoh di Server (file .js):
  ---
  app.get("/", (req, res) => {
    res.render("home", {
      nama: "Rey",
      pesan: "<script>alert('hack!')</script>"
    });
  });

  Contoh di Template (home.hbs):
  ---
  <h1>Halo, {{nama}}!</h1>            -> Output: Halo, Rey!
  <p>{{pesan}}</p>                     -> Output: &lt;script&gt;alert('hack!')&lt;/script&gt;
                                          (ditampilkan sebagai TEKS, AMAN!)


  ==============================
  1b. Triple Curly Braces: {{{variabel}}}
  ==============================
  Menampilkan nilai TANPA escaping (raw HTML).
  
  ⚠️ BAHAYA! Jika data berasal dari input user, JANGAN gunakan ini!

  <p>{{{pesan}}}</p>                   -> Output: Menjalankan script! (XSS Attack!)

  Kapan boleh dipakai?
  - Hanya untuk HTML yang KAMU BUAT SENDIRI di server (bukan dari input user).
  - Contoh: Menampilkan konten artikel yang sudah di-sanitize.
*/


// =========================================================================
// SECTION 2: BLOCK HELPERS (Logika di Template)
// =========================================================================

/*
  Block Helpers adalah "perintah logika" bawaan Handlebars.
  Ditandai dengan tanda pagar (#) di awal dan garis miring (/) di akhir.

  ==============================
  2a. {{#if}} ... {{else}} ... {{/if}}
  ==============================
  Menampilkan konten secara KONDISIONAL.

  ⚠️ KRUSIAL: #if di Handlebars HANYA mengecek TRUTHY atau FALSY.
  ⚠️ TIDAK BISA melakukan perbandingan: {{#if umur > 18}} -> TIDAK BISA!
  ⚠️ Komparasi harus dilakukan di SERVER.

  Nilai yang dianggap FALSY oleh Handlebars:
  - false
  - undefined
  - null
  - "" (string kosong)
  - 0
  - [] (array kosong)  ⚠️ Hati-hati! Array kosong dianggap FALSY di Handlebars!
*/

// --- Contoh di Server (.js) ---

import express from "express";
import { engine } from "express-handlebars";

const app = express();
const PORT = 3001;

app.engine("hbs", engine({ extname: ".hbs", defaultLayout: "main", layoutsDir: "./views/layouts/" }));
app.set("view engine", "hbs");
app.set("views", "views");

// ✅ BENAR - Siapkan boolean di server, kirim ke template
app.get("/film/:id", (req, res) => {
  const film = {
    judul: "Inception",
    tahun: 2010,
    rating: 8.8
  };

  res.render("detail-film", {
    film: film,
    isHighRating: film.rating >= 8.0,      // Boolean: true -> Logika di SERVER
    isClassic: film.tahun < 2000,           // Boolean: false -> Logika di SERVER
    adaFilm: true                           // Boolean sederhana
  });
});

/*
  --- Contoh di Template (detail-film.hbs) ---

  ✅ BENAR:

  {{#if adaFilm}}
    <h1>{{film.judul}}</h1>
    <p>Tahun: {{film.tahun}}</p>

    {{#if isHighRating}}
      <span class="badge">⭐ Rating Tinggi!</span>
    {{else}}
      <span class="badge">Rating Biasa</span>
    {{/if}}

    {{#if isClassic}}
      <p>🎞️ Film Klasik</p>
    {{/if}}
  {{else}}
    <p>Film tidak ditemukan.</p>
  {{/if}}


  ❌ SALAH - Melakukan komparasi langsung di template:

  {{#if film.rating >= 8.0}}          <- ERROR! Handlebars tidak mengerti >=
    <span>Rating Tinggi</span>
  {{/if}}

  {{#if film.tahun < 2000}}           <- ERROR! Handlebars tidak mengerti <
    <span>Film Klasik</span>
  {{/if}}
*/


/*
  ==============================
  2b. {{#unless}} ... {{/unless}}
  ==============================
  Kebalikan dari #if. Menampilkan konten jika nilainya FALSY.
  
  --- Template ---
  {{#unless sudahLogin}}
    <p>Anda belum login. <a href="/login">Login di sini</a></p>
  {{/unless}}

  Sama artinya dengan: "Jika BELUM login, tampilkan ini."
*/


/*
  ==============================
  2c. {{#each}} ... {{/each}}
  ==============================
  Untuk melakukan LOOPING pada Array atau Object.
  
  Variabel spesial di dalam #each:
  - {{this}}      -> Elemen saat ini (jika array of strings)
  - {{this.key}}  -> Akses property (jika array of objects)
  - {{@index}}    -> Index saat ini (dimulai dari 0)
  - {{@key}}      -> Key saat ini (jika looping Object)
  - {{@first}}    -> true jika elemen pertama
  - {{@last}}     -> true jika elemen terakhir
*/

// ✅ BENAR - Kirim array dari server
app.get("/films", (req, res) => {
  const daftarFilm = [
    { judul: "Inception", tahun: 2010, sutradara: "Christopher Nolan" },
    { judul: "Parasite", tahun: 2019, sutradara: "Bong Joon-ho" },
    { judul: "Interstellar", tahun: 2014, sutradara: "Christopher Nolan" },
  ];

  res.render("daftar-film", {
    films: daftarFilm,
    adaFilm: daftarFilm.length > 0     // Kirim boolean, jangan cek .length di template!
  });
});

/*
  --- Template (daftar-film.hbs) ---

  ✅ BENAR:

  <h1>🎬 Daftar Film</h1>

  {{#if adaFilm}}
    <table border="1">
      <tr>
        <th>No</th>
        <th>Judul</th>
        <th>Tahun</th>
        <th>Sutradara</th>
      </tr>
      {{#each films}}
        <tr>
          <td>{{@index}}</td>               <- Index otomatis (0, 1, 2, ...)
          <td>{{this.judul}}</td>            <- Akses property 'judul' dari object saat ini
          <td>{{this.tahun}}</td>
          <td>{{this.sutradara}}</td>
        </tr>
      {{/each}}
    </table>
  {{else}}
    <p>Belum ada film dalam daftar.</p>
  {{/if}}


  ❌ SALAH - Lupa {{this.}} saat akses property:

  {{#each films}}
    <td>{{judul}}</td>            <- Mungkin BISA bekerja, tapi TIDAK KONSISTEN!
    <td>{{this.judul}}</td>       <- Lebih aman dan eksplisit. SELALU gunakan 'this.'
  {{/each}}


  ❌ SALAH - Mengecek .length di template:

  {{#if films.length}}            <- TIDAK BISA! Handlebars tidak mendukung akses .length
    ...
  {{/if}}
*/


/*
  ==============================
  2d. {{#with}} ... {{/with}}
  ==============================
  Mengubah "konteks" (scope) agar kita tidak perlu mengetik nama object
  secara berulang-ulang.
*/

// Contoh tanpa #with (boros ketik):
/*
  <p>Judul: {{film.judul}}</p>
  <p>Tahun: {{film.tahun}}</p>
  <p>Sutradara: {{film.sutradara}}</p>
*/

// ✅ BENAR - Dengan #with (lebih ringkas):
/*
  {{#with film}}
    <p>Judul: {{judul}}</p>            <- Langsung akses property tanpa 'film.'
    <p>Tahun: {{tahun}}</p>
    <p>Sutradara: {{sutradara}}</p>
  {{/with}}
*/


// =========================================================================
// SECTION 3: COMMENT & PARTIAL EXPRESSION
// =========================================================================

/*
  ==============================
  3a. Comment: {{!-- komentar --}}
  ==============================
  Komentar di Handlebars yang TIDAK MUNCUL di HTML output.
  Berbeda dengan komentar HTML biasa (<!-- -->) yang masih muncul di source code browser.

  {{!-- Ini komentar Handlebars, tidak terlihat di browser --}}
  <!-- Ini komentar HTML biasa, masih terlihat di View Source browser -->


  ==============================
  3b. Partial: {{> namaPartial}}
  ==============================
  Partial = Potongan template yang bisa di-reuse (dipakai ulang) di banyak halaman.
  Cocok untuk komponen yang muncul berulang: navbar, footer, sidebar, card, dll.

  Setup di server:
  app.engine("hbs", engine({
    partialsDir: "./views/partials/"    <- Folder tempat menyimpan file partial
  }));

  Buat file: views/partials/navbar.hbs
  ---
  <nav>
    <a href="/">Home</a>
    <a href="/films">Films</a>
    <a href="/contact">Contact</a>
  </nav>

  Panggil di template manapun:
  ---
  {{> navbar}}         <- Menyisipkan isi navbar.hbs di sini

  <h1>Konten Halaman</h1>
*/


// =========================================================================
// RINGKASAN MATERI 2 - CHEATSHEET EXPRESSION
// =========================================================================

/*
  | Expression               | Kegunaan                                   | Contoh                      |
  |--------------------------|--------------------------------------------|-----------------------------|
  | {{variabel}}             | Tampilkan data (escaped/aman)              | {{nama}} -> "Rey"           |
  | {{{variabel}}}           | Tampilkan data (raw/mentah)                | {{{htmlContent}}}           |
  | {{#if val}}              | Kondisi (truthy/falsy)                     | {{#if adaData}}...{{/if}}   |
  | {{else}}                 | Alternatif jika #if falsy                  | {{else}} <p>Kosong</p>      |
  | {{#unless val}}          | Kebalikan #if                              | {{#unless login}}...        |
  | {{#each arr}}            | Looping array/object                       | {{#each items}}...{{/each}} |
  | {{this}} / {{this.key}}  | Elemen saat ini di #each                   | {{this.judul}}              |
  | {{@index}}               | Index saat ini di #each                    | {{@index}} -> 0, 1, 2...    |
  | {{@first}} / {{@last}}   | Boolean pertama/terakhir di #each          | {{#if @first}}...{{/if}}    |
  | {{#with obj}}            | Ganti konteks agar tidak tulis obj. terus  | {{#with film}}{{judul}}     |
  | {{> partial}}            | Sisipkan partial (komponen reusable)       | {{> navbar}}                |
  | {{!-- text --}}          | Komentar (tidak muncul di browser)         | {{!-- catatan dev --}}      |
*/

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

// =========================================================================
// 📘 DAY 2 - MATERI 1: CRUD & Form Handling
// =========================================================================
// Studi Kasus: Aplikasi Daftar Film Favorit 🎬
// =========================================================================

import express from "express";

const app = express();
const PORT = 3000;

/*
  ============================
  APA ITU CRUD?
  ============================

  CRUD = 4 operasi dasar untuk mengelola data:

  | Huruf | Singkatan | Artinya                  | HTTP Method | Contoh Aksi              |
  |-------|-----------|--------------------------|-------------|--------------------------|
  | C     | Create    | Membuat data baru        | POST        | Menambah film baru       |
  | R     | Read      | Membaca/menampilkan data | GET         | Melihat daftar film      |
  | U     | Update    | Mengubah data yang ada   | POST/PUT    | Mengedit judul film      |
  | D     | Delete    | Menghapus data           | POST/DELETE | Menghapus film dari list |

  Hampir SEMUA aplikasi di dunia nyata menggunakan pola CRUD:
  - Instagram: Create (upload foto), Read (lihat feed), Update (edit caption), Delete (hapus post)
  - Tokopedia: Create (tambah produk), Read (lihat katalog), Update (ubah harga), Delete (hapus produk)

  ============================
  APA ITU FORM HANDLING?
  ============================

  Form Handling = Cara server MENERIMA dan MEMPROSES data yang dikirim
  oleh user melalui form HTML (input text, checkbox, select, dll).

  Alur kerjanya:
  1. User mengisi form di browser -> Klik tombol Submit
  2. Browser mengirim data ke server (via POST request)
  3. Server membaca data dari req.body
  4. Server memproses data (simpan, update, hapus)
  5. Server mengirim response (redirect ke halaman lain atau tampilkan pesan)

  ⚠️ YANG HARUS DIPERHATIKAN:
  - Form HTML menggunakan attribute 'method="POST"' dan 'action="/url-tujuan"'
  - Server WAJIB punya middleware untuk membaca body: express.urlencoded()
  - Setiap input di form WAJIB punya attribute 'name' agar datanya bisa dibaca di server
*/


// =========================================================================
// SETUP MIDDLEWARE UNTUK MEMBACA DATA FORM
// =========================================================================

// ✅ BENAR - Middleware ini WAJIB dipasang di atas semua route
app.use(express.urlencoded({ extended: true }));  // Untuk data dari form HTML
app.use(express.json());                          // Untuk data dari JSON (API/Postman)

// ❌ SALAH - Lupa pasang middleware
/*
// Tanpa express.urlencoded(), maka:
app.post("/films", (req, res) => {
  console.log(req.body);  // undefined! Data form tidak terbaca!
});
*/


// =========================================================================
// DATABASE SEMENTARA (Array sebagai pengganti database)
// =========================================================================

/*
  Untuk sekarang, kita belum belajar database (MongoDB, PostgreSQL, dll).
  Jadi kita simpan data di dalam ARRAY biasa di memori server.
  
  ⚠️ PENTING: Data di array ini akan HILANG setiap kali server di-restart!
  Ini hanya untuk latihan. Nanti di materi database, data akan tersimpan permanen.
*/

let daftarFilm = [
  { id: 1, judul: "Inception", sutradara: "Christopher Nolan", tahun: 2010 },
  { id: 2, judul: "Parasite", sutradara: "Bong Joon-ho", tahun: 2019 },
  { id: 3, judul: "Interstellar", sutradara: "Christopher Nolan", tahun: 2014 },
];

// Variabel untuk auto-increment ID (meniru perilaku database)
let nextId = 4;


// =========================================================================
// [C] CREATE - Menambah Film Baru
// =========================================================================

/*
  Untuk operasi CREATE, kita butuh 2 route:
  1. GET  /films/add    -> Menampilkan FORM untuk input data
  2. POST /films/add    -> MEMPROSES data yang dikirim dari form
*/

// Route 1: Tampilkan halaman form
app.get("/films/add", (req, res) => {
  res.send(`
    <h1>Tambah Film Baru</h1>
    <form method="POST" action="/films/add">
      <label>Judul Film:</label><br>
      <input type="text" name="judul" required><br><br>

      <label>Nama Sutradara:</label><br>
      <input type="text" name="sutradara" required><br><br>

      <label>Tahun Rilis:</label><br>
      <input type="number" name="tahun" required><br><br>

      <button type="submit">Simpan Film</button>
    </form>
  `);
});

// Route 2: Proses data dari form
// ✅ BENAR
app.post("/films/add", (req, res) => {
  const { judul, sutradara, tahun } = req.body;

  // Buat object film baru
  const filmBaru = {
    id: nextId,
    judul: judul,
    sutradara: sutradara,
    tahun: Number(tahun),  // ⚠️ Data dari form SELALU STRING, konversi ke Number!
  };

  daftarFilm.push(filmBaru);  // Tambahkan ke "database" array
  nextId++;                    // Naikkan ID untuk film berikutnya

  res.redirect("/films");      // Setelah simpan, redirect ke halaman daftar film
});

/*
  ⚠️ YANG HARUS DIPERHATIKAN pada Form HTML:
  1. method="POST"          -> Menentukan HTTP method yang digunakan
  2. action="/films/add"    -> URL tujuan pengiriman data
  3. name="judul"           -> KUNCI! Ini yang menjadi key di req.body
     Jika name="judul", maka di server diakses dengan req.body.judul
     Jika LUPA pasang name, data TIDAK AKAN TERKIRIM!
*/


// ❌ SALAH - Input tanpa attribute 'name'
/*
  <input type="text">   // Tanpa name="judul" -> req.body tidak punya key 'judul'!
*/


// ❌ SALAH - Lupa konversi tipe data dari form
/*
app.post("/films/add", (req, res) => {
  const filmBaru = {
    tahun: req.body.tahun,       // Ini masih STRING "2024", bukan Number 2024
  };
  // Nanti saat dibandingkan: "2024" > 2000 bisa jadi aneh di beberapa kasus
});
*/


// =========================================================================
// [R] READ - Membaca / Menampilkan Data
// =========================================================================

// ✅ BENAR - Menampilkan semua film
app.get("/films", (req, res) => {
  let html = "<h1>🎬 Daftar Film Favorit</h1>";
  html += '<a href="/films/add">+ Tambah Film Baru</a><br><br>';

  if (daftarFilm.length === 0) {
    html += "<p>Belum ada film. Yuk tambahkan!</p>";
  } else {
    html += "<ul>";
    daftarFilm.forEach((film) => {
      html += `
        <li>
          <strong>${film.judul}</strong> (${film.tahun}) - ${film.sutradara}
          | <a href="/films/edit/${film.id}">Edit</a>
          | <a href="/films/delete/${film.id}">Hapus</a>
        </li>
      `;
    });
    html += "</ul>";
  }

  res.send(html);
});


// =========================================================================
// [U] UPDATE - Mengubah Data Film
// =========================================================================

/*
  Sama seperti CREATE, Update butuh 2 route:
  1. GET  /films/edit/:id  -> Menampilkan form yang sudah TERISI data lama
  2. POST /films/edit/:id  -> Memproses perubahan data
*/

// Route 1: Tampilkan form edit (data lama sudah terisi)
app.get("/films/edit/:id", (req, res) => {
  const filmId = Number(req.params.id);
  const film = daftarFilm.find((f) => f.id === filmId);

  // Jika film tidak ditemukan
  if (!film) {
    return res.status(404).send("Film tidak ditemukan!");
  }

  // Tampilkan form dengan value yang sudah diisi data lama
  res.send(`
    <h1>Edit Film: ${film.judul}</h1>
    <form method="POST" action="/films/edit/${film.id}">
      <label>Judul Film:</label><br>
      <input type="text" name="judul" value="${film.judul}" required><br><br>

      <label>Nama Sutradara:</label><br>
      <input type="text" name="sutradara" value="${film.sutradara}" required><br><br>

      <label>Tahun Rilis:</label><br>
      <input type="number" name="tahun" value="${film.tahun}" required><br><br>

      <button type="submit">Update Film</button>
    </form>
    <br>
    <a href="/films">← Kembali ke Daftar</a>
  `);
});

// Route 2: Proses update
// ✅ BENAR
app.post("/films/edit/:id", (req, res) => {
  const filmId = Number(req.params.id);
  const filmIndex = daftarFilm.findIndex((f) => f.id === filmId);

  if (filmIndex === -1) {
    return res.status(404).send("Film tidak ditemukan!");
  }

  // Update data film di posisi yang ditemukan
  daftarFilm[filmIndex] = {
    id: filmId,                       // ID tetap sama (jangan berubah!)
    judul: req.body.judul,
    sutradara: req.body.sutradara,
    tahun: Number(req.body.tahun),
  };

  res.redirect("/films");
});

// ❌ SALAH - Menggunakan .find() untuk update (tidak bisa langsung assign)
/*
app.post("/films/edit/:id", (req, res) => {
  const film = daftarFilm.find((f) => f.id === Number(req.params.id));
  
  film = {                 // ERROR! Anda tidak bisa re-assign variabel const
    judul: req.body.judul, // Seharusnya update per-property: film.judul = req.body.judul
  };
});
*/

// ✅ BENAR - Alternatif update pakai .find() langsung per-property
/*
app.post("/films/edit/:id", (req, res) => {
  const film = daftarFilm.find((f) => f.id === Number(req.params.id));
  
  film.judul = req.body.judul;         // Update satu per satu
  film.sutradara = req.body.sutradara;
  film.tahun = Number(req.body.tahun);
  
  res.redirect("/films");
});
*/


// =========================================================================
// [D] DELETE - Menghapus Data Film
// =========================================================================

// ✅ BENAR - Hapus film berdasarkan ID
app.get("/films/delete/:id", (req, res) => {
  const filmId = Number(req.params.id);

  // Filter: Simpan SEMUA film KECUALI yang ID-nya cocok
  daftarFilm = daftarFilm.filter((f) => f.id !== filmId);

  res.redirect("/films");
});

/*
  ⚠️ CATATAN PENTING SOAL DELETE:
  Di contoh ini kita menggunakan GET untuk delete (via link <a href>).
  Ini TIDAK IDEAL untuk production karena:
  1. GET seharusnya hanya untuk MEMBACA data (bukan mengubah/menghapus).
  2. Bot/crawler bisa tidak sengaja "mengklik" link delete dan menghapus data!
  
  Di production, gunakan method DELETE atau POST dengan form/AJAX.
  Tapi untuk belajar, GET sudah cukup agar konsepnya mudah dipahami.
*/


// =========================================================================
// RINGKASAN MATERI 1
// =========================================================================

/*
  ✅ CRUD = Create, Read, Update, Delete (4 operasi dasar pengelolaan data).
  ✅ Form HTML mengirim data via POST, attribute 'name' di input menjadi key di req.body.
  ✅ WAJIB pasang express.urlencoded({ extended: true }) untuk membaca data form.
  ✅ Data dari form SELALU bertipe STRING -> konversi manual jika butuh Number.
  ✅ Setelah CREATE/UPDATE/DELETE, gunakan res.redirect() untuk mengarahkan user ke halaman lain.
  ✅ Untuk UPDATE: Cari data dengan .find() atau .findIndex(), lalu ubah property-nya.
  ✅ Untuk DELETE: Gunakan .filter() untuk menyaring data yang TIDAK ingin dihapus.
  ✅ Pola route CRUD:
     - GET  /films           -> Tampilkan semua (Read)
     - GET  /films/add       -> Tampilkan form tambah
     - POST /films/add       -> Proses tambah (Create)
     - GET  /films/edit/:id  -> Tampilkan form edit
     - POST /films/edit/:id  -> Proses edit (Update)
     - GET  /films/delete/:id -> Proses hapus (Delete)
*/

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

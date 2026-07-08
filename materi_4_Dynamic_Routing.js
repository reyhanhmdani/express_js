// =========================================================================
// 📘 DAY 2 - MATERI 4: Dynamic Routing
// =========================================================================
// Studi Kasus: Aplikasi Daftar Film Favorit 🎬 (Lanjutan)
// =========================================================================

import express from "express";

const app = express();
const PORT = 3003;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/*
  ============================
  APA ITU DYNAMIC ROUTING?
  ============================

  Dynamic Routing = Route yang URL-nya BERUBAH-UBAH sesuai data.
  Lawannya adalah Static Routing (URL-nya tetap/pasti).

  Static Routing:
  - /about          -> Selalu halaman about
  - /contact        -> Selalu halaman contact

  Dynamic Routing:
  - /films/1        -> Halaman film dengan ID 1
  - /films/2        -> Halaman film dengan ID 2
  - /films/999      -> Halaman film dengan ID 999
  - /genre/action   -> Halaman genre action
  - /genre/horror   -> Halaman genre horror

  Tanpa Dynamic Routing, kita harus menulis route SATU PER SATU:
  app.get("/films/1", ...)
  app.get("/films/2", ...)
  app.get("/films/3", ...)
  ... (GILA! Tidak mungkin menulis ratusan route!)

  Dengan Dynamic Routing, cukup SATU route untuk menangani semuanya:
  app.get("/films/:id", ...)   -> Satu route, bisa menangani /films/1, /films/2, dll.

  ============================
  YANG HARUS DIPERHATIKAN
  ============================
  ⚠️ Parameter ditandai dengan titik dua (:) di depan nama. Contoh: :id, :slug, :category
  ⚠️ Nilai parameter SELALU bertipe STRING. Konversi manual jika butuh Number.
  ⚠️ Urutan route SANGAT PENTING! Express mencocokkan route dari ATAS ke BAWAH.
  ⚠️ Route yang lebih spesifik (static) harus ditulis SEBELUM yang dinamis.
*/


// =========================================================================
// DATA SIMULASI (Database Sementara)
// =========================================================================

const daftarFilm = [
  { id: 1, judul: "Inception", genre: "sci-fi", sutradara: "Christopher Nolan", tahun: 2010, rating: 8.8 },
  { id: 2, judul: "Parasite", genre: "thriller", sutradara: "Bong Joon-ho", tahun: 2019, rating: 8.5 },
  { id: 3, judul: "The Dark Knight", genre: "action", sutradara: "Christopher Nolan", tahun: 2008, rating: 9.0 },
  { id: 4, judul: "Conjuring", genre: "horror", sutradara: "James Wan", tahun: 2013, rating: 7.5 },
  { id: 5, judul: "Avengers: Endgame", genre: "action", sutradara: "Russo Brothers", tahun: 2019, rating: 8.4 },
];


// =========================================================================
// SECTION 1: SINGLE PARAMETER (:id)
// =========================================================================

// ✅ BENAR - Dynamic route dengan 1 parameter
app.get("/films/:id", (req, res) => {
  const filmId = Number(req.params.id); // ⚠️ Konversi ke Number!
  const film = daftarFilm.find((f) => f.id === filmId);

  if (!film) {
    return res.status(404).json({
      success: false,
      message: `Film dengan ID ${filmId} tidak ditemukan`
    });
  }

  res.json({
    success: true,
    data: film
  });
});

// Akses: GET /films/1  -> { id: 1, judul: "Inception", ... }
// Akses: GET /films/3  -> { id: 3, judul: "The Dark Knight", ... }
// Akses: GET /films/99 -> 404: Film tidak ditemukan


// ❌ SALAH - Lupa konversi req.params ke Number
/*
app.get("/films/:id", (req, res) => {
  const filmId = req.params.id;                  // Ini masih STRING "1"
  const film = daftarFilm.find((f) => f.id === filmId);  // "1" === 1 -> false! Tidak ketemu!
  // Film akan selalu 'undefined' karena tipe data berbeda (String vs Number)
});
*/


// =========================================================================
// SECTION 2: MULTIPLE PARAMETERS
// =========================================================================

// ✅ BENAR - Route dengan 2 parameter
app.get("/films/:genre/:tahun", (req, res) => {
  const { genre, tahun } = req.params; // Destructuring kedua parameter sekaligus

  const hasilFilter = daftarFilm.filter(
    (f) => f.genre === genre && f.tahun === Number(tahun)
  );

  res.json({
    filter: { genre, tahun },
    jumlahDitemukan: hasilFilter.length,
    data: hasilFilter
  });
});

// Akses: GET /films/action/2019  -> [Avengers: Endgame]
// Akses: GET /films/sci-fi/2010  -> [Inception]
// Akses: GET /films/horror/2020  -> [] (kosong)


// =========================================================================
// SECTION 3: URUTAN ROUTE (Route Ordering) ⚠️ KRUSIAL!
// =========================================================================

/*
  Express mencocokkan route dari ATAS ke BAWAH.
  Jika route pertama sudah cocok, route di bawahnya TIDAK AKAN diperiksa.

  Ini adalah SUMBER BUG paling umum di Express!
*/

// ❌ SALAH - Route dinamis ditulis SEBELUM route statis
/*
  app.get("/films/:id", (req, res) => {
    // Route ini menangkap SEMUA /films/apapun, termasuk /films/favorites!
    res.send(`Mencari film dengan ID: ${req.params.id}`);
  });

  app.get("/films/favorites", (req, res) => {
    // Route ini TIDAK PERNAH TEREKSEKUSI!
    // Karena /films/favorites sudah ditangkap oleh /films/:id di atas
    // (Express mengira "favorites" adalah nilai dari parameter :id)
    res.send("Film Favorit");
  });
*/

// ✅ BENAR - Route statis ditulis SEBELUM route dinamis
app.get("/films-catalog/favorites", (req, res) => {
  // Route statis di ATAS -> aman, pasti tereksekusi
  const favorites = daftarFilm.filter((f) => f.rating >= 8.5);
  res.json({
    kategori: "Film Favorit (Rating >= 8.5)",
    data: favorites
  });
});

app.get("/films-catalog/latest", (req, res) => {
  // Route statis lainnya -> juga aman di atas
  const latest = daftarFilm.filter((f) => f.tahun >= 2015);
  res.json({
    kategori: "Film Terbaru (>= 2015)",
    data: latest
  });
});

app.get("/films-catalog/:id", (req, res) => {
  // Route DINAMIS di BAWAH semua route statis
  const filmId = Number(req.params.id);
  const film = daftarFilm.find((f) => f.id === filmId);

  if (!film) {
    return res.status(404).json({ message: "Film tidak ditemukan" });
  }

  res.json(film);
});

/*
  Urutan yang BENAR:
  1. /films-catalog/favorites   <- Statis (pasti, tidak berubah)
  2. /films-catalog/latest      <- Statis (pasti, tidak berubah)
  3. /films-catalog/:id         <- Dinamis (bisa apa saja, TARUH PALING BAWAH)
*/


// =========================================================================
// SECTION 4: QUERY STRING + DYNAMIC ROUTE (Kombinasi)
// =========================================================================

/*
  Dynamic Route  -> Untuk IDENTITAS (apa yang ingin diakses)
  Query String   -> Untuk OPSI TAMBAHAN (bagaimana cara menampilkannya)
  
  Contoh: /genre/action?sort=rating&order=desc
  - :genre = "action" (identitas: genre apa yang dicari)
  - sort = "rating" (opsi: urutkan berdasarkan apa)
  - order = "desc" (opsi: urutkan secara menurun)
*/

// ✅ BENAR - Kombinasi params + query
app.get("/genre/:genre", (req, res) => {
  const { genre } = req.params;
  const { sort, order } = req.query;

  // Filter berdasarkan genre (dari params)
  let hasil = daftarFilm.filter((f) => f.genre === genre);

  // Sort berdasarkan query string (opsional)
  if (sort === "rating") {
    hasil.sort((a, b) => {
      return order === "desc" ? b.rating - a.rating : a.rating - b.rating;
    });
  } else if (sort === "tahun") {
    hasil.sort((a, b) => {
      return order === "desc" ? b.tahun - a.tahun : a.tahun - b.tahun;
    });
  }

  res.json({
    genre: genre,
    sortBy: sort || "default",
    jumlah: hasil.length,
    data: hasil
  });
});

// Akses: GET /genre/action                       -> Semua film action (tanpa sort)
// Akses: GET /genre/action?sort=rating&order=desc -> Film action, rating tertinggi dulu


// =========================================================================
// SECTION 5: ROUTE DENGAN OPTIONAL PARAMETER
// =========================================================================

/*
  Bagaimana jika parameter bersifat opsional?
  Express tidak punya sintaks "optional param" langsung.
  Solusinya: Buat 2 route terpisah atau gunakan query string.
*/

// ✅ BENAR - Solusi 1: Dua route terpisah
app.get("/sutradara", (req, res) => {
  // Tampilkan SEMUA sutradara unik
  const uniqueDirectors = [...new Set(daftarFilm.map((f) => f.sutradara))];
  res.json({ sutradara: uniqueDirectors });
});

app.get("/sutradara/:nama", (req, res) => {
  // Tampilkan film dari sutradara tertentu
  const nama = req.params.nama.toLowerCase();
  const filmSutradara = daftarFilm.filter(
    (f) => f.sutradara.toLowerCase().includes(nama)
  );

  res.json({
    sutradara: req.params.nama,
    jumlahFilm: filmSutradara.length,
    films: filmSutradara
  });
});

// Akses: GET /sutradara                     -> ["Christopher Nolan", "Bong Joon-ho", ...]
// Akses: GET /sutradara/nolan               -> Film-film Christopher Nolan


// =========================================================================
// RINGKASAN MATERI 4
// =========================================================================

/*
  ✅ Dynamic Routing menggunakan parameter yang ditandai titik dua (:)
  ✅ Akses parameter via req.params.namaParameter
  ✅ Nilai parameter SELALU STRING -> konversi manual ke Number jika perlu
  ✅ Bisa punya MULTIPLE parameters: /films/:genre/:tahun
  ✅ URUTAN ROUTE SANGAT PENTING:
     -> Static routes (pasti) di ATAS
     -> Dynamic routes (berubah-ubah) di BAWAH
  ✅ Kombinasikan params (identitas) dengan query (opsi filter/sort)
  ✅ Selalu validasi: Bagaimana jika ID tidak ditemukan? (return 404)

  CHECKLIST SEBELUM CODING:
  ✅ Route statis sudah ditulis SEBELUM route dinamis?
  ✅ req.params sudah dikonversi ke tipe data yang benar?
  ✅ Sudah ada pengecekan "data tidak ditemukan" (404)?
  ✅ Nama parameter di route cocok dengan yang diakses di req.params?
*/


app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

// =========================================================================
// 📘 DAY 2 - MATERI 3: Async/Await Functions
// =========================================================================
// Studi Kasus: Aplikasi Daftar Film Favorit 🎬 (Lanjutan)
// =========================================================================

/*
  ============================
  MASALAH: KENAPA BUTUH ASYNC/AWAIT?
  ============================

  Di JavaScript, beberapa operasi membutuhkan WAKTU untuk selesai:
  - Membaca/menulis file dari disk
  - Mengambil data dari database
  - Memanggil API external (misal: API OMDB untuk cari data film)
  - Upload gambar

  Operasi-operasi ini disebut ASYNCHRONOUS (tidak instan, butuh menunggu).

  Tanpa async/await, kita harus menggunakan callback atau .then() yang
  membuat kode jadi bertingkat-tingkat dan susah dibaca ("Callback Hell").

  Async/Await = Cara MODERN untuk menulis kode asinkron yang TERLIHAT
  seperti kode biasa (sinkron). Lebih mudah dibaca dan di-debug.

  Analogi:
  - Callback/Promise = Memesan makanan lewat antrian, harus terus cek apakah sudah jadi
  - Async/Await = Memesan makanan, duduk santai, pelayan akan mengantar kalau sudah jadi

  ============================
  YANG HARUS DIPERHATIKAN
  ============================
  ⚠️ 'await' HANYA bisa digunakan di dalam fungsi yang diberi tanda 'async'.
  ⚠️ 'await' menunggu sebuah PROMISE selesai, lalu mengembalikan hasilnya.
  ⚠️ Jika operasi async GAGAL (error), gunakan try/catch untuk menangkapnya.
  ⚠️ Tanpa try/catch, error async bisa membuat server CRASH!
*/


// =========================================================================
// SECTION 1: DASAR ASYNC/AWAIT
// =========================================================================

// --- Simulasi fungsi asinkron (meniru waktu tunggu database) ---
function ambilDataDariDatabase(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const daftarFilm = [
        { id: 1, judul: "Inception", tahun: 2010 },
        { id: 2, judul: "Parasite", tahun: 2019 },
        { id: 3, judul: "Interstellar", tahun: 2014 },
      ];

      const film = daftarFilm.find((f) => f.id === id);

      if (film) {
        resolve(film);       // Berhasil -> kirim data film
      } else {
        reject("Film tidak ditemukan di database!");  // Gagal -> kirim pesan error
      }
    }, 1000); // Simulasi: butuh 1 detik untuk "mengambil data"
  });
}


// ✅ BENAR - Menggunakan async/await
async function tampilkanFilm() {
  try {
    console.log("Sedang mengambil data...");
    const film = await ambilDataDariDatabase(1);  // Tunggu sampai selesai
    console.log("Film ditemukan:", film);
    // Output: Film ditemukan: { id: 1, judul: 'Inception', tahun: 2010 }
  } catch (error) {
    console.log("Error:", error);
  }
}

tampilkanFilm();


// ❌ SALAH - Menggunakan await TANPA async
/*
function tampilkanFilm() {                          // Tidak ada kata 'async'!
  const film = await ambilDataDariDatabase(1);      // ERROR: SyntaxError: await is only valid in async functions
  console.log(film);
}
*/


// ❌ SALAH - Lupa await, langsung pakai hasilnya
/*
async function tampilkanFilm() {
  const film = ambilDataDariDatabase(1);  // Lupa 'await'!
  console.log(film);
  // Output: Promise { <pending> }
  // Bukan data film-nya, tapi OBJEK PROMISE yang belum selesai!
}
*/


// ❌ SALAH - Async tanpa try/catch (server bisa crash jika error)
/*
async function tampilkanFilm() {
  const film = await ambilDataDariDatabase(999);  // ID 999 tidak ada!
  console.log(film);
  // Tanpa try/catch, error ini tidak tertangkap!
  // Di Express, ini bisa membuat server berhenti total.
}
*/


// =========================================================================
// SECTION 2: ASYNC/AWAIT DI EXPRESS ROUTE
// =========================================================================

import express from "express";

const app = express();
const PORT = 3002;

// --- Simulasi fungsi database ---
function getAllFilms() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, judul: "Inception", tahun: 2010 },
        { id: 2, judul: "Parasite", tahun: 2019 },
      ]);
    }, 500);
  });
}

function getFilmById(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const films = [
        { id: 1, judul: "Inception", tahun: 2010 },
        { id: 2, judul: "Parasite", tahun: 2019 },
      ];
      const film = films.find((f) => f.id === id);
      if (film) resolve(film);
      else reject(new Error("Film tidak ditemukan!"));
    }, 500);
  });
}


// ✅ BENAR - Route handler dengan async/await + try/catch
app.get("/films", async (req, res) => {
  try {
    const films = await getAllFilms();    // Tunggu data selesai diambil
    res.json({
      success: true,
      data: films
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data film",
      error: error.message
    });
  }
});

app.get("/films/:id", async (req, res) => {
  try {
    const filmId = Number(req.params.id);
    const film = await getFilmById(filmId);   // Tunggu pencarian selesai
    res.json({
      success: true,
      data: film
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});


// ❌ SALAH - Lupa tambahkan 'async' di callback route
/*
app.get("/films", (req, res) => {                  // Tidak ada 'async'!
  const films = await getAllFilms();                // ERROR: await tidak boleh di sini
  res.json(films);
});
*/


// ❌ SALAH - Tidak menangkap error (server bisa crash)
/*
app.get("/films/:id", async (req, res) => {
  const film = await getFilmById(999);    // Tanpa try/catch, jika error -> CRASH!
  res.json(film);
});
*/


// =========================================================================
// SECTION 3: PERBEDAAN CALLBACK vs PROMISE vs ASYNC/AWAIT
// =========================================================================

/*
  Mari kita lihat kode yang SAMA ditulis dalam 3 cara berbeda:

  ==============================
  Cara 1: CALLBACK (Kuno, ribet)
  ==============================

  getFilmByIdCallback(1, function(error, film) {
    if (error) {
      console.log("Error:", error);
      return;
    }
    console.log("Film:", film);
  });


  ==============================
  Cara 2: PROMISE dengan .then() (Lebih baik, tapi masih bertingkat)
  ==============================

  getFilmById(1)
    .then((film) => {
      console.log("Film:", film);
    })
    .catch((error) => {
      console.log("Error:", error);
    });


  ==============================
  Cara 3: ASYNC/AWAIT (Paling modern, paling mudah dibaca)
  ==============================

  async function main() {
    try {
      const film = await getFilmById(1);
      console.log("Film:", film);
    } catch (error) {
      console.log("Error:", error);
    }
  }


  ⚠️ Ketiga cara di atas melakukan HAL YANG SAMA.
  Async/Await hanyalah "gula sintaks" (syntactic sugar) dari Promise.
  Di balik layar, async/await tetap menggunakan Promise.
*/


// =========================================================================
// SECTION 4: MULTIPLE AWAIT (Menunggu Beberapa Operasi)
// =========================================================================

// ✅ BENAR - Sequential (satu per satu, cocok jika data saling bergantung)
async function sequentialExample() {
  try {
    const film1 = await getFilmById(1);   // Tunggu ini selesai dulu
    const film2 = await getFilmById(2);   // Baru jalankan ini
    console.log("Sequential:", film1, film2);
    // Total waktu: 500ms + 500ms = 1000ms (1 detik)
  } catch (error) {
    console.log(error);
  }
}

// ✅ BENAR - Parallel (bersamaan, lebih cepat jika data tidak bergantung satu sama lain)
async function parallelExample() {
  try {
    const [film1, film2] = await Promise.all([
      getFilmById(1),    // Jalankan bersamaan
      getFilmById(2),    // Jalankan bersamaan
    ]);
    console.log("Parallel:", film1, film2);
    // Total waktu: 500ms (lebih cepat karena dijalankan bersamaan!)
  } catch (error) {
    console.log(error);
  }
}


// =========================================================================
// RINGKASAN MATERI 3
// =========================================================================

/*
  ✅ Async/Await = Cara modern menulis kode asinkron yang mudah dibaca.
  ✅ Tambahkan 'async' sebelum function, dan 'await' sebelum operasi yang butuh waktu.
  ✅ SELALU bungkus await dengan try/catch untuk menangkap error.
  ✅ Di Express route: app.get("/path", async (req, res) => { ... })
  ✅ Tanpa 'await', hasilnya adalah Promise object, BUKAN data-nya.
  ✅ Tanpa 'async', menggunakan 'await' akan menyebabkan SyntaxError.
  ✅ Gunakan Promise.all() jika ingin menjalankan beberapa operasi async secara paralel.

  CHECKLIST SEBELUM CODING:
  ✅ Ada 'async' di depan function?
  ✅ Ada 'await' di depan setiap operasi async (database, API call, dll)?
  ✅ Ada try/catch yang membungkus semua await?
  ✅ Di dalam catch, ada response ke client (res.status(500).json(...))?
*/

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

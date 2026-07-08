# 🎯 Panduan Pengerjaan: CRUD My Project

## Kondisi Awal Kamu Saat Ini

Kamu sudah punya:
- `index.js` -> sudah ada route GET `/my-project` yang me-render `my-project.hbs`
- `views/my-project.hbs` -> sudah ada 3 card project tapi masih **hardcode** (data ditulis langsung di HTML)
- Layout `main.hbs` + navbar partial sudah jalan
- Bootstrap sudah terpasang via CDN

## Yang Akan Kamu Bangun

Mengubah halaman my-project dari **hardcode** menjadi **dinamis + CRUD lengkap**.

---

## TAHAP 1: Siapkan Data Array di `index.js`

> **Tujuan:** Pindahkan data project dari HTML ke dalam Array di server.

**File:** `index.js`

1. Tambahkan middleware di bawah `const app = express()`:
   ```js
   app.use(express.urlencoded({ extended: true }));
   ```
   > Kenapa? Supaya `req.body` bisa membaca data dari form HTML nanti.

2. Buat Array `daftarProject` di atas semua route. Isi dengan 3 project yang sudah ada di HTML kamu:
   ```js
   let daftarProject = [
     { id: 1, nama: "Ayobuatbaik", deskripsi: "Applikasi web donasi...", image: "/img/Porto1.avif" },
     { id: 2, nama: "Andre Raditya", deskripsi: "Website pribadi ustad...", image: "/img/andreradityaguru.webp" },
     { id: 3, nama: "Sayf El Falah", deskripsi: "Web lembaga sekolah...", image: "/img/porto-selfa.avif" },
   ];
   ```

3. Buat variabel `let nextId = 4;` untuk auto-increment ID.

4. Ubah route GET `/my-project` yang sudah ada. Kirimkan data Array ke template:
   ```js
   app.get("/my-project", (req, res) => {
     res.render("my-project", {
       projects: daftarProject,
       adaProject: daftarProject.length > 0
     });
   });
   ```

**✅ Checkpoint:** Pastikan server masih bisa dijalankan tanpa error (`npm start`).

---

## TAHAP 2: Ubah `my-project.hbs` Jadi Dinamis (READ)

> **Tujuan:** Ganti 3 card HTML yang hardcode dengan looping `{{#each}}`.

**File:** `views/my-project.hbs`

1. HAPUS ketiga blok card yang hardcode (`<!-- Project 1 -->`, `<!-- Project 2 -->`, `<!-- Project 3 -->`).

2. Ganti dengan kode Handlebars `{{#each}}`. Tulis di dalam `<div class="row g-4">`:
   ```hbs
   {{#if adaProject}}
     {{#each projects}}
       <div class="col-md-4">
         <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
           <img src="{{this.image}}" class="card-img-top" alt="{{this.nama}}" style="height: 250px; object-fit: cover;" />
           <div class="card-body p-4">
             <h5 class="card-title fw-bold">{{this.nama}}</h5>
             <p class="card-text text-secondary">{{this.deskripsi}}</p>
             <a href="/project/{{this.id}}" class="btn btn-outline-primary btn-sm rounded-pill">Detail</a>
           </div>
         </div>
       </div>
     {{/each}}
   {{else}}
     <p class="text-center text-muted">Belum ada project. Yuk tambahkan!</p>
   {{/if}}
   ```

3. Ubah tombol "Tambah Project" yang sudah ada. Ganti `href`-nya:
   ```hbs
   <a href="/project/add" class="btn btn-primary btn-lg active mb-4">Tambah Project</a>
   ```

**✅ Checkpoint:** Buka browser `http://localhost:3000/my-project`. 3 card harus tetap muncul seperti sebelumnya, tapi sekarang datanya dari server.

---

## TAHAP 3: Buat Halaman & Route Tambah Project (CREATE)

> **Tujuan:** Buat form untuk menambah project baru.

### 3a. Buat file template baru

**File BARU:** `views/add-project.hbs`

Isi dengan form HTML:
```hbs
<h2 class="fw-bold mb-4">Tambah Project Baru</h2>

<form method="POST" action="/project/add">
  <div class="mb-3">
    <label class="form-label">Nama Project</label>
    <input type="text" class="form-control" name="nama" required />
  </div>
  <div class="mb-3">
    <label class="form-label">Deskripsi</label>
    <textarea class="form-control" name="deskripsi" rows="3" required></textarea>
  </div>
  <div class="mb-3">
    <label class="form-label">URL Gambar (path)</label>
    <input type="text" class="form-control" name="image" placeholder="/img/namafile.jpg" required />
  </div>
  <button type="submit" class="btn btn-primary">Simpan</button>
  <a href="/my-project" class="btn btn-secondary ms-2">Batal</a>
</form>
```

> **Perhatikan:** Setiap `<input>` dan `<textarea>` WAJIB punya attribute `name`. Nilai `name` inilah yang menjadi key di `req.body`.

### 3b. Tambahkan 2 route baru di `index.js`

```js
// GET: Tampilkan halaman form tambah
app.get("/project/add", (req, res) => {
  res.render("add-project");
});

// POST: Proses data dari form
app.post("/project/add", (req, res) => {
  const { nama, deskripsi, image } = req.body;  // Destructuring!

  const projectBaru = {
    id: nextId,
    nama,
    deskripsi,
    image
  };

  daftarProject.push(projectBaru);
  nextId++;

  res.redirect("/my-project");
});
```

**✅ Checkpoint:** Buka `/project/add`, isi form, klik Simpan. Card baru harus muncul di halaman `/my-project`.

---

## TAHAP 4: Buat Halaman Detail Project (READ + Dynamic Routing)

> **Tujuan:** Ketika card diklik, buka halaman detail project berdasarkan ID.

### 4a. Buat file template baru

**File BARU:** `views/project-detail.hbs`

```hbs
<div class="card border-0 shadow-sm rounded-4 overflow-hidden" style="max-width: 600px; margin: auto;">
  <img src="{{project.image}}" class="card-img-top" style="height: 300px; object-fit: cover;" />
  <div class="card-body p-4">
    <h3 class="fw-bold">{{project.nama}}</h3>
    <p class="text-secondary">{{project.deskripsi}}</p>
    <a href="/my-project" class="btn btn-outline-secondary btn-sm">← Kembali</a>
    <a href="/project/edit/{{project.id}}" class="btn btn-outline-warning btn-sm">Edit</a>
    <a href="/project/delete/{{project.id}}" class="btn btn-outline-danger btn-sm">Hapus</a>
  </div>
</div>
```

### 4b. Tambahkan route dynamic di `index.js`

```js
app.get("/project/:id", (req, res) => {
  const { id } = req.params;  // Destructuring!
  const project = daftarProject.find((p) => p.id === Number(id));  // HOF: .find()

  if (!project) {
    return res.status(404).send("Project tidak ditemukan!");
  }

  res.render("project-detail", { project });
});
```

> ⚠️ **KRUSIAL:** Route `/project/:id` harus ditulis **DI BAWAH** route `/project/add`. Kalau tidak, Express mengira "add" adalah nilai ID!

**✅ Checkpoint:** Klik "Detail" di salah satu card. Halaman detail harus menampilkan data project yang diklik.

---

## TAHAP 5: Buat Fitur Edit Project (UPDATE)

> **Tujuan:** Form edit yang sudah terisi data lama, lalu bisa disimpan perubahannya.

### 5a. Buat file template baru

**File BARU:** `views/edit-project.hbs`

```hbs
<h2 class="fw-bold mb-4">Edit Project: {{project.nama}}</h2>

<form method="POST" action="/project/edit/{{project.id}}">
  <div class="mb-3">
    <label class="form-label">Nama Project</label>
    <input type="text" class="form-control" name="nama" value="{{project.nama}}" required />
  </div>
  <div class="mb-3">
    <label class="form-label">Deskripsi</label>
    <textarea class="form-control" name="deskripsi" rows="3" required>{{project.deskripsi}}</textarea>
  </div>
  <div class="mb-3">
    <label class="form-label">URL Gambar</label>
    <input type="text" class="form-control" name="image" value="{{project.image}}" required />
  </div>
  <button type="submit" class="btn btn-warning">Update</button>
  <a href="/my-project" class="btn btn-secondary ms-2">Batal</a>
</form>
```

> **Perhatikan:** `value="{{project.nama}}"` membuat input sudah terisi data lama.

### 5b. Tambahkan 2 route di `index.js`

```js
// GET: Tampilkan form edit dengan data lama
app.get("/project/edit/:id", (req, res) => {
  const { id } = req.params;
  const project = daftarProject.find((p) => p.id === Number(id));

  if (!project) {
    return res.status(404).send("Project tidak ditemukan!");
  }

  res.render("edit-project", { project });
});

// POST: Proses update data
app.post("/project/edit/:id", (req, res) => {
  const { id } = req.params;
  const { nama, deskripsi, image } = req.body;  // Destructuring!

  const projectIndex = daftarProject.findIndex((p) => p.id === Number(id));

  if (projectIndex === -1) {
    return res.status(404).send("Project tidak ditemukan!");
  }

  daftarProject[projectIndex] = {
    id: Number(id),
    nama,
    deskripsi,
    image
  };

  res.redirect("/my-project");
});
```

**✅ Checkpoint:** Klik "Edit" di halaman detail. Form harus muncul dengan data lama. Ubah sesuatu, klik Update, card harus terupdate.

---

## TAHAP 6: Buat Fitur Hapus Project (DELETE)

> **Tujuan:** Menghapus project dari daftar.

Tambahkan route di `index.js`:

```js
app.get("/project/delete/:id", (req, res) => {
  const { id } = req.params;  // Destructuring!
  daftarProject = daftarProject.filter((p) => p.id !== Number(id));  // HOF: .filter()
  res.redirect("/my-project");
});
```

> **Penjelasan `.filter()`:** Buat array baru yang berisi SEMUA project KECUALI yang ID-nya cocok. Hasilnya = project tersebut "terhapus".

**✅ Checkpoint:** Klik "Hapus" di halaman detail. Card harus hilang dari daftar.

---

## ⚠️ URUTAN ROUTE DI `index.js` (SANGAT PENTING!)

Pastikan urutan route kamu seperti ini (dari atas ke bawah):

```
1. app.get("/", ...)                     <- Home
2. app.get("/contact", ...)              <- Contact
3. app.get("/my-project", ...)           <- READ semua
4. app.get("/project/add", ...)          <- Form tambah (STATIS)
5. app.post("/project/add", ...)         <- Proses tambah
6. app.get("/project/edit/:id", ...)     <- Form edit
7. app.post("/project/edit/:id", ...)    <- Proses edit
8. app.get("/project/delete/:id", ...)   <- Proses hapus
9. app.get("/project/:id", ...)          <- Detail (PALING BAWAH!)
```

> Route `/project/:id` HARUS di paling bawah karena dia menangkap SEMUA `/project/apapun`.

---

## Checklist Tugas

- [ ] **Tahap 1:** Data Array sudah ada di `index.js` + middleware `urlencoded` sudah dipasang
- [ ] **Tahap 2:** `my-project.hbs` sudah dinamis pakai `{{#each}}`
- [ ] **Tahap 3:** CREATE bisa jalan (form + route POST)
- [ ] **Tahap 4:** Detail project bisa dibuka lewat `/project/:id`
- [ ] **Tahap 5:** UPDATE bisa jalan (form terisi data lama + route POST)
- [ ] **Tahap 6:** DELETE bisa jalan (project hilang dari daftar)
- [ ] **Bonus:** Semua route menggunakan destructuring `const { id } = req.params`
- [ ] **Bonus:** Menggunakan `.find()` dan `.filter()` (bukan for loop manual)

---

## Keyword yang Harus Muncul di Kode Kamu

| Keyword | Di mana | Fungsinya |
|---------|---------|-----------|
| `express.urlencoded()` | `index.js` (atas) | Baca data form |
| `const { nama, deskripsi } = req.body` | Route POST | Destructuring body |
| `const { id } = req.params` | Route dinamis | Destructuring params |
| `.find()` | Detail & Edit | Cari 1 project by ID |
| `.findIndex()` | Update | Cari posisi index project |
| `.filter()` | Delete | Hapus project dari array |
| `.push()` | Create | Tambah project baru |
| `{{#each projects}}` | `my-project.hbs` | Looping card |
| `res.redirect("/my-project")` | POST routes | Redirect setelah aksi |

Selamat mengerjakan! Kerjakan satu tahap dulu, test di browser, baru lanjut ke tahap berikutnya. 💪

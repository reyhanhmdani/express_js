import express from "express";
import { engine } from "express-handlebars";

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let daftarProject = [
  // { id: 1, nama: "Ayobuatbaik", deskripsi: "...", image: "/img/Porto1.avif", link: "https://ayobuatbaik.com" },
  // { id: 2, nama: "Andre Raditya", deskripsi: "...", image: "/img/andreradityaguru.webp", link: "https://andreraditya.guru" },
  // { id: 3, nama: "Sayf El Falah", deskripsi: "...", image: "/img/porto-selfa.avif", link: "https://selfa.sch.id" },
];

// Setup Express Handlebars
app.set("view engine", "hbs");
app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: "./views/layouts/",
    partialsDir: "./views/layouts/partials/",
  }),
);
app.set("views", "views");

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home", {
    title: "Home",
  });
});
app.get("/contact", (req, res) => {
  res.render("contact");
});
app.get("/my-project", (req, res) => {
  res.render("my-project", {
    projects: daftarProject,
  });
});

app.get("/add-project", (req, res) => {
  res.render("add-project");
});

app.post("/add-project", (req, res) => {
  const { nama, deskripsi, image } = req.body;

  const projectBaru = {
    id: Date.now(),
    nama,
    deskripsi,
    image,
  };

  daftarProject.unshift(projectBaru);
  res.redirect("/my-project");
});

app.get("/project/:id", (req, res) => {
  const { id } = req.params;

  const projectId = parseInt(id);

  // cari project by id
  const project = daftarProject.find((p) => p.id === projectId);

  if (!project) {
    return res.status(404).send("Project tidak ditemukan!");
  }

  res.render("project-detail", { project });
});

app.get("/project-edit/:id", (req, res) => {
  const { id } = req.params;

  const projectId = parseInt(id);

  // cari project by id
  const project = daftarProject.find((p) => p.id === projectId);

  if (!project) {
    return res.status(404).send("Project tidak ditemukan!");
  }

  res.render("edit-project", { project });
});

app.post("/project-edit/:id", (req, res) => {
  const { id } = req.params;
  const { nama, deskripsi, image } = req.body;

  const projectIndex = daftarProject.findIndex((p) => p.id === Number(id));

  if (projectIndex === -1) {
    return res.status(404).send("Project tidak ditemukan!");
  }

  daftarProject[projectIndex] = {
    id: Number(id),
    nama,
    deskripsi,
    image,
  };

  res.redirect("/my-project");
});

app.get("/project-delete/:id", (req, res) => {
  const { id } = req.params; // Destructuring!
  daftarProject = daftarProject.filter((p) => p.id !== Number(id));
  res.redirect("/my-project");
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

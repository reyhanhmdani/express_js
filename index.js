import express from "express";
import { engine } from "express-handlebars";
import { createProject, deleteProject, getEditProject, getProject, getProjects, updateProject, getAddProject } from "./controllers/projectController.js";
import session from "express-session";

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "secretKey",
    resave: false,
    saveUninitialized: true,
  }),
);

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

app.use((req, res, next) => {
  res.locals.flash = req.session.flash;

  delete req.session.flash;

  next();
});

app.get("/", (req, res) => {
  res.render("home", {
    title: "Home",
  });
});
app.get("/contact", (req, res) => {
  res.render("contact");
});
app.get("/my-project", getProjects);

app.get("/project/:id", getProject);

app.get("/add-project", getAddProject);
app.post("/add-project", createProject);

app.get("/project-edit/:id", getEditProject);

app.post("/project-edit/:id", updateProject);

app.get("/project-delete/:id", deleteProject);

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

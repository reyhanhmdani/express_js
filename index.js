import express from "express";
import { engine } from "express-handlebars";

const app = express();
const port = 3000;

// Setup Express Handlebars
app.set("view engine", "hbs");
app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: "./views/layouts/",
    partialsDir: "./views/layouts/partials/", 
  })
);
app.set("views", "views");

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home");
});
app.get("/contact", (req, res) => {
  res.render("contact");
});
app.get("/my-project", (req, res) => {
  res.render("my-project");
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

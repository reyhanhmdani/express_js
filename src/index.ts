import express from "express";
import { getHello } from "./controllers/userController";
import userRoute from "./router/userRoute";

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", userRoute);

app.listen(port, () => {
  console.log(`Server jalan di port http://localhost:${port}`);
});

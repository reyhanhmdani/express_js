import { Request, Response } from "express";

export const getHello = (req: Request, res: Response) => {
  return res.json({
    message: "Hello world",
  });
};

export const getProfile = (req: Request<{ name: string }>, res: Response) => {
  const name = req.params.name;

  return res.json({
    message: `Halo, selamat datang ${name}!`,
  });
};

interface loginReq {
  username: string;
  password: string;
}

export const login = (req: Request, res: Response) => {
  const { username, password }: loginReq = req.body;

  if (username === "rey" && password === "123") {
    return res.status(201).json({
      message: `Login berhasil, selamat datang ${username}`,
      status: 201,
    });
  } else {
    return res.status(403).json({
      message: "username atau password salah",
      status: 403,
    });
  }
};

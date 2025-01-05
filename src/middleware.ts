import { type NextFunction, type Request, type Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET as string;

export const authorize = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized!" });
    }
    req.user = decoded as JwtPayload;
    next();
  });
};

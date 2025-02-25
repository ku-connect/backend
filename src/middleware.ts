import { type NextFunction, type Request, type Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { z } from "zod";
import { StatusCodes } from "http-status-codes";

const secretKey = process.env.JWT_SECRET as string;

export const authorize = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "No token provide" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized!" });
    }
    req.user = decoded as JwtPayload;
    next();
  });
};

export const valdiateReq = (schema: z.ZodObject<any, any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req.body); 
      req.body = data;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(StatusCodes.BAD_REQUEST).json(error.errors);
      }
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  };
}
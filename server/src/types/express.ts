/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response, NextFunction } from 'express';

export type Handler<ResponseData = any> = (
  request: Request<any>,
  Response: Response<ResponseData>,
) => void | Promise<void>;

export type Middleware<ResponseData = any> = (
  request: Request<any>,
  response: Response<ResponseData>,
  next: NextFunction,
) => void | Promise<void>;

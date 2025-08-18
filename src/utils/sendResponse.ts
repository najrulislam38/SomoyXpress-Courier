import { Response } from "express";

interface IMeta {
  page?: number;
  limit?: number;
  totalPage?: number;
  total: number;
}

interface IResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta?: IMeta;
}

export const sendResponse = <T>(res: Response, data: IResponse<T>) => {
  res.status(data.statusCode).json({
    success: data.success,
    meta: data.meta,
    data: data.data,
  });
};

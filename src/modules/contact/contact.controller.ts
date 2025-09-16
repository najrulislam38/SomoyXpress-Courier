/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { ContactService } from "./contact.service";

const getAllMail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ContactService.getAllMailFromDB(
      req.query as Record<string, string>
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All Mail Retrieved Successfully",
      data: result,
    });
  }
);

const getMailFromContact = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ContactService.getMailFromContact(req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Mail Sent Successfully.",
      data: result,
    });
  }
);

export const ContactController = {
  getMailFromContact,
  getAllMail,
};

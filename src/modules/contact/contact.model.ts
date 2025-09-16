import { model, Schema } from "mongoose";
import { IMailFromContact } from "./contact.interface";

const contactSchema = new Schema<IMailFromContact>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const Contact = model<IMailFromContact>("Contact", contactSchema);

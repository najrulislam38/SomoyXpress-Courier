import AppError from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IMailFromContact } from "./contact.interface";
import { Contact } from "./contact.model";

const searchAbleFields = ["email", "name", "subject"];

const getAllMailFromDB = async (query: Record<string, string>) => {
  const userQuery = new QueryBuilder(Contact.find(), query || {})
    .search(searchAbleFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const users = await userQuery.build().select("-password");
  const meta = await userQuery.getMeta();

  return {
    data: users,
    meta,
  };
};

const getMailFromContact = async ({
  email,
  name,
  subject,
  message,
}: IMailFromContact) => {
  if (!name || !email || !message || !subject) {
    throw new AppError(400, "All field is required");
  }

  const mail = await Contact.create({
    email,
    name,
    subject,
    message,
  });

  return mail;
};

export const ContactService = {
  getMailFromContact,
  getAllMailFromDB,
};

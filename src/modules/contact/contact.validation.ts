import z from "zod";

export const contactMailValidation = z.object({
  name: z.string({ error: "Name is required" }).min(2).trim(),
  email: z.email({ error: "Valid email is required" }),
  subject: z.string({ error: "subject is required" }),
  message: z.string({ error: "message is required" }).min(5),
});

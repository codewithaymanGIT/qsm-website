import { z } from "zod";

// Phase 2 reuses this schema on the server before storing a lead.
export const quoteSchema = z.object({
  name: z.string().trim().min(1, "Enter your name."),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Enter a phone number with at least 10 digits."),
  email: z.string().trim().email("Enter a valid email address."),
  grade: z.string().trim().max(80).optional().or(z.literal("")),
  dimensions: z.string().trim().max(200).optional().or(z.literal("")),
  quantity: z.string().trim().max(100).optional().or(z.literal("")),
  message: z.string().trim().max(2000, "Keep the message under 2000 characters.").optional().or(z.literal("")),
});

export type QuoteInput = z.infer<typeof quoteSchema>;

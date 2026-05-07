import { z } from "zod";

// datetime-local input format: YYYY-MM-DDTHH:mm
const dateTimeLocalRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export const createProgramSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  organization: z.string().min(2, "Organization name is required"),
  durationWeeks: z.number().int().min(1).max(52),
  seats: z.number().int().min(1).max(100),
  applicationDeadline: z.string().regex(dateTimeLocalRegex, "Invalid date format").optional().or(z.literal("")),
});

export const updateProgramSchema = createProgramSchema.partial().extend({
  id: z.string(),
});

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;

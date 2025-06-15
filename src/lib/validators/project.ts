
import { z } from 'zod';

const required_error = "This field is required";
const positive_number_error = "Price must be a positive number";
const at_least_one_milestone_error = "At least one milestone is required";

export const milestoneSchema = z.object({
  title: z.string().min(1, { message: required_error }),
  description: z.string().min(1, { message: required_error }),
  price: z.coerce.number().positive({ message: positive_number_error }),
});

export const createProjectSchema = z.object({
  name: z.string().min(1, { message: required_error }),
  brief: z.string().min(1, { message: required_error }),
  milestones: z.array(milestoneSchema).min(1, { message: at_least_one_milestone_error }),
});

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;

import { z } from 'zod';

export const subscriptionStatusSchema = z.enum(['active', 'trial', 'inactive', 'suspended']);

export const createCustomerSchema = z.object({
  companyName: z.string().trim().min(2).max(120),
  country: z.string().trim().min(2).max(10),
  subscriptionStatus: subscriptionStatusSchema.default('active'),
});

export const updateCustomerSchema = z
  .object({
    companyName: z.string().trim().min(2).max(120).optional(),
    country: z.string().trim().min(2).max(10).optional(),
    subscriptionStatus: subscriptionStatusSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

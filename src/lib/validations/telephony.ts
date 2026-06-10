import { z } from 'zod';

const e164Regex = /^\+[1-9]\d{6,14}$/;

export const createPhoneNumberSchema = z.object({
  e164Number: z.string().regex(e164Regex, 'Must be valid E.164 format'),
  label: z.string().trim().min(1).max(80),
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
});

export const updatePhoneNumberSchema = createPhoneNumberSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field is required' },
);

export const createExtensionSchema = z.object({
  extensionNumber: z.string().regex(/^\d{2,6}$/, 'Must be 2-6 digits'),
  displayName: z.string().trim().min(1).max(80),
  assignedUserName: z.string().trim().max(80).optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const updateExtensionSchema = createExtensionSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field is required' },
);

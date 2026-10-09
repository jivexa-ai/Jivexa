const { z } = require('zod');

const signupSchema = z.object({
  name: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(3, { message: 'Name must be at least 3 characters long' })
    .max(80, { message: 'Name must be at most 80 characters long' }),
  
  age: z
    .number({ invalid_type_error: 'Age must be a valid number' })
    .min(10, { message: 'Age must be at least 10' })
    .max(120, { message: 'Age must be at most 120' })
    .optional(),

  email: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim().toLowerCase() : val),
    z.string({ required_error: 'Email is required' }).email({ message: 'Invalid email address' })
  ),

  password: z
    .string({ required_error: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(50, { message: 'Password must be at most 50 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' }),

  role: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim().toUpperCase() : val),
    z.enum(['PATIENT', 'DOCTOR', 'PHARMACY', 'AMBULANCE_PARTNER', 'ADMIN'], {
      errorMap: () => ({ message: 'Invalid user role specified' })
    })
  ).optional().default('PATIENT'),

  phone: z.string().trim().optional(),
  phoneNumber: z.string().trim().optional(),
  healthId: z.string().trim().optional()
});

const loginSchema = z.object({
  email: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim().toLowerCase() : val),
    z.string({ required_error: 'Email is required' }).email({ message: 'Invalid email address' })
  ),

  password: z
    .string({ required_error: 'Password is required' })
    .min(1, { message: 'Password cannot be empty' })
});

const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: 'Name must be at least 3 characters long' })
    .max(80, { message: 'Name must be at most 80 characters long' })
    .optional(),

  age: z
    .number()
    .min(10, { message: 'Age must be at least 10' })
    .max(120, { message: 'Age must be at most 120' })
    .optional(),

  email: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim().toLowerCase() : val),
    z.string().email({ message: 'Invalid email address' })
  ).optional()
});

module.exports = {
  signupSchema,
  loginSchema,
  updateProfileSchema
};

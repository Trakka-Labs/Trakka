import { z } from 'zod'
import { emailField, phoneField } from './validators'

export const companyInfoSchema = z.object({
  companyName: z.string().trim().min(2, 'Company name is required'),
  logoUrl: z.string().nullable().optional(),
  phone: phoneField,
  email: emailField,
  address: z.string().trim().min(5, 'Business address is required'),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  country: z.string().trim().min(2, 'Country is required'),
})

export const paymentAccountSchema = z.object({
  bankName: z.string().trim().min(1, 'Select your bank'),
  accountNumber: z.string().trim().regex(/^\d{10}$/, 'Enter a valid 10-digit account number'),
  accountHolderName: z.string().trim().min(2, 'We need a verified account name'),
})

export const priceFloorSchema = z.object({
  minimumPrice: z
    .string()
    .trim()
    .min(1, 'Minimum delivery price is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount')
    .refine((v) => Number(v) > 0, { message: 'Minimum price must be greater than zero' })
    .transform(Number),
})

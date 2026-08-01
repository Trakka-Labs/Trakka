import { z } from 'zod'
import { emailField, phoneField } from './validators'

export const companyInfoSchema = z.object({
  companyName: z.string().trim().min(2, 'Company name is required'),
  logoUrl: z
    .string()
    .regex(/^data:image\/(?:png|jpeg);base64,[A-Za-z0-9+/]+={0,2}$/, 'Upload a PNG or JPEG image')
    .nullable()
    .optional(),
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
  normalPriceBaseline: z
    .string()
    .trim()
    .min(1, 'Normal delivery baseline is required')
    .regex(/^\d+$/, 'Enter a whole-number amount')
    .refine((v) => Number(v) > 0, { message: 'Normal baseline must be greater than zero' })
    .transform(Number),
  urgentPriceBaseline: z
    .string()
    .trim()
    .min(1, 'Urgent delivery baseline is required')
    .regex(/^\d+$/, 'Enter a whole-number amount')
    .refine((v) => Number(v) > 0, { message: 'Urgent baseline must be greater than zero' })
    .transform(Number),
}).refine((values) => values.urgentPriceBaseline >= values.normalPriceBaseline, {
  path: ['urgentPriceBaseline'],
  message: 'Urgent baseline cannot be below the normal baseline',
})

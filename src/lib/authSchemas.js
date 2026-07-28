import { z } from 'zod'
import { emailField, phoneField, passwordField } from './validators'

export const businessSignupSchema = z
  .object({
    companyName: z.string().trim().min(2, 'Company name is required'),
    email: emailField,
    phone: phoneField,
    password: passwordField,
    confirmPassword: z.string().min(1, 'Confirm your password'),
    agreeToTerms: z
      .boolean()
      .refine((v) => v === true, { message: 'You must agree to the Terms and Privacy Policy' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const businessLoginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

export const forgotPasswordSchema = z.object({
  email: emailField,
})

export const resetPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

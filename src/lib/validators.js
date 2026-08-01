import { z } from 'zod'

export const emailField = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email address')

export const phoneField = z
  .string()
  .trim()
  .regex(/^\d{10,15}$/, 'Enter a phone number containing 10 to 15 digits')

export const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Include at least one lowercase letter')
  .regex(/[A-Z]/, 'Include at least one uppercase letter')
  .regex(/\d/, 'Include at least one number')

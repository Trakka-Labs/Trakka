import { z } from 'zod'

export const emailField = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email address')

export const phoneField = z
  .string()
  .trim()
  .min(10, 'Enter a valid phone number')
  .regex(/^[0-9+\-\s()]+$/, 'Enter a valid phone number')

export const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Include at least one lowercase letter')
  .regex(/[A-Z]/, 'Include at least one uppercase letter')
  .regex(/\d/, 'Include at least one number')

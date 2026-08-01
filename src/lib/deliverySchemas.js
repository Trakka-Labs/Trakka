import { z } from 'zod'
import { phoneField } from './validators.js'

const requiredMoney = (label) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .regex(/^\d+$/, `${label} must be a whole number`)
    .refine((value) => Number(value) > 0, `${label} must be greater than zero`)

export function createDeliverySchema(priceBaselines) {
  return z.object({
    pickupAddress: z.string().trim().min(5, 'Enter the full pickup address'),
    pickupNeighborhood: z.string().trim().min(1, 'Select the pickup neighborhood'),
    pickupLandmark: z.string().trim().max(120, 'Keep the landmark under 120 characters').optional(),
    pickupContactName: z.string().trim().min(2, 'Enter the pickup contact name'),
    pickupContactPhone: phoneField,
    dropoffAddress: z.string().trim().min(5, 'Enter the full delivery address'),
    dropoffNeighborhood: z.string().trim().min(1, 'Select the delivery neighborhood'),
    dropoffLandmark: z.string().trim().max(120, 'Keep the landmark under 120 characters').optional(),
    recipientName: z.string().trim().min(2, 'Enter the receiver name'),
    recipientPhone: phoneField,
    packageDescription: z.string().trim().min(3, 'Describe the package'),
    declaredValue: requiredMoney('Declared value'),
    notes: z.string().trim().max(300, 'Keep notes under 300 characters').optional(),
    serviceType: z.enum(['normal', 'urgent'], { message: 'Select a delivery service' }),
    requestedDate: z.string().trim().min(1, 'Select the requested delivery date'),
    paymentType: z.enum(['sender_paid', 'pay_on_delivery'], {
      message: 'Select who will pay',
    }),
    deliveryFee: requiredMoney('Delivery fee'),
  }).superRefine((values, context) => {
    const baseline = values.serviceType === 'urgent'
      ? priceBaselines.urgent
      : priceBaselines.normal
    if (Number(values.deliveryFee) < baseline) {
      context.addIssue({
        code: 'custom',
        path: ['deliveryFee'],
        message: `Delivery fee cannot be below the ₦${baseline.toLocaleString('en-NG')} ${values.serviceType} delivery baseline`,
      })
    }
  })
}

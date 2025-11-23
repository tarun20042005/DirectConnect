import { storage } from './storage';
import { getUncachableStripeClient } from './stripeClient';

export class StripeService {
  async createPaymentIntent(amount: number, tenantId: string, propertyId: string, description: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'inr',
      metadata: {
        tenantId,
        propertyId,
        description,
      },
    });
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async createCustomer(email: string, userId: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.customers.create({
      email,
      metadata: { userId },
    });
  }
}

export const stripeService = new StripeService();

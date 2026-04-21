export type StripePaymentIntentRequest = {
  currency: string;
};

export type StripePaymentIntentResponse = {
  clientSecret: string;
  code: number;
  message: string;
};

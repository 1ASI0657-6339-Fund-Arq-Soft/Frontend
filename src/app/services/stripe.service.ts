import { Injectable } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripePromise = loadStripe('pk_test_TU_CLAVE_PUBLICA_AQUI');

  private stripe: any = null;
  private elements: StripeElements | null = null;
  private cardElement: StripeCardElement | null = null;

  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  async initializeStripe(): Promise<void> {
    this.stripe = await this.stripePromise;
    if (this.stripe) {
      this.elements = this.stripe.elements();
    }
  }

  createCardElement(elementId: string): void {
    if (!this.elements) {
      console.error('Stripe elements no inicializado');
      return;
    }

    this.cardElement = this.elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#32325d',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a'
        }
      }
    });

    const element = document.getElementById(elementId);
    if (element) {
      this.cardElement.mount(`#${elementId}`);
    }
  }

  createPaymentIntent(amount: number, currency: string = 'usd'): Observable<any> {
    return this.http.post(`${this.API_URL}/create-payment-intent`, {
      amount,
      currency
    });
  }

  async processPayment(clientSecret: string, billingDetails: any): Promise<any> {
    if (!this.stripe || !this.cardElement) {
      throw new Error('Stripe no está inicializado correctamente');
    }

    const { error, paymentIntent } = await this.stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: this.cardElement,
          billing_details: billingDetails
        }
      }
    );

    if (error) {
      throw error;
    }

    return paymentIntent;
  }

  createSubscription(priceId: string, customerId: string): Observable<any> {
    return this.http.post(`${this.API_URL}/create-subscription`, {
      priceId,
      customerId
    });
  }

  destroyCardElement(): void {
    if (this.cardElement) {
      this.cardElement.destroy();
      this.cardElement = null;
    }
  }

  getSavedPaymentMethods(customerId: string): Observable<any> {
    return this.http.get(`${this.API_URL}/payment-methods/${customerId}`);
  }

  savePaymentMethod(paymentMethodId: string, customerId: string): Observable<any> {
    return this.http.post(`${this.API_URL}/save-payment-method`, {
      paymentMethodId,
      customerId
    });
  }

  async redirectToCheckout(sessionId: string): Promise<void> {
    if (!this.stripe) {
      throw new Error('Stripe no está inicializado');
    }

    const { error } = await this.stripe.redirectToCheckout({ sessionId });

    if (error) {
      throw error;
    }
  }

  createCheckoutSession(priceId: string, customerId?: string): Observable<any> {
    return this.http.post(`${this.API_URL}/create-checkout-session`, {
      priceId,
      customerId
    });
  }
}

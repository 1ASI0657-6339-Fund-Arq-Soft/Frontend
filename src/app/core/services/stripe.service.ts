import { Injectable } from "@angular/core";
import { of, Observable } from "rxjs";
import { delay } from "rxjs/operators";

@Injectable({ providedIn: 'root' })
export class StripeService {
  // Mock: create checkout session and return a receipt URL
  createCheckoutSession(amount: string, description: string): Observable<{ receiptUrl: string }> {
    // In real integration, call backend which calls Stripe APIs and returns session info
    const fakeReceipt = `https://receipts.example.com/receipt_${Date.now()}.pdf`;
    return of({ receiptUrl: fakeReceipt }).pipe(delay(800));
  }
}

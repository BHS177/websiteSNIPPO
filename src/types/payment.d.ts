
// Type definitions for Apple Pay
interface ApplePaySession {
  new(version: number, paymentRequest: ApplePayJS.ApplePayPaymentRequest): ApplePaySession;
  canMakePayments(): boolean;
  canMakePaymentsWithActiveCard(merchantIdentifier: string): Promise<boolean>;
  STATUS_SUCCESS: number;
  STATUS_FAILURE: number;
  completePayment(status: number): void;
  completeMerchantValidation(merchantSession: any): void;
  begin(): void;
  abort(): void;
  
  // Event handlers
  onvalidatemerchant: (event: ApplePayValidateMerchantEvent) => void;
  onpaymentauthorized: (event: ApplePayPaymentAuthorizedEvent) => void;
  oncancel: () => void;
}

interface ApplePayValidateMerchantEvent {
  validationURL: string;
}

interface ApplePayPaymentAuthorizedEvent {
  payment: ApplePayPayment;
}

interface ApplePayPayment {
  token: {
    paymentData: any;
    paymentMethod: any;
    transactionIdentifier: string;
  };
}

interface ApplePayPaymentRequest {
  countryCode: string;
  currencyCode: string;
  supportedNetworks: string[];
  merchantCapabilities: string[];
  merchantIdentifier?: string;
  total: {
    label: string;
    amount: number;
  };
}

declare namespace ApplePayJS {
  interface ApplePayPaymentRequest {
    countryCode: string;
    currencyCode: string;
    supportedNetworks: string[];
    merchantCapabilities: string[];
    merchantIdentifier?: string;
    total: {
      label: string;
      amount: number;
    };
  }
}

interface Window {
  ApplePaySession?: ApplePaySession;
}

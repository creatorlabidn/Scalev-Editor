export interface PaymentMethod {
  id: string;
  label: string;
  badge: string;
  color: string;
  logo: string;
  sub?: string;
}

export interface FormField {
  id: string;
  label: string;
  placeholder: string;
  type: 'text' | 'tel' | 'email' | 'textarea' | 'location';
  required: boolean;
}

export interface AppConfig {
  apiKey: string;
  storeId: string;
  storeIntId: number;
  storeName?: string;
  waNumber: string;
  n8nWebhook: string;
  pixelId?: string;
  fbAccessToken?: string;
}

export interface FormState {
  config: AppConfig;
  payments: PaymentMethod[];
  fields: FormField[];
  productMode: 'all' | 'specific';
  specificVariantIds: string[];
  specificBundleIds: string[];
  autoSelectFirst: boolean;
  allowMultiSelect: boolean;
  productSectionTitle: string;
  showCourier: boolean;
  showPromoBadge: boolean;
  promoUpsellText: string;
  promoSuccessText: string;
  promoBonusText: string;
  codAlwaysWhatsapp: boolean;
  afterOrderAction: 'whatsapp' | 'order_link' | 'custom_link';
  customRedirectUrl?: string;
  showQtyButtons: boolean;
  submitButtonText: string;
  submitButtonBgColor: string;
  submitButtonTextColor: string;
  showProductSection: boolean;
}

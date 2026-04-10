import { FormState, PaymentMethod, FormField } from "./types";

export const AVAILABLE_FIELDS: FormField[] = [
  { id: "f-nama", label: "Nama Lengkap", placeholder: "Nama Lengkap", type: "text", required: true },
  { id: "f-email", label: "Email", placeholder: "email@contoh.com", type: "email", required: true },
  { id: "f-phone", label: "Nomor HP", placeholder: "812345678", type: "tel", required: true },
  { id: "f-kecamatan", label: "Kecamatan (ketik untuk cari)", placeholder: "Cari kecamatan...", type: "location", required: true },
  { id: "f-alamat", label: "Alamat Lengkap", placeholder: "Jl. Contoh No. 1, RT 01/RW 02", type: "textarea", required: true },
  { id: "f-note", label: "Catatan (Opsional)", placeholder: "Contoh: Warna Merah, Ukuran XL", type: "textarea", required: false },
];

export const AVAILABLE_PAYMENTS: PaymentMethod[] = [
  { id: "cod",  label: "Bayar di tempat (COD)",       badge: "COD",     color: "#2d9e5f", logo: "https://res.cloudinary.com/dho4tdzhr/image/upload/COD_j4joxw.png" },
  { id: "qris", label: "QRIS",                         badge: "QRIS",    color: "#444",    logo: "https://res.cloudinary.com/dho4tdzhr/image/upload/qris_l8lqz7.png" },
  { id: "va",   label: "Bank Mandiri Virtual Account", badge: "MANDIRI", color: "#003f72", logo: "https://res.cloudinary.com/dho4tdzhr/image/upload/Mandiri_xzotjn.png", sub: "MANDIRI" },
  { id: "va",   label: "BNI Virtual Account",          badge: "BNI",     color: "#e85a1a", logo: "https://res.cloudinary.com/dho4tdzhr/image/upload/BNI_w26p0g.png",     sub: "BNI" },
  { id: "va",   label: "BRI Virtual Account",          badge: "BRI",     color: "#0048a8", logo: "https://res.cloudinary.com/dho4tdzhr/image/upload/BRI_xxkvb1.png",     sub: "BRI" },
  { id: "va",   label: "Bank BSI Virtual Account",     badge: "BSI",     color: "#3d9e4a", logo: "https://res.cloudinary.com/dho4tdzhr/image/upload/BSI_pz5xic.png",     sub: "BSI" },
  { id: "va",   label: "Bank Permata Virtual Account", badge: "PERMATA", color: "#c00",    logo: "https://res.cloudinary.com/dho4tdzhr/image/upload/Permata_q3uww2.png",  sub: "PERMATA" },
  { id: "va",   label: "Bank BJB Virtual Account",     badge: "BJB",     color: "#006e4e", logo: "https://res.cloudinary.com/dho4tdzhr/image/upload/BJB_bao2fg.png",     sub: "BJB" },
  { id: "bank_transfer", label: "Bank Transfer", badge: "TRANSFER", color: "#007bff", logo: "https://res.cloudinary.com/dho4tdzhr/image/upload/Bank_Indi_isysxq.png" },
];

export const DEFAULT_STATE: FormState = {
  config: {
    apiKey: "sk_ypI4g8mvkRKDusgNth74uYmopeQmHIjEZXByqcbmjZ54ZEYaRWdYY4C5NlX7ZQ1b",
    storeId: "store_MjbXMeDu9VgKrrsUgfSdzqvg",
    storeIntId: 56332,
    storeName: "Juragan PIK's Store",
    waNumber: "6285845435110",
    n8nWebhook: "https://n8n-wexrffsqeapb.sate.sumopod.my.id/webhook/9c279187-b669-4d3d-9ac5-ff2c15d864a2",
  },
  productMode: 'all',
  specificVariantIds: [],
  specificBundleIds: [],
  autoSelectFirst: true,
  allowMultiSelect: false,
  productSectionTitle: "Pilih Isi",
  showCourier: true,
  showPromoBadge: true,
  promoUpsellText: "Tambah 1 lagi untuk dapat Gratis 1 Botol",
  promoSuccessText: "Yeeyy... Kamu dapat Gratis 1 Botol",
  promoBonusText: "Gratis 1 Botol 🎁",
  codAlwaysWhatsapp: true,
  afterOrderAction: 'whatsapp',
  customRedirectUrl: "",
  showQtyButtons: true,
  submitButtonText: "Pesan Sekarang",
  submitButtonBgColor: "#1D9E75",
  submitButtonTextColor: "#ffffff",
  showProductSection: true,
  fields: AVAILABLE_FIELDS.filter(f => f.id !== 'f-note'),
  payments: [...AVAILABLE_PAYMENTS]
};

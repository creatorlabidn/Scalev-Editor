import { FormState } from "../types";

export function generateHTML(state: FormState): string {
  const { config, payments, fields, productMode, specificVariantIds, autoSelectFirst, allowMultiSelect, productSectionTitle, showCourier, showPromoBadge, promoUpsellText, promoSuccessText, promoBonusText, codAlwaysWhatsapp, afterOrderAction, customRedirectUrl, showQtyButtons } = state;

  const fieldsHTML = fields.map(field => {
    if (field.type === 'location') {
      return `
    <div class="field">
      <label>${field.label}</label>
      <input type="text" id="f-kecamatan" placeholder="${field.placeholder}" autocomplete="off" />
      <input type="hidden" id="f-location-id" />
      <div id="kec-suggestions" style="margin-top:4px"></div>
    </div>`;
    }
    if (field.type === 'email') {
      return `
    <div class="field">
      <label>${field.label}</label>
      <input type="email" id="${field.id}" placeholder="${field.placeholder}" autocomplete="email" />
    </div>`;
    }
    if (field.type === 'tel') {
      return `
    <div class="field">
      <label>${field.label}</label>
      <div class="phone-row">
        <div class="phone-prefix">🇮🇩 +62</div>
        <input type="tel" id="${field.id}" placeholder="${field.placeholder}" autocomplete="tel" />
      </div>
    </div>`;
    }
    if (field.type === 'textarea') {
      return `
    <div class="field">
      <label>${field.label}</label>
      <textarea id="${field.id}" placeholder="${field.placeholder}"></textarea>
    </div>`;
    }
    return `
    <div class="field">
      <label>${field.label}</label>
      <input type="text" id="${field.id}" placeholder="${field.placeholder}" />
    </div>`;
  }).join('\n');

  const productsFilterLogic = productMode === 'specific' 
    ? `const allowedVariantIds = ${JSON.stringify(specificVariantIds)};
    const rawProducts = data?.data?.results || data?.data || [];
    
    // Create a map of all variants for quick lookup
    const variantMap = {};
    rawProducts.forEach(p => {
      const variants = p.variants || p.product_variants || [];
      variants.forEach(v => {
        variantMap[String(v.unique_id || v.id)] = { product: p, variant: v };
      });
    });

    // Build ordered list based on allowedVariantIds
    const orderedVariants = [];
    allowedVariantIds.forEach(vid => {
      if (variantMap[vid]) {
        const { product, variant } = variantMap[vid];
        const price = variant.price || variant.variant_price || variant.selling_price || product.price || product.selling_price || 0;
        const weight = variant.weight || variant.variant_weight || product.weight || product.product_weight || 1;
        const variantName = variant.name || variant.variant_name || "";
        const productName = product.name || product.product_name || "";
        const displayName = variantName ? (variantName.toLowerCase().includes(productName.toLowerCase()) ? variantName : productName + " - " + variantName) : productName;

        orderedVariants.push({
          unique_id:  variant.unique_id || variant.variant_unique_id || "",
          variant_id: variant.id || variant.variant_id || null,
          name:       displayName,
          price:      Number(price),
          weight:     Number(weight),
        });
      }
    });

    VARIANTS = orderedVariants;`
    : `const rawProducts = data?.data?.results || data?.data || [];
    const allVariants = [];
    rawProducts.forEach(function(product) {
      const variants = product.variants || product.product_variants || [];
      variants.forEach(function(v) {
        const price = v.price || v.variant_price || v.selling_price || product.price || product.selling_price || 0;
        const weight = v.weight || v.variant_weight || product.weight || product.product_weight || 1;
        const variantName = v.name || v.variant_name || "";
        const productName = product.name || product.product_name || "";
        const displayName = variantName ? (variantName.toLowerCase().includes(productName.toLowerCase()) ? variantName : productName + " - " + variantName) : productName;

        allVariants.push({
          unique_id:  v.unique_id || v.variant_unique_id || "",
          variant_id: v.id || v.variant_id || null,
          name:       displayName,
          price:      Number(price),
          weight:     Number(weight),
        });
      });
    });
    VARIANTS = allVariants;`;

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Order Form</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
<style>
  :root {
    --green: #1D9E75;
    --green-dark: #15825f;
    --green-light: #E1F5EE;
    --green-border: #9FE1CB;
    --gray-bg: #F7F8FA;
    --gray-border: #E2E5EA;
    --gray-text: #6B7280;
    --text: #111827;
    --white: #ffffff;
    --radius: 10px;
    --radius-sm: 7px;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.07);
    --orange: #F97316;
    --orange-light: #FFF7ED;
    --orange-border: #FED7AA;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--gray-bg); color: var(--text); min-height: 100vh; padding: 0; }
  .container { max-width: 560px; margin: 0 auto; padding: 1.5rem 1rem 2rem; }
  .card { background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow-sm); border: 1px solid var(--gray-border); padding: 1.25rem; margin-bottom: 1rem; }
  .section-title { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 1rem; padding-bottom: 10px; border-bottom: 1.5px solid var(--gray-border); }

  /* Loading skeleton */
  .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.2s infinite; border-radius: var(--radius-sm); }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .skeleton-item { height: 56px; margin-bottom: 4px; }
  .product-load-error { font-size: 13px; color: #DC2626; padding: 12px; text-align: center; background: #FEF2F2; border: 1px solid #FECACA; border-radius: var(--radius-sm); }
  .retry-btn { margin-top: 8px; background: none; border: 1px solid #DC2626; color: #DC2626; padding: 6px 14px; border-radius: var(--radius-sm); font-size: 13px; font-family: inherit; cursor: pointer; }
  .retry-btn:hover { background: #FEF2F2; }

  .variant-item { display: flex; align-items: center; gap: 12px; padding: 11px 13px; border: 1px solid var(--gray-border); border-radius: var(--radius-sm); margin-bottom: 4px; cursor: pointer; transition: border-color 0.15s, background 0.15s; background: var(--white); }
  .variant-item.selected { border-color: var(--green); background: var(--green-light); border-width: 1.5px; }
  .variant-item input[type="checkbox"] { width: 17px; height: 17px; accent-color: var(--green); flex-shrink: 0; pointer-events: none; }
  .variant-info { flex: 1; }
  .variant-name { font-size: 14px; font-weight: 500; color: var(--text); }
  .variant-price { font-size: 12px; color: var(--gray-text); margin-top: 2px; }
  .qty-wrap { display: flex; align-items: center; gap: 6px; }
  .qty-btn { 
    flex-shrink: 0 !important;
    transition: background 0.12s !important; 
  }
  .qty-btn:hover { background: var(--green-light); }
  .qty-num { width: 28px; text-align: center; font-size: 14px; font-weight: 600; color: var(--text); }

  .variant-notif {
    display: none;
    font-size: 12px;
    font-weight: 600;
    padding: 6px 12px 6px 10px;
    border-radius: 0 0 var(--radius-sm) var(--radius-sm);
    margin-bottom: 8px;
    align-items: center;
    gap: 6px;
    animation: notifSlide 0.25s ease;
  }
  .variant-notif.show { display: flex; }
  .variant-notif.notif-upsell {
    background: var(--orange-light);
    border: 1px solid var(--orange-border);
    border-top: none;
    color: #C2410C;
  }
  .variant-notif.notif-free {
    background: var(--green-light);
    border: 1px solid var(--green-border);
    border-top: none;
    color: var(--green-dark);
  }
  @keyframes notifSlide {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .notif-icon { font-size: 14px; flex-shrink: 0; }

  .field { margin-bottom: 10px; }
  .field label { font-size: 12px; font-weight: 500; color: var(--gray-text); display: block; margin-bottom: 5px; }
  .field input, .field textarea { width: 100%; padding: 10px 12px; border: 1px solid var(--gray-border); border-radius: var(--radius-sm); font-size: 14px; font-family: inherit; color: var(--text); background: var(--white); transition: border-color 0.15s; outline: none; }
  .field input:focus, .field textarea:focus { border-color: var(--green); box-shadow: 0 0 0 3px rgba(29,158,117,0.12); }
  .field input.error { border-color: #DC2626; }
  .field textarea { resize: vertical; min-height: 70px; }
  .phone-row { display: flex; gap: 8px; }
  .phone-prefix { padding: 10px 12px; border: 1px solid var(--gray-border); border-radius: var(--radius-sm); font-size: 14px; background: var(--gray-bg); color: var(--text); white-space: nowrap; display: flex; align-items: center; gap: 5px; }
  .phone-row input { flex: 1; }

  .payment-item { display: flex; align-items: center; gap: 11px; padding: 11px 13px; border: 1px solid var(--gray-border); border-radius: var(--radius-sm); margin-bottom: 8px; cursor: pointer; background: var(--white); transition: border-color 0.15s, background 0.15s; }
  .payment-item:last-child { margin-bottom: 0; }
  .payment-item.selected { border-color: var(--green); background: var(--green-light); border-width: 1.5px; }
  .payment-item input[type="radio"] { accent-color: var(--green); width: 16px; height: 16px; flex-shrink: 0; pointer-events: none; }
  .pay-badge { font-size: 10px; font-weight: 700; padding: 3px 7px; border-radius: 5px; color: #fff; letter-spacing: 0.02em; flex-shrink: 0; }
  .payment-label { font-size: 14px; font-weight: 500; color: var(--text); }

  .courier-item { display: flex; align-items: center; gap: 11px; padding: 11px 13px; border: 1px solid var(--gray-border); border-radius: var(--radius-sm); margin-bottom: 8px; cursor: pointer; background: var(--white); transition: border-color 0.15s, background 0.15s; }
  .courier-item:last-child { margin-bottom: 0; }
  .courier-item.selected { border-color: var(--green); background: var(--green-light); border-width: 1.5px; }
  .courier-item input[type="radio"] { accent-color: var(--green); width: 16px; height: 16px; flex-shrink: 0; pointer-events: none; }
  .courier-badge { font-size: 10px; font-weight: 700; padding: 3px 7px; border-radius: 5px; color: #fff; flex-shrink: 0; background: #555; letter-spacing: 0.02em; }
  .courier-info { flex: 1; }
  .courier-name { font-size: 14px; font-weight: 500; color: var(--text); }
  .courier-price { font-size: 12px; color: var(--gray-text); margin-top: 2px; }
  .courier-hint { font-size: 13px; color: var(--gray-text); padding: 6px 0; text-align: center; }
  .inline-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid var(--gray-border); border-top-color: var(--green); border-radius: 50%; animation: spin 0.7s linear infinite; vertical-align: middle; margin-right: 6px; }

  .summary-card { background: var(--white); border: 1.5px solid var(--green); border-radius: var(--radius); padding: 1rem 1.25rem; margin-bottom: 1rem; }
  .summary-title { font-size: 11px; font-weight: 600; color: var(--gray-text); text-transform: uppercase; letter-spacing: 0.07em; text-decoration: underline; margin-bottom: 10px; }
  .summary-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--text); padding: 5px 0; border-bottom: 1px solid var(--gray-border); }
  .summary-row:last-of-type { border-bottom: none; }
  .summary-total { display: flex; justify-content: space-between; font-size: 16px; font-weight: 600; color: var(--text); margin-top: 10px; padding-top: 10px; border-top: 1.5px solid var(--gray-border); }

  .btn-order { width: 100%; padding: 15px; background: var(--green); color: #fff; border: none; border-radius: var(--radius); font-size: 16px; font-weight: 600; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.15s, transform 0.1s; box-shadow: 0 2px 8px rgba(29,158,117,0.25); margin-bottom: 2rem; }
  .btn-order:hover { background: var(--green-dark); }
  .btn-order:active { transform: scale(0.99); }
  .btn-order:disabled { background: #9CA3AF; cursor: not-allowed; box-shadow: none; }

  .toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-80px); background: var(--text); color: #fff; padding: 12px 20px; border-radius: var(--radius); font-size: 14px; font-weight: 500; z-index: 9999; transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1); white-space: nowrap; max-width: 90vw; text-align: center; }
  .toast.show { transform: translateX(-50%) translateY(0); }
  .toast.success { background: var(--green); }
  .toast.error { background: #DC2626; }

  .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .hidden { display: none !important; }
  .location-suggestion {
    padding: 10px 14px;
    border: 1px solid var(--green-border);
    border-left: 3px solid var(--green);
    border-radius: var(--radius-sm);
    margin-bottom: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: var(--text);
    background: var(--green-light);
    transition: background 0.15s, border-color 0.15s, transform 0.1s;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .location-suggestion::before {
    content: "📍";
    font-size: 13px;
    flex-shrink: 0;
  }
  .location-suggestion:hover {
    background: #c8f0e2;
    border-color: var(--green);
    border-left-color: var(--green-dark);
    transform: translateX(2px);
  }
  .location-suggestion:active {
    background: #a8e8d0;
  }
</style>
</head>
<body>

<div class="toast" id="toast"></div>

<div class="container">

  <div class="card">
    <div class="section-title">${productSectionTitle}</div>
    <div id="variants-list">
      <!-- Skeleton loading -->
      <div class="skeleton skeleton-item"></div>
      <div class="skeleton skeleton-item"></div>
      <div class="skeleton skeleton-item"></div>
    </div>
  </div>

  <div class="card">
    <div class="section-title">Lengkapi Data:</div>
    ${fieldsHTML}
  </div>

  <div class="card">
    <div class="section-title">Metode Pembayaran:</div>
    <div id="payment-list"></div>
  </div>

  ${showCourier ? `
  <div class="card hidden" id="courier-card">
    <div class="section-title">Pilih Kurir:</div>
    <div id="courier-list">
      <div class="courier-hint">Pilih kecamatan dan produk terlebih dahulu</div>
    </div>
  </div>` : ''}

  <div class="summary-card hidden" id="summary-card">
    <div class="summary-title">Rincian Pesanan:</div>
    <div id="summary-items"></div>
    <div class="summary-total">
      <span>Total</span>
      <span id="summary-total-val">Rp 0</span>
    </div>
  </div>

  <button class="btn-order" id="btn-order" onclick="submitOrder()">
    Pesan Sekarang
  </button>

</div>

<script>
    
const CONFIG = {
  API_KEY:      "${config.apiKey}",
  STORE_ID:     "${config.storeId}",
  STORE_INT_ID: ${config.storeIntId},
  WA_NUMBER:    "${config.waNumber}",
  AFTER_ORDER_ACTION: "${afterOrderAction}",
  CUSTOM_REDIRECT_URL: "${customRedirectUrl || ""}",
  SHOW_PROMO_BADGE: ${showPromoBadge},
  PROMO_UPSELL_TEXT: "${promoUpsellText.replace(/"/g, '\\"')}",
  PROMO_SUCCESS_TEXT: "${promoSuccessText.replace(/"/g, '\\"')}",
  SHOW_QTY_BUTTONS: ${showQtyButtons},
  COD_ALWAYS_WHATSAPP: ${codAlwaysWhatsapp},
  API_BASE:     "https://api.scalev.id/v2",
};

const PAYMENT_METHODS = ${JSON.stringify(payments, null, 2)};

let VARIANTS = [];
let selectedVariants    = {};
let selectedPaymentIdx  = 0;
let selectedCourierIdx  = null;
let courierList         = [];
let warehouseUniqueId   = null;
let warehouseIntId      = null;
let locationSearchTimer = null;

const capiData = {
  client_user_agent: navigator.userAgent,
  fbp:               null,
  fbc:               null,
  fbclid:            null,
  client_ip_address: null,
  event_time:        null,
};

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function getUrlParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

(function initCapiData() {
  capiData.fbp = getCookie("_fbp");
  const fbclid = getUrlParam("fbclid");
  capiData.fbclid = fbclid || null;
  const fbcCookie = getCookie("_fbc");
  if (fbcCookie) {
    capiData.fbc = fbcCookie;
  } else if (fbclid) {
    capiData.fbc = "fb.1." + Date.now() + "." + fbclid;
  }
  fetch("https://api.ipify.org?format=json")
    .then(function(r) { return r.json(); })
    .then(function(d) { capiData.client_ip_address = d.ip || null; })
    .catch(function() {});
})();

const fmt = n => "Rp " + Math.round(n).toLocaleString("id-ID");
const apiHeaders = () => ({
  "Authorization": "Bearer " + CONFIG.API_KEY,
  "Content-Type":  "application/json",
  "Accept":        "application/json",
});

function showToast(msg, type) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className   = "toast " + (type || "");
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3500);
}

function getTotalWeight() {
  return Object.keys(selectedVariants).reduce((sum, i) => sum + (VARIANTS[i].weight * selectedVariants[i]), 0);
}

function getTotalQty() {
  return Object.keys(selectedVariants).reduce((sum, i) => sum + selectedVariants[i], 0);
}

function validatePhone(phone) {
  return /^[0-9]{8,13}$/.test(phone.replace(/^0/, ""));
}

function updateVariantNotif(i) {
  const notifEl = document.getElementById("vnotif-" + i);
  if (!notifEl) return;
  if (!CONFIG.SHOW_PROMO_BADGE || !selectedVariants[i]) {
    notifEl.className = "variant-notif";
    return;
  }
  const totalQty = getTotalQty();
  if (totalQty === 1) {
    notifEl.className = "variant-notif notif-upsell show";
    notifEl.innerHTML = '<span class="notif-icon">🎁</span> ' + CONFIG.PROMO_UPSELL_TEXT;
  } else {
    notifEl.className = "variant-notif notif-free show";
    notifEl.innerHTML = '<span class="notif-icon">🎉</span> ' + CONFIG.PROMO_SUCCESS_TEXT;
  }
}

function updateAllVariantNotifs() {
  VARIANTS.forEach((_, i) => updateVariantNotif(i));
}

async function loadProductsFromAPI() {
  const listEl = document.getElementById("variants-list");
  try {
    const res  = await fetch(CONFIG.API_BASE + "/stores/" + CONFIG.STORE_INT_ID + "/products", {
      headers: apiHeaders()
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data?.message || "Gagal memuat produk (HTTP " + res.status + ")");

    ${productsFilterLogic}

    if (!VARIANTS.length) {
      listEl.innerHTML = '<div class="product-load-error">Tidak ada produk tersedia.<br><button class="retry-btn" onclick="loadProductsFromAPI()">Coba Lagi</button></div>';
      return;
    }

    renderVariants();

    if (${autoSelectFirst} && VARIANTS.length > 0) {
      toggleVariant(0);
    }

  } catch (e) {
    listEl.innerHTML = '<div class="product-load-error">Gagal memuat produk: ' + e.message + '<br><button class="retry-btn" onclick="loadProductsFromAPI()">Coba Lagi</button></div>';
  }
}

function renderVariants() {
  document.getElementById("variants-list").innerHTML = VARIANTS.map((v, i) => \`
    <div class="variant-item" id="vcard-\${i}" onclick="toggleVariant(\${i})">
      <input type="checkbox" id="vchk-\${i}" tabindex="-1" />
      <div class="variant-info">
        <div class="variant-name">\${v.name}</div>
        <div class="variant-price">\${fmt(v.price)}</div>
      </div>
      \${CONFIG.SHOW_QTY_BUTTONS ? \`
      <div class="qty-wrap" id="vqty-\${i}" style="display:none" onclick="event.stopPropagation()">
        <button class="qty-btn" onclick="changeQty(\${i},-1)" style="width: 26px !important; height: 26px !important; border-radius: 50% !important; border: 1px solid var(--green-border) !important; background: var(--white) !important; color: var(--green) !important; font-size: 18px !important; font-weight: 500 !important; display: flex !important; align-items: center !important; justify-content: center !important; line-height: 0 !important; padding: 0 !important; font-family: sans-serif !important; cursor: pointer !important; outline: none !important;">-</button>
        <div class="qty-num" id="vqnum-\${i}">1</div>
        <button class="qty-btn" onclick="changeQty(\${i},1)" style="width: 26px !important; height: 26px !important; border-radius: 50% !important; border: 1px solid var(--green-border) !important; background: var(--white) !important; color: var(--green) !important; font-size: 18px !important; font-weight: 500 !important; display: flex !important; align-items: center !important; justify-content: center !important; line-height: 0 !important; padding: 0 !important; font-family: sans-serif !important; cursor: pointer !important; outline: none !important;">+</button>
      </div>\` : ''}
    </div>
    <div class="variant-notif" id="vnotif-\${i}"></div>
  \`).join("");
}

function toggleVariant(i) {
  const isSelected = !!selectedVariants[i];
  const allowMulti = ${allowMultiSelect};
  
  if (!isSelected && !allowMulti) {
    // Clear others if multi-select is disabled
    Object.keys(selectedVariants).forEach(idx => {
      const card = document.getElementById("vcard-" + idx);
      const chk = document.getElementById("vchk-" + idx);
      const qty = document.getElementById("vqty-" + idx);
      if (card) card.classList.remove("selected");
      if (chk) chk.checked = false;
      if (qty) qty.style.display = "none";
    });
    selectedVariants = {};
  }

  const chk   = document.getElementById("vchk-" + i);
  const card  = document.getElementById("vcard-" + i);
  const qtyEl = document.getElementById("vqty-" + i);
  if (!isSelected) {
    selectedVariants[i] = 1;
    chk.checked = true;
    card.classList.add("selected");
    if (qtyEl) qtyEl.style.display = "flex";
  } else {
    delete selectedVariants[i];
    chk.checked = false;
    card.classList.remove("selected");
    if (qtyEl) qtyEl.style.display = "none";
  }
  updateAllVariantNotifs();
  updateSummary();
  refreshCourierIfReady();
}

function changeQty(i, delta) {
  selectedVariants[i] = Math.max(1, (selectedVariants[i] || 1) + delta);
  const numEl = document.getElementById("vqnum-" + i);
  if (numEl) numEl.textContent = selectedVariants[i];
  updateAllVariantNotifs();
  updateSummary();
  refreshCourierIfReady();
}

function renderPayments() {
  document.getElementById("payment-list").innerHTML = PAYMENT_METHODS.map((p, i) => \`
    <div class="payment-item \${i === 0 ? 'selected' : ''}" id="pcard-\${i}" onclick="selectPayment(\${i})">
      <input type="radio" name="payment" \${i === 0 ? 'checked' : ''} />
      <img src="\${p.logo}" alt="\${p.badge}" style="width:48px;height:28px;object-fit:contain;flex-shrink:0;" />
      <span class="payment-label">\${p.label}</span>
    </div>
  \`).join("");
}

function selectPayment(i) {
  document.querySelectorAll(".payment-item").forEach((el, idx) => el.classList.toggle("selected", idx === i));
  document.querySelectorAll('input[name=payment]').forEach((r, idx) => r.checked = idx === i);
  selectedPaymentIdx = i;
  refreshCourierIfReady();
}

function updateSummary() {
  const keys    = Object.keys(selectedVariants);
  const card    = document.getElementById("summary-card");
  const items   = document.getElementById("summary-items");
  const totalEl = document.getElementById("summary-total-val");

  if (!keys.length) { card.classList.add("hidden"); return; }
  card.classList.remove("hidden");

  const totalQty = getTotalQty();
  const showPromo = ${showPromoBadge};
  const isFree   = showPromo && totalQty > 1;

  let total = 0;
  let rows  = keys.map(i => {
    const q   = selectedVariants[i];
    const sub = VARIANTS[i].price * q;
    total += sub;
    return '<div class="summary-row"><span>' + VARIANTS[i].name + ' x' + q + '</span><span>' + fmt(sub) + '</span></div>';
  }).join("");

  if (isFree) {
    rows += '<div class="summary-row"><span>' + "${promoBonusText.replace(/"/g, '\\"')}" + '</span><span style="color:var(--green);font-weight:600;">Gratis</span></div>';
  }

  if (selectedCourierIdx !== null && courierList[selectedCourierIdx]) {
    const c      = courierList[selectedCourierIdx];
    const ongkir = c.cost || c.shipping_cost || c.price || 0;
    rows  += '<div class="summary-row"><span>Ongkos Kirim</span><span>' + fmt(ongkir) + '</span></div>';
    total += ongkir;
  }

  items.innerHTML = rows;
  totalEl.textContent = fmt(total);
}

document.addEventListener("DOMContentLoaded", () => {
  const kecInput = document.getElementById("f-kecamatan");
  if (kecInput) {
    kecInput.addEventListener("focus", function () {
      const el = this;
      setTimeout(() => {
        const y = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: "smooth" });
      }, 300);
    });

    kecInput.addEventListener("input", function () {
      clearTimeout(locationSearchTimer);
      document.getElementById("f-location-id").value = "";
      selectedCourierIdx = null;
      courierList        = [];
      warehouseUniqueId  = null;
      warehouseIntId     = null;
      const courierCard = document.getElementById("courier-card");
      if (courierCard) courierCard.classList.add("hidden");
      updateSummary();

      const q = this.value.trim();
      if (q.length < 3) { document.getElementById("kec-suggestions").innerHTML = ""; return; }
      locationSearchTimer = setTimeout(() => searchLocation(q), 400);
    });
  }
});

async function searchLocation(q) {
  const box = document.getElementById("kec-suggestions");
  box.innerHTML = '<div class="courier-hint"><span class="inline-spinner"></span>Mencari...</div>';
  try {
    const res  = await fetch(CONFIG.API_BASE + "/locations?search=" + encodeURIComponent(q), { headers: apiHeaders() });
    const data = await res.json();
    const results = (data?.data?.results) ? data.data.results : (Array.isArray(data?.data) ? data.data : []);

    if (!results.length) { box.innerHTML = '<div class="courier-hint">Tidak ditemukan</div>'; return; }

    box.innerHTML = results.slice(0, 6).map(function (loc) {
      const displayName = loc.full_name || loc.fullname || loc.name || [loc.subdistrict_name, loc.district_name, loc.city_name, loc.province_name].filter(Boolean).join(", ") || String(loc.id);
      const safe = displayName.replace(/\\\\/g, "\\\\\\\\").replace(/'/g, "\\\\'");
      return '<div class="location-suggestion" onclick="pickLocation(' + loc.id + ', \\'' + safe + '\\')">' + displayName + '</div>';
    }).join("");
  } catch (e) {
    box.innerHTML = '<div class="courier-hint" style="color:#dc2626">Gagal memuat lokasi</div>';
  }
}

function pickLocation(id, name) {
  document.getElementById("f-kecamatan").value   = name;
  document.getElementById("f-location-id").value = id;
  document.getElementById("kec-suggestions").innerHTML = "";
  refreshCourierIfReady();
}

function refreshCourierIfReady() {
  const locIdEl = document.getElementById("f-location-id");
  const locId = locIdEl ? locIdEl.value : null;
  if (locId && Object.keys(selectedVariants).length > 0) {
    loadCouriers(parseInt(locId));
  }
}

async function loadCouriers(locationId) {
  const showCourier = ${showCourier};
  const courierCard   = document.getElementById("courier-card");
  const courierListEl = document.getElementById("courier-list");

  if (showCourier && courierCard && courierListEl) {
    courierCard.classList.remove("hidden");
    courierListEl.innerHTML = '<div class="courier-hint"><span class="inline-spinner"></span>Mencari kurir tersedia...</div>';
  }

  selectedCourierIdx = null;
  courierList        = [];
  warehouseUniqueId  = null;
  warehouseIntId     = null;
  updateSummary();

  try {
    const warehouseBody = {
      store_id:       CONFIG.STORE_INT_ID,
      destination_id: locationId,
      variants: Object.keys(selectedVariants).map(i => ({
        variant_id: VARIANTS[i].variant_id,
        qty:        selectedVariants[i],
      })),
    };

    const wRes  = await fetch(CONFIG.API_BASE + "/shipping-costs/search-warehouse", {
      method:  "POST",
      headers: apiHeaders(),
      body:    JSON.stringify(warehouseBody),
    });
    const wData = await wRes.json();

    if (!wRes.ok) {
      const errMsg = wData?.message || wData?.error || JSON.stringify(wData);
      if (courierListEl) courierListEl.innerHTML = '<div class="courier-hint" style="color:#dc2626">Error warehouse: ' + errMsg + '</div>';
      return;
    }

    let warehouses = [];
    if      (Array.isArray(wData?.data?.results) && wData.data.results.length) warehouses = wData.data.results;
    else if (Array.isArray(wData?.data)          && wData.data.length)         warehouses = wData.data;
    else if (wData?.data?.unique_id || wData?.data?.warehouse_unique_id)       warehouses = [wData.data];
    else if (wData?.unique_id       || wData?.warehouse_unique_id)             warehouses = [wData];

    if (!warehouses.length) {
      if (courierListEl) courierListEl.innerHTML = '<div class="courier-hint">Tidak ada gudang tersedia untuk lokasi ini</div>';
      return;
    }

    const wh = warehouses[0].warehouse || warehouses[0];
    warehouseUniqueId = wh.unique_id || wh.warehouse_unique_id || wh.warehouse_id || null;
    warehouseIntId    = (typeof wh.id === "number" ? wh.id : null) || (typeof wh.warehouse_int_id === "number" ? wh.warehouse_int_id : null) || null;

    if (!warehouseUniqueId && !warehouseIntId) {
      if (courierListEl) courierListEl.innerHTML = '<div class="courier-hint" style="color:#dc2626">Gagal membaca ID gudang, coba refresh halaman</div>';
      return;
    }

    if (!showCourier) {
      updateSummary();
      return;
    }

    const pm     = PAYMENT_METHODS[selectedPaymentIdx];
    const weight = Math.max(getTotalWeight(), 1);

    const courierBody = {
      store_id:            CONFIG.STORE_INT_ID,
      warehouse_unique_id: warehouseUniqueId,
      warehouse_id:        warehouseIntId,
      location_id:         locationId,
      weight:              weight,
      payment_method:      pm.id,
    };
    if (pm.sub) courierBody.sub_payment_method = pm.sub;

    const cRes  = await fetch(CONFIG.API_BASE + "/shipping-costs/search-courier-service", {
      method:  "POST",
      headers: apiHeaders(),
      body:    JSON.stringify(courierBody),
    });
    const cData = await cRes.json();

    if (!cRes.ok) {
      const errMsg = cData?.message || cData?.error || JSON.stringify(cData);
      courierListEl.innerHTML = '<div class="courier-hint" style="color:#dc2626">Error kurir: ' + errMsg + '</div>';
      return;
    }

    const services = Array.isArray(cData?.data?.results) && cData.data.results.length ? cData.data.results : Array.isArray(cData?.data) && cData.data.length ? cData.data : [];

    if (!services.length) {
      courierListEl.innerHTML = '<div class="courier-hint">Tidak ada kurir tersedia untuk lokasi ini</div>';
      return;
    }

    courierList = services;
    renderCouriers();
    selectCourier(0);

  } catch (e) {
    courierListEl.innerHTML = '<div class="courier-hint" style="color:#dc2626">Gagal memuat kurir: ' + e.message + '</div>';
  }
}

function renderCouriers() {
  const COURIER_LOGOS = {
    "JNT":    "https://res.cloudinary.com/dho4tdzhr/image/upload/J_T_xhbp2s.png",
    "J&T":    "https://res.cloudinary.com/dho4tdzhr/image/upload/J_T_xhbp2s.png",
    "NINJA":  "https://res.cloudinary.com/dho4tdzhr/image/upload/Ninja_hrir7q.png",
    "SICEPAT":"https://res.cloudinary.com/dho4tdzhr/image/upload/Sicepat_wghvd3.png",
    "JNE":    "https://res.cloudinary.com/dho4tdzhr/image/upload/JNE_xcw6gn.png",
  };

  document.getElementById("courier-list").innerHTML = courierList.map(function (c, i) {
    const courierName = (c.courier_service?.courier?.name) || "";
    const serviceName = (c.courier_service?.name) || "";
    const name        = courierName && serviceName ? courierName + " - " + serviceName : courierName || serviceName || c.name || "Kurir";
    const price       = c.cost || c.shipping_cost || c.price || 0;
    const code        = ((c.courier_service?.courier?.code) || c.courier_code || c.provider || "KURIR").toUpperCase().slice(0, 6);

    const logoKey  = Object.keys(COURIER_LOGOS).find(k => code.includes(k) || name.toUpperCase().includes(k));
    const logoUrl  = logoKey ? COURIER_LOGOS[logoKey] : null;
    const badgeHtml = logoUrl ? '<img src="' + logoUrl + '" alt="' + code + '" style="width:48px;height:28px;object-fit:contain;flex-shrink:0;" />' : '<span class="courier-badge">' + code + '</span>';

    return '<div class="courier-item" id="ccard-' + i + '" onclick="selectCourier(' + i + ')"><input type="radio" name="courier" />' + badgeHtml + '<div class="courier-info"><div class="courier-name">' + name + '</div><div class="courier-price">' + fmt(price) + '</div></div></div>';
  }).join("");
}

function selectCourier(i) {
  selectedCourierIdx = i;
  document.querySelectorAll(".courier-item").forEach((el, idx) => el.classList.toggle("selected", idx === i));
  document.querySelectorAll('input[name=courier]').forEach((r, idx) => r.checked = idx === i);
  updateSummary();
}

async function submitOrder() {
  if (!Object.keys(selectedVariants).length) { showToast("Pilih minimal satu produk", "error"); return; }

  const activeFields = ${JSON.stringify(fields)};
  const fieldValues = {};
  
  for (const field of activeFields) {
    const el = document.getElementById(field.id);
    if (el) {
      fieldValues[field.id] = el.value.trim();
    }
    
    // Special handling for location
    if (field.type === 'location') {
      fieldValues['location_id'] = document.getElementById("f-location-id")?.value || "";
    }
  }

  // Validation
  for (const field of activeFields) {
    const val = fieldValues[field.id];
    
    if (field.required && !val && field.type !== 'location') {
      showToast(field.label + " wajib diisi", "error");
      return;
    }
    
    if (field.id === 'f-email' && val && !/^\\S+@\\S+\\.\\S+$/.test(val)) {
      showToast("Email tidak valid", "error");
      return;
    }
    
    if (field.id === 'f-phone') {
      const cleanPhone = val.replace(/^0/, "");
      if (!validatePhone(cleanPhone)) {
        showToast("Nomor HP tidak valid", "error");
        return;
      }
      fieldValues['phone_clean'] = cleanPhone;
    }
    
    if (field.type === 'location' && !fieldValues['location_id']) {
      showToast("Kecamatan wajib dipilih dari daftar", "error");
      return;
    }
  }

  const showCourier = ${showCourier};
  if (showCourier && selectedCourierIdx === null) { showToast("Pilih kurir pengiriman", "error"); return; }

  const nama   = fieldValues['f-nama'] || "";
  const email  = fieldValues['f-email'] || "";
  const phone  = fieldValues['phone_clean'] || (fieldValues['f-phone'] || "").replace(/^0/, "");
  const alamat = fieldValues['f-alamat'] || "";
  const locId  = fieldValues['location_id'] || "";
  const note   = fieldValues['f-note'] || "";

  const pm      = PAYMENT_METHODS[selectedPaymentIdx];
  const courier = showCourier ? courierList[selectedCourierIdx] : null;
  const ongkir   = courier ? (courier.cost || courier.shipping_cost || courier.price || 0) : 0;
  const subtotal = Object.keys(selectedVariants).reduce((sum, i) => sum + VARIANTS[i].price * selectedVariants[i], 0);

  if (showCourier) {
    if (!locId) {
      showToast("Kecamatan wajib diisi/dipilih untuk memproses order", "error");
      return;
    }

    if (!warehouseUniqueId) {
      showToast("Gagal mendapatkan data gudang. Silakan pilih ulang kecamatan.", "error");
      return;
    }
  }

  const namaParts = nama.split(/\\s+/);
  const firstName = namaParts[0] || "";
  const lastName  = namaParts.length > 1 ? namaParts.slice(1).join(" ") : "";

  capiData.event_time = Math.floor(Date.now() / 1000);

  const payload = {
    store_unique_id:     CONFIG.STORE_ID,
    customer_name:       nama,
    customer_phone:      phone.startsWith("62") ? phone : "62" + phone,
    customer_email:      email,
    address:             alamat + (note ? "\\nCatatan: " + note : ""),
    location_id:         parseInt(locId) || null,
    payment_method:      pm.id,
    warehouse_unique_id: warehouseUniqueId,
    courier_service_id:  courier ? (courier.courier_service?.id || courier.courier_service_id || courier.id) : null,
    shipping_cost:       ongkir,
    ordervariants:       Object.keys(selectedVariants).map(i => ({ quantity: selectedVariants[i], variant_unique_id: VARIANTS[i].unique_id })),
    source_url:          window.location.href,
    event_source_url:    window.location.href,
    metadata: {
      fbp: capiData.fbp || "",
      fbc: capiData.fbc || "",
      fbclid: capiData.fbclid || "",
      client_user_agent: capiData.client_user_agent || "",
      client_ip_address: capiData.client_ip_address || "",
      customer_first_name: firstName,
      customer_last_name: lastName,
      event_time: String(capiData.event_time),
      value: String(subtotal + ongkir),
    },
  };

  if (pm.sub) payload.sub_payment_method = pm.sub;
  const providerCode = courier ? (courier.shipment_provider_code || courier.courier_aggregator_code || courier.provider_code) : null;
  if (providerCode) payload.shipment_provider_code = providerCode;

  const btn = document.getElementById("btn-order");
  btn.disabled  = true;
  btn.innerHTML = '<div class="spinner"></div> Memproses...';

  try {
    const res = await fetch(CONFIG.API_BASE + "/order", {
      method:  "POST",
      headers: apiHeaders(),
      body:    JSON.stringify(payload),
    });

    let data;
    try { data = await res.json(); } catch (e) { data = {}; }
    console.log("[Scalev] Order Response:", data);

    if (!res.ok) {
      console.error("[Scalev] Order Error Response:", data);
      const errMsg = (typeof data.message === "string" && data.message) || (Array.isArray(data.errors) && data.errors.map(e => e.message || e).join(", ")) || (typeof data.error === "string" && data.error) || (data.details ? JSON.stringify(data.details) : null) || "Gagal membuat order (HTTP " + res.status + ")";
      throw new Error(errMsg);
    }

    const orderId = data?.data?.order_id || data?.order_id || null;
    const d = data?.data || data || {};
    const orderLink = d.message_variables?.order_link || d.order_link || 
                      (d.secret_slug && d.business?.username ? "https://" + d.business.username + ".myscalev.com/o/" + d.secret_slug : null) || 
                      null;
    
    console.log("[Scalev] Action:", CONFIG.AFTER_ORDER_ACTION);
    console.log("[Scalev] Order Link:", orderLink);

    sendCapiToN8n(orderId, subtotal, ongkir, firstName, lastName, phone, email);

    const isCod = pm.id === 'cod';
    const forceWa = isCod && CONFIG.COD_ALWAYS_WHATSAPP;

    if (!forceWa && String(CONFIG.AFTER_ORDER_ACTION).toLowerCase() === 'order_link' && orderLink) {
      showToast("Order berhasil! Mengalihkan ke halaman pembayaran...", "success");
      setTimeout(() => {
        window.location.href = orderLink;
      }, 1200);
    } else if (!forceWa && String(CONFIG.AFTER_ORDER_ACTION).toLowerCase() === 'custom_link' && CONFIG.CUSTOM_REDIRECT_URL) {
      showToast("Order berhasil! Mengalihkan...", "success");
      setTimeout(() => {
        window.location.href = CONFIG.CUSTOM_REDIRECT_URL;
      }, 1200);
    } else {
      showToast("Order berhasil! Mengalihkan ke WhatsApp...", "success");
      const pmSel    = PAYMENT_METHODS[selectedPaymentIdx];
      const payLabel = pmSel.sub ? pmSel.badge + " Virtual Account" : pmSel.label;
      const itemLines = Object.keys(selectedVariants).map(i => VARIANTS[i].name + " x" + selectedVariants[i]).join(", ");
      const totalFmt = "Rp " + Math.round(subtotal + ongkir).toLocaleString("id-ID");

      const waMsg = encodeURIComponent("Halo, saya sudah melakukan pemesanan :\\n*Produk* : " + itemLines + "\\n*Total* : " + totalFmt + "\\n*Pembayaran* : " + payLabel + "\\n\\nAtas nama *" + nama + "*. Mohon segera diproses ya...");

      setTimeout(() => {
        window.open("https://wa.me/" + CONFIG.WA_NUMBER + "?text=" + waMsg, "_blank");
      }, 1200);
    }

  } catch (err) {
    showToast("Gagal: " + err.message, "error");
  } finally {
    btn.disabled  = false;
    btn.innerHTML = 'Pesan Sekarang';
  }
}

async function sendCapiToN8n(orderId, subtotal, ongkir, firstName, lastName, phone, email) {
  const courier  = courierList[selectedCourierIdx];
  const pm       = PAYMENT_METHODS[selectedPaymentIdx];
  const nama     = firstName + (lastName ? " " + lastName : "");

  const scalevLikePayload = {
    event:     "order.created",
    unique_id: "event_browser_" + orderId,
    timestamp: new Date().toISOString(),
    data: {
      order_id:       orderId,
      payment_method: pm.id,
      payment_status: "unpaid",
      gross_revenue:  String(subtotal + ongkir) + ".00",
      net_revenue:    String(subtotal) + ".00",
      product_price:  String(subtotal) + ".00",
      shipping_cost:  String(ongkir) + ".00",
      customer: { name: nama, phone: "62" + phone, email: email },
      courier_service: {
        courier: { name: courier.courier_service?.courier?.name || "", code: courier.courier_service?.courier?.code || "" },
        name: courier.courier_service?.name || "",
        code: courier.courier_service?.code || "",
      },
      orderlines: Object.keys(selectedVariants).map(i => ({ product_name: VARIANTS[i].name, quantity: selectedVariants[i], variant_price: String(VARIANTS[i].price) + ".00", product_price: String(VARIANTS[i].price * selectedVariants[i]) + ".00" })),
      message_variables: { event_source_url: window.location.href },
      metadata: {
        event_source_url: window.location.href,
        fbp: capiData.fbp || "",
        fbc: capiData.fbc || "",
        fbclid: capiData.fbclid || "",
        client_user_agent: capiData.client_user_agent || "",
        client_ip_address: capiData.client_ip_address || "",
        customer_first_name: firstName,
        customer_last_name: lastName,
        customer_phone: "62" + phone,
        customer_email: email,
        event_name: "Purchase",
        event_time: String(capiData.event_time),
        currency: "IDR",
        value: String(subtotal + ongkir),
      },
    },
    entity_type: "order",
    entity_id:   orderId,
  };

  try {
    await fetch("${config.n8nWebhook}", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(scalevLikePayload),
    });
  } catch (e) {
    console.warn("[CAPI] Failed to send:", e.message);
  }
}

renderPayments();
loadProductsFromAPI();

</script>
</body>
</html>`;
}

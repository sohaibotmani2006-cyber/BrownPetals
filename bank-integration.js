// Bank Transfer Integration for Checkout

// Inject payment method UI into checkout form
store.addPaymentMethodUI = function() {
  const checkoutFormContainer = document.querySelector('.bg-black\\/40.p-4.rounded-xl.border.border-luxuryGold\\/20');
  if (!checkoutFormContainer || checkoutFormContainer.querySelector('[data-bank-ui="true"]')) return; // Already added

  const paymentMethodHTML = `
    <div data-bank-ui="true" class="space-y-3 border-b border-luxuryGold/20 pb-3">
      <p class="text-xs font-semibold text-luxuryGold uppercase">Payment Method</p>
      <div class="space-y-2">
        <label class="flex items-center gap-3 p-3 rounded-lg border border-luxuryGold/20 hover:border-luxuryGold/50 cursor-pointer transition bg-black/20">
          <input type="radio" name="paymentMethod" value="cod" checked class="w-4 h-4 rounded accent-luxuryGold cart-payment-method-radio">
          <div>
            <p class="text-xs font-semibold text-white">Cash on Delivery</p>
            <p class="text-[9px] text-gray-400">Pay when your order arrives</p>
          </div>
        </label>
        <label class="flex items-center gap-3 p-3 rounded-lg border border-luxuryGold/20 hover:border-luxuryGold/50 cursor-pointer transition bg-black/20">
          <input type="radio" name="paymentMethod" value="bank" class="w-4 h-4 rounded accent-luxuryGold cart-payment-method-radio">
          <div>
            <p class="text-xs font-semibold text-white">Bank Transfer</p>
            <p class="text-[9px] text-gray-400">Direct bank payment with verification</p>
          </div>
        </label>
      </div>
    </div>

    <!-- Bank Selection -->
    <div id="bank-selection-container" class="hidden space-y-2">
      <p class="text-[10px] uppercase font-bold text-luxuryGold">Select Bank Account</p>
      <div id="banks-radio-list" class="space-y-2">
        ${store.banks && store.banks.filter(b => b.active).length > 0 ? store.banks.filter(b => b.active).map(bank => `
          <label class="flex items-center gap-3 p-3 rounded-lg border border-luxuryGold/20 hover:border-luxuryGold/50 cursor-pointer transition bg-black/20">
            <input type="radio" name="selectedBank" value="${bank.id}" class="w-4 h-4 rounded accent-luxuryGold cart-bank-radio">
            <div>
              <p class="text-xs font-semibold text-white">${bank.bankName}</p>
              <p class="text-[9px] text-gray-400">${bank.accountHolder}</p>
            </div>
          </label>
        `).join('') : '<p class="text-sm text-gray-400">No banks available</p>'}
      </div>
    </div>

    <!-- Bank Details -->
    <div id="bank-details-container" class="hidden space-y-3">
      <div class="bg-black/40 p-4 rounded-lg border border-luxuryGold/30 space-y-3">
        <div>
          <p class="text-[10px] uppercase font-bold text-luxuryGold mb-1">Bank Name</p>
          <p id="bank-display-name" class="text-sm text-white font-semibold">-</p>
        </div>
        <div>
          <p class="text-[10px] uppercase font-bold text-luxuryGold mb-1">Account Holder</p>
          <p id="bank-display-holder" class="text-sm text-white font-semibold">-</p>
        </div>
        <div>
          <p class="text-[10px] uppercase font-bold text-luxuryGold mb-1">RIB</p>
          <div class="flex items-center gap-2">
            <p id="bank-display-rib" class="text-sm text-white font-mono flex-grow">-</p>
            <button type="button" id="bank-copy-rib-btn" class="px-3 py-1 bg-luxuryGold/20 hover:bg-luxuryGold text-luxuryGold hover:text-black text-[9px] font-bold uppercase rounded transition">Copy</button>
          </div>
        </div>
        <div class="pt-2 border-t border-luxuryGold/20">
          <p class="text-[10px] uppercase font-bold text-luxuryGold mb-2">Amount to Pay</p>
          <p id="bank-display-amount" class="text-lg text-luxuryGold font-serif font-bold">-</p>
        </div>
      </div>

      <div class="bg-black/40 p-4 rounded-lg border border-luxuryGold/30 space-y-2">
        <p class="text-[10px] uppercase font-bold text-luxuryGold">Payment Instructions</p>
        <p class="text-[11px] text-gray-300 leading-relaxed">Please transfer the exact amount shown above to the selected bank account.</p>
        <p class="text-[11px] text-gray-300 leading-relaxed">After completing the transfer, send us a screenshot of your bank transfer confirmation on WhatsApp so we can verify your payment and confirm your order.</p>
        <button type="button" id="bank-send-whatsapp-btn" class="w-full mt-3 py-2 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-300 hover:text-white rounded-lg text-[10px] uppercase font-bold tracking-wider flex items-center justify-center gap-1.5 transition">
          Send Payment Screenshot on WhatsApp
        </button>
      </div>
    </div>
  `;

  // Find the shippingInfo label and insert before it
  const shippingLabel = Array.from(checkoutFormContainer.querySelectorAll('p')).find(p => p.textContent.includes('Shipping Information'));
  if (shippingLabel) {
    shippingLabel.parentElement.insertAdjacentHTML('beforebegin', paymentMethodHTML);
  }
};

// Setup payment method event listeners
store.setupPaymentMethodListeners = function() {
  const radioButtons = document.querySelectorAll('.cart-payment-method-radio');
  const bankSelectionDiv = document.getElementById('bank-selection-container');
  const bankDetailsDiv = document.getElementById('bank-details-container');

  if (!radioButtons.length) return;

  radioButtons.forEach(radio => {
    radio.onchange = () => {
      const isBank = radio.value === 'bank';
      if (isBank) {
        bankSelectionDiv?.classList.remove('hidden');
        store.setupBankRadioListeners();
      } else {
        bankSelectionDiv?.classList.add('hidden');
        bankDetailsDiv?.classList.add('hidden');
      }
      store.checkoutFormValues.paymentMethod = radio.value;
    };
  });

  // Set initial state
  const selectedPayment = document.querySelector('.cart-payment-method-radio:checked');
  if (selectedPayment?.value === 'bank') {
    bankSelectionDiv?.classList.remove('hidden');
    store.setupBankRadioListeners();
  }
};

// Setup bank selection listeners
store.setupBankRadioListeners = function() {
  const bankRadios = document.querySelectorAll('.cart-bank-radio');
  const bankDetailsDiv = document.getElementById('bank-details-container');

  bankRadios.forEach(radio => {
    radio.onchange = () => {
      const bankId = radio.value;
      const bank = store.banks.find(b => b.id === bankId);
      if (bank) {
        store.selectedBankId = bankId;
        store.displayBankDetails(bank);
        bankDetailsDiv?.classList.remove('hidden');
      }
    };
  });

  // Auto-select first bank if not already selected
  const checkedBank = document.querySelector('.cart-bank-radio:checked');
  if (!checkedBank && bankRadios.length > 0) {
    bankRadios[0].checked = true;
    bankRadios[0].dispatchEvent(new Event('change', { bubbles: true }));
  }
};

// Display bank details
store.displayBankDetails = function(bank) {
  const total = this.cart.reduce((sum, item) => sum + (item.quantity * (item.discountPrice || item.price)), 0);
  const selectedCityId = this.checkoutFormValues.cityId;
  const city = this.deliveryCities.find(c => c.id === selectedCityId);
  const deliveryFee = city ? city.price : 0;
  const finalTotal = total + deliveryFee;

  document.getElementById('bank-display-name').textContent = bank.bankName || '-';
  document.getElementById('bank-display-holder').textContent = bank.accountHolder || '-';
  document.getElementById('bank-display-rib').textContent = bank.rib || '-';
  document.getElementById('bank-display-amount').textContent = `${finalTotal} MAD`;
};

// Setup copy RIB button
store.setupCopyRIBButton = function() {
  const copyBtn = document.getElementById('bank-copy-rib-btn');
  if (!copyBtn) return;

  copyBtn.onclick = (e) => {
    e.preventDefault();
    const ribText = document.getElementById('bank-display-rib').textContent;
    navigator.clipboard.writeText(ribText).then(() => {
      showToast('RIB copied to clipboard');
    }).catch(err => {
      showToast('Failed to copy RIB', 'error');
    });
  };
};

// Setup WhatsApp screenshot button
store.setupWhatsAppButton = function() {
  const waBtn = document.getElementById('bank-send-whatsapp-btn');
  if (!waBtn) return;

  waBtn.onclick = (e) => {
    e.preventDefault();
    const bankName = document.getElementById('bank-display-name').textContent;
    const amount = document.getElementById('bank-display-amount').textContent;
    const form = document.getElementById('cart-page-checkout-form');
    const orderId = 'ORDER-' + Date.now(); // Temporary, will be generated on order creation
    
    const message = encodeURIComponent(
      `Hello, I have completed the bank transfer for my order.\n\n` +
      `Order #: ${orderId}\n` +
      `Amount: ${amount}\n` +
      `Bank: ${bankName}\n` +
      `Account Holder: SOHAIB OTMANI\n\n` +
      `I am sending my payment screenshot here.`
    );
    
    const phoneNumber = (store.settings.whatsappHotline || '212777467304').replace(/\s+/g, '');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };
};

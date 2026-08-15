// Enhanced checkout form section with Bank Transfer payment method
// Insert this HTML after the address textarea in renderCartPage form
const paymentMethodUI = `
  <!-- PAYMENT METHOD SELECTION -->
  <div class="border-t border-luxuryGold/20 pt-4 space-y-3">
    <p class="text-xs font-semibold text-luxuryGold uppercase">${this.t('selectPaymentMethod') || 'Payment Method'}</p>
    
    <div class="space-y-2">
      <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer border border-luxuryGold/30 hover:bg-white/5 transition ${checkoutFormValues.paymentMethod === 'cod' ? 'bg-luxuryGold/10 border-luxuryGold' : ''}">
        <input type="radio" name="paymentMethod" value="cod" ${checkoutFormValues.paymentMethod === 'cod' ? 'checked' : ''} class="w-4 h-4 cursor-pointer">
        <div class="flex-grow">
          <p class="text-xs font-semibold text-white">Cash on Delivery</p>
          <p class="text-[9px] text-gray-400">Pay when your order arrives</p>
        </div>
      </label>

      ${this.banks.filter(b => b.active).length > 0 ? `
        <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer border border-luxuryGold/30 hover:bg-white/5 transition ${checkoutFormValues.paymentMethod === 'bank_transfer' ? 'bg-luxuryGold/10 border-luxuryGold' : ''}">
          <input type="radio" name="paymentMethod" value="bank_transfer" ${checkoutFormValues.paymentMethod === 'bank_transfer' ? 'checked' : ''} class="w-4 h-4 cursor-pointer">
          <div class="flex-grow">
            <p class="text-xs font-semibold text-blue-300">Bank Transfer</p>
            <p class="text-[9px] text-gray-400">Direct transfer with receipt verification</p>
          </div>
        </label>

        ${checkoutFormValues.paymentMethod === 'bank_transfer' ? `
          <div class="bg-blue-950/20 border border-blue-800/50 p-4 rounded-xl space-y-3 animate-fade-in">
            <select id="checkout-bank-select" class="w-full px-3 py-2 text-xs rounded-lg border border-luxuryGold/30 focus:outline-none focus:border-luxuryGold bg-[#111] text-white">
              <option value="">Select Bank...</option>
              ${this.banks.filter(b => b.active).map(b => `
                <option value="${b.id}" data-bank='${JSON.stringify(b)}' ${checkoutFormValues.selectedBankId === b.id ? 'selected' : ''}>${b.bankName}</option>
              `).join('')}
            </select>

            ${checkoutFormValues.selectedBankId ? (() => {
              const selectedBank = this.banks.find(b => b.id === checkoutFormValues.selectedBankId);
              return selectedBank ? `
                <div class="bg-black/40 p-3 rounded-lg border border-luxuryGold/20 space-y-2">
                  <div>
                    <p class="text-[9px] text-gray-400">Account Holder</p>
                    <p class="text-xs font-semibold text-white">${selectedBank.accountHolder}</p>
                  </div>
                  <div>
                    <div class="flex justify-between items-center mb-1">
                      <p class="text-[9px] text-gray-400">RIB (Account Number)</p>
                      <button type="button" id="copy-rib-btn" class="text-[8px] text-blue-300 hover:text-blue-200 uppercase font-bold">COPY</button>
                    </div>
                    <p class="text-xs font-mono font-semibold text-luxuryGold select-all" id="rib-display">${selectedBank.rib}</p>
                  </div>
                  <div>
                    <p class="text-[9px] text-gray-400">Transfer Amount</p>
                    <p class="text-xs font-semibold text-luxuryGold">${total} MAD</p>
                  </div>
                </div>

                <button type="button" id="whatsapp-send-btn" class="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white rounded-lg text-[10px] uppercase font-bold tracking-wider transition flex items-center justify-center gap-2">
                  📸 Send Proof via WhatsApp
                </button>
              ` : '';
            })() : ''}
          </div>
        ` : ''}
      ` : ''}
    </div>
  </div>
`;

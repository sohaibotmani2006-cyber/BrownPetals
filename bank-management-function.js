    store.renderAdminBankManagement = function(container) {
      container.innerHTML = `
        <div class="space-y-6">
          <!-- Header Section -->
          <div class="bg-[#141414] rounded-3xl p-6 border border-luxuryGold/20">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-serif text-xl text-luxuryGold">Bank Transfer Management</h3>
                <p class="text-xs text-gray-400 mt-1">Manage bank accounts for customer bank transfer payments</p>
              </div>
              <button id="admin-add-bank-btn" class="px-4 py-2 bg-luxuryGold hover:bg-luxuryGold/90 text-black text-xs font-bold uppercase tracking-widest rounded-lg transition">+ Add Bank</button>
            </div>
          </div>

          <!-- Banks List Section -->
          <div id="banks-list-container" class="space-y-4">
            ${this.banks && this.banks.length > 0 ? `
              ${this.banks.map((bank, index) => `
                <div class="bg-[#141414]/60 p-5 rounded-2xl border border-luxuryGold/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div class="flex-grow">
                    <div class="flex items-center gap-3">
                      <div class="flex-grow">
                        <p class="font-semibold text-luxuryGold text-sm">${bank.bankName || 'Unknown Bank'}</p>
                        <p class="text-xs text-gray-400 mt-0.5">Account Holder: ${bank.accountHolder || 'N/A'}</p>
                        <p class="text-xs text-gray-400 font-mono mt-0.5">RIB: ${bank.rib ? bank.rib.substring(0, 8) + '...' : 'N/A'}</p>
                      </div>
                      <div class="text-right">
                        <span class="px-3 py-1 rounded-full text-[8px] font-bold uppercase border ${
                          bank.active ? 'bg-emerald-950/45 text-emerald-300 border-emerald-800' : 'bg-red-950/45 text-red-300 border-red-800'
                        }">${bank.active ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button class="admin-edit-bank-btn px-3 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase rounded-lg transition" data-id="${bank.id}" data-index="${index}">Edit</button>
                    <button class="admin-toggle-bank-btn px-3 py-2 ${bank.active ? 'bg-red-950/20 text-red-300 hover:bg-red-950/40 border border-red-800' : 'bg-emerald-950/20 text-emerald-300 hover:bg-emerald-950/40 border border-emerald-800'} text-xs font-bold uppercase rounded-lg transition" data-id="${bank.id}">${bank.active ? 'Deactivate' : 'Activate'}</button>
                    <button class="admin-delete-bank-btn px-3 py-2 bg-white/5 hover:bg-red-950/20 text-white hover:text-red-300 text-xs font-bold uppercase rounded-lg transition" data-id="${bank.id}">Delete</button>
                  </div>
                </div>
              `).join('')}
            ` : `
              <div class="text-center py-12 bg-black/40 rounded-2xl border border-luxuryGold/10">
                <p class="text-gray-400 text-sm">No banks configured yet</p>
                <p class="text-xs text-gray-500 mt-1">Add your first bank account to enable bank transfer payments</p>
              </div>
            `}
          </div>
        </div>
      `;

      // Add Bank Button
      const addBankBtn = document.getElementById('admin-add-bank-btn');
      if (addBankBtn) {
        addBankBtn.onclick = () => {
          store.editingBankId = null;
          store.bankManagementForm = { bankName: "", accountHolder: "SOHAIB OTMANI", rib: "", logo: "", active: true };
          store.showBankForm();
        };
      }

      // Edit Bank Buttons
      document.querySelectorAll('.admin-edit-bank-btn').forEach(btn => {
        btn.onclick = () => {
          const bankId = btn.getAttribute('data-id');
          const bank = store.banks.find(b => b.id === bankId);
          if (bank) {
            store.editingBankId = bankId;
            store.bankManagementForm = { ...bank };
            store.showBankForm();
          }
        };
      });

      // Delete Bank Buttons
      document.querySelectorAll('.admin-delete-bank-btn').forEach(btn => {
        btn.onclick = () => {
          const bankId = btn.getAttribute('data-id');
          const bank = store.banks.find(b => b.id === bankId);
          if (bank) {
            triggerConfirm(
              'Delete Bank',
              `Are you sure you want to permanently delete "${bank.bankName}"?<br><br><strong>This action cannot be undone.</strong>`,
              async () => {
                try {
                  await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'banks', bankId));
                  showToast('Bank deleted successfully');
                  store.renderAdminBankManagement(container);
                } catch (e) {
                  showToast('Failed to delete bank', 'error');
                  console.error(e);
                }
              }
            );
          }
        };
      });

      // Toggle Active Status Buttons
      document.querySelectorAll('.admin-toggle-bank-btn').forEach(btn => {
        btn.onclick = async () => {
          const bankId = btn.getAttribute('data-id');
          const bank = store.banks.find(b => b.id === bankId);
          if (bank) {
            try {
              await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'banks', bankId), {
                active: !bank.active,
                updatedAt: new Date()
              });
              showToast(`Bank ${!bank.active ? 'activated' : 'deactivated'} successfully`);
            } catch (e) {
              showToast('Failed to update bank status', 'error');
              console.error(e);
            }
          }
        };
      });
    };

    store.showBankForm = function() {
      const modal = document.getElementById('confirm-modal-container');
      if (!modal) return;
      
      const isEditing = !!this.editingBankId;
      const form = this.bankManagementForm;
      
      modal.innerHTML = `
        <div class="absolute inset-0 bg-black/80 backdrop-blur-xs"></div>
        <div class="relative bg-[#141414] p-6 rounded-2xl max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto w-full border border-luxuryGold/30 shadow-2xl z-10 space-y-4">
          <h3 class="font-serif text-lg text-luxuryGold font-bold">${isEditing ? 'Edit Bank' : 'Add New Bank'}</h3>
          
          <form id="bank-form" class="space-y-4">
            <div>
              <label class="block text-[10px] uppercase font-bold text-luxuryGold mb-1">Bank Name*</label>
              <input type="text" name="bankName" required placeholder="e.g., CIH Bank" value="${form.bankName}" class="w-full px-3 py-2 text-xs rounded-lg border border-luxuryGold/30 focus:outline-none focus:border-luxuryGold bg-[#111] text-white">
            </div>
            
            <div>
              <label class="block text-[10px] uppercase font-bold text-luxuryGold mb-1">Account Holder / Beneficiary*</label>
              <input type="text" name="accountHolder" required placeholder="e.g., SOHAIB OTMANI" value="${form.accountHolder}" class="w-full px-3 py-2 text-xs rounded-lg border border-luxuryGold/30 focus:outline-none focus:border-luxuryGold bg-[#111] text-white">
            </div>
            
            <div>
              <label class="block text-[10px] uppercase font-bold text-luxuryGold mb-1">RIB (Account Number)*</label>
              <input type="text" name="rib" required placeholder="e.g., 00680100001234567890123" value="${form.rib}" class="w-full px-3 py-2 text-xs rounded-lg border border-luxuryGold/30 focus:outline-none focus:border-luxuryGold bg-[#111] text-white font-mono">
            </div>
            
            <div>
              <label class="block text-[10px] uppercase font-bold text-luxuryGold mb-1">Bank Logo URL (Optional)</label>
              <input type="url" name="logo" placeholder="https://example.com/logo.png" value="${form.logo}" class="w-full px-3 py-2 text-xs rounded-lg border border-luxuryGold/30 focus:outline-none focus:border-luxuryGold bg-[#111] text-white">
            </div>
            
            <div class="flex items-center gap-3">
              <input type="checkbox" id="bankActiveToggle" name="active" ${form.active ? 'checked' : ''} class="rounded text-luxuryGold">
              <label for="bankActiveToggle" class="text-xs font-semibold text-gray-300">Active (customers can see and select this bank)</label>
            </div>
          </form>
          
          <div class="flex gap-3 justify-end pt-2">
            <button id="bank-form-cancel-btn" class="px-4 py-2 bg-black/40 text-gray-400 rounded-lg text-xs uppercase font-bold tracking-wider border border-white/10 hover:bg-white/5 transition">Cancel</button>
            <button id="bank-form-submit-btn" class="px-6 py-2 bg-luxuryGold text-black rounded-lg text-xs uppercase font-bold tracking-wider hover:bg-luxuryGold/80 transition shadow-md">${isEditing ? 'Update Bank' : 'Add Bank'}</button>
          </div>
        </div>
      `;
      
      modal.classList.remove('hidden');
      
      document.getElementById('bank-form-cancel-btn').onclick = () => {
        modal.classList.add('hidden');
      };
      
      document.getElementById('bank-form-submit-btn').onclick = async () => {
        const form = document.getElementById('bank-form');
        if (!form.checkValidity()) {
          showToast('Please fill in all required fields', 'error');
          return;
        }
        
        const bankData = {
          bankName: form.bankName.value.trim(),
          accountHolder: form.accountHolder.value.trim(),
          rib: form.rib.value.trim(),
          logo: form.logo.value.trim(),
          active: document.getElementById('bankActiveToggle').checked,
          updatedAt: new Date()
        };
        
        try {
          if (store.editingBankId) {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'banks', store.editingBankId), bankData);
            showToast('Bank updated successfully');
          } else {
            bankData.createdAt = new Date();
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'banks'), bankData);
            showToast('Bank added successfully');
          }
          modal.classList.add('hidden');
          const container = document.getElementById('admin-view-content');
          if (container) store.renderAdminBankManagement(container);
        } catch (e) {
          showToast('Failed to save bank. Please try again.', 'error');
          console.error(e);
        }
      };
    };

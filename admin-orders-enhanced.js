    store.renderAdminOrders = function(container) {
      container.innerHTML = `
        <div class="bg-[#141414] rounded-3xl p-6 border border-luxuryGold/20 space-y-6">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-white">
              <thead class="bg-black uppercase font-bold border-b border-luxuryGold/25 text-luxuryGold">
                <tr>
                  <th class="p-4">Order ID & Client</th>
                  <th class="p-4">Items</th>
                  <th class="p-4">Payment</th>
                  <th class="p-4">Total</th>
                  <th class="p-4">Status</th>
                  <th class="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                ${this.orders.map(o => `
                  <tr class="hover:bg-white/5 transition">
                    <td class="p-4">
                      <p class="font-bold text-sm text-luxuryGold">${o.orderId}</p>
                      <p class="text-[10px] text-gray-300 mt-0.5">${o.customerName}</p>
                      <p class="text-[9px] text-gray-400">${o.phone}</p>
                      <p class="text-[9px] text-gray-400">${o.address} (${o.deliveryCity || 'Morocco'})</p>
                    </td>
                    <td class="p-4">
                      ${o.items?.slice(0, 3).map(item => `<p class="text-[10px] text-gray-300 line-clamp-1">• ${item.name.replace(/\s*\(\s*(Les Hommes|Les Filles|Men|Women|Men's Packs|Women's Packs)\s*\)\s*/gi, "").trim()} <strong class="text-luxuryGold">x${item.quantity}</strong></p>`).join('')}
                      ${o.items?.length > 3 ? `<p class="text-[9px] text-gray-500 mt-1">+${o.items.length - 3} more items</p>` : ''}
                    </td>
                    <td class="p-4">
                      <p class="text-[10px] font-semibold ${o.paymentMethod === 'Bank Transfer' ? 'text-blue-300' : 'text-green-300'}">${o.paymentMethod || 'Cash on Delivery'}</p>
                      ${o.paymentStatus ? `<p class="text-[9px] text-gray-400 mt-1">${o.paymentStatus}</p>` : ''}
                      ${o.bankTransfer ? `
                        <div class="text-[9px] text-gray-400 mt-2 space-y-0.5">
                          <p><strong>Bank:</strong> ${o.bankTransfer.bankName}</p>
                          <p><strong>Account:</strong> ${o.bankTransfer.accountHolder}</p>
                        </div>
                      ` : ''}
                    </td>
                    <td class="p-4 font-serif font-bold text-luxuryGold">${o.total} MAD</td>
                    <td class="p-4">
                      <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        o.status === 'pending' ? 'bg-red-950 text-red-300' : 
                        o.status === 'cancelled' ? 'bg-white/5 text-gray-500' : 
                        'bg-emerald-950 text-emerald-300'
                      }">${o.status || 'pending'}</span>
                    </td>
                    <td class="p-4 text-right space-x-2">
                      ${o.status === 'pending' ? `
                        ${o.paymentMethod === 'Bank Transfer' && o.paymentStatus === 'Pending Verification' ? `
                          <button class="bank-verify-btn px-2 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded text-[9px] uppercase font-bold" data-id="${o.id}" title="Mark payment as verified">Verify</button>
                          <button class="bank-reject-btn px-2 py-1 bg-orange-700 hover:bg-orange-800 text-white rounded text-[9px] uppercase font-bold" data-id="${o.id}" title="Reject payment">Reject</button>
                        ` : ''}
                        <button class="fulfill-order-btn px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[9px] uppercase font-bold" data-id="${o.id}">Fulfill</button>
                        <button class="cancel-order-btn px-2 py-1 bg-red-700 hover:bg-red-800 text-white rounded text-[9px] uppercase font-bold" data-id="${o.id}">Cancel</button>
                      ` : `<span class="text-[9px] text-gray-500">Archived</span>`}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      // Bank transfer verification button
      document.querySelectorAll(".bank-verify-btn").forEach(btn => {
        btn.onclick = async () => {
          const id = btn.getAttribute("data-id");
          const order = store.orders.find(o => o.id === id);
          if (!order) return;

          triggerConfirm(
            "Verify Bank Transfer",
            `Verify the bank transfer for ${order.customerName}'s order (${order.orderId})?<br><br>Amount: <strong>${order.total} MAD</strong><br>Bank: <strong>${order.bankTransfer?.bankName}</strong>`,
            async () => {
              try {
                await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', id), {
                  paymentStatus: "Paid",
                  paymentVerifiedAt: new Date(),
                  updatedAt: new Date()
                });
                showToast("Payment verified successfully!");
              } catch (e) {
                showToast("Failed to verify payment", "error");
                console.error(e);
              }
            }
          );
        };
      });

      // Bank transfer rejection button
      document.querySelectorAll(".bank-reject-btn").forEach(btn => {
        btn.onclick = async () => {
          const id = btn.getAttribute("data-id");
          const order = store.orders.find(o => o.id === id);
          if (!order) return;

          triggerConfirm(
            "Reject Bank Transfer",
            `Reject the bank transfer for ${order.customerName}'s order (${order.orderId})?<br><br>Amount: <strong>${order.total} MAD</strong><br>Bank: <strong>${order.bankTransfer?.bankName}</strong><br><br>The customer will need to submit payment proof again.`,
            async () => {
              try {
                await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', id), {
                  paymentStatus: "Rejected",
                  rejectedAt: new Date(),
                  updatedAt: new Date()
                });
                showToast("Payment rejected. Customer notification sent.");
              } catch (e) {
                showToast("Failed to reject payment", "error");
                console.error(e);
              }
            }
          );
        };
      });

      // Fulfill order button
      document.querySelectorAll(".fulfill-order-btn").forEach(btn => {
        btn.onclick = async () => {
          const id = btn.getAttribute("data-id");
          const order = store.orders.find(o => o.id === id);
          
          // Check if bank transfer is still pending verification
          if (order?.paymentMethod === 'Bank Transfer' && order?.paymentStatus === 'Pending Verification') {
            showToast("Please verify the bank transfer payment first.", "error");
            return;
          }

          try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', id), { 
              status: "processed",
              processedAt: new Date()
            });
            showToast("Order fulfilled successfully!");
          } catch (e) {
            showToast("Failed to fulfill order", "error");
            console.error(e);
          }
        };
      });

      // Cancel order button
      document.querySelectorAll(".cancel-order-btn").forEach(btn => {
        btn.onclick = () => {
          const id = btn.getAttribute("data-id");
          const order = store.orders.find(o => o.id === id);
          if (!order) return;

          triggerConfirm(
            "Cancel Order",
            `Remove order ${order.orderId} for ${order.customerName} from database tracking?<br><br>This action cannot be undone.`,
            async () => {
              try {
                await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', id), { 
                  status: "cancelled",
                  cancelledAt: new Date()
                });
                showToast("Order cancelled.");
              } catch (e) {
                showToast("Failed to cancel order", "error");
                console.error(e);
              }
            }
          );
        };
      });
    };

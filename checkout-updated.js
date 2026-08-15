    store.processCheckoutPage = async function(e) {
      e.preventDefault();
      const formEl = e.target;
      const name = formEl.customerName.value;
      const phone = formEl.phone.value;
      const cityId = formEl.cityId.value;
      const address = formEl.address.value;
      const paymentMethod = formEl.paymentMethod?.value || "cod";

      if (!name || !phone || !cityId || !address) {
        showToast("Please fill in all required delivery coordinates.", "error");
        return;
      }

      // Validate bank selection for Bank Transfer
      if (paymentMethod === 'bank_transfer') {
        if (!this.checkoutFormValues.selectedBankId) {
          showToast("Please select a bank for the transfer.", "error");
          return;
        }
      }

      this.checkoutLoading = true;
      this.renderCartPage();

      try {
        const subtotal = this.cart.reduce((sum, item) => sum + ((item.discountPrice || item.price) * item.quantity), 0);
        const cityObj = this.deliveryCities.find(c => c.id === cityId);
        const deliveryFee = cityObj ? cityObj.price : 0;
        const cityName = cityObj ? cityObj.name : "Morocco";
        const total = subtotal + deliveryFee;
        const orderId = "SOV-" + Math.floor(100000 + Math.random() * 900000);

        const orderItems = this.cart.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.discountPrice || item.price
        }));

        let newOrder = {
          orderId,
          items: orderItems,
          total,
          subtotal,
          deliveryFee,
          deliveryCity: cityName,
          customerName: name,
          phone,
          address,
          status: "pending",
          paymentMethod: paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Cash on Delivery',
          createdAt: new Date()
        };

        // Add bank transfer details if Bank Transfer method is selected
        if (paymentMethod === 'bank_transfer') {
          const selectedBank = this.banks.find(b => b.id === this.checkoutFormValues.selectedBankId);
          if (selectedBank) {
            newOrder.paymentStatus = 'Pending Verification';
            newOrder.bankTransfer = {
              bankId: selectedBank.id,
              bankName: selectedBank.bankName,
              accountHolder: selectedBank.accountHolder,
              rib: selectedBank.rib,
              amount: total
            };
          }
        } else {
          newOrder.paymentStatus = 'Pending';
        }

        const ordersCol = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
        await addDoc(ordersCol, newOrder);

        const localHistory = JSON.parse(localStorage.getItem("sovanex_order_history")) || [];
        localHistory.push(orderId);
        localStorage.setItem("sovanex_order_history", JSON.stringify(localHistory));

        const purchasedItemIds = this.cart.map(item => item.id);
        localStorage.setItem("sovanex_last_purchased_ids", JSON.stringify(purchasedItemIds));

        if (typeof fbq !== 'undefined') {
          fbq('track', 'Purchase', {
            value: total,
            currency: 'MAD',
            contents: orderItems.map(item => ({ id: item.id, quantity: item.quantity })),
            content_type: 'product'
          });
        }

        let productsMsg = "";
        this.cart.forEach(item => {
          productsMsg += "• *" + item.name + "* x" + item.quantity + " (" + (item.discountPrice || item.price) + " MAD)\n";
        });

        let msgText = this.telegramSettings.template
          .replace(/{products}/g, productsMsg.trim())
          .replace(/{subtotal}/g, subtotal)
          .replace(/{city}/g, cityName)
          .replace(/{delivery}/g, deliveryFee)
          .replace(/{total}/g, total)
          .replace(/{name}/g, name)
          .replace(/{address}/g, address)
          .replace(/{phone}/g, phone)
          .replace(/{orderId}/g, orderId);

        // Add Bank Transfer specific info to message
        if (paymentMethod === 'bank_transfer' && newOrder.bankTransfer) {
          msgText += "\n\n💳 *BANK TRANSFER ORDER*\n";
          msgText += "*Bank:* " + newOrder.bankTransfer.bankName + "\n";
          msgText += "*Account Holder:* " + newOrder.bankTransfer.accountHolder + "\n";
          msgText += "*RIB:* " + newOrder.bankTransfer.rib + "\n";
          msgText += "*Status:* Waiting for payment proof verification";
        }

        if (this.telegramSettings.botEnabled && this.telegramSettings.botToken && this.telegramSettings.chatId) {
          try {
            const telegramUrl = "https://api.telegram.org/bot" + this.telegramSettings.botToken + "/sendMessage";
            await fetch(telegramUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: this.telegramSettings.chatId,
                text: msgText,
                parse_mode: "Markdown"
              })
            });
          } catch (apiErr) {
            console.error("Telegram delivery bypassed:", apiErr);
          }
        }

        this.cart = [];
        localStorage.setItem("bp_cart", JSON.stringify([]));
        this.checkoutFormValues = { customerName: "", phone: "", cityId: "", address: "", paymentMethod: "cod", selectedBankId: null };
        this.checkoutLoading = false;

        this.setPage("order-confirmation");

      } catch (err) {
        console.error(err);
        this.checkoutLoading = false;
        showToast("Order checkout pipeline failed. Please try again.", "error");
        this.renderCartPage();
      }
    };

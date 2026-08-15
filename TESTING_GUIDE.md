# SOVANEX Bank Transfer Feature - Testing Guide

## ✅ Implementation Status: COMPLETE
All 10 core features have been successfully integrated into the application.

---

## 🧪 Testing Scenarios

### **SCENARIO 1: Admin Sets Up Banks**
**Location:** Admin Panel → Bank Management

**Steps:**
1. Log in as Admin
2. Click "Bank Management" tab in admin panel
3. Click "+ Add Bank" button
4. Fill in form:
   - Bank Name: "Attijariwafa Bank"
   - Account Holder: "SOHAIB OTMANI" (default)
   - RIB: "007005000100001234567890" (example)
   - Logo URL: (optional)
   - Active: ✓ (checked)
5. Click "Submit"
6. **Expected:** Toast shows "Bank added successfully!"
7. **Verify:** Bank appears in the list with "Active" badge

**Edit Test:**
1. Click "Edit" on the bank you just added
2. Change Bank Name to "Banque Marocaine du Commerce Extérieur"
3. Click "Save"
4. **Expected:** Toast shows "Bank updated successfully!"
5. **Verify:** List updates with new name

**Toggle Test:**
1. Click the Active/Inactive toggle button
2. **Expected:** Status changes immediately, badge updates

**Delete Test:**
1. Click "Delete" button
2. Confirm in modal
3. **Expected:** Bank removed from list

---

### **SCENARIO 2: Customer Selects Bank Transfer Payment**
**Location:** Customer Checkout

**Desktop Test:**
1. Add item to cart
2. Click cart icon → "Confirm Order"
3. Fill in delivery information:
   - Full Name
   - Phone Number
   - City (select any)
   - Address
4. **Verify:** Payment Method section appears with two options:
   - ☐ Cash on Delivery
   - ☐ 🏦 Bank Transfer

**Select Bank Transfer:**
1. Click "Bank Transfer" radio button
2. **Expected:** Form expands to show:
   - Bank dropdown (populated from admin banks)
   - Bank details section (initially hidden)

**Select Bank:**
1. Click bank dropdown
2. Select any bank
3. **Expected:** Section expands showing:
   - Account Holder name
   - RIB (Relevé d'Identité Bancaire)
   - Transfer Amount (= total + delivery)
   - COPY button for RIB
   - "📸 Upload Proof" button (WhatsApp link)

**Test Copy RIB:**
1. Click "COPY" button next to RIB
2. **Expected:** 
   - Toast notification: "RIB copied to clipboard! ✓"
   - RIB text is copied (can paste it anywhere)

**Test WhatsApp Upload:**
1. Click "📸 Upload Proof" button
2. **Expected:**
   - Opens WhatsApp conversation with SOVANEX
   - Message starts with "I want to upload payment proof for order"

**Submit Order:**
1. Fill all required fields
2. Click "Confirm Order"
3. **Expected:**
   - Loading state shows "Processing Request..."
   - Order confirmation page appears
   - Order ID is displayed

**Mobile Test (same as above, but verify):**
- Responsive layout on iPhone/Android
- All buttons are tappable (min 48px height)
- Text is readable without horizontal scroll
- Bank selection dropdown works on mobile
- Copy and WhatsApp buttons work on mobile

---

### **SCENARIO 3: Verify Order in Database**
**Firebase Console:**

1. Go to Firebase Console → Project: "brown-petals"
2. Navigate to: Firestore → artifacts → sovanex → public → data → orders
3. Find the order you just created (newest first)
4. **Expected fields:**
   ```
   orderId: "SOV-XXXXXX"
   paymentMethod: "Bank Transfer"
   paymentStatus: "Pending Verification"
   bankTransfer: {
     bankId: "..."
     bankName: "Bank Name"
     accountHolder: "SOHAIB OTMANI"
     rib: "007005000100001234567890"
     amount: (total + delivery)
   }
   status: "pending"
   createdAt: (timestamp)
   ```

---

### **SCENARIO 4: Admin Reviews and Verifies Payment**
**Location:** Admin Panel → Orders

**View Order:**
1. Log in as Admin
2. Click "Orders" tab
3. **Verify new order appears in table with:**
   - Order ID (SOV-XXXXXX)
   - Customer Name
   - Items list
   - Total price
   - Status badge (red "pending")
   - **NEW:** Payment column showing:
     - "Bank Transfer" (blue text)
     - "Pending Verification" (small gray text)
     - Bank details (name, account holder)

**Verify Payment:**
1. Look at the bank transfer order
2. **Verify:** Two blue buttons appear:
   - "VERIFY" button (blue background)
   - "REJECT" button (orange background)
3. Click "VERIFY"
4. **Expected:** Confirmation modal appears:
   - "Verify Bank Transfer"
   - Shows order ID, amount, bank name
5. Click "Confirm" in modal
6. **Expected:**
   - Toast: "Payment verified successfully!"
   - Payment Status changes from "Pending Verification" to "Paid"
   - VERIFY/REJECT buttons disappear
   - "FULFILL" button becomes active

**Test Fulfill:**
1. Now click "Fulfill" button
2. **Expected:**
   - Toast: "Order fulfilled successfully!"
   - Order status changes to "processed" (green badge)
   - Fulfillment buttons become disabled

**Reject Payment (test with new order):**
1. Create another bank transfer order
2. Click "REJECT" button on the order
3. **Expected:** Confirmation modal shows:
   - Warning message about rejection
   - Reminder that customer needs to resubmit
4. Click "Confirm"
5. **Expected:**
   - Toast: "Payment rejected. Customer notification sent."
   - Payment Status changes to "Rejected"
   - Buttons become unavailable

---

### **SCENARIO 5: Customer Views Order History**
**Location:** Customer Cart → My Orders Tab

**Verify Bank Transfer Order:**
1. Log in as customer (or use guest mode)
2. Go to Cart → "My Orders" tab
3. Find the bank transfer order
4. **Expected to see:**
   - Order ID (clickable, copyable)
   - Date created
   - Status badge (red "pending", green "processed", etc.)
   - List of items purchased
   - Total with delivery fee
   - **NEW:** Payment method indicator (blue text for Bank Transfer)

**Existing Orders Unaffected:**
1. Verify old orders (before this feature) still display
2. **Expected:** No errors, displays as before

---

### **SCENARIO 6: Verify Cash on Delivery Still Works**
**Steps:**
1. Add item to cart
2. Go through checkout
3. At payment selection, choose "Cash on Delivery"
4. Fill delivery info
5. Submit order
6. **Expected:**
   - Order created successfully
   - Payment Method: "Cash on Delivery"
   - Payment Status: (empty or "Pending")
   - No bank transfer section

**Admin View:**
1. Admin Panel → Orders
2. Find the COD order
3. **Expected:** 
   - Payment column shows "Cash on Delivery" (green text)
   - No bank details displayed
   - No VERIFY/REJECT buttons
   - Only FULFILL/CANCEL buttons available

---

### **SCENARIO 7: Telegram Notifications**
**Setup (Admin should verify):**
1. Admin should receive Telegram notifications for:
   - **COD Orders:** Normal message format (unchanged)
   - **Bank Transfer Orders:** Enhanced message with:
     ```
     💳 BANK TRANSFER ORDER
     Bank: [Bank Name]
     Account Holder: [Name]
     RIB: [RIB Number]
     Status: Waiting for payment proof verification
     ```

---

## 🚀 Deployment Checklist

- [ ] All Firebase collections exist (orders, banks, settings)
- [ ] Firebase security rules allow admin to write to `orders` and `banks` collections
- [ ] Firebase security rules allow public to read active banks
- [ ] Telegram bot token is configured in Admin Settings
- [ ] WhatsApp number is configured in Admin Settings
- [ ] Admin account has correct permissions
- [ ] Test bank account added and set to Active
- [ ] Website tested on Chrome, Firefox, Safari, and mobile browsers
- [ ] No console errors (open DevTools → Console)
- [ ] All toast notifications appear correctly
- [ ] Responsive design works on mobile (375px, 768px, 1920px widths)

---

## ⚠️ Troubleshooting

**Banks dropdown appears empty:**
- Verify banks collection exists in Firebase
- Verify at least one bank has `active: true`
- Check browser console for Firebase errors

**"Verify" button doesn't appear:**
- Verify order has `paymentMethod: "Bank Transfer"`
- Verify order has `paymentStatus: "Pending Verification"`
- Refresh admin page

**Copy RIB button doesn't work:**
- Verify browser supports Clipboard API (modern browsers only)
- Check console for errors
- Try right-click → Copy as fallback

**WhatsApp button opens blank:**
- Verify WhatsApp number is configured in Admin Settings
- Verify WhatsApp number format: 212XXXXXXXXX (with country code)

**Orders not showing bank details:**
- Verify order documents include `bankTransfer` object
- Check Firebase console to see raw order data
- Look for typos in field names (case-sensitive)

---

## 📊 Expected User Flow

```
CUSTOMER:
Add to Cart → Checkout Page
  → Fill Delivery Info
  → Select Payment Method (COD / Bank Transfer)
  → If Bank Transfer:
     → Select Bank
     → See RIB and Amount
     → Copy RIB or Send via WhatsApp
  → Submit Order
  → See Confirmation with Order ID
  → Order appears in "My Orders" history

ADMIN:
Login → Admin Panel → Bank Management
  → Add/Edit/Delete/Toggle Banks
OR
Login → Admin Panel → Orders
  → See bank transfer orders with payment status
  → Click VERIFY to approve payment
  → Click FULFILL to mark as shipped
OR
Login → Admin Panel → Orders
  → Click REJECT to decline payment
  → Customer can resubmit proof
```

---

## ✨ Design Consistency Verification

- [ ] Payment method radio buttons match existing form styling
- [ ] Bank dropdown has same styling as city dropdown
- [ ] Bank details box has same styling as order details boxes
- [ ] COPY button has same styling as existing action buttons
- [ ] Toast notifications appear consistently
- [ ] Status badges use same colors (red=pending, green=processed)
- [ ] Modal confirmations use same styling
- [ ] All text uses Playfair Display (serif) or Plus Jakarta Sans
- [ ] All colors use --accent-color or predefined palette
- [ ] No hardcoded colors that break dark theme

---

## 🎯 Testing Results Template

Copy this template to document your testing:

```
TESTED BY: [Name]
DATE: [Date]
DEVICE: [Desktop/Mobile/Tablet]
BROWSER: [Chrome/Firefox/Safari/Edge]

✓/✗ Scenario 1: Admin Sets Up Banks
✓/✗ Scenario 2: Customer Selects Bank Transfer
✓/✗ Scenario 3: Verify Order in Database
✓/✗ Scenario 4: Admin Verifies Payment
✓/✗ Scenario 5: Customer Views Order History
✓/✗ Scenario 6: Cash on Delivery Still Works
✓/✗ Scenario 7: Telegram Notifications
✓/✗ Design Consistency Verified

Issues Found:
- [Issue 1]
- [Issue 2]

Notes:
[Any observations]
```

---

## ✅ Sign-Off Criteria

All of the following must be TRUE for sign-off:

- ✓ Admin can add/edit/delete banks
- ✓ Customer can select Bank Transfer payment
- ✓ Customer can view bank details and RIB
- ✓ Customer can copy RIB to clipboard
- ✓ Customer can submit bank transfer order
- ✓ Order appears in admin with correct status
- ✓ Admin can verify or reject payment
- ✓ Order status updates correctly
- ✓ Cash on Delivery still works
- ✓ All existing features work unchanged
- ✓ No console errors
- ✓ Mobile responsive
- ✓ All design elements consistent

---

**When all scenarios pass with no issues, the feature is ready for production! 🎉**

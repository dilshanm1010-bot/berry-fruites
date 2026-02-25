/* =========================================================
   GLOBAL CONFIG
========================================================= */
const LOW_STOCK_LIMIT = 5;

/* =========================================================
   NOTIFICATION SYSTEM
========================================================= */
function requestNotificationPermission() {
  if ("Notification" in window) {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }
}

function showNotification(title, options = {}) {
  const defaultOptions = {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%231e88e5'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z'/></svg>",
    ...options
  };

  // Try to use Web Notifications API (works on Android)
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, defaultOptions);
    } catch (e) {
      showToastNotification(title, options.body);
    }
  } else {
    // Fallback to toast notification
    showToastNotification(title, options.body);
  }
}

function showToastNotification(title, message = "") {
  const toast = document.createElement("div");
  toast.className = "toast-notification";
  toast.innerHTML = `
    <div class="toast-content">
      <strong>${title}</strong>
      ${message ? `<p>${message}</p>` : ""}
    </div>
  `;
  document.body.appendChild(toast);

  // Show animation
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function showPDFNotification(fileName, shopName = "") {
  const toast = document.createElement("div");
  toast.className = "toast-notification";
  toast.style.background = "#2e7d32";
  toast.innerHTML = `
    <div class="toast-content">
      <strong>✅ PDF Ready!</strong>
      <p>${fileName}</p>
      <p style="font-size: 12px; margin-top: 4px;">📁 Check Downloads folder</p>
    </div>
  `;
  document.body.appendChild(toast);

  // Show animation
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 5000);

  // Native Android notification
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification("📄 PDF Exported: " + fileName, {
        body: "Tap to open. Swipe to share with others.",
        icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232e7d32'><path d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54h5.79L10.96 12.29z'/></svg>",
        tag: "pdf-export",
        requireInteraction: false
      });
    } catch (e) {
      // Fallback handled by toast
    }
  }
}

/* =========================================================
   DATABASE
========================================================= */
let db;
let dbReady = false;
let domReady = false;

const DB_NAME = "FruitERP_DB";
const DB_VERSION = 1;

const request = indexedDB.open(DB_NAME, DB_VERSION);

request.onupgradeneeded = e => {
  db = e.target.result;

  if (!db.objectStoreNames.contains("inventory")) {
    db.createObjectStore("inventory", { keyPath: "id", autoIncrement: true });
  }

  if (!db.objectStoreNames.contains("sales")) {
    db.createObjectStore("sales", { keyPath: "id", autoIncrement: true });
  }

  if (!db.objectStoreNames.contains("expenses")) {
    db.createObjectStore("expenses", { keyPath: "id", autoIncrement: true });
  }
};

request.onsuccess = e => {
  db = e.target.result;
  dbReady = true;
  if (domReady) initApp();
};

request.onerror = () => {
  alert("Database failed to open");
};

/* =========================================================
   DOM REFERENCES
========================================================= */
// DOM references - lazy loaded
let splashScreen, loginScreen, forgotScreen, pinScreen, erpApp;
let inventoryTable, fruitSelect, ledgerContainer, expenseTable;
let loginUsername, loginPassword, forgotUsername, forgotNewPassword, pinInput;
let invDate, invFruit, invStock, invPrice;
let saleDate, shop, phone, kg, sell, total, paid;
let expDate, expNote, expAmount;
let dashTotalSales, dashPending, dashExpense, dashProfit, dashLowStock;

function initDOM() {
  splashScreen = document.getElementById("splashScreen");
  loginScreen = document.getElementById("loginScreen");
  forgotScreen = document.getElementById("forgotScreen");
  pinScreen = document.getElementById("pinScreen");
  erpApp = document.getElementById("erpApp");
  inventoryTable = document.getElementById("inventoryTable");
  fruitSelect = document.getElementById("fruitSelect");
  ledgerContainer = document.getElementById("ledgerContainer");
  expenseTable = document.getElementById("expenseTable");
  loginUsername = document.getElementById("loginUsername");
  loginPassword = document.getElementById("loginPassword");
  forgotUsername = document.getElementById("forgotUsername");
  forgotNewPassword = document.getElementById("forgotNewPassword");
  pinInput = document.getElementById("pinInput");
  invDate = document.getElementById("invDate");
  invFruit = document.getElementById("invFruit");
  invStock = document.getElementById("invStock");
  invPrice = document.getElementById("invPrice");
  saleDate = document.getElementById("saleDate");
  shop = document.getElementById("shop");
  phone = document.getElementById("phone");
  kg = document.getElementById("kg");
  sell = document.getElementById("sell");
  total = document.getElementById("total");
  paid = document.getElementById("paid");
  expDate = document.getElementById("expDate");
  expNote = document.getElementById("expNote");
  expAmount = document.getElementById("expAmount");
  dashTotalSales = document.getElementById("dashTotalSales");
  dashPending = document.getElementById("dashPending");
  dashExpense = document.getElementById("dashExpense");
  dashProfit = document.getElementById("dashProfit");
  dashLowStock = document.getElementById("dashLowStock");
}

/* =========================================================
   INIT
========================================================= */
function initApp() {
  splashScreen.classList.add("hidden");
  // Check if user is already logged in
  if (localStorage.getItem("isLoggedIn") === "true") {
    showPin();
  } else {
    showLogin();
  }
}

/* =========================================================
   AUTH
========================================================= */
const AUTH = { user: "admin", pass: "1234", pin: "1234" };
localStorage.setItem("auth", JSON.stringify(AUTH));
let isFirstLogin = !localStorage.getItem("hasLoggedIn");

function hideAllScreens() {
  document.querySelectorAll(".auth-screen, #erpApp").forEach(el =>
    el.classList.add("hidden")
  );
}

function showLogin() {
  hideAllScreens();
  loginScreen.classList.remove("hidden");
  loginUsername.value = "";
  loginPassword.value = "";
}

function showPin() {
  hideAllScreens();
  pinScreen.classList.remove("hidden");
}

function showApp() {
  hideAllScreens();
  erpApp.classList.remove("hidden");
  const logoutBtn = document.querySelector(".app-bar .icon-btn");
  if (logoutBtn) {
    logoutBtn.style.display = isFirstLogin ? "none" : "block";
  }
  nav("dashboardSection");
  refreshAll();
}

function login() {
  const a = JSON.parse(localStorage.getItem("auth"));
  if (
    loginUsername.value === a.user &&
    loginPassword.value === a.pass
  ) {
    showPin();
  } else {
    alert("Invalid login");
  }
}

function unlockPin() {
  const a = JSON.parse(localStorage.getItem("auth"));
  if (pinInput.value === a.pin) {
    localStorage.setItem("hasLoggedIn", "true");
    localStorage.setItem("isLoggedIn", "true");
    isFirstLogin = false;
    pinInput.value = "";
    showApp();
  } else {
    alert("Wrong PIN");
  }
}

function logout() {
  localStorage.setItem("isLoggedIn", "false");
  loginUsername.value = "";
  loginPassword.value = "";
  showLogin();
}

function openForgot() {
  hideAllScreens();
  forgotScreen.classList.remove("hidden");
}

function backToLogin() {
  hideAllScreens();
  loginScreen.classList.remove("hidden");
  loginUsername.value = "";
  loginPassword.value = "";
}

function resetPassword() {
  const a = JSON.parse(localStorage.getItem("auth"));
  const username = forgotUsername.value.trim();
  const newPass = forgotNewPassword.value.trim();

  if (username === a.user && newPass) {
    a.pass = newPass;
    localStorage.setItem("auth", JSON.stringify(a));
    forgotUsername.value = "";
    forgotNewPassword.value = "";
    alert("Password updated successfully");
    backToLogin();
  } else {
    alert("Invalid username or password");
  }
}

function closeInvoice() {
  document.getElementById("invoiceModal").classList.add("hidden");
}

function exportInvoicePDF() {
  const invNo = document.getElementById("invNo").textContent;
  const invShop = document.getElementById("invShop").textContent;
  const invDate = document.getElementById("invDate").textContent;
  
  showNotification("📄 Preparing Invoice", { body: `Creating PDF for Invoice #${invNo}...` });

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");
  let y = 20;

  // Header
  pdf.setFontSize(18);
  pdf.setFont(undefined, "bold");
  pdf.text("BERRY FRUITS", 105, y, { align: "center" });
  y += 7;

  pdf.setFontSize(11);
  pdf.setFont(undefined, "normal");
  pdf.text("Wholesale Fruits Supplier", 105, y, { align: "center" });
  y += 5;
  pdf.text("Aruvai, Wayanad – Kerala", 105, y, { align: "center" });
  y += 5;
  pdf.text("📞 9847103532 | 9961136634", 105, y, { align: "center" });
  y += 12;

  // Title
  pdf.setFontSize(16);
  pdf.setFont(undefined, "bold");
  pdf.text("CASH BILL", 105, y, { align: "center" });
  y += 10;

  // Invoice details
  pdf.setFontSize(10);
  pdf.setFont(undefined, "normal");
  pdf.text("Invoice No: " + invNo, 14, y);
  pdf.text("Date: " + invDate, 120, y);
  y += 7;
  
  pdf.text("BILL TO: " + invShop, 14, y);
  y += 10;

  // Table header
  pdf.setFont(undefined, "bold");
  pdf.setFontSize(10);
  pdf.text("#", 14, y);
  pdf.text("Item", 30, y);
  pdf.text("Qty (kg)", 85, y);
  pdf.text("Rate", 120, y);
  pdf.text("Amount", 160, y, { align: "right" });
  y += 7;

  // Separator
  pdf.setLineWidth(0.3);
  pdf.line(14, y, 196, y);
  y += 7;

  // Items
  pdf.setFont(undefined, "normal");
  pdf.setFontSize(10);
  const itemRow = document.querySelector("#invoiceItems tr");
  if (itemRow) {
    const cells = itemRow.querySelectorAll("td");
    pdf.text(cells[0].textContent, 14, y);
    pdf.text((cells[1].textContent || "").substring(0, 25), 30, y);
    pdf.text(cells[2].textContent, 85, y);
    pdf.text(cells[3].textContent, 120, y);
    pdf.text(cells[4].textContent, 196, y, { align: "right" });
  }
  y += 10;

  // Separator
  pdf.line(14, y, 196, y);
  y += 7;

  // Totals
  pdf.setFont(undefined, "bold");
  pdf.setFontSize(10);
  const total = document.getElementById("invTotal").textContent;
  const paid = document.getElementById("invPaid").textContent;
  const due = document.getElementById("invDue").textContent;

  pdf.text("Subtotal:", 120, y);
  pdf.text("₹" + total, 196, y, { align: "right" });
  y += 7;

  pdf.text("Paid:", 120, y);
  pdf.text("₹" + paid, 196, y, { align: "right" });
  y += 7;

  pdf.setFont(undefined, "bold");
  pdf.setFontSize(11);
  pdf.text("Balance Due:", 120, y);
  pdf.text("₹" + due, 196, y, { align: "right" });
  y += 12;

  // Footer
  pdf.setFont(undefined, "normal");
  pdf.setFontSize(9);
  pdf.text("Payment Mode: Cash / UPI", 14, y);
  y += 8;

  pdf.text("Generated: " + new Date().toLocaleDateString("en-IN"), 14, y);
  y += 8;

  // Signature
  pdf.line(140, y, 196, y);
  y += 4;
  pdf.text("Authorised Signature", 168, y, { align: "center" });

  const fileName = `Invoice_${invNo}_${invDate.replace(/\//g, "-")}.pdf`;
  pdf.save(fileName);
  showPDFNotification(fileName);
  
  // Close modal after export
  setTimeout(() => {
    closeInvoice();
  }, 500);
}

function showInvoice(saleId) {
  showNotification("📋 Loading Invoice", { body: `Processing invoice #${saleId}...` });
  
  const tx = db.transaction("sales", "readonly");
  const store = tx.objectStore("sales");

  store.get(saleId).onsuccess = e => {
    const sale = e.target.result;
    if (!sale) {
      alert("Sale not found");
      return;
    }

    // Populate invoice modal
    document.getElementById("invNo").textContent = saleId;
    document.getElementById("invDate").textContent = sale.date;
    document.getElementById("invShop").textContent = sale.shop;
    document.getElementById("invTotal").textContent = sale.total;
    document.getElementById("invPaid").textContent = sale.paid;
    document.getElementById("invDue").textContent = sale.total - sale.paid;

    // Populate items
    const invoiceItems = document.getElementById("invoiceItems");
    invoiceItems.innerHTML = `
      <tr>
        <td>1</td>
        <td>${sale.fruit}</td>
        <td>${sale.kg} kg</td>
        <td>₹${sale.rate}</td>
        <td>₹${sale.total}</td>
      </tr>
    `;

    // Show modal
    document.getElementById("invoiceModal").classList.remove("hidden");
    showNotification("✅ Invoice Ready", { body: `Invoice #${saleId} displayed` });
  };
}

/* =========================================================
   NAVIGATION
========================================================= */
function nav(sectionId) {
  document.querySelectorAll(".panel").forEach(p =>
    p.classList.add("hidden")
  );
  document.getElementById(sectionId).classList.remove("hidden");
}

/* =========================================================
   INVENTORY
========================================================= */
function addInventory() {
  const fruit = invFruit.value.trim();
  const stock = Number(invStock.value);
  const price = Number(invPrice.value);

  if (!fruit || stock <= 0 || price <= 0) return;

  const tx = db.transaction("inventory", "readwrite");
  const store = tx.objectStore("inventory");

  store.getAll().onsuccess = e => {
    const existing = e.target.result.find(i => i.fruit === fruit);

    if (existing) {
      existing.stock += stock;
      existing.price = price;
      store.put(existing);
    } else {
      store.add({ fruit, stock, price });
    }
  };

  tx.oncomplete = () => {
    invFruit.value = "";
    invStock.value = "";
    invPrice.value = "";
    refreshInventory();
  };
}

function refreshInventory() {
  inventoryTable.innerHTML = "";
  fruitSelect.innerHTML = "";

  const tx = db.transaction("inventory", "readonly");
  const store = tx.objectStore("inventory");

  store.getAll().onsuccess = e => {
    e.target.result.forEach(item => {
      inventoryTable.innerHTML += `
        <tr>
          <td>${item.fruit}</td>
          <td>${item.stock} kg</td>
          <td>₹${item.price}</td>
        </tr>
      `;

      fruitSelect.innerHTML += `
        <option value="${item.fruit}">${item.fruit}</option>
      `;
    });

    updateDashboard();
  };
}

/* =========================================================
   SALES
========================================================= */
function setupSalesHandlers() {
  kg.oninput = sell.oninput = () => {
    total.value = (Number(kg.value) * Number(sell.value)) || 0;
  };
}

function addSale() {
  const soldKg = Number(kg.value);
  const paidAmt = Number(paid.value);

  if (soldKg <= 0) return;

  const tx = db.transaction(["inventory", "sales"], "readwrite");
  const invStore = tx.objectStore("inventory");
  const salesStore = tx.objectStore("sales");

  invStore.getAll().onsuccess = e => {
    const item = e.target.result.find(
      i => i.fruit === fruitSelect.value
    );

    if (!item) {
      alert("Inventory item not found");
      tx.abort();
      return;
    }

    if (item.stock < soldKg) {
      alert("Not enough stock");
      tx.abort();
      return;
    }

    if (item.stock - soldKg < LOW_STOCK_LIMIT) {
      alert("Low stock limit reached. Sale blocked.");
      tx.abort();
      return;
    }

    item.stock -= soldKg;
    invStore.put(item);

    salesStore.add({
      date: saleDate.value,
      shop: shop.value,
      phone: phone.value,
      fruit: fruitSelect.value,
      kg: soldKg,
      rate: Number(sell.value),
      total: Number(total.value),
      paid: paidAmt,
      payments: [
        {
          date: new Date().toLocaleDateString(),
          amount: paidAmt
        }
      ]
    });
  };

  tx.oncomplete = () => {
    kg.value = "";
    sell.value = "";
    total.value = "";
    paid.value = "";
    refreshInventory();
    refreshSales();
    refreshLedger();
    updateDashboard();
  };
}

function refreshSales() {
  const tx = db.transaction("sales", "readonly");
  const store = tx.objectStore("sales");

  store.getAll().onsuccess = e => {
    const salesTable = document.getElementById("salesTable");
    if (!salesTable) return;
    
    salesTable.innerHTML = "";
    e.target.result.forEach(sale => {
      const due = sale.total - sale.paid;
      salesTable.innerHTML += `
        <tr>
          <td>${sale.date}</td>
          <td>${sale.shop}</td>
          <td>${sale.fruit}</td>
          <td>${sale.kg} kg</td>
          <td>₹${sale.rate}</td>
          <td>₹${sale.total}</td>
          <td>₹${sale.paid}</td>
          <td>₹${due}</td>
          <td><button onclick="showInvoice(${sale.id})">Invoice</button></td>
        </tr>
      `;
    });
  };
}

/* =========================================================
   LEDGER + PARTIAL PAYMENT
========================================================= */
function addPartialPayment(id, amount) {
  if (!amount || amount <= 0) return;

  const tx = db.transaction("sales", "readwrite");
  const store = tx.objectStore("sales");

  store.get(id).onsuccess = e => {
    const sale = e.target.result;
    sale.paid += amount;
    sale.payments.push({
      date: new Date().toLocaleDateString(),
      amount
    });
    store.put(sale);
  };

  tx.oncomplete = refreshLedger;
}

function sendWhatsapp(phone, shop, due) {
  if (!phone || due <= 0) return;

  const msg = `Hello ${shop},

Your pending balance is ₹${due}.
Kindly clear the payment at the earliest.

Thank you.`;

  const url = `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

function refreshLedger() {
  ledgerContainer.innerHTML = "";

  const tx = db.transaction("sales", "readonly");
  const store = tx.objectStore("sales");

  store.getAll().onsuccess = e => {
    const shops = {};

    e.target.result.forEach(sale => {
      if (!shops[sale.shop]) shops[sale.shop] = [];
      shops[sale.shop].push(sale);
    });

    Object.keys(shops).forEach(shopName => {
      let total = 0;
      let paid = 0;

      shops[shopName].forEach(s => {
        total += s.total;
        paid += s.paid;
      });

      const card = document.createElement("div");
      card.className = "ledger-card";

      card.innerHTML = `
        <div><strong>${shopName}</strong></div>
        <div>Total ₹${total} | Paid ₹${paid} | Due ₹${total - paid}</div>
      `;

      const pdfBtn = document.createElement("button");
      pdfBtn.textContent = "Export PDF";
      pdfBtn.onclick = () =>
        exportLedgerPDF(shopName, shops[shopName]);

      card.appendChild(pdfBtn);

      shops[shopName].forEach(s => {
        const due = s.total - s.paid;
        const row = document.createElement("div");
        row.className = "txn";

        row.innerHTML = `
          <div>${s.date} – ${s.fruit} (${s.kg}kg)</div>
          <div>Total ₹${s.total} | Paid ₹${s.paid} | Due ₹${due}</div>
          <input type="number" placeholder="Add payment"
            onchange="addPartialPayment(${s.id}, Number(this.value))">
          <button class="whatsapp-btn"
            onclick="sendWhatsapp('${s.phone}','${shopName}',${due})">
            WhatsApp
          </button>
        `;
        card.appendChild(row);
      });

      ledgerContainer.appendChild(card);
    });
  };
}

/* =========================================================
   LEDGER PDF (PROFESSIONAL)
========================================================= */
function exportLedgerPDF(shopName, sales) {
  showNotification("📄 Preparing Export", { body: `Creating ledger for ${shopName}...` });
  
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");
  let y = 20;

  // Header
  pdf.setFontSize(18);
  pdf.setFont(undefined, "bold");
  pdf.text("BERRY FRUITS", 105, y, { align: "center" });
  y += 7;

  pdf.setFontSize(11);
  pdf.setFont(undefined, "normal");
  pdf.text("Wholesale Fruits Supplier", 105, y, { align: "center" });
  y += 5;
  pdf.text("Aruvai, Wayanad - Kerala", 105, y, { align: "center" });
  y += 5;
  pdf.text("Phone: 9847103532 | 9961136634", 105, y, { align: "center" });
  y += 10;

  // Title
  pdf.setFontSize(14);
  pdf.setFont(undefined, "bold");
  pdf.text("SHOP LEDGER STATEMENT", 105, y, { align: "center" });
  y += 8;

  // Shop Name
  pdf.setFontSize(11);
  pdf.setFont(undefined, "normal");
  pdf.text("Shop: " + shopName, 14, y);
  y += 8;

  // Separator Line
  pdf.line(14, y, 196, y);
  y += 8;

  // Table Header
  pdf.setFont(undefined, "bold");
  pdf.setFontSize(10);
  
  const col1 = 14;   // Date
  const col2 = 45;   // Item
  const col3 = 95;   // Qty
  const col4 = 130;  // Rate
  const col5 = 160;  // Total
  const col6 = 195;  // Paid

  pdf.text("Date", col1, y);
  pdf.text("Item", col2, y);
  pdf.text("Qty (kg)", col3, y);
  pdf.text("Rate", col4, y);
  pdf.text("Total", col5, y, { align: "right" });
  y += 6;

  pdf.setLineWidth(0.3);
  pdf.line(14, y, 196, y);
  y += 6;

  // Table Content
  pdf.setFont(undefined, "normal");
  let total = 0, paid = 0;

  sales.forEach(s => {
    const saleTotal = s.total || 0;
    const salePaid = s.paid || 0;
    
    pdf.text(s.date || "", col1, y);
    pdf.text((s.fruit || "").substring(0, 15), col2, y);
    pdf.text((s.kg || "0").toString(), col3, y);
    pdf.text("Rs." + (s.rate || "0"), col4, y);
    pdf.text("Rs." + saleTotal.toFixed(2), col5, y, { align: "right" });
    
    y += 6;
    total += saleTotal;
    paid += salePaid;

    if (y > 270) {
      pdf.addPage();
      y = 20;
    }
  });

  // Bottom Separator
  y += 2;
  pdf.line(14, y, 196, y);
  y += 8;

  // Totals
  pdf.setFont(undefined, "bold");
  pdf.setFontSize(11);
  
  pdf.text("Total Sales:", 130, y);
  pdf.text("Rs." + total.toFixed(2), 195, y, { align: "right" });
  y += 7;

  pdf.text("Total Paid:", 130, y);
  pdf.text("Rs." + paid.toFixed(2), 195, y, { align: "right" });
  y += 7;

  const due = total - paid;
  pdf.setFont(undefined, "bold");
  pdf.setFontSize(12);
  pdf.text("Balance Due:", 130, y);
  pdf.text("Rs." + due.toFixed(2), 195, y, { align: "right" });
  y += 12;

  // Footer
  pdf.setFontSize(9);
  pdf.setFont(undefined, "normal");
  pdf.text("Generated on: " + new Date().toLocaleDateString("en-IN"), 14, y);

  pdf.save("Ledger_" + shopName + ".pdf");
  const fileName = "BERRY_FRUITS_Ledger_" + shopName + ".pdf";
  showPDFNotification(fileName, shopName);
}

/* =========================================================
   EXPENSES
========================================================= */
function addExpense() {
  const note = expNote.value.trim();
  const amount = Number(expAmount.value);

  if (!note || amount <= 0) return;

  db.transaction("expenses", "readwrite")
    .objectStore("expenses")
    .add({ note, amount }).onsuccess = refreshExpenses;
}

function refreshExpenses() {
  expenseTable.innerHTML = "";
  db.transaction("expenses").objectStore("expenses").getAll().onsuccess = e => {
    e.target.result.forEach(x => {
      expenseTable.innerHTML += `
        <tr><td>${x.note}</td><td>₹${x.amount}</td></tr>
      `;
    });
    updateDashboard();
  };
}

/* =========================================================
   DASHBOARD
========================================================= */
function updateDashboard() {
  let salesTotal = 0;
  let paidTotal = 0;
  let expenseTotal = 0;
  let lowStock = 0;

  db.transaction("sales").objectStore("sales").getAll().onsuccess = e => {
    e.target.result.forEach(s => {
      salesTotal += s.total;
      paidTotal += s.paid;
    });

    dashTotalSales.textContent = "₹" + salesTotal;
    dashPending.textContent = "₹" + (salesTotal - paidTotal);
  };

  db.transaction("expenses").objectStore("expenses").getAll().onsuccess = e => {
    e.target.result.forEach(x => (expenseTotal += x.amount));
    dashExpense.textContent = "₹" + expenseTotal;
    dashProfit.textContent = "₹" + (paidTotal - expenseTotal);
  };

  db.transaction("inventory").objectStore("inventory").getAll().onsuccess = e => {
    e.target.result.forEach(i => {
      if (i.stock < LOW_STOCK_LIMIT) lowStock++;
    });
    dashLowStock.textContent = lowStock;
  };
}

/* =========================================================
   REFRESH ALL
========================================================= */
function refreshAll() {
  refreshInventory();
  refreshLedger();
  refreshExpenses();
}

/* =========================================================
   SYSTEM RESET
========================================================= */
function openResetConfirm() {
  document.getElementById("resetModal").classList.remove("hidden");
}

function closeResetConfirm() {
  document.getElementById("resetModal").classList.add("hidden");
}

function confirmReset() {
  // 1. Export all data before reset
  exportFullBackupPDF(() => {
    // 2. Clear IndexedDB
    const deleteReq = indexedDB.deleteDatabase(DB_NAME);

    deleteReq.onsuccess = () => {
      alert("System reset completed");

      // 3. Reload app cleanly
      location.reload();
    };

    deleteReq.onerror = () => {
      alert("Reset failed");
    };
  });
}

function exportFullBackupPDF(done) {
  showNotification("💾 Creating Backup", { body: "Exporting all data to PDF..." });
  
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");
  let y = 15;

  // ===== HEADER =====
  pdf.setFontSize(20);
  pdf.setFont(undefined, "bold");
  pdf.text("BERRY FRUITS", 105, y, { align: "center" });
  y += 8;

  pdf.setFontSize(11);
  pdf.setFont(undefined, "normal");
  pdf.text("Wholesale Fruits Supplier - Complete Data Backup", 105, y, { align: "center" });
  y += 5;
  pdf.text("Aruvai, Wayanad - Kerala | Phone: 9847103532", 105, y, { align: "center" });
  y += 10;

  // Date & Time
  pdf.setFontSize(9);
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN");
  const timeStr = now.toLocaleTimeString("en-IN");
  pdf.text("Generated: " + dateStr + " at " + timeStr, 14, y);
  y += 8;

  // ===== INVENTORY SECTION =====
  pdf.setLineWidth(0.5);
  pdf.line(14, y, 196, y);
  y += 6;

  pdf.setFontSize(14);
  pdf.setFont(undefined, "bold");
  pdf.text("1. INVENTORY STOCK", 14, y);
  y += 8;

  pdf.setFont(undefined, "bold");
  pdf.setFontSize(10);
  pdf.text("Item", 14, y);
  pdf.text("Stock (kg)", 70, y);
  pdf.text("Price/kg", 120, y);
  pdf.text("Value", 165, y, { align: "right" });
  y += 5;

  pdf.setLineWidth(0.2);
  pdf.line(14, y, 196, y);
  y += 5;

  pdf.setFont(undefined, "normal");
  let inventoryValue = 0;

  db.transaction("inventory")
    .objectStore("inventory")
    .getAll().onsuccess = e => {
      e.target.result.forEach(item => {
        const itemValue = (item.stock || 0) * (item.price || 0);
        inventoryValue += itemValue;

        pdf.setFontSize(9);
        pdf.text((item.fruit || "").substring(0, 20), 14, y);
        pdf.text((item.stock || "0").toString(), 70, y);
        pdf.text("Rs." + (item.price || "0"), 120, y);
        pdf.text("Rs." + itemValue.toFixed(2), 195, y, { align: "right" });
        y += 5;

        if (y > 250) {
          pdf.addPage();
          y = 15;
        }
      });

      y += 3;
      pdf.line(14, y, 196, y);
      y += 5;

      pdf.setFont(undefined, "bold");
      pdf.setFontSize(10);
      pdf.text("TOTAL INVENTORY VALUE:", 120, y);
      pdf.text("Rs." + inventoryValue.toFixed(2), 195, y, { align: "right" });
      y += 12;

      // ===== SALES SECTION =====
      pdf.setLineWidth(0.5);
      pdf.line(14, y, 196, y);
      y += 6;

      pdf.setFontSize(14);
      pdf.setFont(undefined, "bold");
      pdf.text("2. SALES TRANSACTIONS", 14, y);
      y += 8;

      pdf.setFont(undefined, "bold");
      pdf.setFontSize(9);
      pdf.text("Date", 14, y);
      pdf.text("Shop", 40, y);
      pdf.text("Item", 85, y);
      pdf.text("Qty", 120, y);
      pdf.text("Total", 140, y);
      pdf.text("Paid", 165, y);
      pdf.text("Due", 190, y, { align: "right" });
      y += 5;

      pdf.setLineWidth(0.2);
      pdf.line(14, y, 196, y);
      y += 5;

      pdf.setFont(undefined, "normal");
      let totalSales = 0, totalPaid = 0;

      db.transaction("sales")
        .objectStore("sales")
        .getAll().onsuccess = e => {
          e.target.result.forEach(sale => {
            totalSales += sale.total || 0;
            totalPaid += sale.paid || 0;

            pdf.setFontSize(8);
            pdf.text(sale.date || "", 14, y);
            pdf.text((sale.shop || "").substring(0, 12), 40, y);
            pdf.text((sale.fruit || "").substring(0, 12), 85, y);
            pdf.text((sale.kg || "0").toString() + "kg", 120, y);
            pdf.text("Rs." + (sale.total || "0"), 140, y);
            pdf.text("Rs." + (sale.paid || "0"), 165, y);
            pdf.text("Rs." + ((sale.total || 0) - (sale.paid || 0)), 190, y, { align: "right" });
            y += 5;

            if (y > 250) {
              pdf.addPage();
              y = 15;
            }
          });

          y += 3;
          pdf.line(14, y, 196, y);
          y += 5;

          pdf.setFont(undefined, "bold");
          pdf.setFontSize(9);
          pdf.text("TOTAL SALES:", 120, y);
          pdf.text("Rs." + totalSales.toFixed(2), 140, y);
          pdf.text("Rs." + totalPaid.toFixed(2), 165, y);
          pdf.text("Rs." + (totalSales - totalPaid).toFixed(2), 190, y, { align: "right" });
          y += 10;

          // ===== EXPENSES SECTION =====
          pdf.setLineWidth(0.5);
          pdf.line(14, y, 196, y);
          y += 6;

          pdf.setFontSize(14);
          pdf.setFont(undefined, "bold");
          pdf.text("3. EXPENSES", 14, y);
          y += 8;

          pdf.setFont(undefined, "bold");
          pdf.setFontSize(9);
          pdf.text("Description", 14, y);
          pdf.text("Amount", 165, y, { align: "right" });
          y += 5;

          pdf.setLineWidth(0.2);
          pdf.line(14, y, 196, y);
          y += 5;

          pdf.setFont(undefined, "normal");
          let totalExpenses = 0;

          db.transaction("expenses")
            .objectStore("expenses")
            .getAll().onsuccess = e => {
              e.target.result.forEach(exp => {
                totalExpenses += exp.amount || 0;

                pdf.setFontSize(8);
                pdf.text((exp.note || "").substring(0, 40), 14, y);
                pdf.text("Rs." + (exp.amount || "0"), 165, y, { align: "right" });
                y += 5;

                if (y > 250) {
                  pdf.addPage();
                  y = 15;
                }
              });

              y += 3;
              pdf.line(14, y, 196, y);
              y += 5;

              pdf.setFont(undefined, "bold");
              pdf.setFontSize(10);
              pdf.text("TOTAL EXPENSES:", 120, y);
              pdf.text("Rs." + totalExpenses.toFixed(2), 195, y, { align: "right" });
              y += 12;

              // ===== SUMMARY SECTION =====
              pdf.setLineWidth(0.5);
              pdf.line(14, y, 196, y);
              y += 6;

              pdf.setFontSize(14);
              pdf.setFont(undefined, "bold");
              pdf.text("4. FINANCIAL SUMMARY", 14, y);
              y += 10;

              pdf.setFont(undefined, "normal");
              pdf.setFontSize(10);

              const netProfit = totalPaid - totalExpenses;

              pdf.text("Total Sales Value:", 40, y);
              pdf.text("Rs." + totalSales.toFixed(2), 195, y, { align: "right" });
              y += 7;

              pdf.text("Total Paid:", 40, y);
              pdf.text("Rs." + totalPaid.toFixed(2), 195, y, { align: "right" });
              y += 7;

              pdf.text("Total Due:", 40, y);
              pdf.text("Rs." + (totalSales - totalPaid).toFixed(2), 195, y, { align: "right" });
              y += 7;

              pdf.text("Total Expenses:", 40, y);
              pdf.text("Rs." + totalExpenses.toFixed(2), 195, y, { align: "right" });
              y += 7;

              pdf.setFont(undefined, "bold");
              pdf.setFontSize(11);
              const profitColor = netProfit >= 0 ? [46, 125, 50] : [211, 47, 47];
              pdf.setTextColor(...profitColor);
              pdf.text("Net Profit/Loss:", 40, y);
              pdf.text("Rs." + netProfit.toFixed(2), 195, y, { align: "right" });
              
              pdf.setTextColor(0, 0, 0);
              y += 15;

              // ===== FOOTER =====
              pdf.setLineWidth(0.5);
              pdf.line(14, y, 196, y);
              y += 5;

              pdf.setFontSize(8);
              pdf.setFont(undefined, "normal");
              pdf.text("This is an automated backup generated by Berry Fruits ERP System.", 105, y, { align: "center" });
              y += 4;
              pdf.text("For data integrity and security purposes only.", 105, y, { align: "center" });

              pdf.save("FruitERP_Full_Backup_" + dateStr.replace(/\//g, "-") + ".pdf");
              const backupFileName = "BERRY_FRUITS_Backup_" + dateStr.replace(/\//g, "-") + ".pdf";
              showPDFNotification(backupFileName);
              showNotification("💾 Backup Complete", { body: "System data exported successfully" });
              done();
            };
        };
    };
}

function exportCompleteDataPDF() {
  showNotification("📊 Preparing Data Export", { body: "Gathering all records..." });
  
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  let y = 12;

  pdf.setFontSize(16);
  pdf.text("FRUIT ERP - COMPLETE DATA EXPORT", 10, y);
  y += 10;

  const exportStore = (name, title, cb) => {
    pdf.setFontSize(14);
    pdf.text(title, 10, y);
    y += 6;

    db.transaction(name).objectStore(name).getAll().onsuccess = e => {
      e.target.result.forEach((x, i) => {
        pdf.setFontSize(10);
        pdf.text(`${i + 1}. ${JSON.stringify(x)}`, 10, y);
        y += 5;
        if (y > 280) {
          pdf.addPage();
          y = 10;
        }
      });
      y += 8;
      cb();
    };
  };

  exportStore("inventory", "Inventory", () => {
    exportStore("sales", "Sales", () => {
      exportStore("expenses", "Expenses", () => {
        pdf.save("FruitERP_Complete_Data.pdf");
        showPDFNotification("BERRY_FRUITS_Complete_Data.pdf");
        showNotification("✅ Data Exported", { body: "Check your Downloads folder" });
      });
    });
  });
}

/* =========================================================
   DOM CONTENT LOADED
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  // Initialize DOM references
  initDOM();

  // Setup sales handlers
  setupSalesHandlers();

  // Request notification permission for Android
  requestNotificationPermission();

  // Mark DOM as ready
  domReady = true;
  
  // If DB is already loaded, init the app
  if (dbReady) {
    initApp();
  }

  // FORCE LOGIN BUTTON BINDING (FIX)
  document.getElementById("loginBtn").addEventListener("click", () => {
    const a = JSON.parse(localStorage.getItem("auth"));

    if (
      loginUsername.value === a.user &&
      loginPassword.value === a.pass
    ) {
      showPin();
    } else {
      alert("Invalid username or password");
    }
  });

  // LUCIDE ICON INIT (FIX)
  if (window.lucide) {
    lucide.createIcons();
  }
});

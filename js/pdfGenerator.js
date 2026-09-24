/**
 * PDF Invoice Generator for LOGIN Mobile Accessories Wholesale Order System
 * 
 * Generates compact, professional invoices strictly following the project's
 * Black, Yellow (#FFC700), and White brand visual identity.
 * 
 * Ready for both browser WebViews and future Capacitor/Android native file saving.
 */

import { formatCurrency, formatDateForWhatsApp } from './state.js';

export function generateOrderInvoiceHtml(order) {
  const shopName = escapeHtml(order.shopName || '-');
  const customerName = escapeHtml(order.customerName || '-');
  const phone = escapeHtml(order.phone || '-');
  const address = escapeHtml(order.address || '-');
  const orderId = escapeHtml(order.orderId || 'ORD-PREVIEW');
  const formattedDate = formatDateForWhatsApp(order.date);
  const items = order.items || [];
  const totalItems = order.totalItems || items.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const grandTotal = order.grandTotal || items.reduce((sum, i) => sum + (i.lineTotal || (i.rate * i.quantity) || 0), 0);

  const itemRowsHtml = items.map((item, index) => {
    const model = escapeHtml(item.modelNumber || '');
    let productName = escapeHtml(item.productName || item.name || '');
    let modelName = '';
    if (model && productName) {
      modelName = productName.toLowerCase().startsWith(model.toLowerCase()) ? productName : `${model} ${productName}`;
    } else {
      modelName = model || productName || 'Product';
    }

    const variant = escapeHtml(item.variant || item.description || '-');
    const qty = item.quantity || 0;
    const rate = Number(item.rate !== undefined && item.rate !== null ? item.rate : 0);
    const lineTotal = Number(item.lineTotal !== undefined && item.lineTotal !== null ? item.lineTotal : (rate * qty));

    return `
      <tr>
        <td style="text-align: center; color: #64748B;">${index + 1}</td>
        <td>
          <strong style="color: #111827;">${modelName}</strong>
        </td>
        <td style="color: #475569;">${variant}</td>
        <td style="text-align: center; font-weight: 700; color: #111827;">${qty}</td>
        <td style="text-align: right; font-family: monospace; color: #1E293B;">${formatCurrency(rate)}</td>
        <td style="text-align: right; font-family: monospace; font-weight: 700; color: #111827;">${formatCurrency(lineTotal)}</td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${orderId}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 10mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #111827;
      background: #FFFFFF;
      font-size: 11pt;
      line-height: 1.4;
      padding: 16px;
    }
    .invoice-wrapper {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      overflow: hidden;
    }
    .invoice-header {
      background-color: #111827;
      color: #FFFFFF;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #FFC700;
    }
    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-logo-box {
      background-color: #FFC700;
      color: #111827;
      font-weight: 900;
      font-size: 20pt;
      letter-spacing: 1px;
      padding: 4px 10px;
      border-radius: 4px;
      line-height: 1;
    }
    .brand-sub {
      display: flex;
      flex-direction: column;
    }
    .brand-title {
      font-weight: 800;
      font-size: 11pt;
      letter-spacing: 0.5px;
      color: #FFFFFF;
    }
    .brand-tagline {
      font-size: 8pt;
      color: #94A3B8;
      letter-spacing: 0.3px;
    }
    .invoice-meta {
      text-align: right;
    }
    .invoice-id {
      font-size: 11pt;
      font-weight: 800;
      color: #FFC700;
      font-family: monospace;
      letter-spacing: 0.5px;
    }
    .invoice-date {
      font-size: 9pt;
      color: #CBD5E1;
      margin-top: 2px;
    }
    .customer-card {
      background-color: #F8FAFC;
      border-bottom: 1px solid #E2E8F0;
      padding: 14px 20px;
    }
    .customer-title {
      font-size: 9pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #475569;
      margin-bottom: 8px;
    }
    .customer-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px 16px;
      font-size: 9.5pt;
    }
    .customer-cell strong {
      color: #64748B;
      font-weight: 600;
      margin-right: 4px;
    }
    .customer-cell span {
      color: #0F172A;
      font-weight: 600;
    }
    .customer-cell.full-width {
      grid-column: 1 / -1;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5pt;
    }
    .items-table th {
      background-color: #1E293B;
      color: #FFFFFF;
      text-align: left;
      padding: 8px 10px;
      font-weight: 700;
      font-size: 8.5pt;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .items-table td {
      padding: 7px 10px;
      border-bottom: 1px solid #E2E8F0;
    }
    .items-table tbody tr:nth-child(even) {
      background-color: #F8FAFC;
    }
    .totals-section {
      background-color: #FFFFFF;
      padding: 14px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 2px solid #E2E8F0;
    }
    .total-items-badge {
      background-color: #F1F5F9;
      border: 1px solid #CBD5E1;
      color: #1E293B;
      padding: 6px 12px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 10pt;
    }
    .grand-total-box {
      background-color: #111827;
      color: #FFFFFF;
      padding: 8px 16px;
      border-radius: 6px;
      display: flex;
      align-items: baseline;
      gap: 10px;
    }
    .grand-total-label {
      font-size: 9pt;
      font-weight: 700;
      color: #CBD5E1;
      letter-spacing: 0.5px;
    }
    .grand-total-amount {
      font-size: 14pt;
      font-weight: 900;
      color: #FFC700;
      font-family: monospace;
    }
    .invoice-footer {
      background-color: #0F172A;
      color: #94A3B8;
      text-align: center;
      padding: 10px 16px;
      font-size: 8pt;
      letter-spacing: 0.3px;
    }
    @media print {
      body {
        padding: 0;
      }
      .invoice-wrapper {
        border: none;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-wrapper">
    <div class="invoice-header">
      <div class="brand-wrap">
        <div class="brand-logo-box">LOGIN</div>
        <div class="brand-sub">
          <span class="brand-title">SMART ACCESSORIES</span>
          <span class="brand-tagline">Wholesale Order Invoice</span>
        </div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-id">${orderId}</div>
        <div class="invoice-date">${formattedDate}</div>
      </div>
    </div>

    <div class="customer-card">
      <div class="customer-title">Customer & Shop Details</div>
      <div class="customer-grid">
        <div class="customer-cell">
          <strong>Shop Name:</strong>
          <span>${shopName}</span>
        </div>
        <div class="customer-cell">
          <strong>Customer Name:</strong>
          <span>${customerName}</span>
        </div>
        <div class="customer-cell">
          <strong>Customer No.:</strong>
          <span>${phone}</span>
        </div>
        <div class="customer-cell">
          <strong>Date:</strong>
          <span>${formattedDate}</span>
        </div>
        <div class="customer-cell full-width">
          <strong>Address / Market:</strong>
          <span>${address}</span>
        </div>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 32px; text-align: center;">#</th>
          <th>Model & Product Name</th>
          <th style="width: 140px;">Variant</th>
          <th style="width: 60px; text-align: center;">Qty</th>
          <th style="width: 100px; text-align: right;">Rate</th>
          <th style="width: 110px; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRowsHtml}
      </tbody>
    </table>

    <div class="totals-section">
      <div class="total-items-badge">
        Total Items: <strong>${totalItems} Units</strong>
      </div>
      <div class="grand-total-box">
        <span class="grand-total-label">GRAND TOTAL</span>
        <span class="grand-total-amount">${formatCurrency(grandTotal)}</span>
      </div>
    </div>

    <div class="invoice-footer">
      LOGIN SMART ACCESSORIES • Mobile Accessories Wholesale Order System • Thank you for your business!
    </div>
  </div>
</body>
</html>`;
}

/**
 * Downloads or saves the order as a PDF document.
 * 
 * - In Capacitor/Android WebView: Ready to write to device Documents via Filesystem plugin
 * - In Mobile & Desktop Browsers: Spawns a clean print-to-PDF frame/window
 */
export async function downloadOrderPdf(order) {
  const htmlContent = generateOrderInvoiceHtml(order);

  // Future Capacitor Native Android/iOS hook
  if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.Plugins?.Filesystem) {
    try {
      const fileName = `Order_${order.orderId || Date.now()}.html`;
      await window.Capacitor.Plugins.Filesystem.writeFile({
        path: fileName,
        data: htmlContent,
        directory: 'DOCUMENTS',
        encoding: 'utf8'
      });
      return { success: true, method: 'capacitor', fileName };
    } catch (e) {
      console.warn('Capacitor native file write failed, falling back to print dialog:', e);
    }
  }

  // Web Browser / WebView print-to-PDF
  try {
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.top = '-9999px';
    printFrame.style.left = '-9999px';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = 'none';
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow.document;
    frameDoc.open();
    frameDoc.write(htmlContent);
    frameDoc.close();

    // Allow resources to render then invoke print
    await new Promise((resolve) => setTimeout(resolve, 300));
    printFrame.contentWindow.focus();
    printFrame.contentWindow.print();

    setTimeout(() => {
      if (printFrame.parentNode) {
        printFrame.parentNode.removeChild(printFrame);
      }
    }, 2000);

    return { success: true, method: 'print' };
  } catch (err) {
    console.error('Error invoking print dialog:', err);
    // Fallback: download as HTML file that can be opened/saved
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${order.orderId || 'Order'}.html`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 500);
    return { success: true, method: 'download_html' };
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

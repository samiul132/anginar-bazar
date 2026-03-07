'use client';

import { useCallback } from 'react';

// ─── Helpers ─────
const formatPrice = (value) => {
  const num = Number(value);
  return Number.isInteger(num)
    ? num.toLocaleString('en-US')
    : num.toLocaleString('en-US', { minimumFractionDigits: 2 });
};

const formatDate = (dateString) => {
  if (!dateString || dateString === '0000-00-00') return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const capitalize = (s) => {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

// ─── Build full HTML page string ─────
function buildInvoicePage(order) {
  const addressParts = [
    order.address?.street_address,
    order.address?.upazila?.name,
    order.address?.district?.name,
  ].filter(Boolean);
  const fullAddress = addressParts.join(', ') || 'N/A';

  const paymentMethod =
    order.payment_method === 'cod' || order.payment_method === 'Cash On Delivery'
      ? 'Cash On Delivery'
      : capitalize(order.payment_method) || 'N/A';

  const customerName  = order.user?.name  || 'N/A';
  const customerId    = order.user?.formatted_id || order.user?.id || 'N/A';
  const customerPhone = order.user?.phone || 'N/A';

  const rows = (order.order_details || []).map((detail, index) => {
    const bg       = index % 2 === 0 ? '#ffffff' : '#F3F4F6';
    const qty      = Number(detail.quantity);
    const price    = Number(detail.price);
    const subtotal = detail.sub_total ? Number(detail.sub_total) : qty * price;
    return `
      <tr style="background:${bg};">
        <td>${index + 1}</td>
        <td>${detail.product?.product_name || 'Unknown'}</td>
        <td class="right">${qty}</td>
        <td class="right">${formatPrice(price)}/=</td>
        <td class="right bold">${formatPrice(subtotal)}/=</td>
      </tr>`;
  }).join('');

  const noteHTML = order.order_note && order.order_note.trim() !== ''
    ? `<div style="margin-top:4px;"><span class="bold">Note: </span>${order.order_note}</div>`
    : '';

  const dueHTML = Number(order.due_amount) > 0
    ? `<div class="amt-row" style="color:#DC2626;margin-top:3px;">
        <span>Due Amount:</span><span>${formatPrice(order.due_amount)}/=</span>
       </div>`
    : '';

  const logoSrc = `/assets/anginar_bazar_logo.png`;

  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8"/>
  <title>Invoice #${order.formatted_id || order.id}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    body { font-family:Arial,sans-serif; font-size:12px; color:#000; background:#fff; width:210mm; margin:0 auto; }
    .header { display:flex; align-items:center; border-bottom:2px solid #111; padding-bottom:8px; margin:12px 12px 0 12px; }
    .logo-box img { height:70px; object-fit:contain; }
    .company-info { flex:1; text-align:center; }
    .company-name { font-size:22px; font-weight:800; letter-spacing:2px; }
    .company-sub { font-size:10px; color:#444; margin-top:2px; }
    .body { padding:8px 12px; }
    .invoice-wrap { text-align:center; margin:8px 0 6px; }
    .invoice-label { display:inline-block; font-size:15px; font-weight:700; letter-spacing:3px; border-bottom:4px double #000; padding:0 8px 2px; }
    .row-between { display:flex; justify-content:space-between; align-items:flex-start; }
    .bold { font-weight:bold; }
    .dashed-row { border-top:1px dashed #9CA3AF; border-bottom:1px dashed #9CA3AF; padding:5px 0; margin-top:6px; }
    .dashed-bottom { border-bottom:1px dashed #9CA3AF; padding:5px 0; margin-top:4px; }
    table { width:100%; border-collapse:collapse; }
    thead tr { background:#6B7280; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    thead th { padding:7px 8px; font-size:10px; font-weight:600; color:#fff; text-align:left; }
    th.right, td.right { text-align:right; }
    tbody td { padding:6px 8px; font-size:12px; border-bottom:1px solid #D1D5DB; }
    .summary { display:flex; justify-content:space-between; background:#F9FAFB; border-top:1px solid #D1D5DB; padding:10px 8px; }
    .summary-left { flex:1; padding-right:16px; border-right:1px dashed #9CA3AF; line-height:1.9; }
    .summary-right { width:220px; padding-left:10px; line-height:1.9; }
    .amt-row { display:flex; justify-content:space-between; font-size:12px; font-weight:700; }
    .total-row { display:flex; justify-content:space-between; font-size:13px; font-weight:800; border-top:1px solid #374151; padding-top:4px; margin-top:3px; }
    .footer { margin-top:20px; border-top:1px solid #E5E7EB; padding-top:8px; text-align:center; font-size:9px; color:#6B7280; }
    @media print { body { width:100%; margin:0; } @page { size:A4 portrait; margin:0.5cm; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-box"><img src="${logoSrc}" alt="Logo"/></div>
    <div class="company-info">
      <div class="company-name">ANGINAR BAZAR</div>
      <div class="company-sub">Phone: 01889093967, Web: www.anginarbazar.com, Email: anginarbazar@gmail.com</div>
      <div class="company-sub">Chengarchor Bazar, Matlab Uttar, Chandpur.</div>
    </div>
  </div>
  <div class="body">
    <div class="invoice-wrap"><span class="invoice-label">INVOICE</span></div>
    <div class="row-between" style="margin-bottom:4px;">
      <span class="bold">Order ID: #${order.formatted_id || 'N/A'}</span>
      <span class="bold">Date: ${formatDate(order.order_date)}</span>
    </div>
    <div class="row-between dashed-row">
      <span class="bold">Name: ${customerName}</span>
      <span class="bold">Customer ID: ${customerId}</span>
    </div>
    <div class="row-between dashed-bottom">
      <div style="flex:1;padding-right:12px;"><span class="bold">Shipping Address: </span>${fullAddress}</div>
      <div><span class="bold">Phone Number: </span>${customerPhone}</div>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width:36px;">SL</th>
          <th>PRODUCT</th>
          <th class="right" style="width:50px;">QTY</th>
          <th class="right" style="width:82px;">UNIT PRICE</th>
          <th class="right" style="width:76px;">TOTAL</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="summary">
      <div class="summary-left">
        <div><span class="bold">Payment Method: </span>${paymentMethod}</div>
        ${noteHTML}
      </div>
      <div class="summary-right">
        <div class="amt-row"><span>Subtotal:</span><span>${formatPrice(order.total_amount)}/=</span></div>
        <div class="amt-row"><span>Shipping Charge:</span><span>${formatPrice(order.shipping_charge)}/=</span></div>
        <div class="amt-row"><span>Discount:</span><span>${formatPrice(order.discount_amount)}/=</span></div>
        <div class="total-row"><span>Total Payable:</span><span>${formatPrice(order.payable_amount)}/=</span></div>
        ${dueHTML}
      </div>
    </div>
    <div class="footer">
      Thank you for shopping at Anginar Bazar! &nbsp;|&nbsp; anginarbazar@gmail.com &nbsp;|&nbsp; 01889093967
    </div>
  </div>
</body>
</html>`;
}

// ─── Hook ─────
export function useInvoiceDownload(order) {

  const downloadInvoice = useCallback(() => {
    if (!order) return;

    const html = buildInvoicePage(order);

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:0;height:0;border:none;';
    document.body.appendChild(iframe);

    iframe.contentDocument.open();
    iframe.contentDocument.write(html);
    iframe.contentDocument.close();

    iframe.contentWindow.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 1500);
    };
  }, [order]);

  return { InvoiceTemplate: () => null, downloadInvoice };
}

export default useInvoiceDownload;
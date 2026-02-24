'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { orders, storage } from '@/lib/api';

// ============================================
// Stat Card Component
// ============================================
function StatCard({ icon, label, value, sub, accent, delay, href }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay || 0);
    return () => clearTimeout(timer);
  }, [delay]);

  const inner = (
    <div
      className={`stat-card${href ? ' stat-card-link' : ''}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.45s ease, transform 0.45s ease',
        '--accent': accent,
      }}
    >
      <div className="stat-icon-wrap">
        <span className="stat-icon">{icon}</span>
      </div>
      <p className="stat-label">{label}</p>
      <h3 className="stat-value">{value}</h3>
      {sub && <p className="stat-sub">{sub}</p>}
      {href && <span className="stat-link-hint">View all <ChevronRight size={11} /></span>}
      <div className="stat-bar" />
    </div>
  );

  if (href) return <Link href={href} style={{ textDecoration: 'none' }}>{inner}</Link>;
  return inner;
}

// ============================================
// Order Row Component
// ============================================
function OrderRow({ order, index }) {
  const statusConfig = {
    pending:    { label: 'Pending',    bg: '#fff7ed', color: '#c2410c', dot: '#fb923c' },
    processing: { label: 'Processing', bg: '#eff6ff', color: '#1d4ed8', dot: '#60a5fa' },
    shipped:    { label: 'Shipped',    bg: '#f0fdf4', color: '#15803d', dot: '#16a34a' },
    delivered:  { label: 'Delivered',  bg: '#f0fdf4', color: '#15803d', dot: '#16a34a' },
    cancelled:  { label: 'Cancelled',  bg: '#fef2f2', color: '#b91c1c', dot: '#f87171' },
    completed:  { label: 'Completed',  bg: '#f0fdf4', color: '#166534', dot: '#16a34a' },
  };

  const rawStatus = (order.order_status || order.status || 'pending').toLowerCase();
  const status = statusConfig[rawStatus] || statusConfig.pending;
  const date = order.order_date && order.order_date !== '0000-00-00'
    ? new Date(order.created_at || order.order_date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    : order.created_at
      ? new Date(order.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
      : '—';

  const itemCount = order.order_items_count ?? order.order_details?.length ?? order.items?.length;
  const amount    = Number(order.payable_amount || order.total_amount || 0);
  const dueAmt    = Number(order.due_amount || 0);

  return (
    <tr
      className="order-row order-row-clickable"
      style={{ animationDelay: `${index * 50}ms`, cursor: 'pointer' }}
      onClick={() => window.location.href = `/order-details/${order.id}`}
    >
      <td><span className="order-id">#{order.id}</span></td>
      <td className="td-date">{date}</td>
      <td className="td-items">{itemCount != null ? `${itemCount} items` : '—'}</td>
      <td><span className="td-mono">৳{amount.toLocaleString()}</span></td>
      <td>
        {dueAmt > 0
          ? <span className="due-badge">৳{dueAmt.toLocaleString()}</span>
          : <span className="paid-badge">✓ Paid</span>}
      </td>
      <td>
        <span className="status-pill" style={{ background: status.bg, color: status.color }}>
          <span className="status-dot" style={{ background: status.dot }} />
          {status.label}
        </span>
      </td>
    </tr>
  );
}

// ============================================
// Main Dashboard Page
// ============================================
export default function DashboardPage() {
  const ROWS_PER_PAGE = 10;
  const [loading, setLoading] = useState(true);
  const [allOrders, setAllOrders] = useState([]);
  const [tablePage, setTablePage] = useState(1);
  const [error, setError] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCustomer(storage.getCustomerData());
  }, []);

  const fetchOrders = async () => {
    if (!storage.isAuthenticated()) {
      setError('Please log in to view your dashboard.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      // Fetch all orders — load all pages if needed
      let allData = [];
      let currentPage = 1;
      let lastPage = 1;
      do {
        const res = await orders.getMyOrders(currentPage);
        if (res.success) {
          allData = [...allData, ...(res.data || [])];
          lastPage = res.last_page || 1;
          currentPage++;
        } else {
          setError(res.message || 'Failed to load orders.');
          break;
        }
      } while (currentPage <= lastPage);
      setAllOrders(allData);
      setTablePage(1);
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (mounted) fetchOrders(); }, [mounted]);

  // Computed stats — field names match DB schema
  // DB: payable_amount, paid_amount, due_amount, order_status
  const totalOrders  = allOrders.length;
  const totalAmount  = allOrders.reduce((s, o) => s + Number(o.payable_amount || o.total_amount || 0), 0);
  const totalPaid    = allOrders.reduce((s, o) => s + Number(o.paid_amount || 0), 0);
  const totalDue     = allOrders.reduce((s, o) => s + Number(o.due_amount  || 0), 0);
  const getStatus    = (o) => (o.order_status || o.status || '').toLowerCase();
  const delivered    = allOrders.filter(o => ['delivered','completed'].includes(getStatus(o))).length;
  const pending      = allOrders.filter(o => getStatus(o) === 'pending').length;
  const deliveryRate = totalOrders > 0 ? Math.round((delivered / totalOrders) * 100) : 0;

  // Client-side table pagination
  const tableLastPage  = Math.max(1, Math.ceil(allOrders.length / ROWS_PER_PAGE));
  const paginatedOrders = allOrders.slice((tablePage - 1) * ROWS_PER_PAGE, tablePage * ROWS_PER_PAGE);

  return (
    <div className="dash-root">

        {/* Header */}
        <div className="dash-header">
          <div>
            <div className="dash-name">
              Hello, <span>{mounted ? (customer?.name || customer?.user_name || 'there') : '...'}</span> 👋
            </div>
            <div className="dash-sub">{mounted ? (customer?.name || customer?.user_name || '') : ''}{mounted && (customer?.phone || customer?.mobile) ? ' · ' + (customer?.phone || customer?.mobile) : ''}</div>
          </div>
          {mounted && storage.isAuthenticated() && (
            <div className="dash-active-badge">
              <span className="active-dot" />
              Active Account
            </div>
          )}
        </div>

        <div className="dash-inner">

          {/* Loading */}
          {loading && (
            <div className="dash-loading">
              <Loader2 size={44} color="#FF5533" className="dash-spin" />
              <p>Loading your orders…</p>
            </div>
          )}

          {/* Error — matches homepage error style */}
          {!loading && error && (
            <div className="dash-error-box">
              <p>⚠️ {error}</p>
              <button className="retry-btn" onClick={fetchOrders}>Try Again</button>
            </div>
          )}

          {/* Main Content */}
          {!loading && !error && (
            <>
              {/* Stats Grid */}
              <div className="stats-grid">
                <StatCard delay={0}   icon="📦" label="Total Orders" value={totalOrders}                        accent="#FF5533" sub={`${delivered} delivered`} href="/my-orders" />
                <StatCard delay={60}  icon="💰" label="Total Amount" value={`৳${totalAmount.toLocaleString()}`} accent="#7c3aed" sub="All time" />
                <StatCard delay={120} icon="✅" label="Total Paid"   value={`৳${totalPaid.toLocaleString()}`}   accent="#319F00" sub="Cleared" />
                <StatCard delay={180} icon="⏳" label="Total Due"    value={`৳${totalDue.toLocaleString()}`}    accent="#f59e0b" sub={totalDue > 0 ? 'Needs attention' : 'All clear'} />
                <StatCard delay={240} icon="🕐" label="Pending"      value={pending}                            accent="#f59e0b" sub="Awaiting" />
                <StatCard delay={300} icon="🚚" label="Delivered"    value={delivered}                          accent="#319F00" sub="Completed" />
              </div>

              {/* Summary Strip */}
              {totalOrders > 0 && (
                <div className="summary-strip">
                  <div className="sum-item">
                    <span className="sum-label">Orders</span>
                    <span className="sum-val blue">{totalOrders}</span>
                  </div>
                  <div className="sum-divider" />
                  <div className="sum-item">
                    <span className="sum-label">Total Spent</span>
                    <span className="sum-val">৳{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="sum-divider" />
                  <div className="sum-item">
                    <span className="sum-label">Paid</span>
                    <span className="sum-val green">৳{totalPaid.toLocaleString()}</span>
                  </div>
                  <div className="sum-divider" />
                  <div className="sum-item">
                    <span className="sum-label">Due</span>
                    <span className={`sum-val ${totalDue > 0 ? 'orange' : 'green'}`}>
                      ৳{totalDue.toLocaleString()}
                    </span>
                  </div>
                  <div className="sum-divider" />
                  <div className="sum-item">
                    <span className="sum-label">Delivery Rate</span>
                    <div className="rate-bar-wrap">
                      <div className="rate-bar-track">
                        <div className="rate-bar-fill" style={{ width: `${deliveryRate}%` }} />
                      </div>
                      <span className="rate-pct">{deliveryRate}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Section Header */}
              <div className="dash-section-header">
                <h3 className="dash-section-title">Order History 🧾</h3>
                <span className="dash-section-badge">{totalOrders} orders</span>
              </div>

              {/* Table or Empty */}
              {allOrders.length === 0 ? (
                <div className="dash-empty">
                  <span style={{ fontSize: 42 }}>🛒</span>
                  <p>No orders yet. Start shopping!</p>
                  <Link href="/" className="shop-btn">
                    Shop Now <ChevronRight size={15} />
                  </Link>
                </div>
              ) : (
                <div className="dash-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Due</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedOrders.map((order, i) => (
                        <OrderRow key={order.id} order={order} index={(tablePage - 1) * ROWS_PER_PAGE + i} />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Client-side Pagination */}
              {tableLastPage > 1 && (
                <div className="dash-pagination">
                  <button className="page-btn" onClick={() => setTablePage(p => Math.max(1, p - 1))} disabled={tablePage === 1}>‹</button>
                  {Array.from({ length: tableLastPage }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === tableLastPage || Math.abs(p - tablePage) <= 1)
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, idx) =>
                      p === '...'
                        ? <span key={`dots-${idx}`} className="page-dots">…</span>
                        : <button key={p} className={`page-btn ${p === tablePage ? 'active' : ''}`} onClick={() => setTablePage(p)}>{p}</button>
                    )
                  }
                  <button className="page-btn" onClick={() => setTablePage(p => Math.min(tableLastPage, p + 1))} disabled={tablePage === tableLastPage}>›</button>
                </div>
              )}
              {/* Showing X–Y of Z */}
              {allOrders.length > 0 && (
                <p className="pagination-info">
                  Showing {(tablePage - 1) * ROWS_PER_PAGE + 1}–{Math.min(tablePage * ROWS_PER_PAGE, allOrders.length)} of {allOrders.length} orders
                </p>
              )}
            </>
          )}
        </div>
      </div>
  );
}
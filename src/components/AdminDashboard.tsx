import React, { useState, useEffect } from 'react';
import { Order, Package, SiteSettings, FAQItem, OrderStatus, PaymentStatus, ReelItem } from '../types';
import {
  adminLogin,
  adminVerifyOrderPayment,
  fetchAdminOrders,
  updateOrderStatus,
  updatePackage,
  updateSettings,
} from '../lib/api';
import {
  ShieldCheck,
  Lock,
  Search,
  CheckCircle,
  CheckCircle2,
  Video,
  LogOut,
  X,
  ExternalLink,
  Edit,
  Save,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

interface AdminDashboardProps {
  onClose: () => void;
  siteSettings: SiteSettings;
  packages: Package[];
  faqs: FAQItem[];
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onClose,
  siteSettings,
  packages,
  faqs,
  onRefreshData,
}) => {
  const [token, setToken] = useState<string>(() => localStorage.getItem('tpbd_admin_token') || '');
  const [username, setUsername] = useState('Techpromotionbd');
  const [password, setPassword] = useState('Tech02@0##');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Dashboard Tabs: 'orders' | 'packages' | 'media' | 'settings'
  const [activeTab, setActiveTab] = useState<'orders' | 'packages' | 'media' | 'settings'>('orders');

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [paidCount, setPaidCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPayment, setFilterPayment] = useState('ALL');
  const [filterOrder, setFilterOrder] = useState('ALL');
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Editing package modal
  const [editingPkg, setEditingPkg] = useState<Package | null>(null);

  // Settings & Media form state
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(siteSettings);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  useEffect(() => {
    setSettingsForm(siteSettings);
  }, [siteSettings]);

  useEffect(() => {
    if (token) {
      loadOrders();
    }
  }, [token, filterPayment, filterOrder, searchQuery]);

  const loadOrders = async () => {
    if (!token) return;
    setIsLoadingOrders(true);
    try {
      const data = await fetchAdminOrders(token, {
        search: searchQuery,
        paymentStatus: filterPayment,
        orderStatus: filterOrder,
      });
      setOrders(data.orders);
      setTotalRevenue(data.revenueBDT);
      setPaidCount(data.paidCount);
    } catch (err) {
      console.error(err);
      setToken('');
      localStorage.removeItem('tpbd_admin_token');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const res = await adminLogin({ username: username.trim(), password });
      if (res.success && res.token) {
        setToken(res.token);
        localStorage.setItem('tpbd_admin_token', res.token);
      }
    } catch (err: unknown) {
      setLoginError((err as Error).message || 'Invalid username or password');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('tpbd_admin_token');
    window.location.hash = '';
  };

  // Requirement: Admin verifies payment to confirm order
  const handleVerifyPayment = async (orderId: string) => {
    try {
      await adminVerifyOrderPayment(token, orderId);
      loadOrders();
    } catch (err: unknown) {
      console.error(err);
      alert((err as Error).message || 'Failed to verify payment');
    }
  };

  const handleStatusChange = async (orderId: string, orderStatus: OrderStatus, paymentStatus: PaymentStatus) => {
    try {
      await updateOrderStatus(token, orderId, { orderStatus, paymentStatus });
      loadOrders();
    } catch (err) {
      console.error(err);
      alert('Failed to update order status');
    }
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg) return;
    try {
      await updatePackage(token, editingPkg.id, editingPkg);
      setEditingPkg(null);
      onRefreshData();
      alert('Package updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update package');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(token, settingsForm);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
      onRefreshData();
    } catch (err) {
      console.error(err);
      alert('Failed to update settings');
    }
  };

  const handleReelChange = (index: number, field: keyof ReelItem, value: string) => {
    const updatedReels = [...(settingsForm.reels || [])];
    if (updatedReels[index]) {
      updatedReels[index] = { ...updatedReels[index], [field]: value };
      setSettingsForm({ ...settingsForm, reels: updatedReels });
    }
  };

  const adminUrl = typeof window !== 'undefined' ? `${window.location.origin}/admin` : '/admin';

  const copyAdminUrl = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(adminUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  // If not logged in, show secure login modal
  if (!token) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-left relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6" />
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-1">
            Admin Portal Login
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Authorized management access for Tech Promotion BD.
          </p>

          <div className="mb-5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
            <div className="truncate mr-2">
              <span className="font-semibold text-slate-700">Direct URL: </span>
              <code className="text-blue-600 font-mono">/admin</code>
            </div>
            <button
              onClick={copyAdminUrl}
              type="button"
              className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
            >
              {copiedUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Techpromotionbd"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tech02@0##"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 space-y-0.5">
              <p>Username: <code className="text-slate-800 font-bold font-mono">Techpromotionbd</code></p>
              <p>Password: <code className="text-slate-800 font-bold font-mono">Tech02@0##</code></p>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm cursor-pointer"
            >
              {isLoggingIn ? 'Verifying...' : 'Sign In to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 overflow-hidden">
      <div className="bg-[#F8FAFC] rounded-3xl max-w-6xl w-full h-[92vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-left">
        {/* Top Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black">
              TP
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Tech Promotion BD Admin</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Online
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Direct URL: <span className="font-mono text-cyan-400">{adminUrl}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dashboard Tabs & Metrics Summary */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'orders' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'packages' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Packages ({packages.length})
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'media' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Hero Video & 3 Reels</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'settings' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Settings & Rates
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <div>
              <span className="text-slate-400">Paid Orders: </span>
              <strong className="text-emerald-600 tabular-nums">{paidCount}</strong>
            </div>
            <div>
              <span className="text-slate-400">Total Revenue: </span>
              <strong className="text-slate-900 tabular-nums">৳{totalRevenue.toLocaleString()} BDT</strong>
            </div>
          </div>
        </div>

        {/* Body content based on activeTab */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by order ID, customer, phone, or link..."
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={filterPayment}
                    onChange={(e) => setFilterPayment(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
                  >
                    <option value="ALL">All Payments</option>
                    <option value="PAID">PAID</option>
                    <option value="PENDING">PENDING</option>
                    <option value="FAILED">FAILED</option>
                  </select>

                  <select
                    value={filterOrder}
                    onChange={(e) => setFilterOrder(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
                  >
                    <option value="ALL">All Order Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-200">
                    <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                      <tr>
                        <th className="py-3 px-4">Order ID & Date</th>
                        <th className="py-3 px-4">Customer & Phone</th>
                        <th className="py-3 px-4">Service & Quantity</th>
                        <th className="py-3 px-4">Link</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4">Payment</th>
                        <th className="py-3 px-4">Delivery Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400">
                            No orders found matching your search.
                          </td>
                        </tr>
                      ) : (
                        orders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 whitespace-nowrap">
                              <p className="font-bold text-blue-600 font-mono">{ord.orderNumber}</p>
                              <p className="text-[10px] text-slate-400">
                                {new Date(ord.createdAt).toLocaleDateString()} {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              {ord.transactionId && (
                                <p className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">
                                  {ord.transactionId}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <p className="font-semibold text-slate-900">{ord.customerName}</p>
                              <a
                                href={`https://wa.me/${ord.whatsappNumber.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:underline font-mono text-[11px]"
                              >
                                {ord.whatsappNumber}
                              </a>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-medium text-slate-800">{ord.packageName}</p>
                              <p className="text-[11px] text-slate-500">{ord.quantityDisplay}</p>
                              {ord.promoCode && (
                                <p className="text-[10px] text-emerald-600 font-medium">Promo: {ord.promoCode} (-৳{ord.discountApplied || 0})</p>
                              )}
                            </td>
                            <td className="py-3 px-4 max-w-[200px]">
                              <div className="space-y-1">
                                <a
                                  href={ord.serviceLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-blue-600 hover:underline max-w-[170px] truncate block font-mono text-[11px]"
                                  title={ord.serviceLink}
                                >
                                  <span>{ord.serviceLink}</span>
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>

                                {ord.pageLink && ord.pageLink !== ord.serviceLink && (
                                  <a
                                    href={ord.pageLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-600 hover:underline max-w-[170px] truncate block font-mono text-[10px]"
                                    title={`Page Link: ${ord.pageLink}`}
                                  >
                                    Page: {ord.pageLink}
                                  </a>
                                )}

                                {ord.videoLinks && ord.videoLinks.length > 0 && (
                                  <div className="text-[10px] text-slate-500">
                                    <span className="font-semibold text-slate-700">{ord.videoLinks.length} Video Link(s):</span>
                                    {ord.videoLinks.map((v, i) => (
                                      <a
                                        key={i}
                                        href={v}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-cyan-600 hover:underline max-w-[170px] truncate block font-mono"
                                      >
                                        #{i + 1}: {v}
                                      </a>
                                    ))}
                                  </div>
                                )}

                                {ord.additionalLinks && ord.additionalLinks.length > 0 && (
                                  <div className="text-[10px] text-slate-500">
                                    <span className="font-semibold text-slate-700">Extra Links:</span>
                                    {ord.additionalLinks.map((al, idx) => (
                                      <a
                                        key={idx}
                                        href={al}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:underline max-w-[170px] truncate block font-mono"
                                      >
                                        + {al}
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap font-extrabold text-slate-900 tabular-nums">
                              ৳{ord.totalPrice.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="space-y-0.5">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    ord.paymentStatus === 'PAID'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : ord.paymentStatus === 'PENDING'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {ord.paymentStatus === 'PAID' ? 'Verified' : 'Pending Verification'}
                                </span>
                                <p className="text-[10px] text-slate-600 font-semibold">{ord.paymentMethod || 'bKash'}</p>
                                {ord.transactionId && (
                                  <p className="text-[10px] text-blue-600 font-mono font-bold truncate max-w-[120px]">
                                    Trx: {ord.transactionId}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <select
                                value={ord.orderStatus}
                                onChange={(e) =>
                                  handleStatusChange(ord.id, e.target.value as OrderStatus, ord.paymentStatus)
                                }
                                className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
                              >
                                <option value="PENDING">Pending</option>
                                <option value="PROCESSING">Processing</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                              </select>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              {ord.paymentStatus !== 'PAID' ? (
                                <button
                                  onClick={() => handleVerifyPayment(ord.id)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                                  title="Verify customer payment and confirm order"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Verify Payment</span>
                                </button>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Confirmed</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PACKAGES */}
          {activeTab === 'packages' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
                        <span className="uppercase">{pkg.category} Category</span>
                        <span className="text-blue-600">Base: ৳{pkg.basePrice}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{pkg.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{pkg.quantityLabel}</p>
                      <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">{pkg.description}</p>
                      <div className="mt-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                        <p>Quantity Step: <strong>{pkg.quantityStep.toLocaleString()}</strong></p>
                        <p>Price Step: <strong>৳{pkg.priceStep}</strong></p>
                        <p>Multiplier Enabled: <strong>{pkg.allowQuantityIncrease ? 'Yes' : 'No'}</strong></p>
                      </div>
                    </div>

                    <button
                      onClick={() => setEditingPkg(pkg)}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Package</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA (Hero Video up to 500MB & 3 FB Reels) */}
          {activeTab === 'media' && (
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
              {settingsSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl flex items-center gap-2 border border-emerald-200">
                  <CheckCircle className="w-4 h-4" />
                  <span>Media configuration saved successfully!</span>
                </div>
              )}

              {/* Hero 16:9 Video Configuration */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Video className="w-5 h-5 text-blue-600" />
                    <span>Hero Video Configuration (Supports Min 500MB Video)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Provide a direct MP4 / WebM / CDN video stream link of any size (500MB+ supported via direct HTTP streaming) or YouTube/hosted link.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Hero Video URL (MP4 / WebM / Direct Link)
                    </label>
                    <input
                      type="url"
                      value={settingsForm.heroVideoUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroVideoUrl: e.target.value })}
                      placeholder="https://example.com/videos/promo-500mb.mp4 (leave blank for poster preview)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Large videos up to 500MB+ will stream smoothly using browser HTTP range request buffering.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Hero Video Poster Image URL
                    </label>
                    <input
                      type="text"
                      value={settingsForm.heroVideoPoster || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroVideoPoster: e.target.value })}
                      placeholder="/src/assets/images/hero_cinematic_banner_1791233752016.jpg"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* 3 Facebook Reels Sized (9:16) Videos Configuration */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>3 Facebook Reels Sized Video Cards (9:16 Vertical)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage the 3 vertical story reels displayed on the homepage. Update titles, subtitles, view counts, and video URLs.
                  </p>
                </div>

                <div className="space-y-6">
                  {(settingsForm.reels || []).map((reel, idx) => (
                    <div key={reel.id || idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-blue-600">Reel #{idx + 1}</span>
                        <span className="text-[11px] text-slate-400 font-mono">ID: {reel.id}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Reel Title</label>
                          <input
                            type="text"
                            value={reel.title}
                            onChange={(e) => handleReelChange(idx, 'title', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Subtitle / Bengali Description</label>
                          <input
                            type="text"
                            value={reel.subtitle}
                            onChange={(e) => handleReelChange(idx, 'subtitle', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Views Tag</label>
                          <input
                            type="text"
                            value={reel.views || ''}
                            onChange={(e) => handleReelChange(idx, 'views', e.target.value)}
                            placeholder="e.g. 124K Views"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Duration Tag</label>
                          <input
                            type="text"
                            value={reel.duration || ''}
                            onChange={(e) => handleReelChange(idx, 'duration', e.target.value)}
                            placeholder="e.g. 0:45"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Video Stream URL</label>
                          <input
                            type="url"
                            value={reel.videoUrl || ''}
                            onChange={(e) => handleReelChange(idx, 'videoUrl', e.target.value)}
                            placeholder="https://...reel.mp4"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Video & Reels Settings</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: SETTINGS & RATES */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs max-w-2xl space-y-5">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Global Settings & Bonus Rates
              </h3>

              {settingsSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl flex items-center gap-2 border border-emerald-200">
                  <CheckCircle className="w-4 h-4" />
                  <span>Settings updated successfully!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary WhatsApp
                  </label>
                  <input
                    type="text"
                    value={settingsForm.primaryWhatsapp}
                    onChange={(e) => setSettingsForm({ ...settingsForm, primaryWhatsapp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alternative WhatsApp
                  </label>
                  <input
                    type="text"
                    value={settingsForm.alternativeWhatsapp}
                    onChange={(e) => setSettingsForm({ ...settingsForm, alternativeWhatsapp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Active Promo Code
                  </label>
                  <input
                    type="text"
                    value={settingsForm.promoCode || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, promoCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                    placeholder="TechPromotionBD"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Brand Tagline
                </label>
                <input
                  type="text"
                  value={settingsForm.tagline || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Delivered Views Stat
                  </label>
                  <input
                    type="text"
                    value={settingsForm.statTotalViews}
                    onChange={(e) => setSettingsForm({ ...settingsForm, statTotalViews: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Engagements Stat
                  </label>
                  <input
                    type="text"
                    value={settingsForm.statTotalEngagement}
                    onChange={(e) => setSettingsForm({ ...settingsForm, statTotalEngagement: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Settings</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Edit Package Modal */}
        {editingPkg && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-left space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-900">Edit Package</h3>
                <button onClick={() => setEditingPkg(null)} className="p-1 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSavePackage} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Package Name</label>
                  <input
                    type="text"
                    value={editingPkg.name}
                    onChange={(e) => setEditingPkg({ ...editingPkg, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Base Price (৳)</label>
                    <input
                      type="number"
                      value={editingPkg.basePrice}
                      onChange={(e) => setEditingPkg({ ...editingPkg, basePrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Price Step (৳)</label>
                    <input
                      type="number"
                      value={editingPkg.priceStep}
                      onChange={(e) => setEditingPkg({ ...editingPkg, priceStep: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Base Quantity</label>
                    <input
                      type="number"
                      value={editingPkg.baseQuantity}
                      onChange={(e) => setEditingPkg({ ...editingPkg, baseQuantity: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Quantity Step</label>
                    <input
                      type="number"
                      value={editingPkg.quantityStep}
                      onChange={(e) => setEditingPkg({ ...editingPkg, quantityStep: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="allowIncrease"
                    checked={editingPkg.allowQuantityIncrease}
                    onChange={(e) => setEditingPkg({ ...editingPkg, allowQuantityIncrease: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="allowIncrease" className="font-semibold text-slate-700">
                    Allow Quantity Increase Multiplier
                  </label>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingPkg(null)}
                    className="flex-1 py-2 rounded-lg border border-slate-200 font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

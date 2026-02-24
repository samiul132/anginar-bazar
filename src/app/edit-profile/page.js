'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, MapPin, Plus, Trash2, Edit2, X, Loader2, Check } from 'lucide-react';
import Link from 'next/link';
import { api, storage } from '@/lib/api';

export default function EditProfilePage() {
  const router = useRouter();

  // Auth State
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customerData, setCustomerData] = useState(null);

  // Address State
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);

  // Add Address Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [addingAddress, setAddingAddress] = useState(false);

  // Edit Address Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [editAddressText, setEditAddressText] = useState('');
  const [updatingAddress, setUpdatingAddress] = useState(false);

  // Delete Confirm Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState(null);
  const [deletingAddress, setDeletingAddress] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  // Fixed Location
  const locationData = {
    division: { id: 1, name: 'Chattagram' },
    district: { id: 6, name: 'Chandpur' },
    upazila: { id: 58, name: 'Matlab North' },
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const checkAuthentication = async () => {
    try {
      const token = storage.getAuthToken();
      const customer = storage.getCustomerData();

      if (token && customer && customer.name) {
        setIsAuthenticated(true);
        setCustomerData(customer);
        await fetchAddresses();
      } else {
        setIsAuthenticated(false);
        router.push('/');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    setAddressesLoading(true);
    try {
      const response = await api.address.getAll();
      if (response.success && response.data?.addressList && Array.isArray(response.data.addressList)) {
        setAddresses(response.data.addressList);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setAddresses([]);
    } finally {
      setAddressesLoading(false);
    }
  };

  // ─── ADD ─── (FIXED: 0/1 instead of true/false)
  const handleAddAddress = async () => {
    if (!newAddress.trim()) {
      showToast('Please enter an address', 'error');
      return;
    }

    setAddingAddress(true);
    try {
      const response = await api.address.add({
        street_address: newAddress.trim(),
        division_id: locationData.division.id,
        district_id: locationData.district.id,
        upazila_id: locationData.upazila.id,
        is_default: addresses.length === 0 ? 1 : 0, // ✅ 0 or 1
      });

      if (response.success) {
        await fetchAddresses();
        setShowAddModal(false);
        setNewAddress('');
        showToast('Address added successfully');
      }
    } catch (error) {
      showToast('Failed to add address: ' + error.message, 'error');
    } finally {
      setAddingAddress(false);
    }
  };

  // ─── EDIT ─── (FIXED: 0/1 instead of true/false)
  const openEditModal = (address) => {
    setEditingAddress(address);
    setEditAddressText(address.street_address);
    setShowEditModal(true);
  };

  const handleUpdateAddress = async () => {
    if (!editAddressText.trim()) {
      showToast('Please enter an address', 'error');
      return;
    }

    setUpdatingAddress(true);
    try {
      const response = await api.address.update(editingAddress.id, {
        street_address: editAddressText.trim(),
        division_id: editingAddress.division_id || locationData.division.id,
        district_id: editingAddress.district_id || locationData.district.id,
        upazila_id: editingAddress.upazila_id || locationData.upazila.id,
        is_default: editingAddress.is_default === 1 ? 1 : 0, // ✅ 0 or 1
      });

      if (response.success) {
        await fetchAddresses();
        setShowEditModal(false);
        setEditingAddress(null);
        setEditAddressText('');
        showToast('Address updated successfully');
      }
    } catch (error) {
      showToast('Failed to update address: ' + error.message, 'error');
    } finally {
      setUpdatingAddress(false);
    }
  };

  // ─── DELETE ───
  const openDeleteModal = (addressId) => {
    if (addresses.length === 1) {
      showToast('You must have at least one address', 'error');
      return;
    }
    setDeletingAddressId(addressId);
    setShowDeleteModal(true);
  };

  const handleDeleteAddress = async () => {
    setDeletingAddress(true);
    try {
      await api.address.delete(deletingAddressId);
      await fetchAddresses();
      setShowDeleteModal(false);
      setDeletingAddressId(null);
      showToast('Address deleted');
    } catch (error) {
      showToast('Failed to delete address', 'error');
    } finally {
      setDeletingAddress(false);
    }
  };

  // ─── SET DEFAULT ─── (FIXED: 1 instead of true)
  const handleSetDefault = async (address) => {
    if (address.is_default === 1) return;
    try {
      await api.address.update(address.id, {
        street_address: address.street_address,
        division_id: address.division_id || locationData.division.id,
        district_id: address.district_id || locationData.district.id,
        upazila_id: address.upazila_id || locationData.upazila.id,
        is_default: 1, // ✅ 1 instead of true
      });
      await fetchAddresses();
      showToast('Default address updated');
    } catch (error) {
      showToast('Failed to update default address', 'error');
    }
  };

  // ─── Loading ───
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#FF5533] animate-spin" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl shadow-lg text-white font-medium flex items-center gap-2 transition-all ${
            toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
          }`}
        >
          {toast.type !== 'error' && <Check size={18} />}
          {toast.message}
        </div>
      )}

      <div className="bg-gray-50 min-h-screen flex flex-col pb-20 md:pb-8">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              <Link href="/account" className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer">
                <ChevronLeft size={24} />
              </Link>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Manage Addresses</h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto w-full px-4 py-6">

          {/* User Info Card */}
          {customerData && (
            <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-[#FF5533]/10 rounded-full p-3">
                  <svg className="w-7 h-7 text-[#FF5533]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">{customerData.name}</p>
                  <p className="text-gray-500 text-sm">+88 {customerData.phone}</p>
                </div>
              </div>
            </div>
          )}

          {/* Addresses Section */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="text-[#FF5533]" size={20} />
                My Addresses
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#FF5533] text-white rounded-lg hover:bg-[#e64e27] transition text-sm font-semibold cursor-pointer"
              >
                <Plus size={16} />
                Add New
              </button>
            </div>

            {addressesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#FF5533] animate-spin" />
              </div>
            ) : addresses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-gray-100 rounded-full p-5 mb-4">
                  <MapPin className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium mb-1">No addresses yet</p>
                <p className="text-gray-400 text-sm">Add a delivery address to get started</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-5 px-6 py-2.5 bg-[#FF5533] text-white rounded-lg font-semibold hover:bg-[#e64e27] transition cursor-pointer"
                >
                  Add Address
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((address, index) => (
                  <div
                    key={address.id}
                    className={`rounded-xl border-2 p-4 transition ${
                      address.is_default === 1
                        ? 'border-[#FF5533] bg-[#FF5533]/5'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <MapPin
                        size={20}
                        className={`mt-0.5 flex-shrink-0 ${
                          address.is_default === 1 ? 'text-[#FF5533]' : 'text-gray-400'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-700">
                            Address {index + 1}
                          </span>
                          {address.is_default === 1 && (
                            <span className="bg-[#FF5533] text-white text-xs px-2 py-0.5 rounded-full font-medium">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {address.street_address}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {locationData.district.name}, {locationData.upazila.name}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                      {/* Set Default */}
                      {address.is_default !== 1 && (
                        <button
                          onClick={() => handleSetDefault(address)}
                          className="flex-1 text-center text-xs font-medium text-gray-500 hover:text-[#FF5533] py-1.5 rounded-lg hover:bg-[#FF5533]/5 transition cursor-pointer border border-gray-200 hover:border-[#FF5533]"
                        >
                          Set as Default
                        </button>
                      )}
                      {/* Edit */}
                      <button
                        onClick={() => openEditModal(address)}
                        className="flex items-center justify-center gap-1 px-4 py-1.5 border border-[#FF5533] text-[#FF5533] rounded-lg hover:bg-[#FF5533]/5 transition text-sm font-medium cursor-pointer"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      {/* Delete */}
                      {addresses.length > 1 && (
                        <button
                          onClick={() => openDeleteModal(address.id)}
                          className="flex items-center justify-center gap-1 px-4 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition text-sm font-medium cursor-pointer"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Service Area Note */}
          <div className="mt-4 bg-[#FF5533]/5 border border-[#FF5533]/20 rounded-xl p-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-[#FF5533]">Service Area:</span>{' '}
              We currently deliver to {locationData.district.name} — {locationData.upazila.name} only.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Add Address Modal ─── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center"
            onClick={() => { setShowAddModal(false); setNewAddress(''); }}
          >
          <div className="bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-lg p-6"
              onClick={(e) => e.stopPropagation()} 
            >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-gray-900">Add New Address</h3>
              <button
                onClick={() => { setShowAddModal(false); setNewAddress(''); }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="House/Flat, Road, Area..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FF5533] focus:ring-2 focus:ring-[#FF5533]/20 resize-none text-gray-900"
              />
            </div>

            <div className="bg-[#FF5533]/5 border border-[#FF5533]/20 rounded-xl p-3 mb-5">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Area:</span> {locationData.district.name} — {locationData.upazila.name}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowAddModal(false); setNewAddress(''); }}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAddress}
                disabled={addingAddress}
                className={`flex-1 py-3 rounded-xl font-bold transition cursor-pointer ${
                  addingAddress
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-[#FF5533] hover:bg-[#e64e27] text-white'
                }`}
              >
                {addingAddress ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Save Address'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Edit Address Modal ─── */}
      {showEditModal && editingAddress && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center"
            onClick={() => { setShowEditModal(false); setEditingAddress(null); setEditAddressText(''); }}
          >
          <div className="bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-lg p-6"
            onClick={(e) => e.stopPropagation()} 
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-gray-900">Edit Address</h3>
              <button
                onClick={() => { setShowEditModal(false); setEditingAddress(null); setEditAddressText(''); }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={editAddressText}
                onChange={(e) => setEditAddressText(e.target.value)}
                placeholder="House/Flat, Road, Area..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FF5533] focus:ring-2 focus:ring-[#FF5533]/20 resize-none text-gray-900"
              />
            </div>

            <div className="bg-[#FF5533]/5 border border-[#FF5533]/20 rounded-xl p-3 mb-5">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Area:</span> {locationData.district.name} — {locationData.upazila.name}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowEditModal(false); setEditingAddress(null); setEditAddressText(''); }}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateAddress}
                disabled={updatingAddress}
                className={`flex-1 py-3 rounded-xl font-bold transition cursor-pointer ${
                  updatingAddress
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-[#FF5533] hover:bg-[#e64e27] text-white'
                }`}
              >
                {updatingAddress ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating...
                  </span>
                ) : (
                  'Update Address'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm Modal ─── */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
            onClick={() => { setShowDeleteModal(false); setDeletingAddressId(null); }}
          >
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()} 
            >
            <div className="flex flex-col items-center text-center mb-6">
              <div className="bg-red-100 rounded-full p-4 mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Address?</h3>
              <p className="text-gray-500 text-sm">This action cannot be undone.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeletingAddressId(null); }}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAddress}
                disabled={deletingAddress}
                className={`flex-1 py-3 rounded-xl font-bold transition cursor-pointer ${
                  deletingAddress
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {deletingAddress ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
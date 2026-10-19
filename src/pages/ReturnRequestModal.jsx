// src/pages/ReturnRequestModal.jsx   (same folder as OrdersPage.jsx)
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../api/axios';

const REASONS = [
    { value: 'damaged', label: 'Damaged Product' },
    { value: 'wrong_item', label: 'Wrong Item Delivered' },
    { value: 'not_as_described', label: 'Not as Described' },
    { value: 'size_issue', label: 'Size/Fit Issue' },
    { value: 'quality_issue', label: 'Quality Issue' },
    { value: 'changed_mind', label: 'Changed My Mind' },
    { value: 'other', label: 'Other' },
];

const MAX_IMAGES = 5;
const MAX_IMAGE_MB = 2;

const EMPTY_BANK = {
    bank_account_holder: '',
    bank_name: '',
    bank_account_number: '',
    bank_confirm_account_number: '',
    bank_ifsc: '',
    bank_account_type: 'savings',
    bank_upi_id: '',
};

const inputCls =
    'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent';

const ReturnRequestModal = ({ item, order, onClose, onSuccess }) => {
    const maxQty = Number(item.net_quantity ?? item.quantity ?? 1);

    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [images, setImages] = useState([]);
    const [bank, setBank] = useState({ ...EMPTY_BANK });
    const [forceBank, setForceBank] = useState(false); // backend told us it's a COD order
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const isCod = order?.payment_method === 'cod' || forceBank;

    const setB = (k, v) => setBank((p) => ({ ...p, [k]: v }));

    const onImages = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > MAX_IMAGES) {
            toast.error(`Maximum ${MAX_IMAGES} images allowed`);
            e.target.value = '';
            return;
        }
        for (const f of files) {
            if (f.size > MAX_IMAGE_MB * 1024 * 1024) {
                toast.error(`${f.name} is larger than ${MAX_IMAGE_MB}MB`);
                e.target.value = '';
                return;
            }
        }
        setImages(files);
    };

    const validate = () => {
        const e = {};
        if (!reason) e.reason = 'Select a reason';
        if (!quantity || quantity < 1 || quantity > maxQty) e.quantity = `Quantity must be between 1 and ${maxQty}`;

        if (isCod) {
            if (!/^[A-Za-z][A-Za-z .'-]{2,99}$/.test(bank.bank_account_holder.trim()))
                e.bank_account_holder = 'Enter account holder name as per bank';
            if (bank.bank_name.trim().length < 2) e.bank_name = 'Enter bank name';
            if (!/^\d{9,18}$/.test(bank.bank_account_number.trim()))
                e.bank_account_number = 'Account number must be 9 to 18 digits';
            if (!bank.bank_confirm_account_number.trim())
                e.bank_confirm_account_number = 'Please confirm the account number';
            else if (bank.bank_confirm_account_number.trim() !== bank.bank_account_number.trim())
                e.bank_confirm_account_number = 'Account numbers do not match';
            if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bank.bank_ifsc.trim().toUpperCase()))
                e.bank_ifsc = 'Invalid IFSC code (e.g. SBIN0001234)';
            if (bank.bank_upi_id.trim() && !/^[a-zA-Z0-9.\-_]{2,60}@[a-zA-Z]{2,30}$/.test(bank.bank_upi_id.trim()))
                e.bank_upi_id = 'Invalid UPI ID (e.g. name@bank)';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        if (!validate()) return;

        const fd = new FormData();
        fd.append('order_item_id', item.id);
        fd.append('reason', reason);
        fd.append('description', description.trim());
        fd.append('quantity', quantity);
        images.forEach((img) => fd.append('images', img));

        if (isCod) {
            fd.append('bank_account_holder', bank.bank_account_holder.trim());
            fd.append('bank_name', bank.bank_name.trim());
            fd.append('bank_account_number', bank.bank_account_number.trim());
            fd.append('bank_confirm_account_number', bank.bank_confirm_account_number.trim());
            fd.append('bank_ifsc', bank.bank_ifsc.trim().toUpperCase());
            fd.append('bank_account_type', bank.bank_account_type);
            fd.append('bank_upi_id', bank.bank_upi_id.trim());
        }

        setSubmitting(true);
        try {
            const res = await axiosInstance.post('/api/ecommerce/public/returns/create/', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (res.data.success) {
                toast.success('Return request submitted');
                onSuccess && onSuccess(res.data.data);
            }
        } catch (err) {
            const apiErrors = err.response?.data?.errors;
            if (apiErrors && typeof apiErrors === 'object') {
                const flat = {};
                Object.entries(apiErrors).forEach(([k, v]) => {
                    flat[k] = Array.isArray(v) ? v[0] : String(v);
                });
                setErrors(flat);
                // order is COD but modal wasn't told → reveal the bank section
                if (Object.keys(flat).some((k) => k.startsWith('bank_'))) setForceBank(true);
                toast.error(flat.non_field_errors || 'Please fix the highlighted fields');
            } else {
                toast.error(err.response?.data?.message || 'Failed to submit return request');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const Err = ({ k }) => (errors[k] ? <p className="text-xs text-red-600 mt-1">{errors[k]}</p> : null);

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[92vh] overflow-y-auto p-5 space-y-4"
            >
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Return Item</h2>
                        <p className="text-sm text-gray-500 mt-0.5">{item.product_name}</p>
                    </div>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
                </div>

                {errors.non_field_errors && (
                    <div className="p-2 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg">{errors.non_field_errors}</div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                    <select value={reason} onChange={(e) => setReason(e.target.value)} className={inputCls}>
                        <option value="">Select reason</option>
                        {REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    <Err k="reason" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to return *</label>
                    <input type="number" min="1" max={maxQty} value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))} className={inputCls} />
                    <p className="text-xs text-gray-400 mt-1">You can return up to {maxQty}</p>
                    <Err k="quantity" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
                        className={inputCls} placeholder="Tell us what went wrong…" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Photos (max {MAX_IMAGES}, {MAX_IMAGE_MB}MB each)
                    </label>
                    <input type="file" accept="image/*" multiple onChange={onImages}
                        className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700" />
                    {images.length > 0 && <p className="text-xs text-gray-500 mt-1">{images.length} file(s) selected</p>}
                    <Err k="images" />
                </div>

                {isCod && (
                    <div className="border border-blue-200 bg-blue-50/60 rounded-lg p-4 space-y-3">
                        <div>
                            <h3 className="text-sm font-semibold text-red-800">Refund Bank Details</h3>
                            <p className="text-xs text-gray-600 mt-0.5">
                                This was a Cash on Delivery order. Your refund will be sent to this bank account after your return is approved.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Account Holder Name *</label>
                            <input value={bank.bank_account_holder} onChange={(e) => setB('bank_account_holder', e.target.value)} className={inputCls} />
                            <Err k="bank_account_holder" />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Bank Name *</label>
                            <input value={bank.bank_name} onChange={(e) => setB('bank_name', e.target.value)} className={inputCls} />
                            <Err k="bank_name" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Account Number *</label>
                                <input inputMode="numeric" value={bank.bank_account_number}
                                    onChange={(e) => setB('bank_account_number', e.target.value.replace(/\D/g, ''))}
                                    maxLength={18} className={inputCls} />
                                <Err k="bank_account_number" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Account Number *</label>
                                <input inputMode="numeric" value={bank.bank_confirm_account_number}
                                    onChange={(e) => setB('bank_confirm_account_number', e.target.value.replace(/\D/g, ''))}
                                    onPaste={(e) => e.preventDefault()}
                                    maxLength={18} className={inputCls} />
                                <Err k="bank_confirm_account_number" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">IFSC Code *</label>
                                <input value={bank.bank_ifsc}
                                    onChange={(e) => setB('bank_ifsc', e.target.value.toUpperCase())}
                                    maxLength={11} className={inputCls} placeholder="SBIN0001234" />
                                <Err k="bank_ifsc" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">Account Type *</label>
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="bank_account_type"
                                            value="savings"
                                            checked={bank.bank_account_type === 'savings'}
                                            onChange={(e) => setB('bank_account_type', e.target.value)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Savings</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="bank_account_type"
                                            value="current"
                                            checked={bank.bank_account_type === 'current'}
                                            onChange={(e) => setB('bank_account_type', e.target.value)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Current</span>
                                    </label>
                                </div>
                                <Err k="bank_account_type" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">UPI ID</label>
                            <input value={bank.bank_upi_id} onChange={(e) => setB('bank_upi_id', e.target.value)}
                                className={inputCls} placeholder="name@bank" />
                            <Err k="bank_upi_id" />
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} disabled={submitting}
                        className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium">
                        Cancel
                    </button>
                    <button type="submit" disabled={submitting}
                        className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50">
                        {submitting ? 'Submitting…' : 'Submit Return'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReturnRequestModal;
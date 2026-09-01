import React, { useState } from 'react';
import axiosInstance from '../api/axios';
import { toast } from 'react-hot-toast';

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
const MAX_IMAGE_SIZE_MB = 2;

const ReturnRequestModal = ({ item, onClose, onSuccess }) => {
    const [reason, setReason] = useState('damaged');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [images, setImages] = useState([]); // File[]
    const [submitting, setSubmitting] = useState(false);

    const handleImageChange = (e) => {
        const selected = Array.from(e.target.files);
        e.target.value = null; // taaki same file dobara select ho sake

        if (images.length + selected.length > MAX_IMAGES) {
            toast.error(`You can upload a maximum of ${MAX_IMAGES} images`);
            return;
        }

        const oversized = selected.find(f => f.size > MAX_IMAGE_SIZE_MB * 1024 * 1024);
        if (oversized) {
            toast.error(`"${oversized.name}" is over ${MAX_IMAGE_SIZE_MB}MB`);
            return;
        }

        const nonImage = selected.find(f => !f.type.startsWith('image/'));
        if (nonImage) {
            toast.error(`"${nonImage.name}" is not an image file`);
            return;
        }

        setImages(prev => [...prev, ...selected]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('order_item_id', item.id);
            formData.append('reason', reason);
            formData.append('description', description);
            formData.append('quantity', quantity);
            images.forEach(img => formData.append('images', img));

            const res = await axiosInstance.post('/api/ecommerce/public/returns/create/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data.success) {
                toast.success('Return request submitted');
                onSuccess();
            }
        } catch (err) {
            const errors = err.response?.data?.errors;
            const msg = errors?.images?.[0] || errors?.non_field_errors?.[0] || err.response?.data?.message || 'Failed to submit return';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000080] px-3">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl">&times;</button>
                <h2 className="text-lg font-bold text-gray-800 mb-1">Return Item</h2>
                <p className="text-sm text-gray-500 mb-4">{item.product_name}</p>

                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
                >
                    {REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>

                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                    type="number"
                    min={1}
                    max={item.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
                />

                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
                    placeholder="Tell us what went wrong..."
                />

                {/* ✅ Image Upload */}
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Images ({images.length}/{MAX_IMAGES}) <span className="text-xs text-gray-400">max {MAX_IMAGE_SIZE_MB}MB each</span>
                </label>

                {images.length < MAX_IMAGES && (
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="w-full text-sm mb-3"
                    />
                )}

                {images.length > 0 && (
                    <div className="grid grid-cols-5 gap-2 mb-4">
                        {images.map((img, idx) => (
                            <div key={idx} className="relative">
                                <img
                                    src={URL.createObjectURL(img)}
                                    alt={`upload-${idx}`}
                                    className="w-full h-14 object-cover rounded border border-gray-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] leading-none"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {submitting ? 'Submitting...' : 'Submit Return Request'}
                </button>
            </div>
        </div>
    );
};

export default ReturnRequestModal;
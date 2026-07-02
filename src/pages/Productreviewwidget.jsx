// src/pages/customer/Productreviewwidget.jsx
import React, { useState, useEffect, useCallback } from "react";
import { FaStar } from "react-icons/fa";
import { FiChevronDown, FiChevronUp, FiCheckCircle } from "react-icons/fi";
import { publicAxios, axiosInstance } from "../api/axios";

function StarPicker({ value, onChange, size = 22 }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <FaStar size={size} color={(hovered || value) >= star ? "#3b82f6" : "#d1d5db"} />
        </button>
      ))}
    </div>
  );
}

export default function ProductReviewWidget({
    productId,
    productName,
    orderStatus,
    orderItemId,  // ✅ scopes review/check to THIS exact order item
}) {
  const [expanded, setExpanded] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isDelivered = orderStatus === "delivered";

  // ── Check if THIS order_item is already reviewed ─────────────────────────
  const checkReviewStatus = useCallback(async () => {
    if (!productId || !orderItemId) {
      setChecking(false);
      return;
    }
    try {
      setChecking(true);
      const token = localStorage.getItem("customer_token");
      // ✅ CORRECT endpoint per services/urls/review_urls.py -> /api/search-reviews/
      const res = await publicAxios.get("/api/search-reviews/", {
        params: {
          model: "product",
          object_id: productId,
          order_item_id: orderItemId, // ✅ scopes the check to this exact order
        },
        headers: token ? { Authorization: `Token ${token}` } : {},
      });
      if (res.data.success) {
        setHasReviewed(!!res.data.has_reviewed); // ✅ matches actual backend response shape
      }
    } catch (err) {
      console.error("Review status check error:", err);
    } finally {
      setChecking(false);
    }
  }, [productId, orderItemId]);

  useEffect(() => {
    if (isDelivered) {
      checkReviewStatus();
    } else {
      setChecking(false);
    }
  }, [checkReviewStatus, isDelivered]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError("Please select a rating"); return; }
    if (!review.trim()) { setError("Please write something about your experience"); return; }
    if (!orderItemId) { setError("Unable to identify this order item. Please refresh and try again."); return; }

    try {
      setSubmitting(true);
      setError("");
      const token = localStorage.getItem("customer_token");

      // ✅ CORRECT endpoint per services/urls/review_urls.py -> /api/add-review/
      const res = await axiosInstance.post(
        "/api/add-review/",
        {
          model: "product",
          object_id: productId,
          rating,
          review: review.trim(),
          order_item_id: orderItemId, // ✅ scopes the review to this exact order
        },
        { headers: { Authorization: `Token ${token}` } }
      );

      if (res.data.success) {
        setSuccess(true);
        setHasReviewed(true);
        setTimeout(() => { setExpanded(false); setSuccess(false); }, 2000);
      } else {
        setError(res.data.errors?.non_field_errors?.[0] || "Failed to submit review");
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.non_field_errors?.[0];
      setError(msg || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Not delivered → don't show anything ──────────────────────────────────
  if (!isDelivered) return null;
  if (checking) return null;

  // ── Already reviewed for THIS order → show confirmation badge only ───────
  if (hasReviewed) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 font-medium">
        <FiCheckCircle className="h-3.5 w-3.5" />
        Review submitted
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
      >
        <span className="flex items-center gap-1.5">
          <FaStar className="h-3 w-3 text-blue-600" />
          Write a Review
        </span>
        {expanded ? <FiChevronUp className="h-3.5 w-3.5" /> : <FiChevronDown className="h-3.5 w-3.5" />}
      </button>

      {expanded && (
        <div className="p-3 space-y-3">
          {success ? (
            <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
              <FiCheckCircle className="h-4 w-4 flex-shrink-0" />
              Review submitted successfully!
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <p className="text-xs text-gray-600 mb-1.5 font-medium">Your rating</p>
                <StarPicker value={rating} onChange={setRating} />
              </div>

              <div>
                <p className="text-xs text-gray-600 mb-1.5 font-medium">Your review</p>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={3}
                  placeholder={`Share your experience with ${productName || "this product"}...`}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  disabled={submitting}
                />
              </div>

              {error && (
                <div className="px-2.5 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
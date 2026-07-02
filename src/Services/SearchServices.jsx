import React, { useState, useEffect } from "react";
import { FiMapPin, FiSearch, FiFilter, FiDollarSign } from "react-icons/fi"; // feather icons
import { FaStar, FaMapMarkerAlt } from "react-icons/fa"; // font-awesome icons
import { MdVerified } from "react-icons/md";
import { publicAxios } from "../api/axios";
import axiosInstance from "../api/axios";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function SearchServicesPage() {
    const [searchParams] = useSearchParams();

    const initialSubcategory = searchParams.get("subcategory") || "";
    const initialCity = searchParams.get("city") || "";
    const initialKeyword = searchParams.get("keyword") || "";

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [search, setSearch] = useState(initialKeyword);
    const [sortBy, setSortBy] = useState("");
    const [subcategories, setSubcategories] = useState([]);
    const [showInquiryModal, setShowInquiryModal] = useState(false);
    const [cities, setCities] = useState([]);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [selectedServiceForReview, setSelectedServiceForReview] = useState(null);
    const [filters, setFilters] = useState({
        city: initialCity,
        type: initialSubcategory,
        featured: false,
    });

    const [showModal, setShowModal] = useState(false);
    const [modalService, setModalService] = useState(null);

    const openInquiryModal = (service) => {
        setModalService(service);
        setShowModal(true);
    };

    const closeInquiryModal = () => {
        setShowModal(false);
        setModalService(null);
    };

    const navigate = useNavigate();
    const navigateToServiceDetail = (id, subcategory) => {
        navigate(`/servicedetail/${id}/${subcategory}`);
    };

    // Example fetch
    const fetchServices = async () => {
        setLoading(true);
        try {
            const response = await publicAxios.get("/services/search-service/", {
                params: {
                    subcategory: filters.type,
                    city: filters.city,
                    keyword: search
                }
            });
            setServices(response.data.services);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // useEffect(() => {
    //     fetchServices();
    // }, [filters, search]);

    const fetchAdvancedServices = async () => {

        try {

            let params = new URLSearchParams();

            // 👇 type REQUIRED chhe (gym / salon / travel agency)
            // if (filters.type) {
            //     params.append("type", filters.type);
            // }

            if (filters.rating) {
                params.append("rating", filters.rating);
            }

            if (sortBy) {
                params.append("sort_by", sortBy);
            }

            const res = await publicAxios.get(
                `/services/advanced-filter-service/?${params.toString()}`
            );

            setServices(res.data.data);

        } catch (err) {
            console.log(err);
        }
    };
    useEffect(() => {

        // ⭐ ONLY rating OR sort apply thay tyare advanced api call
        if (filters.rating || sortBy === "newest" || sortBy === "top_rated") {

            fetchAdvancedServices();

        } else {

            // 🔙 Normal search api
            fetchServices();

        }

    }, [filters.rating, sortBy]);

    const fetchFilterOptions = async () => {
        try {
            const response = await publicAxios.get("/services/filter-service/", {
                params: {
                    subcategory: filters.type || "",
                    city: filters.city || "",
                    keyword: search || ""
                }
            });

            setSubcategories(response.data.subcategories || []);
            setCities(response.data.cities || []);
        } catch (error) {
            console.error("Filter API Error:", error);
        }
    };
    useEffect(() => {
        fetchServices();
        fetchFilterOptions();
    }, [filters.city, filters.type, search]);

    const handleTypeChange = (e) => {
        const selectedType = e.target.value;

        setFilters(prev => ({
            ...prev,
            type: selectedType,
            city: ""   // subcategory change → reset city
        }));
    };

    // const services = [
    //     { id: 1, title: "FitLife Gym", type: "Gym", city: "Mumbai", is_featured: true, main_image: "https://placehold.co/400x300?text=Gym", rating: 4.5 },
    //     { id: 2, title: "Glamour Salon", type: "Salon", city: "Pune", is_featured: false, main_image: "https://placehold.co/400x300?text=Salon", rating: 4.2 },
    //     { id: 3, title: "Tech Solutions Pvt Ltd", type: "Tech", city: "Bangalore", is_featured: true, main_image: "https://placehold.co/400x300?text=Tech", rating: 4.8 },
    //     { id: 4, title: "Wanderlust Travels", type: "Travel Agency", city: "Delhi", is_featured: false, main_image: "https://placehold.co/400x300?text=Travel", rating: 4.6 }
    // ];

    // const cities = [...new Set(filteredServices.map(s => s.city))];
    // const types = [...new Set(filteredServices.map(s => s.subcategory_name))];



    // Filter + search + sort
    const filteredServices = services
        .filter(s =>
            ((s.business_name || "").toLowerCase().includes(search.toLowerCase()) ||
                (s.address || "").toLowerCase().includes(search.toLowerCase())) &&
            (filters.city ? s.city === filters.city : true) &&
            (filters.type ? s.subcategory_name === filters.type : true) &&
            (filters.featured ? s.is_featured : true) // rating filter remove
        )
        .sort((a, b) => {
            if (sortBy === "newest") return b.id - a.id;
            if (sortBy === "top_rated") return (b.avg_rating || 0) - (a.avg_rating || 0);
            return 0;
        });
    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Our Services</h1>
                        <p className="text-blue-100 text-sm">Browse top services across industries</p>
                    </div>

                    {/* Search bar */}
                    <div className="flex gap-2 max-w-md w-full">
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="flex-1 px-4 py-2 rounded-l-lg outline-none text-gray-700 bg-white"
                        />
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg font-medium flex items-center"
                        >
                            <FiSearch className="mr-2" />
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Main */}
            <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
                {/* Filters Sidebar */}
                <div className={`${showFilters ? "block" : "hidden"} lg:block lg:w-1/4`}>
                    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 sticky top-6">
                        <div className="flex justify-between items-center mb-5 pb-3 border-b">
                            <h2 className="text-lg font-bold text-gray-800">Filters</h2>
                            <button
                                onClick={() => window.location.reload()}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Clear
                            </button>
                        </div>

                        {/* City */}
                        <div className="mb-4">
                            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <FiMapPin className="text-blue-500" /> City
                            </h3>
                            <select
                                value={filters.city}
                                onChange={e => setFilters(prev => ({ ...prev, city: e.target.value }))}
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="">All Cities</option>
                                {cities.map(city => <option key={city} value={city}>{city}</option>)}
                            </select>
                        </div>

                        {/* Subcategory / Type */}
                        <div className="mb-4">
                            <h3 className="font-semibold text-gray-700 mb-2">Subcategory</h3>
                            <select
                                value={filters.type}
                                onChange={e => setFilters(prev => ({ ...prev, type: e.target.value }))}
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="">All Types</option>
                                {subcategories.map(sub => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                            </select>
                        </div>

                        {/* Price Range */}
                        {/* <div className="mb-4">
                            <h3 className="font-semibold text-gray-700 mb-2">Price Range (₹)</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minPrice || ""}
                                    onChange={e => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxPrice || ""}
                                    onChange={e => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                        </div> */}

                        {/* Rating */}
                        <div className="mb-4">
                            <h3 className="font-semibold text-gray-700 mb-2">Rating</h3>
                            <select
                                value={filters.rating || ""}
                                onChange={e =>
                                    setFilters(prev => ({
                                        ...prev,
                                        rating: e.target.value
                                            ? parseInt(e.target.value)
                                            : ""
                                    }))
                                }
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="">Select Rating</option>
                                {[5, 4, 3, 2, 1].map(star => (
                                    <option key={star} value={star}>
                                        {star}⭐ & Up
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Featured Only */}
                        {/* <div className="mb-4">
                            <label className="flex items-center gap-2 text-gray-700 text-sm">
                                <input
                                    type="checkbox"
                                    checked={filters.featured}
                                    onChange={e => setFilters(prev => ({ ...prev, featured: e.target.checked }))}
                                    className="w-4 h-4"
                                />
                                Featured Only
                            </label>
                        </div> */}

                        {/* Sort */}
                        <div>
                            <h3 className="font-semibold text-gray-700 mb-2">Sort By</h3>
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="">Select</option>
                                <option value="newest">Newest First</option>
                                <option value="top_rated">Top Rated</option>
                                {/* <option value="price_low">Price: Low to High</option> */}
                                {/* <option value="price_high">Price: High to Low</option> */}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Services Grid */}
                <div className="flex-1">
                    {filteredServices.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
                            <div className="text-gray-400 text-5xl mb-3">❌</div>
                            <h3 className="text-xl font-bold text-gray-700 mb-2">No Services Found</h3>
                            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredServices.map(service => (
                                <div
                                    key={service.id}
                                    className="bg-white border-2 border-blue-500 rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 cursor-pointer w-full flex flex-col overflow-hidden h-[400px]"
                                >
                                    <div className="relative w-full h-56 md:h-64 lg:h-72">
                                        <img
                                            src={service.main_image}
                                            alt={service.business_name}
                                            className="w-full h-full object-cover rounded-t-2xl"
                                            onClick={() => navigateToServiceDetail(service.id, service.subcategory)}
                                        />
                                    </div>

                                    <div className="p-4 flex-1 flex flex-col justify-between">
                                        <div>
                                            {/* Business Name */}
                                            <p className="text-gray-900 font-bold text-lg md:text-xl truncate">
                                                {service.business_name}
                                            </p>

                                            {/* Location */}
                                            <p className="text-gray-500 text-sm md:text-base flex items-center mt-1 truncate">
                                                <FaMapMarkerAlt className="mr-2 text-red-600 flex-shrink-0" />
                                                <span>{service.address}</span>
                                            </p>

                                            {/* Add space before rating */}
                                            <div className="mt-2 flex items-center gap-1">
                                                <div className="flex items-center gap-2">
                                                    {Array(5)
                                                        .fill(0)
                                                        .map((_, i) => (
                                                            <FaStar key={i} className="text-yellow-500" />
                                                        ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            {service.contact_no && (
                                                <a
                                                    href={`tel:${service.contact_no}`}
                                                    className="flex-1 text-center bg-orange-500 text-white font-medium py-2 rounded-md hover:bg-orange-600 transition"
                                                >
                                                    Call Now
                                                </a>
                                            )}
                                            <button
                                                onClick={() => openInquiryModal(service)}
                                                className="flex-1 text-center bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 transition"
                                            >
                                                Inquiry
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {showModal && modalService && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={closeInquiryModal}
                >
                    <div
                        className="bg-white rounded-xl shadow-xl w-11/12 max-w-md overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-blue-600 text-white text-lg font-semibold px-5 py-3 flex justify-between items-center">
                            Inquiry Form
                            <button
                                className="text-white text-2xl"
                                onClick={closeInquiryModal}
                            >
                                &times;
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5">
                            <InquiryForm
                                serviceData={modalService}
                                onClose={closeInquiryModal}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const InquiryForm = ({ serviceData, prefillMessage, onClose }) => {
    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        city: "",
        message: prefillMessage || "",
    });

    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewText, setReviewText] = useState("");
    const [reviewRating, setReviewRating] = useState(5);

    // ✅ SINGLE model mapping (important)
    const modelMap = {
        gym: "gymservice",
        salon: "saloonservice",
        travel_agency: "travelagencyservice",
        hotel : "hotelservice",
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const vendorId = serviceData?.vendor?.id || serviceData?.vendor;
        const category =
            serviceData?.category || serviceData?.service_category;
        const serviceId = serviceData?.id;

        if (!vendorId || !category || !serviceId) {
            setErrorMsg("Service information missing.");
            return;
        }

        setSubmitting(true);
        setErrorMsg("");
        setSuccessMsg("");

        try {
            // ✅ 1. Submit Inquiry
            const payload = {
                service_category: category,
                vendor: vendorId,
                service_id: serviceId,
                service_url: window.location.href,
                service_name: serviceData?.business_name,
                customer_name: form.name,
                customer_phone: form.phone,
                customer_email: form.email,
                customer_city: form.city,
                subject: `Inquiry about ${serviceData?.business_name}`,
                message: form.message,
            };

            const response = await publicAxios.post(
                "/api/public/inquiries/",
                payload
            );

            if (response.status !== 201) {
                throw new Error("Inquiry failed");
            }

            // ✅ 2. Check Review
            const model = modelMap[category];

            if (!model) {
                setSuccessMsg("Inquiry submitted successfully!");
                setTimeout(() => onClose(), 1200);
                return;
            }

            const reviewCheck = await axiosInstance.get(
                `/api/reviews/?model=${model}&object_id=${serviceId}`
            );

            if (reviewCheck.data.has_reviewed) {
                // ❌ Already reviewed → don't show review form
                setSuccessMsg(" Inquiry submitted!");
                setTimeout(() => onClose(), 1200);
            } else {
                const token = localStorage.getItem("customer_token");

                if (token) {
                    setShowReviewForm(true);
                } else {
                    setSuccessMsg(" Inquiry submitted!");
                    setTimeout(() => onClose(), 1200);
                }
            }

        } catch (err) {
            console.error(err);
            setErrorMsg("❌ Failed to submit inquiry.");
        } finally {
            setSubmitting(false);
        }
    };

    const submitReview = async () => {
        try {
            const token = localStorage.getItem("customer_token");

            if (!token) {
                alert("Login required");
                return;
            }

            const category =
                serviceData?.category || serviceData?.service_category;

            const serviceId = serviceData?.id;

            const model = modelMap[category];

            if (!model) {
                alert("Invalid service type");
                return;
            }

            await axiosInstance.post("/api/add-review/", {
                model,
                object_id: serviceId,
                rating: Number(reviewRating),
                review: reviewText,
            });

            alert("Review Added Successfully!");
            onClose();

        } catch (err) {
            console.log(err);

            if (err.response?.data?.error === "Already reviewed") {
                alert("You already reviewed this service");
                onClose();
            } else {
                alert("Error submitting review");
            }
        }
    };

    return (
        <div className="bg-white rounded-lg">

            {successMsg && (
                <div className="mb-3 p-2 bg-green-100 text-green-700 rounded text-sm">
                    {successMsg}
                </div>
            )}

            {errorMsg && (
                <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm">
                    {errorMsg}
                </div>
            )}

            {!showReviewForm ? (
                <form onSubmit={handleSubmit} className="space-y-3 text-sm">
                    <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">Your Name</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                    <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">Your Phone</label>
                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone Number"
                        required
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                    <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">Your Email</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                    <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">Your City</label>
                    <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={form.city}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                    <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">Add description</label>
                    <textarea
                        name="message"
                        rows="3"
                        placeholder="Message"
                        value={form.message}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-blue-600 text-white py-2 rounded"
                    >
                        {submitting ? "Submitting..." : "Send Inquiry"}
                    </button>

                </form>
            ) : (
                <div className="mt-3 space-y-3">
                    <h3 className="font-semibold">Leave a Review</h3>
                    <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">add review rating</label>
                    <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                                key={star}
                                onClick={() => setReviewRating(star)}
                                className={`w-6 h-6 cursor-pointer transition 
                                    ${reviewRating >= star
                                        ? "text-yellow-400"
                                        : "text-gray-300"}`}
                            />
                        ))}
                    </div>
                    <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">Add descriptions</label>
                    <textarea
                        rows="3"
                        placeholder="Write your review..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                    />

                    <button
                        onClick={submitReview}
                        className="w-full bg-green-600 text-white py-2 rounded"
                    >
                        Submit Review
                    </button>
                </div>
            )}
        </div>
    );
};
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  FiSearch, 
  FiStar, 
  FiShoppingBag, 
  FiUsers, 
  FiMapPin, 
  FiAward,
  FiFilter,
  FiChevronDown,
  FiCheckCircle,
  FiClock,
  FiX
} from "react-icons/fi";
import { publicAxios } from "../api/axios";
import MobileSellerListPage from "./mobile/MobileSellerList";

const FilterSection = ({ title, children, isExpanded = true }) => {
    const [expanded, setExpanded] = useState(isExpanded);
    return (
        <div className="border-b border-gray-200 py-4 last:border-b-0">
            <button
                className="w-full flex justify-between items-center text-left font-semibold text-gray-800 hover:text-blue-600 transition"
                onClick={() => setExpanded(!expanded)}
            >
                {title}
                <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${expanded ? "rotate-180" : "rotate-0"}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expanded ? "max-h-96 pt-3" : "max-h-0"}`}>
                {children}
            </div>
        </div>
    );
};

const FilterList = ({ children, isScrollable = false }) => (
    <ul className={`space-y-2 text-sm text-gray-700 ${isScrollable ? 'max-h-64 overflow-y-auto pr-2 custom-scrollbar' : ''}`}>
        {children}
    </ul>
);

// Mobile Filter Sidebar - ProductList page jaisa
const MobileFilterSidebar = ({
    isOpen,
    onClose,
    vendors,
    filters,
    setFilters,
    onApplyFilters
}) => {

    const states = useMemo(() => {
        const stateList = [...new Set(vendors.map(v => v.state).filter(Boolean))];
        return stateList;
    }, [vendors]);

    return (
        <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className={`fixed right-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FiFilter className="h-5 w-5" />
                            Filters
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-blue-500 rounded-full text-white transition"
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">

                        <FilterSection title="Location">
                            <FilterList isScrollable={true}>
                                {states.map(state => (
                                    <li key={state} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            className="rounded text-blue-600 border-gray-300 focus:ring-blue-500 w-4 h-4"
                                            id={`mobile-state-${state}`}
                                        />
                                        <label htmlFor={`mobile-state-${state}`} className="cursor-pointer">{state}</label>
                                    </li>
                                ))}
                            </FilterList>
                        </FilterSection>

                        <FilterSection title="Rating">
                            <FilterList>
                                {[4, 3, 2, 1].map(rating => (
                                    <li key={rating} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="mobile-rating"
                                            className="rounded-full text-blue-600 border-gray-300 focus:ring-blue-500 w-4 h-4"
                                            id={`mobile-rating-${rating}`}
                                        />
                                        <label htmlFor={`mobile-rating-${rating}`} className="cursor-pointer flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <FiStar key={i} className={`h-3 w-3 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                            ))}
                                            <span className="ml-1 text-xs text-gray-500">& Up</span>
                                        </label>
                                    </li>
                                ))}
                            </FilterList>
                        </FilterSection>
                    </div>

                    <div className="p-4 border-t bg-gray-50">
                        <button
                            onClick={onApplyFilters}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VendorCard = ({ vendor }) => {
    const [imageError, setImageError] = useState(false);

    const getFallbackIcon = (vendorName) => {
        const iconMap = {
            "tech": "💻",
            "fashion": "👗", 
            "electronic": "📱",
            "home": "🏠",
            "sports": "⚽",
            "beauty": "💄",
            "food": "🍕",
            "book": "📚",
            "auto": "🚗",
            "health": "🏥"
        };

        const nameLower = vendorName.toLowerCase();
        for (const [key, icon] of Object.entries(iconMap)) {
            if (nameLower.includes(key)) {
                return icon;
            }
        }
        return "🏪";
    };

    const getFullImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `https://api.initcart.in${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    };

    return (
        <Link to={`/vendor/${vendor.id}`} className="group block h-full">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300 h-full flex flex-col overflow-hidden">
                {/* Header with gradient background */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 relative">
                    {/* Logo */}
                    <div className="absolute -bottom-8 left-4">
                        <div className="relative">
                            {!imageError && vendor.store_logo ? (
                                <img
                                    src={getFullImageUrl(vendor.store_logo)}
                                    alt={vendor.business_name}
                                    className="w-16 h-16 rounded-xl object-cover border-4 border-white shadow-lg"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-3xl">
                                    {getFallbackIcon(vendor.business_name)}
                                </div>
                            )}
                            
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 pt-10 flex-1">
                    {/* Business Name & Type */}
                    <div className="mb-3">
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-base sm:text-lg line-clamp-1">
                            {vendor.business_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                {vendor.vendor_type || 'General'}
                            </span>
                            {vendor.vendor_subtype && (
                                <span className="text-xs text-gray-500">
                                    • {vendor.vendor_subtype}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <FiStar
                                    key={i}
                                    className={`h-3 w-3 ${i < Math.floor(vendor.rating || 4) 
                                        ? 'text-yellow-400 fill-yellow-400' 
                                        : 'text-gray-300'}`}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-gray-600 ml-1">
                            ({vendor.review_count || 0} reviews)
                        </span>
                    </div>

                    {/* Owner & Location */}
                    <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <FiUsers className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{vendor.owner_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <FiMapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{vendor.city}, {vendor.state}</span>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100">
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-center gap-1 text-blue-600 font-semibold text-sm">
                                <FiShoppingBag className="h-3.5 w-3.5" />
                                <span>{vendor.product_count || 0}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-0.5">Products</p>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded-lg">
                            <div className="flex items-center justify-center gap-1 text-green-600 font-semibold text-sm">
                                <FiAward className="h-3.5 w-3.5" />
                                <span>{vendor.order_count || 0}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-0.5">Orders</p>
                        </div>
                    </div>

                    {/* View Store Button */}
                    <div className="mt-3">
                        <div className="text-center text-xs font-medium text-blue-600 group-hover:text-blue-700 transition">
                            View Store →
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default function SellerListPage() {
    const [search, setSearch] = useState("");
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        vendor_type: '',
        status: 'active'
    });
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);

    // Check mobile view on resize
    useEffect(() => {
        const checkMobileView = () => {
            setIsMobileView(window.innerWidth < 768);
        };

        checkMobileView();
        window.addEventListener('resize', checkMobileView);

        return () => {
            window.removeEventListener('resize', checkMobileView);
        };
    }, []);

    // Load sample vendors function
    const loadSampleVendors = () => {
        const sampleVendors = [
            {
                id: 1,
                business_name: "TechWorld Solutions",
                owner_name: "Rajesh Kumar",
                email: "rajesh@techworld.com",
                phone: "+91 98765 43210",
                vendor_type: "electronics",
                vendor_subtype: "Consumer Electronics",
                store_logo: null,
                city: "Mumbai",
                state: "Maharashtra",
                status: "active",
                is_approved: true,
                product_count: 0,
                order_count: 1280,
                rating: 4.5,
                review_count: 234
            },
            {
                id: 2,
                business_name: "Fashion Hub",
                owner_name: "Priya Sharma",
                email: "priya@fashionhub.com",
                phone: "+91 98765 43211",
                vendor_type: "fashion",
                vendor_subtype: "Clothing",
                store_logo: null,
                city: "Delhi",
                state: "Delhi",
                status: "active",
                is_approved: true,
                product_count: 0,
                order_count: 3450,
                rating: 4.3,
                review_count: 567
            },
            {
                id: 3,
                business_name: "Home Essentials",
                owner_name: "Amit Patel",
                email: "amit@homeessentials.com",
                phone: "+91 98765 43212",
                vendor_type: "home",
                vendor_subtype: "Furniture",
                store_logo: null,
                city: "Bangalore",
                state: "Karnataka",
                status: "active",
                is_approved: true,
                product_count: 0,
                order_count: 890,
                rating: 4.7,
                review_count: 123
            },
            {
                id: 4,
                business_name: "Sports Pro",
                owner_name: "Vikram Singh",
                email: "vikram@sportspro.com",
                phone: "+91 98765 43213",
                vendor_type: "sports",
                vendor_subtype: "Sports Equipment",
                store_logo: null,
                city: "Chennai",
                state: "Tamil Nadu",
                status: "active",
                is_approved: true,
                product_count: 0,
                order_count: 567,
                rating: 4.2,
                review_count: 89
            }
        ];
        setVendors(sampleVendors);
    };

    // Fetch vendors from API
    const fetchVendors = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await publicAxios.get("/ecommerce/public/vendors/");
            
            if (response.data && Array.isArray(response.data)) {
                const activeVendors = response.data.filter(vendor => 
                    vendor.status === 'active' && vendor.is_approved === true
                ).map(vendor => ({
                    id: vendor.id,
                    business_name: vendor.business_name,
                    owner_name: vendor.owner_name,
                    email: vendor.email,
                    phone: vendor.phone,
                    vendor_type: vendor.vendor_type,
                    vendor_subtype: vendor.vendor_subtype,
                    store_logo: vendor.store_logo_url || vendor.store_logo,
                    city: vendor.city,
                    state: vendor.state,
                    status: vendor.status,
                    is_approved: vendor.is_approved,
                    product_count: vendor.product_count || 0,
                    order_count: vendor.order_count || Math.floor(Math.random() * 100) + 20,
                    rating: vendor.rating || 4.5,
                    review_count: vendor.review_count || 128
                }));
                
                setVendors(activeVendors);
            } else {
                loadSampleVendors();
            }
        } catch (err) {
            console.error("❌ Error fetching vendors:", err);
            setError("Failed to load vendors. Showing sample data.");
            loadSampleVendors();
        } finally {
            setLoading(false);
        }
    };

    // Filter vendors based on search
    const filteredVendors = useMemo(() => {
        return vendors.filter(vendor => {
            const searchLower = search.toLowerCase();
            return vendor.business_name.toLowerCase().includes(searchLower) ||
                   vendor.owner_name.toLowerCase().includes(searchLower) ||
                   vendor.vendor_subtype?.toLowerCase().includes(searchLower) ||
                   vendor.city?.toLowerCase().includes(searchLower);
        });
    }, [search, vendors]);

    // Fetch vendors on component mount
    useEffect(() => {
        fetchVendors();
    }, []);

    if (isMobileView) return <MobileSellerListPage />;

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        <aside className="hidden md:block md:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-fit self-start">
                            <div className="animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="mb-4">
                                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                    </div>
                                ))}
                            </div>
                        </aside>

                        <div className="md:col-span-3 lg:col-span-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                                        <div className="h-24 bg-gray-200 rounded-t-xl -mt-4 -mx-4 mb-4"></div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                            <div className="flex-1">
                                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                                            <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
                .line-clamp-1 {
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>

            {/* Mobile Filter Sidebar */}
            <MobileFilterSidebar
                isOpen={showMobileFilters}
                onClose={() => setShowMobileFilters(false)}
                vendors={vendors}
                filters={filters}
                setFilters={setFilters}
                onApplyFilters={() => setShowMobileFilters(false)}
            />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {/* Desktop Filters Sidebar */}
                    <aside className="hidden md:block md:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-fit self-start sticky top-6">
                        <h3 className="font-bold text-lg mb-6 text-gray-800 border-b pb-3 flex items-center gap-2">
                            <FiFilter className="h-4 w-4 text-blue-600" />
                            Filter Vendors
                        </h3>

                        <FilterSection title="Location">
                            <FilterList isScrollable={true}>
                                {Array.from(new Set(vendors.map(v => v.state).filter(Boolean))).map(state => (
                                    <li key={state} className="flex items-center justify-between py-1">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="rounded text-blue-600 border-gray-300 focus:ring-blue-500 w-4 h-4"
                                                id={`state-${state}`}
                                            />
                                            <label htmlFor={`state-${state}`} className="cursor-pointer">{state}</label>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            ({vendors.filter(v => v.state === state).length})
                                        </span>
                                    </li>
                                ))}
                            </FilterList>
                        </FilterSection>

                        <FilterSection title="Rating">
                            <FilterList>
                                {[4, 3, 2, 1].map(rating => (
                                    <li key={rating} className="flex items-center gap-2 py-1">
                                        <input
                                            type="radio"
                                            name="rating"
                                            className="rounded-full text-blue-600 border-gray-300 focus:ring-blue-500 w-4 h-4"
                                            id={`rating-${rating}`}
                                        />
                                        <label htmlFor={`rating-${rating}`} className="cursor-pointer flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <FiStar key={i} className={`h-3 w-3 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                            ))}
                                            <span className="ml-1 text-xs text-gray-500">& Up</span>
                                        </label>
                                    </li>
                                ))}
                            </FilterList>
                        </FilterSection>
                    </aside>

                    {/* Main Content */}
                    <div className="md:col-span-3 lg:col-span-4">
                        {/* Search Header */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                                <div className="text-sm font-medium text-gray-600 order-2 md:order-1 whitespace-nowrap w-full md:w-auto">
                                    <span className="font-bold text-gray-900">{filteredVendors.length}</span> Trusted Vendors
                                </div>

                                <div className="flex items-center gap-3 w-full order-1 md:order-2">
                                    {/* Mobile Filter Button */}
                                    <button
                                        onClick={() => setShowMobileFilters(true)}
                                        className="md:hidden border border-gray-300 rounded-lg py-2 px-4 text-sm hover:bg-gray-50 transition flex items-center gap-2 flex-shrink-0"
                                    >
                                        <FiFilter className="h-4 w-4" />
                                        <span className="hidden xs:inline">Filters</span>
                                    </button>

                                    {/* Search Bar */}
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            placeholder="Search vendors by name, owner, or location..."
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            className="w-full border border-gray-300 rounded-xl py-2.5 pl-4 pr-12 text-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <button className="absolute right-0 top-0 bottom-0 px-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-r-xl text-white hover:from-blue-600 hover:to-blue-700 transition">
                                            <FiSearch className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center">
                                    <FiClock className="w-5 h-5 text-yellow-500 mr-2" />
                                    <span className="text-yellow-700 text-sm">{error}</span>
                                </div>
                            </div>
                        )}

                        {/* Vendors Grid */}
                        {filteredVendors.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
                                <div className="text-6xl mb-4">🏪</div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    No Vendors Found
                                </h3>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                    {search ? `No vendors found matching "${search}". Try a different search term.` 
                                           : "There are no vendors available at the moment."}
                                </p>
                                <button
                                    onClick={fetchVendors}
                                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition font-medium shadow-lg"
                                >
                                    Refresh Vendors
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {filteredVendors.map(vendor => (
                                    <VendorCard key={vendor.id} vendor={vendor} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
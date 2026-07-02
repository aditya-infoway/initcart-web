//CategoryProductsPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { publicAxios } from "../api/axios";
import { Filter, ChevronRight, Zap, Tag, Eye } from "lucide-react"; // Add these imports
import { FiClock } from "react-icons/fi"; // Add this import
import MobileCategoryProductsPage from "./mobile/MobileCategoryProductsPage";

const MIN_PRICE = 0;
const MAX_PRICE = Number.MAX_SAFE_INTEGER;

const StarRating = ({ rating }) => (
    <span className="text-yellow-500 flex items-center">
        {Array(5)
            .fill(0)
            .map((_, i) => (
                <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill={i < rating ? "currentColor" : "none"}
                    stroke={i < rating ? "none" : "currentColor"}
                    strokeWidth="1.5"
                    className="w-3 h-3"
                >
                    <path
                        fillRule="evenodd"
                        d="M10.868 2.884c.325-.795 1.48-.795 1.805 0l1.931 4.707 5.176.425c.801.066 1.129 1.055.518 1.574l-3.922 3.23.957 5.063c.15.795-.658 1.455-1.378 1.014L10 16.03l-4.717 2.842c-.72.441-1.528-.219-1.378-1.014l.957-5.063-3.922-3.23c-.611-.519-.283-1.508.518-1.574l5.176-.425 1.931-4.707z"
                        clipRule="evenodd"
                    />
                </svg>
            ))}
    </span>
);

const FilterSection = ({ title, children, isExpanded = true }) => {
    const [expanded, setExpanded] = useState(isExpanded);

    return (
        <div className="border-b border-gray-200 py-4 last:border-b-0">
            <button
                className="w-full flex justify-between items-center text-left font-semibold text-gray-800 hover:text-blue-600 transition"
                onClick={() => setExpanded(!expanded)}
            >
                {title}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${expanded ? "rotate-180" : "rotate-0"
                        }`}
                >
                    <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>
            <div
                className={`overflow-hidden transition-max-height duration-500 ease-in-out ${expanded ? "max-h-96 pt-3" : "max-h-0"
                    }`}
            >
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

const PriceRangeFilter = ({ minPrice, maxPrice, setMinPrice, setMaxPrice }) => {
    const STEP = 100;

    const [minInput, setMinInput] = useState(minPrice.toString());
    const [maxInput, setMaxInput] = useState(maxPrice.toString());

    useEffect(() => {
        setMinInput(minPrice.toString());
    }, [minPrice]);

    useEffect(() => {
        setMaxInput(maxPrice.toString());
    }, [maxPrice]);

    const rangeProgress = useMemo(() => {
        const total = MAX_PRICE - MIN_PRICE;
        const start = ((minPrice - MIN_PRICE) / total) * 100;
        const end = ((maxPrice - MIN_PRICE) / total) * 100;
        return { start, end };
    }, [minPrice, maxPrice]);

    const handleRangeChange = (e, type) => {
        const value = Number(e.target.value);
        if (type === 'min') {
            const newMin = Math.min(value, maxPrice);
            setMinPrice(newMin);
        } else {
            const newMax = Math.max(value, minPrice);
            setMaxPrice(newMax);
        }
    };

    const handleInputChange = (e, type) => {
        const value = e.target.value.replace(/[^0-9]/g, '');

        if (type === 'min') {
            setMinInput(value);
        } else {
            setMaxInput(value);
        }

        const numberValue = Number(value);

        if (!isNaN(numberValue) && e.type === 'blur') {
            if (type === 'min') {
                let newMin = Math.round(Math.max(MIN_PRICE, numberValue) / STEP) * STEP;
                newMin = Math.min(newMin, maxPrice);
                setMinPrice(newMin);
            } else {
                let newMax = Math.round(Math.min(MAX_PRICE, numberValue) / STEP) * STEP;
                newMax = Math.max(newMax, minPrice);
                setMaxPrice(newMax);
            }
        }
    };

    return (
        <div className="mt-4">
            <div className="flex justify-between gap-4 mb-4">
                <div className="flex flex-col flex-1">
                    <label htmlFor="min-price-text" className="text-xs text-gray-500 mb-1">Min Price</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">₹</span>
                        <input
                            id="min-price-text"
                            type="text"
                            value={minInput}
                            onChange={(e) => handleInputChange(e, 'min')}
                            onBlur={(e) => handleInputChange(e, 'min')}
                            className="w-full border border-gray-300 rounded-lg py-2 pl-6 pr-3 text-sm focus:ring-blue-500 focus:border-blue-500 transition"
                            inputMode="numeric"
                        />
                    </div>
                </div>
                <div className="flex flex-col flex-1">
                    <label htmlFor="max-price-text" className="text-xs text-gray-500 mb-1">Max Price</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">₹</span>
                        <input
                            id="max-price-text"
                            type="text"
                            value={maxInput}
                            onChange={(e) => handleInputChange(e, 'max')}
                            onBlur={(e) => handleInputChange(e, 'max')}
                            className="w-full border border-gray-300 rounded-lg py-2 pl-6 pr-3 text-sm focus:ring-blue-500 focus:border-blue-500 transition"
                            inputMode="numeric"
                        />
                    </div>
                </div>
            </div>
            <div className="relative h-2 rounded-full bg-gray-200">
                <div
                    className="absolute h-2 w-4 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full "
                    style={{
                        left: `${rangeProgress.start}%`,
                        width: `${rangeProgress.end - rangeProgress.start}%`,
                    }}
                ></div>

                <div
                    className="absolute w-4 h-4 rounded-full bg-blue-600 -top-1 shadow-md border-2 border-white pointer-events-none"
                    style={{
                        left: `${rangeProgress.start}%`,
                        transform: 'translateX(-50%)',
                        zIndex: 10,
                    }}
                ></div>

                <input
                    type="range"
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    step={STEP}
                    value={minPrice}
                    onChange={(e) => handleRangeChange(e, 'min')}
                    className="absolute w-full appearance-none bg-transparent pointer-events-none"
                    style={{ zIndex: 4 }}
                />

                <input
                    type="range"
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    step={STEP}
                    value={maxPrice}
                    onChange={(e) => handleRangeChange(e, 'max')}
                    className="absolute w-full appearance-none bg-transparent pointer-events-none"
                    style={{ zIndex: 3 }}
                />
            </div>

            <style>{`
                input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px; 
                    height: 16px;
                    border-radius: 50%;
                    background: transparent;
                    cursor: pointer;
                    margin-top: -7px; 
                    pointer-events: all;
                    box-shadow: none;
                }
                
                input[type=range]::-moz-range-thumb {
                    width: 16px; 
                    height: 16px;
                    border-radius: 50%;
                    background: transparent;
                    cursor: pointer;
                    pointer-events: all;
                    box-shadow: none;
                    border: none;
                }
                
                input[type=range]:hover::-webkit-slider-thumb {
                    background: rgba(37, 99, 235, 0.1); 
                }
            `}</style>
        </div>
    );
};

const MobileFilterSidebar = ({
    isOpen,
    onClose,
    minPrice,
    maxPrice,
    setMinPrice,
    setMaxPrice,
    categories,
    selectedCategories,
    setSelectedCategories,
    brands,
    selectedBrands,
    setSelectedBrands,
    onApplyFilters
}) => {
    return (
        <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
            ></div>

            <div className={`fixed right-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            ✗
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        <FilterSection title="Price Range">
                            <PriceRangeFilter
                                minPrice={minPrice}
                                maxPrice={maxPrice}
                                setMinPrice={setMinPrice}
                                setMaxPrice={setMaxPrice}
                            />
                        </FilterSection>

                        {categories.length > 0 && (
                            <FilterSection title="Categories">
                                <FilterList isScrollable={true}>
                                    {categories.map(category => (
                                        <li key={category.id} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="rounded text-blue-600 border-gray-300 focus:ring-blue-500 w-4 h-4"
                                                id={`mobile-category-${category.id}`}
                                                checked={selectedCategories.includes(category.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedCategories([...selectedCategories, category.id]);
                                                    } else {
                                                        setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                                                    }
                                                }}
                                            />
                                            <label htmlFor={`mobile-category-${category.id}`} className="cursor-pointer">
                                                {category.name} ({category.product_count || 0})
                                            </label>
                                        </li>
                                    ))}
                                </FilterList>
                            </FilterSection>
                        )}

                        {brands.length > 0 && (
                            <FilterSection title="Brands">
                                <FilterList isScrollable={true}>
                                    {brands.map(brand => (
                                        <li key={brand.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="rounded text-blue-600 border-gray-300 focus:ring-blue-500 w-4 h-4"
                                                    id={`mobile-brand-${brand.id}`}
                                                    checked={selectedBrands.includes(brand.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedBrands([...selectedBrands, brand.id]);
                                                        } else {
                                                            setSelectedBrands(selectedBrands.filter(id => id !== brand.id));
                                                        }
                                                    }}
                                                />
                                                <label htmlFor={`mobile-brand-${brand.id}`} className="cursor-pointer">{brand.brand_name}</label>
                                            </div>
                                            <span className="text-xs text-gray-500">({brand.product_count || 0})</span>
                                        </li>
                                    ))}
                                </FilterList>
                            </FilterSection>
                        )}
                    </div>

                    <div className="p-4 border-t">
                        <button
                            onClick={onApplyFilters}
                            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                            Apply Filters ({selectedCategories.length + selectedBrands.length})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Product Card Component (same as before, just using publicAxios)
const ProductCard = ({ product }) => {
    const navigate = useNavigate();

    // 👇 Add countdown state
    const [countdown, setCountdown] = useState(null);
    const getDisplayImage = () => {
        // 1️⃣ Variant image first priority
        if (product.stocks && product.stocks.length > 0) {
            const variantImage = product.stocks[0]?.variant_image;
            if (variantImage) {
                return getImageUrl(variantImage);
            }
        }

        // 2️⃣ Fallback to main image
        if (product.main_image) {
            return getImageUrl(product.main_image);
        }

        // 3️⃣ Fallback to thumbnail
        if (product.thumbnail_image) {
            return getImageUrl(product.thumbnail_image);
        }

        return "https://placehold.co/300x300/f0f4f8/94a3b8?text=No+Image";
    };
    // 👇 Add countdown effect for ALL campaign types
    useEffect(() => {
        if (!product?.is_in_campaign || !product?.campaign_details?.end_datetime) {
            return;
        }

        const timer = setInterval(() => {
            const endTime = new Date(product.campaign_details.end_datetime).getTime();
            const now = new Date().getTime();
            const distance = endTime - now;

            if (distance <= 0) {
                setCountdown(null);
                clearInterval(timer);
                return;
            }

            // const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setCountdown({ hours, minutes, seconds });
        }, 500);

        return () => clearInterval(timer);
    }, [product]);

    // ✅ Get product price with campaign support
    const getProductPrice = () => {
        // First check if product is in campaign
        if (product.is_in_campaign && product.campaign_price) {
            return product.campaign_price;
        }

        // Fallback to regular price from stocks
        if (product.stocks && product.stocks.length > 0) {
            const stock = product.stocks[0];
            return stock.final_price > 0 ? stock.final_price : stock.selling_price;
        }

        // Agar stock nahi hai toh min_price use karo
        if (product.min_price && product.min_price > 0) {
            return product.min_price;
        }

        return product.price || 0;
    };

    // ✅ Get old price with campaign support
    const getOldPrice = () => {
        // If in campaign, use campaign's original price
        if (product.is_in_campaign && product.campaign_details?.original_price) {
            return product.campaign_details.original_price;
        }

        // Fallback to regular price
        if (product.stocks && product.stocks.length > 0) {
            return product.stocks[0].mrp || 0;
        }
        return product.old_price || 0;
    };

    // ✅ Get discount percentage
    const getDiscountPercentage = () => {
        // If in campaign, use campaign discount
        if (product.is_in_campaign && product.campaign_details?.discount_percentage) {
            return product.campaign_details.discount_percentage;
        }

        // Calculate from original prices
        const currentPrice = getProductPrice();
        const oldPrice = getOldPrice();
        if (oldPrice > currentPrice && oldPrice > 0) {
            return Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
        }
        return 0;
    };

    // ✅ Get campaign badge
    const getCampaignBadge = () => {
        if (!product.is_in_campaign) return null;
        const campaignType = product.campaign_details?.campaign_type;

        let badgeText = "";
        let icon = null;

        switch (campaignType) {
            case 'Flash':
                badgeText = "FLASH";
                break;
            case 'Deal of the Day':
                badgeText = "DEAL OF THE DAY";
                break;
            case 'Featured':
                badgeText = "FEATURED";
                break;
            default:
                return null;
        }

        return (
            <div className="absolute top-2 left-2 z-10">
                <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg flex items-center gap-1">
                    {badgeText}
                </div>
            </div>
        );
    };

    // ✅ Get countdown display
    const getCountdownDisplay = () => {
        if (!product.is_in_campaign || !countdown) return null;

        // Agar campaign khatam hone wala hai (less than 30 minutes)
        const isEndingSoon = countdown.hours === 0 && countdown.minutes < 30;

        return (
            <div className={`mt-2 flex items-center justify-between ${isEndingSoon
                ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
                } px-3 py-1.5 rounded-lg text-xs`}>
                <div className="flex items-center gap-1">
                    <FiClock className={isEndingSoon ? "text-red-600" : "text-blue-600"} />
                    <span className="font-medium">Ends in:</span>
                </div>
                <div className="flex items-center gap-1 font-bold">
                    {/* {countdown.days > 0 && <span>{countdown.days}d</span>} */}
                    <span>{countdown.hours.toString().padStart(2, '0')}h</span>
                    <span>{countdown.minutes.toString().padStart(2, '0')}m</span>
                    <span className={isEndingSoon ? "animate-pulse" : ""}>{countdown.seconds.toString().padStart(2, '0')}s</span>
                </div>
            </div>
        );
    };

    const getImageUrl = (image) => {
        if (!image) return "https://placehold.co/300x300/f0f4f8/94a3b8?text=No+Image";
        if (image.startsWith('http')) return image;
        if (image.startsWith('/media/')) {
            return `https://api.initcart.in${image}`;
        }
        return `https://api.initcart.in/media/${image}`;
    };
    const price = Number(getProductPrice()) || 0;
    const oldPrice = Number(getOldPrice()) || 0;
    const discount = getDiscountPercentage();

    return (
        <Link to={`/product/${product.id}`} className="block">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden h-full relative">
                {/* Campaign Badge */}
                {getCampaignBadge()}

                {/* Discount Badge - Show only if not in campaign */}
                {!product.is_in_campaign && discount > 0 && (
                    <div className="absolute top-2 left-2 z-10">
                        <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
                            {discount}% OFF
                        </div>
                    </div>
                )}

                <div className="relative h-48 bg-gray-100">
                    <img
                        src={getDisplayImage()}
                        alt={product.product_name}
                        className="w-full h-full object-contain p-2"
                    />
                </div>

                <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-800 overflow-x-auto h-full">
                        {product.product_name}
                    </h3>

                    {/* Price Section */}
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gray-900">₹{price.toFixed(2)}</span>
                        {oldPrice > price && (
                            <span className="text-sm text-gray-500 line-through">₹{oldPrice.toFixed(2)}</span>
                        )}
                    </div>


                    {/* Countdown Display */}
                    {getCountdownDisplay()}

                    <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-gray-600">
                            {product.vendor_details?.business_name || 'Vendor'}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${product.in_stock
                            ? 'text-green-600 bg-green-100'
                            : 'text-red-600 bg-red-100'
                            }`}>
                            {product.in_stock ? 'In Stock' : 'Out of Stock'}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

const CategoryProductsPage = () => {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);

    const categoryId = queryParams.get("category");
    const subcategoryId = queryParams.get("subcategory");
    const subsubcategoryId = queryParams.get("subsubcategory");

    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categoryInfo, setCategoryInfo] = useState(null);
    const [subcategoryInfo, setSubcategoryInfo] = useState(null);
    const [subsubcategoryInfo, setSubsubcategoryInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [priceRange, setPriceRange] = useState([0, Number.MAX_SAFE_INTEGER]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

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

    // Fetch data based on URL parameters
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Build query parameters
                const params = {
                    status: "approved"
                };

                if (categoryId) params.category = categoryId;
                if (subcategoryId) params.subcategory = subcategoryId;
                if (subsubcategoryId) params.subsubcategory = subsubcategoryId;



                // Use category-products API instead of all products
                const productsResponse = await publicAxios.get("/ecommerce/public/category-products/", {
                    params: params
                });

                let productsData = [];

                // Handle different response formats
                if (Array.isArray(productsResponse.data)) {
                    productsData = productsResponse.data;
                } else if (productsResponse.data && Array.isArray(productsResponse.data.results)) {
                    productsData = productsResponse.data.results;
                } else if (productsResponse.data) {
                    productsData = [productsResponse.data];
                }



                setProducts(productsData);
                setFilteredProducts(productsData);

                // Fetch category info if categoryId is provided
                if (categoryId) {
                    try {
                        const categoriesResponse = await publicAxios.get("/ecommerce/public/categories/");
                        const allCategories = Array.isArray(categoriesResponse.data)
                            ? categoriesResponse.data
                            : [];

                        const category = allCategories.find(cat => cat.id == categoryId);
                        if (category) {
                            setCategoryInfo(category);
                        }
                        setCategories(allCategories);
                    } catch (err) {

                    }
                }

                // Fetch subcategory info if subcategoryId is provided
                if (subcategoryId) {
                    try {
                        const subcategoriesResponse = await publicAxios.get(
                            "/ecommerce/public/subcategories/"
                        );
                        const allSubcategories = Array.isArray(subcategoriesResponse.data)
                            ? subcategoriesResponse.data
                            : [];

                        const subcategory = allSubcategories.find(sub => sub.id == subcategoryId);
                        if (subcategory) {
                            setSubcategoryInfo(subcategory);
                        }
                    } catch (err) {

                    }
                }

                // Fetch subsubcategory info if subsubcategoryId is provided
                if (subsubcategoryId) {
                    try {
                        const subsubcategoriesResponse = await publicAxios.get(
                            "/ecommerce/public/subsubcategories/"
                        );
                        const allSubsubcategories = Array.isArray(subsubcategoriesResponse.data)
                            ? subsubcategoriesResponse.data
                            : [];

                        const subsubcategory = allSubsubcategories.find(subsub => subsub.id == subsubcategoryId);
                        if (subsubcategory) {
                            setSubsubcategoryInfo(subsubcategory);
                        }
                    } catch (err) {

                    }
                }

                // Fetch brands
                try {
                    const brandsResponse = await publicAxios.get("/ecommerce/public/brands/");
                    if (Array.isArray(brandsResponse.data)) {
                        setBrands(brandsResponse.data);
                    }
                } catch (err) {
                }

            } catch (err) {
                console.error("Error fetching data:", err);
                setError(`Failed to load products: ${err.message}`);
                setProducts([]);
                setFilteredProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [categoryId, subcategoryId, subsubcategoryId]);

    // Apply filters
    useEffect(() => {
        let filtered = [...products];

        filtered = filtered.filter(product => {
            let price = 0;

            if (product.stocks && product.stocks.length > 0) {
                const stock = product.stocks[0];
                price = stock.final_price > 0
                    ? stock.final_price
                    : stock.selling_price;
            } else if (product.min_price && product.min_price > 0) {
                price = product.min_price;
            }

            // 👇 IMPORTANT FIX
            if (
                priceRange[0] === 0 &&
                priceRange[1] === Number.MAX_SAFE_INTEGER
            ) {
                return true;
            }

            return price >= priceRange[0] && price <= priceRange[1];
        });

        // Apply brand filter
        if (selectedBrands.length > 0) {
            filtered = filtered.filter(product =>
                product.brand && selectedBrands.includes(product.brand.toString())
            );
        }

        // Apply category filter (if multiple categories selected)
        if (selectedCategories.length > 0) {
            filtered = filtered.filter(product =>
                product.category && selectedCategories.includes(product.category.toString())
            );
        }

        setFilteredProducts(filtered);
    }, [products, priceRange, selectedBrands, selectedCategories]);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    // Get page title
    const getPageTitle = () => {
        if (subsubcategoryInfo) return subsubcategoryInfo.name;
        if (subcategoryInfo) return subcategoryInfo.name;
        if (categoryInfo) return categoryInfo.name;
        return "Products";
    };

    // Get breadcrumb items
    const getBreadcrumbItems = () => {
        const items = [
            { name: "Home", path: "/" }
        ];

        if (categoryInfo) {
            items.push({
                name: categoryInfo.name,
                path: `/category-products?category=${categoryId}`
            });
        }

        if (subcategoryInfo) {
            items.push({
                name: subcategoryInfo.name,
                path: `/category-products?category=${categoryId}&subcategory=${subcategoryId}`
            });
        }

        if (subsubcategoryInfo) {
            items.push({
                name: subsubcategoryInfo.name,
                path: `/category-products?category=${categoryId}&subcategory=${subcategoryId}&subsubcategory=${subsubcategoryId}`
            });
        }

        return items;
    };

    // Get unique brands from products
    const getUniqueBrands = () => {
        const brandMap = {};
        products.forEach(product => {
            if (product.brand_details && product.brand_details.id) {
                const brandId = product.brand_details.id;
                const brandName = product.brand_details.brand_name;
                if (!brandMap[brandId]) {
                    brandMap[brandId] = {
                        id: brandId,
                        name: brandName,
                        count: 1
                    };
                } else {
                    brandMap[brandId].count++;
                }
            }
        });
        return Object.values(brandMap);
    };

    if (isMobile) {
        return <MobileCategoryProductsPage />;
    }
    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen font-inter">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="bg-white p-4 rounded-xl shadow-md border border-gray-200 animate-pulse h-full flex flex-col">
                                        <div className="h-48 bg-gray-200 rounded mb-3"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2 mt-auto"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
                <div className="text-center max-w-md mx-auto">

                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Products</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate("/")}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    const breadcrumbItems = getBreadcrumbItems();
    const uniqueBrands = getUniqueBrands();

    return (
        <div className="bg-gray-50 min-h-screen font-inter">
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
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>

            {/* Mobile Filter Sidebar */}
            <MobileFilterSidebar
                isOpen={showMobileFilters}
                onClose={() => setShowMobileFilters(false)}
                minPrice={priceRange[0]}
                maxPrice={priceRange[1]}
                setMinPrice={(min) => setPriceRange([min, priceRange[1]])}
                setMaxPrice={(max) => setPriceRange([priceRange[0], max])}
                categories={categories}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                brands={brands}
                selectedBrands={selectedBrands}
                setSelectedBrands={setSelectedBrands}
                onApplyFilters={() => setShowMobileFilters(false)}
            />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {/* Desktop Filters Sidebar */}
                    <aside className="hidden md:block md:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-fit self-start sticky top-6">
                        <h3 className="font-bold text-lg mb-6 text-gray-800 border-b pb-3">Filter By</h3>

                        <FilterSection title="Price Range">
                            <PriceRangeFilter
                                minPrice={priceRange[0]}
                                maxPrice={priceRange[1]}
                                setMinPrice={(min) => setPriceRange([min, priceRange[1]])}
                                setMaxPrice={(max) => setPriceRange([priceRange[0], max])}
                            />
                        </FilterSection>
                        {uniqueBrands.length > 0 && (
                            <FilterSection title="Brands">
                                <FilterList isScrollable={true}>
                                    {uniqueBrands.map(brand => (
                                        <li key={brand.id} className="flex items-center justify-between py-1">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="rounded text-blue-600 border-gray-300 focus:ring-blue-500 w-4 h-4"
                                                    id={`brand-${brand.id}`}
                                                    checked={selectedBrands.includes(brand.id.toString())}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedBrands([...selectedBrands, brand.id.toString()]);
                                                        } else {
                                                            setSelectedBrands(selectedBrands.filter(id => id !== brand.id.toString()));
                                                        }
                                                    }}
                                                />
                                                <label htmlFor={`brand-${brand.id}`} className="cursor-pointer">{brand.name}</label>
                                            </div>
                                            <span className="text-xs text-gray-500">({brand.count})</span>
                                        </li>
                                    ))}
                                </FilterList>
                            </FilterSection>
                        )}
                    </aside>

                    {/* Main Content */}
                    <div className="md:col-span-3 lg:col-span-4">
                        {/* Breadcrumb */}
                        <nav className="flex items-center text-sm text-gray-600 mb-6 flex-wrap">
                            {breadcrumbItems.map((item, index) => (
                                <div key={index} className="flex items-center">
                                    {index > 0 && <ChevronRight className="w-4 h-4 mx-2" />}
                                    {index === breadcrumbItems.length - 1 ? (
                                        <span className="font-medium text-gray-900">{item.name}</span>
                                    ) : (
                                        <Link
                                            to={item.path}
                                            className="hover:text-blue-600 transition"
                                        >
                                            {item.name}
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </nav>

                        {/* Page Header */}
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{getPageTitle()}</h1>
                            <p className="text-gray-600">
                                Showing {filteredProducts.length} of {products.length} products
                            </p>
                        </div>

                        {/* Applied Filters Display */}
                        {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
                            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-medium text-blue-800">Applied Filters</h4>
                                    <button
                                        onClick={() => {
                                            setSelectedCategories([]);
                                            setSelectedBrands([]);
                                        }}
                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Clear All
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedCategories.map(catId => {
                                        const category = categories.find(c => c.id === catId);
                                        return category && (
                                            <span key={catId} className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full flex items-center gap-1">
                                                {category.name}
                                                <button
                                                    onClick={() => setSelectedCategories(selectedCategories.filter(id => id !== catId))}
                                                    className="hover:text-blue-900"
                                                >
                                                    ✗
                                                </button>
                                            </span>
                                        );
                                    })}
                                    {selectedBrands.map(brandId => {
                                        const brand = uniqueBrands.find(b => b.id.toString() === brandId);
                                        return brand && (
                                            <span key={brandId} className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full flex items-center gap-1">
                                                {brand.name}
                                                <button
                                                    onClick={() => setSelectedBrands(selectedBrands.filter(id => id !== brandId))}
                                                    className="hover:text-blue-900"
                                                >
                                                    ✗
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Products Grid */}
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300">
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Products Found</h3>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                    No products match your current filters. Try adjusting your criteria.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                                {filteredProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Load More Button (if needed) */}
                        {filteredProducts.length > 0 && filteredProducts.length < products.length && (
                            <div className="mt-8 text-center">
                                <button className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium">
                                    Load More Products
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryProductsPage;
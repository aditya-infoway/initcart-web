import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { publicAxios } from "../api/axios";
import { Filter, ChevronRight } from "lucide-react";
import MobileBrandProductsPage from "./mobile/MobileBrandProduct";


const MIN_PRICE = 0;
const MAX_PRICE = 200000;

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
                                                {category.name} ({category.count || 0})
                                            </label>
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
                            Apply Filters ({selectedCategories.length})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Product Card Component
const ProductCard = ({ product }) => {
    const getImageUrl = (image) => {
        if (!image) return "https://placehold.co/300x300/f0f4f8/94a3b8?text=No+Image";
        if (image.startsWith('http')) return image;
        if (image.startsWith('/media/')) {
            return `https://api.initcart.in${image}`;
        }
        return `https://api.initcart.in/media/${image}`;
    };

    const getProductPrice = () => {
        if (product.stocks && product.stocks.length > 0) {
            const stock = product.stocks[0];
            return stock.final_price > 0 ? stock.final_price : stock.selling_price;
        }
        
        // Agar stock nahi hai toh min_price/max_price use karo
        if (product.min_price && product.min_price > 0) {
            return product.min_price;
        }
        
        return product.price || 0;
    };

    const price = parseFloat(getProductPrice());
    
    return (
        <Link to={`/product/${product.id}`} className="block">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                <div className="relative h-48 bg-gray-100">
                    <img
                        src={getImageUrl(product.main_image || product.thumbnail_image)}
                        alt={product.product_name}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/300x300/f0f4f8/94a3b8?text=No+Image";
                        }}
                    />
                </div>
                <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 h-12">
                        {product.product_name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gray-900">₹{price.toFixed(2)}</span>
                        {product.mrp && product.mrp > price && (
                            <span className="text-sm text-gray-500 line-through">₹{product.mrp.toFixed(2)}</span>
                        )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-gray-600">
                            {product.vendor_details?.business_name || 'Vendor'}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                            product.in_stock 
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

const BrandProductsPage = () => {
    const [isMobile, setIsMobile] = useState (() => window.innerWidth < 768);
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    
    const brandId = queryParams.get("brand");
    
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [brandInfo, setBrandInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [priceRange, setPriceRange] = useState([0, 50000]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const [categories, setCategories] = useState([]);

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

    // Fetch brand info and products
    useEffect(() => {
        const fetchBrandProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // First fetch brand info
                let brandData = null;
                try {
                    const brandsResponse = await publicAxios.get("/ecommerce/public/brands/");
                    const allBrands = Array.isArray(brandsResponse.data) 
                        ? brandsResponse.data 
                        : [];
                    
                    brandData = allBrands.find(b => b.id == brandId);
                    if (brandData) {
                        setBrandInfo(brandData);
                    }
                } catch (err) {

                }
                
                // Fetch products for this brand using category-products API
                const productsResponse = await publicAxios.get("/ecommerce/public/category-products/", {
                    params: {
                        brand: brandId,
                        status: "approved"
                    }
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
                
                // If no products found with brand filter, try to fetch all products and filter
                if (productsData.length === 0) {

                    
                    // Alternative: Fetch all approved products and filter by brand
                    const allProductsResponse = await publicAxios.get("/ecommerce/public/products/", {
                        params: { status: "approved" }
                    });
                    
                    let allProducts = [];
                    if (Array.isArray(allProductsResponse.data)) {
                        allProducts = allProductsResponse.data;
                    } else if (allProductsResponse.data && Array.isArray(allProductsResponse.data.results)) {
                        allProducts = allProductsResponse.data.results;
                    }
                    
                    // Filter products by brand
                    productsData = allProducts.filter(product => product.brand == brandId);
                }
                

                setProducts(productsData);
                setFilteredProducts(productsData);
                
            } catch (err) {
                console.error("Error fetching brand products:", err);
                setError(`Failed to load products: ${err.message}`);
                setProducts([]);
                setFilteredProducts([]);
            } finally {
                setLoading(false);
            }
        };
        
        if (brandId) {
            fetchBrandProducts();
        } else {
            setError("No brand selected");
            setLoading(false);
        }
    }, [brandId]);

    // Get categories from products
    const getCategoriesFromProducts = useMemo(() => {
        const categoriesMap = {};
        products.forEach(product => {
            if (product.category_details) {
                const catId = product.category_details.id;
                const catName = product.category_details.name;
                if (!categoriesMap[catId]) {
                    categoriesMap[catId] = {
                        id: catId,
                        name: catName,
                        count: 1
                    };
                } else {
                    categoriesMap[catId].count++;
                }
            }
        });
        const categoriesList = Object.values(categoriesMap);
        setCategories(categoriesList);
        return categoriesList;
    }, [products]);
    
    // Apply filters
    useEffect(() => {
        let filtered = [...products];
        
        // Apply price filter
        filtered = filtered.filter(product => {
            let price = 0;
            
            // Get product price from stocks or min_price
            if (product.stocks && product.stocks.length > 0) {
                const stock = product.stocks[0];
                price = stock.final_price > 0 ? stock.final_price : stock.selling_price;
            } else if (product.min_price && product.min_price > 0) {
                price = product.min_price;
            }
            
            return price >= priceRange[0] && price <= priceRange[1];
        });

        // Apply category filter
        if (selectedCategories.length > 0) {
            filtered = filtered.filter(product => {
                if (!product.category_details) return false;
                return selectedCategories.includes(product.category_details.id.toString());
            });
        }
        
        setFilteredProducts(filtered);
    }, [products, priceRange, selectedCategories]);

    useEffect(() => {
  const checkMobile = () => setIsMobile(window.innerWidth < 768);
  window.addEventListener("resize", checkMobile);
  return () => window.removeEventListener("resize", checkMobile);
}, []);
    
    // Get page title
    const getPageTitle = () => {
        if (brandInfo) return brandInfo.brand_name;
        return "Brand Products";
    };
    
    // Get breadcrumb items
    const getBreadcrumbItems = () => {
        const items = [
            { name: "Home", path: "/" }
        ];
        
        if (brandInfo) {
            items.push({ 
                name: brandInfo.brand_name, 
                path: `/brand-products/?brand=${brandId}` 
            });
        }
        
        return items;
    };

    if (isMobile){
        return<MobileBrandProductsPage/>;
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
                    <div className="text-6xl mb-4">😔</div>
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

                        {categories.length > 0 && (
                            <FilterSection title="Categories">
                                <FilterList isScrollable={true}>
                                    {categories.map(category => (
                                        <li key={category.id} className="flex items-center gap-2 py-1">
                                            <input
                                                type="checkbox"
                                                className="rounded text-blue-600 border-gray-300 focus:ring-blue-500 w-4 h-4"
                                                id={`category-${category.id}`}
                                                checked={selectedCategories.includes(category.id.toString())}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedCategories([...selectedCategories, category.id.toString()]);
                                                    } else {
                                                        setSelectedCategories(selectedCategories.filter(id => id !== category.id.toString()));
                                                    }
                                                }}
                                            />
                                            <label htmlFor={`category-${category.id}`} className="cursor-pointer flex items-center justify-between w-full">
                                                <span>{category.name}</span>
                                                <span className="text-xs text-gray-500">({category.count})</span>
                                            </label>
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

                        {/* Brand Header */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                            {brandInfo && (
                                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                                    <div className="w-32 h-32 flex-shrink-0">
                                        <img
                                            src={brandInfo.brand_logo_url || "https://placehold.co/300x300/f0f4f8/94a3b8?text=Brand"}
                                            alt={brandInfo.brand_name}
                                            className="w-full h-full object-contain rounded-lg border border-gray-200"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://placehold.co/300x300/f0f4f8/94a3b8?text=Brand";
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{brandInfo.brand_name}</h1>
                                        <p className="text-gray-600 mb-4">
                                            {brandInfo.description || "Explore premium products from this brand"}
                                        </p>
                                        <div className="flex flex-wrap gap-4">
                                            <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                                                <span className="font-semibold">{brandInfo.product_count || 0}</span> Total Products
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Applied Filters Display */}
                        {selectedCategories.length > 0 && (
                            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-medium text-blue-800">Applied Filters</h4>
                                    <button
                                        onClick={() => {
                                            setSelectedCategories([]);
                                        }}
                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Clear All
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedCategories.map(catId => {
                                        const category = categories.find(c => c.id.toString() === catId);
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
                                </div>
                            </div>
                        )}

                        {/* Products Grid */}
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300">
                                <div className="text-6xl mb-4">📦</div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Products Found</h3>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                    {selectedCategories.length > 0 
                                        ? "No products available for this brand in the selected categories."
                                        : "No products available for this brand with current price filters."}
                                </p>
                                <button
                                    onClick={() => {
                                        setPriceRange([0, 50000]);
                                        setSelectedCategories([]);
                                    }}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                                >
                                    Clear All Filters
                                </button>
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandProductsPage;
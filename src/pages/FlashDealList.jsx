import React, { useState, useEffect, useMemo, useCallback } from "react";

const products = [
    {
        id: 1,
        title: "IPhone 14 Pro Max",
        price: 1149.0,
        oldPrice: 1299.0,
        img: "https://6valley.6amtech.com/storage/app/public/product/thumbnail/2024-09-22-66f0027e72108.webp",
        rating: 5,
        reviews: 12,
        discount: 12,
        shortDescription: "The latest smartphone with incredible camera performance and battery life.",
    },
    {
        id: 2,
        title: "Beauty Jelly Lipstick",
        price: 32.0,
        oldPrice: 45.0,
        img: "https://6valley.6amtech.com/storage/app/public/product/thumbnail/2024-09-19-66ec01ed63b50.webp",
        rating: 4,
        reviews: 20,
        discount: 29,
        shortDescription: "Hydrating jelly lipstick that changes color based on temperature.",
    },
    {
        id: 3,
        title: "Leather Ladies Bag",
        price: 15.0,
        oldPrice: 25.0,
        img: "https://6valley.6amtech.com/storage/app/public/product/thumbnail/2024-09-17-66e978a853a80.webp",
        rating: 5,
        reviews: 6,
        discount: 40,
        shortDescription: "Elegant and durable leather bag for everyday use.",
    },
    {
        id: 4,
        title: "Samsung S24 Ultra",
        price: 1150.0,
        oldPrice: 1200.0,
        img: "https://6valley.6amtech.com/storage/app/public/product/thumbnail/2024-09-19-66eba8074d784.webp",
        rating: 5,
        reviews: 8,
        discount: 4,
        shortDescription: "The flagship Android phone with S Pen and powerful zoom camera.",
    },
    {
        id: 5,
        title: "Smart Watch",
        price: 90.0,
        oldPrice: 120.0,
        img: "https://6valley.6amtech.com/storage/app/public/product/thumbnail/2024-09-17-66e96c995236e.webp",
        rating: 4,
        reviews: 15,
        discount: 25,
        shortDescription: "Fitness tracker and notification center for your wrist.",
    },
];

const filterData = {
    productTypes: ["Mobile", "Fashion", "Accessories", "Electronics", "Home & Decor", "Sports"],
    categories: [
        {
            name: "Men's Fashion",
            count: 25,
            subcategories: [],
        },
        {
            name: "Women's Fashion",
            count: 32,
            subcategories: [
                { name: "Dress", count: 8 },
                { name: "Footwear", count: 12 },
                { name: "Accessories", count: 6 },
            ],
        },
        { name: "Kids & Fashion", count: 18, subcategories: [] },
        { name: "Health & Beauty", count: 10, subcategories: [] },
        { name: "Pet Supplies", count: 5, subcategories: [] },
        { name: "Automotive", count: 15, subcategories: [] },
        { name: "Books", count: 40, subcategories: [] },
        { name: "Toys", count: 22, subcategories: [] },
        { name: "Gardening Tools", count: 15, subcategories: [] },
        { name: "Fitness Equipment", count: 20, subcategories: [] },
        { name: "Kitchen Appliances", count: 12, subcategories: [] },
    ],
    brands: [
        { name: "Apple", count: 20 },
        { name: "Samsung", count: 30 },
        { name: "Tech Connect", count: 15 },
        { name: "Global Gear", count: 10 },
        { name: "Fashion Hub", count: 12 },
    ],
};

const MIN_PRICE = 0;
const MAX_PRICE = 2000;

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

const ProductCard = ({ product, openModal }) => (
    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition group relative cursor-pointer">
        {product.discount > 0 && (
            <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full z-10 font-semibold">
                -{product.discount}%
            </span>
        )}
        <div className="absolute inset-0 bg-blue-300/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 z-20">
            <button
                onClick={(e) => openModal(product, e)}
                className="p-3 rounded-full bg-white/90 text-blue-600 shadow-xl hover:bg-white transition transform hover:scale-110"
                aria-label="Quick View"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.009 9.96 7.173.18.529.18.977 0 1.506C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.009-9.96-7.173z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
        </div>
        <div className="h-32 flex items-center justify-center mb-3 overflow-hidden">
            <img
                src={product.img}
                alt={product.title}
                className="object-contain h-full"
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/150x150/f0f4f8/94a3b8?text=Image+Error" }}
            />
        </div>
        <h4 className="text-sm font-medium text-gray-800 truncate mb-1 group-hover:text-blue-600 transition">{product.title}</h4>
        <div className="flex items-baseline gap-2">
            <p className="text-base font-bold text-gray-900">${product.price.toFixed(2)}</p>
            <p className="text-xs text-gray-400 line-through">${product.oldPrice.toFixed(2)}</p>
        </div>
        <div className="flex items-center text-xs text-gray-500 mt-1">
            <StarRating rating={product.rating} />
            <span className="ml-1">({product.reviews})</span>
        </div>
    </div>
);

const PriceRangeFilter = ({ minPrice, maxPrice, setMinPrice, setMaxPrice }) => {
    const STEP = 10;
    
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
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">$</span>
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
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">$</span>
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
                    className="absolute h-2 bg-blue-600 rounded-full"
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
                    title={`Min Price: $${minPrice.toFixed(0)}`}
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


const QuickViewModal = ({ product, onClose, isModalOpen }) => {
    if (!product) return null;

    const backdropClass = `fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isModalOpen ? "opacity-100" : "opacity-0"
        } ${isModalOpen ? "bg-black/40" : "bg-black/0"} ${isModalOpen ? "pointer-events-auto" : "pointer-events-none"
        }`;
    const modalContentClass = `w-11/12 max-w-3xl rounded-xl bg-white p-6 shadow-2xl transition-all duration-300 transform ${isModalOpen ? "scale-100 translate-y-0" : "scale-90 translate-y-4"
        }`;

    return (
        <div className={backdropClass} onClick={onClose}>
            <div className={modalContentClass} onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-2 rounded-full text-gray-400 bg-white hover:bg-gray-100 hover:text-gray-700 transition shadow-md"
                    aria-label="Close modal"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/2 flex flex-col items-center">
                        <img
                            src={product.img}
                            alt={product.title}
                            className="w-full h-72 object-contain rounded-lg border border-gray-200"
                        />
                    </div>

                    <div className="w-full md:w-1/2">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h3>

                        <div className="flex items-baseline gap-3 mb-4">
                            <span className="text-3xl font-extrabold text-blue-600">${product.price.toFixed(2)}</span>
                            <span className="text-lg text-gray-400 line-through">${product.oldPrice.toFixed(2)}</span>
                        </div>

                        <p className="text-gray-700 text-sm mb-6">
                            {product.shortDescription}
                        </p>

                        <button className="w-full rounded-lg bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function ProductListLayout() {
    const [timeLeft, setTimeLeft] = useState({
        days: 827,
        hours: 0,
        minutes: 26,
        seconds: 35,
    });
    const [modalProduct, setModalProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [minPrice, setMinPrice] = useState(500);
    const [maxPrice, setMaxPrice] = useState(1500);
    const TRANSITION_DURATION = 300;

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                let { days, hours, minutes, seconds } = prev;
                if (seconds > 0) seconds -= 1;
                else if (minutes > 0) { minutes -= 1; seconds = 59; }
                else if (hours > 0) { hours -= 1; minutes = 59; seconds = 59; }
                else if (days > 0) { days -= 1; hours = 23; minutes = 59; seconds = 59; }
                return { days, hours, minutes, seconds };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const openModal = (product, e) => {
        e.preventDefault();
        e.stopPropagation();
        setModalProduct(product);
        setTimeout(() => setIsModalOpen(true), 10);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setModalProduct(null), TRANSITION_DURATION);
    };

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
            `}</style>

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="relative bg-blue-100 p-6 rounded-xl mb-6 flex flex-col md:flex-row justify-between items-center border border-blue-200 shadow-md">
                    <div>
                        <h2 className="text-2xl font-bold text-blue-800">FLASH DEAL</h2>
                        <p className="text-sm text-gray-600">
                            Hurry Up! The offer is limited. Grab while it lasts
                        </p>
                    </div>

                    <div className="bg-blue-600 text-white rounded-lg px-6 py-3 flex gap-4 mt-4 md:mt-0 shadow-lg">
                        {Object.entries(timeLeft).map(([key, value]) => (
                            <div key={key} className="text-center">
                                <div className="text-xl font-extrabold">
                                    {value.toString().padStart(2, "0")}
                                </div>
                                <div className="text-[10px] uppercase">{key}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    <aside className="md:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-fit self-start">
                        <h3 className="font-bold text-lg mb-2 text-gray-800">Filter By</h3>

                        <FilterSection title="Product Type">
                            <FilterList>
                                {filterData.productTypes.map(type => (
                                    <li key={type} className="flex items-center gap-2">
                                        <input type="checkbox" className="rounded text-blue-600 border-gray-300 focus:ring-blue-500 w-4 h-4" id={`type-${type}`} />
                                        <label htmlFor={`type-${type}`} className="cursor-pointer">{type}</label>
                                    </li>
                                ))}
                            </FilterList>
                        </FilterSection>

                        <FilterSection title="Price Range">
                            <PriceRangeFilter
                                minPrice={minPrice}
                                maxPrice={maxPrice}
                                setMinPrice={setMinPrice}
                                setMaxPrice={setMaxPrice}
                            />
                        </FilterSection>

                        <FilterSection title="Categories">
                            <FilterList isScrollable={true}>
                                {filterData.categories.map((cat) => (
                                    <li key={cat.name} className="py-2 px-3 border border-gray-200 rounded-lg hover:bg-blue-50 transition">
                                        <button className="flex justify-between items-center w-full hover:text-blue-600 transition text-sm font-medium">
                                            <span className="text-gray-700 hover:text-blue-600 transition">{cat.name}</span>
                                            <span className="text-xs text-gray-500">({cat.count})</span>
                                        </button>
                                        {cat.subcategories.length > 0 && (
                                            <ul className="ml-3 border-l-2 border-dashed border-gray-200 pl-3 mt-2 space-y-1">
                                                {cat.subcategories.map((sub) => (
                                                    <li key={sub.name} className="text-gray-500 hover:text-blue-500 text-xs flex justify-between">
                                                        {sub.name}
                                                        <span className="text-xs text-gray-400">({sub.count})</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </FilterList>
                        </FilterSection>

                        <FilterSection title="Brands">
                            <FilterList isScrollable={true}>
                                {filterData.brands.map(brand => (
                                    <li key={brand.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" className="rounded text-blue-600 border-gray-300 focus:ring-blue-500 w-4 h-4" id={`brand-${brand.name}`} />
                                            <label htmlFor={`brand-${brand.name}`} className="cursor-pointer">{brand.name}</label>
                                        </div>
                                        <span className="text-xs text-gray-500">({brand.count})</span>
                                    </li>
                                ))}
                            </FilterList>
                        </FilterSection>
                    </aside>

                    <div className="md:col-span-3 lg:col-span-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row justify-between items-center gap-3">
                            <div className="text-sm font-medium text-gray-600 order-2 sm:order-1 whitespace-nowrap">
                                37 Items Found
                            </div>

                            <div className="relative flex-1 w-full order-1 sm:order-2 max-w-sm sm:max-w-md">
                                <input
                                    type="text"
                                    placeholder="Search items..."
                                    className="w-full border border-gray-300 rounded-lg py-1.5 pl-3 pr-12 text-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button className="absolute right-0 top-0 bottom-0 px-3 bg-blue-600 rounded-r-lg text-white hover:bg-blue-700 transition">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex gap-2 order-3 sm:order-3 w-full sm:w-auto justify-end">
                                <select className="border border-gray-300 rounded-lg py-1.5 px-3 text-sm focus:ring-blue-500 focus:border-blue-500">
                                    <option>Price</option>
                                    <option>Low → High</option>
                                    <option>High → Low</option>
                                </select>
                                <select className="border border-gray-300 rounded-lg py-1.5 px-3 text-sm focus:ring-blue-500 focus:border-blue-500">
                                    <option>Rated</option>
                                    <option>5 Star</option>
                                    <option>4 Star & up</option>
                                </select>
                            </div>
                        </div>

                       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {products.map((p) => (
                                <ProductCard key={p.id} product={p} openModal={openModal} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {modalProduct && <QuickViewModal product={modalProduct} onClose={closeModal} isModalOpen={isModalOpen} />}
        </div>
    );
}
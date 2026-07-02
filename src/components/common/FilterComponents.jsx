import React, { useState, useMemo } from "react";
import { FiFilter } from "react-icons/fi";

const MIN_PRICE = 0;
const MAX_PRICE = 200000;

export const FilterSection = ({ title, children, isExpanded = true }) => {
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

export const FilterList = ({ children, isScrollable = false }) => (
    <ul className={`space-y-2 text-sm text-gray-700 ${isScrollable ? 'max-h-64 overflow-y-auto pr-2 custom-scrollbar' : ''}`}>
        {children}
    </ul>
);

export const PriceRangeFilter = ({ minPrice, maxPrice, setMinPrice, setMaxPrice }) => {
    const STEP = 100;

    const [minInput, setMinInput] = useState(minPrice.toString());
    const [maxInput, setMaxInput] = useState(maxPrice.toString());

    React.useEffect(() => {
        setMinInput(minPrice.toString());
    }, [minPrice]);

    React.useEffect(() => {
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

export const MobileFilterSidebar = ({
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
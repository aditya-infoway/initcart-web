import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { publicAxios } from "../api/axios";
import { FiSearch, FiFilter, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const getImageUrl = (image) => {
  if (!image) return "https://placehold.co/400x400/f0f4f8/94a3b8?text=No+Image";
  if (image.startsWith("http")) return image;
  const cleanPath = image.replace(/^\/+/, '');
  return `https://api.initcart.in/media/${cleanPath}`;
};

export default function DealOfTheDay() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [filterBy, setFilterBy] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [brandSearch, setBrandSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(8);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Fetch Deal of the Day Products
  useEffect(() => {
    const fetchDealProducts = async () => {
      try {
        setLoading(true);
        const response = await publicAxios.get("/api/ecommerce/public/deal-of-day/main-products/");
        
        console.log("Deal API Response:", response.data);
        
        if (response.data.products && response.data.products.length > 0) {
          const mappedProducts = response.data.products.map((product) => ({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            oldPrice: parseFloat(product.old_price),
            img: product.image || product.main_image || product.thumbnail,
            discount_percentage: product.discount_percentage,
            category: product.category || "Uncategorized",
            brand: product.brand || "Generic",
            stock: product.stocks || [],
            description: product.description || "",
          }));
          
          setProducts(mappedProducts);
          setFilteredProducts(mappedProducts);
          
          // Extract unique categories
          const uniqueCategories = [...new Set(mappedProducts.map(p => p.category))];
          setCategories(uniqueCategories);
          
          // Extract unique brands with counts
          const brandMap = new Map();
          mappedProducts.forEach(p => {
            brandMap.set(p.brand, (brandMap.get(p.brand) || 0) + 1);
          });
          const brandArray = Array.from(brandMap, ([name, count]) => ({ name, count }));
          setBrands(brandArray);
        } else {
          setProducts([]);
          setFilteredProducts([]);
        }
      } catch (err) {
        console.error("Error fetching Deal of Day:", err);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDealProducts();
  }, []);

  // Filter and Sort Products
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Price range filter
    if (priceRange.min) {
      filtered = filtered.filter(product => product.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter(product => product.price <= parseFloat(priceRange.max));
    }

    // Brand filter
    if (brandSearch) {
      filtered = filtered.filter(product =>
        product.brand.toLowerCase().includes(brandSearch.toLowerCase())
      );
    }

    // Discount filter
    if (filterBy === "discounted") {
      filtered = filtered.filter(product => product.discount_percentage > 0);
    }

    // Sorting
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "discount-desc":
        filtered.sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0));
        break;
      default:
        // Default sorting by id or discount
        filtered.sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0));
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchTerm, selectedCategory, priceRange, brandSearch, sortBy, filterBy]);

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Loading State
  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen p-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3">
              <div className="bg-white p-4 rounded-lg shadow animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            <div className="col-span-9">
              <div className="grid grid-cols-4 gap-5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow p-3 animate-pulse">
                    <div className="w-full h-32 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="container mx-auto grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="col-span-3 bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <FiFilter className="w-4 h-4" /> Filter By
          </h2>

          {/* Product Type / Category */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Product Type</label>
            <select 
              className="w-full border rounded-md p-2 text-sm bg-gray-50"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((category, idx) => (
                <option key={idx} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Price Range</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min Price"
                className="w-1/2 border rounded-md p-2 text-sm bg-gray-50"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              />
              <input
                type="number"
                placeholder="Max Price"
                className="w-1/2 border rounded-md p-2 text-sm bg-gray-50"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              />
            </div>
          </div>

          {/* Categories List */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Categories</label>
            <ul className="text-sm space-y-2">
              <li 
                className={`cursor-pointer ${selectedCategory === 'all' ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'}`}
                onClick={() => setSelectedCategory('all')}
              >
                All Products ({products.length})
              </li>
              {categories.map((category, idx) => (
                <li 
                  key={idx}
                  className={`cursor-pointer ${selectedCategory === category ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category} ({products.filter(p => p.category === category).length})
                </li>
              ))}
            </ul>
          </div>

          {/* Brands */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Brands</label>
            <input
              type="text"
              placeholder="Search by brands"
              className="w-full border rounded-md p-2 text-sm bg-gray-50"
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
            />
            <ul className="mt-3 text-sm space-y-2 max-h-32 overflow-y-auto">
              {brands
                .filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase()))
                .map((brand, idx) => (
                  <li key={idx} className="text-gray-600">
                    {brand.name} ({brand.count})
                  </li>
                ))}
            </ul>
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
              setPriceRange({ min: "", max: "" });
              setBrandSearch("");
              setSortBy("default");
              setFilterBy("default");
            }}
            className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition"
          >
            Clear All Filters
          </button>
        </aside>

        {/* Product Grid */}
        <main className="col-span-9">
          {/* Search & Sort */}
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for items..."
                className="w-full pl-10 pr-4 border rounded-md p-2 text-sm bg-gray-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select 
                className="border rounded-md p-2 text-sm bg-gray-50"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Sort by Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="discount-desc">Discount: High to Low</option>
              </select>
              <select 
                className="border rounded-md p-2 text-sm bg-gray-50"
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
              >
                <option value="default">All Products</option>
                <option value="discounted">Discounted Only</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4 text-sm text-gray-600">
            Showing {currentProducts.length} of {filteredProducts.length} products
          </div>

          {/* Products Grid */}
          {currentProducts.length > 0 ? (
            <div className="grid grid-cols-4 gap-5">
              {currentProducts.map((item, i) => (
                <Link
                  key={i}
                  to={`/product/${item.id}`}
                  className="bg-white rounded-lg shadow p-3 relative hover:shadow-lg transition-transform hover:scale-105 cursor-pointer group"
                >
                  {item.discount_percentage > 0 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded z-10">
                      -{item.discount_percentage}%
                    </span>
                  )}
                  <div className="w-full h-40 mb-3 overflow-hidden rounded bg-gray-50">
                    <img
                      src={getImageUrl(item.img)}
                      alt={item.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        console.error("Image failed to load:", item.img);
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/400x400/f0f4f8/94a3b8?text=No+Image";
                      }}
                    />
                  </div>
                  <h3 className="text-sm font-medium leading-tight line-clamp-2 mb-2">
                    {item.name}
                  </h3>
                  <div className="mt-2 text-sm">
                    {item.oldPrice && item.discount_percentage > 0 ? (
                      <>
                        <span className="line-through text-gray-400 mr-2">
                          ₹{item.oldPrice.toLocaleString()}
                        </span>
                        <span className="text-red-500 font-semibold">
                          ₹{item.price.toLocaleString()}
                        </span>
                        <div className="text-xs text-green-600 mt-1">
                          Save ₹{(item.oldPrice - item.price).toLocaleString()}
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-800 font-semibold">
                        ₹{item.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  {/* Stock Status */}
                  {item.stock && item.stock.length === 0 && (
                    <div className="mt-2 text-xs text-red-500">Out of Stock</div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No products found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setPriceRange({ min: "", max: "" });
                  setBrandSearch("");
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <ul className="flex gap-2 text-sm items-center">
                <li>
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-white shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                  </button>
                </li>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <li key={i}>
                      <button
                        onClick={() => paginate(pageNum)}
                        className={`px-3 py-1 rounded ${currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "bg-white shadow hover:bg-gray-50"
                          }`}
                      >
                        {pageNum}
                      </button>
                    </li>
                  );
                })}
                <li>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded bg-white shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </li>
              </ul>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { publicAxios } from "../api/axios";
import MobileSubCategoryListPage from "./mobile/Mobilesubcategorylistpage";


interface SubCategory {
  id: number;
  name: string;
  icon_url?: string;
  product_count?: number;
  description?: string;
  featured?: boolean;
}

export default function SubCategoryListPage() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    return (localStorage.getItem("subcategoryViewMode") as "grid" | "list") || "grid";
  });
  const [sortBy, setSortBy] = useState<"name" | "count" | "default">("default");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string>("");

  useEffect(() => {
    localStorage.setItem("subcategoryViewMode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        setLoading(true);
        const response = await publicAxios.get("/ecommerce/public/subcategories/");
        setSubCategories(response.data);
        setFilteredCategories(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching subcategories:", err);
        setError("Failed to load subcategories.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubCategories();
  }, []);

  useEffect(() => {
    let result = [...subCategories];

    if (searchTerm) {
      result = result.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLetter) {
      result = result.filter(cat =>
        cat.name.toLowerCase().startsWith(selectedLetter.toLowerCase())
      );
    }

    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "count") {
      result.sort((a, b) => (b.product_count || 0) - (a.product_count || 0));
    }

    setFilteredCategories(result);
  }, [searchTerm, selectedLetter, sortBy, subCategories]);

   useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
 

  const getFirstLetters = () => {
    const letters = new Set<string>();
    subCategories.forEach(cat => {
      const firstLetter = cat.name.charAt(0).toUpperCase();
      if (/[A-Za-z]/.test(firstLetter)) {
        letters.add(firstLetter);
      }
    });
    return Array.from(letters).sort();
  };

  if (isMobile) return <MobileSubCategoryListPage />;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-3 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 w-96 bg-gray-200 rounded mb-8"></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full"></div>
                    <div className="h-4 w-20 mx-auto mt-3 bg-gray-200 rounded"></div>
                    <div className="h-3 w-16 mx-auto mt-2 bg-gray-200 rounded"></div>
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
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-500 text-lg mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-[1210px] mx-auto">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 md:p-8 mb-8 text-white">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Browse Categories</h1>
            <p className="text-blue-100 text-sm md:text-base">
              {subCategories.length}+ categories with thousands of products
            </p>
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
            <div className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Sort Dropdown */}
                <div className="w-full md:w-48">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                  >
                    <option value="default">Default Sort</option>
                    <option value="name">Sort by Name</option>
                    <option value="count">Sort by Popularity</option>
                  </select>
                </div>

                {/* View Toggle */}
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-4 py-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-4 py-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>

                {/* Filter Toggle Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2.5 rounded-lg border transition-all flex items-center gap-2 ${showFilters ? "bg-blue-50 border-blue-300 text-blue-600" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span>Filter</span>
                  {selectedLetter && (
                    <span className="ml-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                      1
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Expandable Filters Panel */}
            {showFilters && (
              <div className="border-t border-gray-100 p-4 bg-gray-50">
                <div className="mb-3">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by First Letter</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedLetter("")}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-all ${!selectedLetter ? "bg-blue-600 text-white shadow-sm" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
                    >
                      All
                    </button>
                    {getFirstLetters().map(letter => (
                      <button
                        key={letter}
                        onClick={() => setSelectedLetter(letter)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-all ${selectedLetter === letter ? "bg-blue-600 text-white shadow-sm" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                </div>

                {(searchTerm || selectedLetter) && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                    <span className="text-xs text-gray-500">Active Filters:</span>
                    {searchTerm && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        Search: {searchTerm}
                        <button onClick={() => setSearchTerm("")} className="hover:text-blue-900">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )}
                    {selectedLetter && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        Letter: {selectedLetter}
                        <button onClick={() => setSelectedLetter("")} className="hover:text-blue-900">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedLetter("");
                        setSortBy("default");
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 ml-2"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-800">{filteredCategories.length}</span> of{" "}
              <span className="font-semibold text-gray-800">{subCategories.length}</span> categories
            </p>
          </div>

          {/* Categories Grid/List View */}
          {filteredCategories.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No categories found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {filteredCategories.map((subCat) => (
                <Link
                  key={subCat.id}
                  to={`/category-products/?subcategory=${subCat.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                    {/* Image */}
                    <div className="relative mx-auto h-24 w-24 md:h-28 md:w-28">
                      <div className="absolute inset-0 rounded-full bg-blue-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-sm"></div>
                      <div className="relative h-full w-full rounded-full overflow-hidden ring-1 ring-blue-200 group-hover:ring-2 group-hover:ring-blue-500 transition-all duration-300">
                        <img
                          src={subCat.icon_url || `https://picsum.photos/seed/sub${subCat.id}/300/300`}
                          alt={subCat.name}
                          className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                          onError={(e: any) => {
                            e.target.onerror = null;
                            e.target.src = `https://picsum.photos/seed/sub${subCat.id}/300/300`;
                          }}
                        />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="mt-3 text-center">
                      <h3 className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors truncate">
                        {subCat.name}
                      </h3>
                      <div className="mt-1.5 flex items-center justify-center gap-1">
                        <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span className="text-xs text-gray-500">
                          {subCat.product_count ?? 0} items
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            // List View
            <div className="space-y-3">
              {filteredCategories.map((subCat) => (
                <Link
                  key={subCat.id}
                  to={`/category-products/?subcategory=${subCat.id}`}
                  className="group block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-blue-200"
                >
                  <div className="flex items-center gap-4">
                    {/* Image */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden ring-1 ring-blue-200 group-hover:ring-2 group-hover:ring-blue-500 transition-all">
                      <img
                        src={subCat.icon_url || `https://picsum.photos/seed/sub${subCat.id}/300/300`}
                        alt={subCat.name}
                        className="w-full h-full object-cover"
                        onError={(e: any) => {
                          e.target.onerror = null;
                          e.target.src = `https://picsum.photos/seed/sub${subCat.id}/300/300`;
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {subCat.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          {subCat.product_count ?? 0} products
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Footer Stats */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center text-xs text-gray-400">
            <div className="flex gap-4">
              <span>Total Categories: {subCategories.length}</span>
              <span>Total Products: {subCategories.reduce((acc, cat) => acc + (cat.product_count || 0), 0).toLocaleString()}</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
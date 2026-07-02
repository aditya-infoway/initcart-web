import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { publicAxios } from "../api/axios";

export default function SubCategorySlider() {
  const [itemsPerView, setItemsPerView] = useState(5);
  const [start, setStart] = useState(0);
  const [subCategories, setSubCategories] = useState([]);
  const [subCategoryProducts, setSubCategoryProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch subcategories
  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        setLoading(true);
        const response = await publicAxios.get("/ecommerce/public/subcategories/");

        const mappedSubCategories = response.data.map((subCat, index) => ({
          id: subCat.id,
          uniqueId: `${subCat.id}-${index}`,
          title: subCat.name,
          img: subCat.icon_url || `https://picsum.photos/seed/sub${subCat.id}/300/300`,
          category_name: subCat.category_name || "Category",
          product_count: subCat.product_count || 0
        }));

        // Remove duplicates
        const uniqueSubCategories = Array.from(
          new Map(mappedSubCategories.map(item => [item.id, item])).values()
        );

        setSubCategories(uniqueSubCategories);
        setError(null);

        // After subcategories are loaded, fetch products for them
        if (uniqueSubCategories.length > 0) {
          fetchProductsForSubcategories(uniqueSubCategories.map(sc => sc.id));
        }

      } catch (err) {
        console.error("Error fetching subcategories:", err);
        setError("Failed to load categories. Please try again later.");

        // Fallback data
        const fallbackData = Array.from({ length: 12 }).map((_, i) => {
          const titles = [
            "Men's Fashion", "Women's Fashion", "Kid's Fashion",
            "Health & Beauty", "Pet Supplies", "Home & Kitchen",
            "Baby & Toddler", "Sports & Outdoor", "Phones",
            "Electronics", "Books", "Grocery"
          ];
          return {
            id: i + 1,
            uniqueId: `fallback-${i + 1}`,
            title: titles[i % titles.length],
            img: `https://picsum.photos/seed/sub${i}/300/300`,
            category_name: "Category",
            product_count: Math.floor(Math.random() * 50)
          };
        });

        setSubCategories(fallbackData);
        // Fetch products for fallback data too
        fetchProductsForSubcategories(fallbackData.map(sc => sc.id));
      } finally {
        setLoading(false);
      }
    };

    fetchSubCategories();
  }, []);

  // Fetch products for subcategories
  const fetchProductsForSubcategories = async (subcategoryIds) => {
    if (!subcategoryIds || subcategoryIds.length === 0) return;

    try {
      setProductsLoading(true);

      // Take only first 10 subcategories to avoid too many products
      const idsToFetch = subcategoryIds.slice(0, 10);
      const idsString = idsToFetch.join(',');

      const response = await publicAxios.get(
        `/ecommerce/public/subcategory-products/?subcategory_ids=${idsString}&products_per_subcat=4`
      );

      if (response.data.success) {
        setSubCategoryProducts(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching subcategory products:", err);

      // Generate fallback products for each subcategory
      const fallbackProducts = {};
      subcategoryIds.forEach(id => {
        fallbackProducts[id] = {
          products: Array.from({ length: 4 }).map((_, i) => ({
            id: i + 1,
            product_name: `Product ${i + 1}`,
            main_image_url: `https://picsum.photos/seed/prod${id}${i}/200/200`
          }))
        };
      });
      setSubCategoryProducts(fallbackProducts);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    const setFromWidth = () => {
      const w = window.innerWidth;
      if (w >= 1280) setItemsPerView(6);
      else if (w >= 1024) setItemsPerView(5);
      else if (w >= 768) setItemsPerView(3);
      else setItemsPerView(2);
    };
    setFromWidth();
    window.addEventListener("resize", setFromWidth);
    return () => window.removeEventListener("resize", setFromWidth);
  }, []);

  useEffect(() => setStart(0), [itemsPerView]);

  // Get visible subcategories
  const visible = useMemo(() => {
    if (subCategories.length === 0) return [];

    const out = [];
    for (let i = 0; i < itemsPerView; i += 1) {
      const itemIndex = (start + i) % subCategories.length;
      const item = subCategories[itemIndex];

      // Check for duplicates
      const isDuplicate = out.some(existingItem => existingItem.id === item.id);

      if (!isDuplicate) {
        out.push({
          ...item,
          sliderIndex: i
        });
      } else {
        const nextIndex = (itemIndex + 1) % subCategories.length;
        const nextItem = subCategories[nextIndex];
        if (nextItem && !out.some(existing => existing.id === nextItem.id)) {
          out.push({
            ...nextItem,
            sliderIndex: i
          });
        }
      }
    }
    return out;
  }, [start, itemsPerView, subCategories]);

  const prev = () => {
    if (subCategories.length === 0) return;
    setStart((s) => (s - 1 + subCategories.length) % subCategories.length);
  };

  const next = () => {
    if (subCategories.length === 0) return;
    setStart((s) => (s + 1) % subCategories.length);
  };

  // Auto-slide
  useEffect(() => {
    if (subCategories.length === 0) return;

    const id = setInterval(() => {
      setStart((s) => (s + 1) % subCategories.length);
    }, 7000);

    return () => clearInterval(id);
  }, [subCategories.length]);

  // Product Grid Skeleton
  const ProductGridSkeleton = () => (
    <div className="grid grid-cols-2 gap-2 aspect-square">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-gray-200 animate-pulse rounded-lg"></div>
      ))}
    </div>
  );

  // Product Grid Component - 2x2 grid with equal sized images
  const ProductGrid = ({ subcatId }) => {
    const products = subCategoryProducts[subcatId]?.products || [];

    if (productsLoading) {
      return <ProductGridSkeleton />;
    }

    // If we have less than 4 products, fill remaining slots with placeholders
    const displayProducts = [...products];
    while (displayProducts.length < 4) {
      displayProducts.push(null);
    }

    return (
      <div className="grid grid-cols-2 gap-2 w-full">
        {displayProducts.slice(0, 4).map((product, index) => (
          <Link
            key={product?.id || `placeholder-${index}`}
            to={`/product/${product?.id || '#'}`}
            className="block w-full aspect-square"
          >
            <div className="w-full h-full bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-blue-400 hover:shadow-md transition-all duration-300">
              {product ? (
                <img
                  src={
                    product?.stocks?.length > 0 &&
                      product?.stocks?.[0]?.variant_image_url
                      ? product.stocks[0].variant_image_url
                      : product.main_image
                  }
                  alt={product.name}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <section className="mt-10 overflow-hidden px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">SHOP BY CATEGORIES</h2>
          <div className="text-sm text-gray-400">Loading...</div>
        </div>
        <div className="relative overflow-hidden">
          <div
            className="grid transition-all duration-300 ease-in-out gap-4"
            style={{
              gridTemplateColumns: `repeat(${itemsPerView}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: itemsPerView }).map((_, i) => (
              <div key={`loading-${i}`} className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-3">
                  <div className="grid grid-cols-2 gap-2 w-full">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="aspect-square  bg-gray-200 animate-pulse rounded-lg"></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error && subCategories.length === 0) {
    return (
      <section className="mt-10 overflow-hidden px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">SHOP BY CATEGORIES</h2>
        </div>
        <div className="text-center p-8 border border-red-200 bg-red-50 rounded-xl">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  // Empty state
  if (subCategories.length === 0) {
    return (
      <section className="mt-10 overflow-hidden px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">SHOP BY CATEGORIES</h2>
        </div>
        <div className="text-center p-8 border border-gray-200 bg-gray-50 rounded-xl">
          <p className="text-gray-600">No categories available</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10 overflow-hidden px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">SHOP BY CATEGORIES</h2>
        <Link
          to="/subcategorieslist"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          View all
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="relative overflow-hidden group/sub">
        <div
          className="grid transition-all duration-300 ease-in-out gap-4 py-5"
          style={{
            gridTemplateColumns: `repeat(${itemsPerView}, minmax(0, 1fr))`,
          }}
        >
          {visible.map((subCat, index) => {
            const uniqueKey = `${subCat.id}-${subCat.sliderIndex || index}-${start}`;

            return (
              <div key={uniqueKey} className="bg-white rounded-xl border border-blue-400 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
                {/* Product Grid Section */}
                <div className="p-3 pb-0">
                  <ProductGrid subcatId={subCat.id} />
                </div>

                {/* Separator Line */}
                <div className="border-t border-gray-200 my-2"></div>

                {/* Category Info Section with Blue Background */}
                <Link
                  to={`/category-products/?subcategory=${subCat.id}`}
                  className="block bg-blue-100 hover:bg-blue-200 transition-colors duration-300 px-3 py-2.5 mt-auto"
                >
                  <div className="text-center">
                    <h3 className="text-sm font-semibold text-black group-hover/title:text-blue-600 transition-colors line-clamp-1">
                      {subCat.title}
                    </h3>
                    <div className="flex items-center justify-center text-center gap-2 mt-1">
                      <span className="flex text-xs font-medium text-center text-gray-600">
                        {subCategoryProducts[subCat.id]?.products?.length || subCat.product_count} items
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Navigation buttons */}
        {subCategories.length > itemsPerView && (
          <>
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute -left-3 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg border border-gray-200 transition-all duration-300 opacity-0 group-hover/sub:opacity-100 hover:bg-gray-50 hover:scale-110 z-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>

            <button
              onClick={next}
              aria-label="Next"
              className="absolute -right-3 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg border border-gray-200 transition-all duration-300 opacity-0 group-hover/sub:opacity-100 hover:bg-gray-50 hover:scale-110 z-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </>
        )}
      </div>
    </section>
  );
}
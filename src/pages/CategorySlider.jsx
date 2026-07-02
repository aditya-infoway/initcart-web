import React, { useEffect, useMemo, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { publicAxios } from '../api/axios'

export default function CategorySlider() {
  const [itemsPerView, setItemsPerView] = useState(1)
  const [start, setStart] = useState(0)
  const [modalProduct, setModalProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasFeaturedCategories, setHasFeaturedCategories] = useState(false) // ✅ New state
  const sliderRef = useRef(null)
  const TRANSITION_DURATION = 300 // ms, used for modal smooth closing

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        // console.log('Fetching categories from API...')

        const response = await publicAxios.get('/ecommerce/public/categories/featured/');
        // console.log('Featured Categories API Response:', response.data)

        // ✅ Check if we have any featured categories
        if (response.data && response.data.length > 0) {
          setHasFeaturedCategories(true);

          // Ensure no duplicate IDs - use combination of id and index for uniqueness
          const mappedCategories = response.data.map((category, index) => ({
            id: category.id,
            uniqueId: `${category.id}-${index}`, // Unique ID for React keys
            title: category.name,
            img: category.icon_url || `https://picsum.photos/seed/cat${category.id}/600/400`,
            description: category.description || `Category ${category.name}`,
            product_count: category.product_count || 0,
            is_featured: category.is_featured || false
          }))

          // Remove any possible duplicates by id
          const uniqueCategories = Array.from(
            new Map(mappedCategories.map(item => [item.id, item])).values()
          )

          // console.log('Unique featured categories:', uniqueCategories.length)
          setCategories(uniqueCategories)
          setError(null)
        } else {
          // ✅ No featured categories found
          setHasFeaturedCategories(false);
          setCategories([]);
          setError(null);
        }
      } catch (err) {
        // console.error('Error fetching categories:', err)
        setError('Failed to load categories. Please try again later.')
        setHasFeaturedCategories(false);
        // Don't set fallback data for featured categories
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // --- Utility Hooks for Slider Logic ---

  useEffect(() => {
    const setFromWidth = () => {
      const w = window.innerWidth
      if (w >= 1280) setItemsPerView(7)
      else if (w >= 1024) setItemsPerView(4)
      else if (w >= 768) setItemsPerView(3)
      else setItemsPerView(2)
    }
    setFromWidth()
    window.addEventListener('resize', setFromWidth)
    return () => window.removeEventListener('resize', setFromWidth)
  }, [])

  useEffect(() => {
    setStart(0)
  }, [itemsPerView])

  // FIXED: Ensure visible items are unique
  const visible = useMemo(() => {
    if (categories.length === 0) return []

    const out = []
    for (let i = 0; i < itemsPerView; i += 1) {
      const itemIndex = (start + i) % categories.length
      const item = categories[itemIndex]

      // Check if item already exists in out array
      const isDuplicate = out.some(existingItem => existingItem.id === item.id)

      if (!isDuplicate) {
        out.push({
          ...item,
          sliderIndex: i // Add unique index for slider position
        })
      } else {
        // If duplicate, get the next item
        const nextIndex = (itemIndex + 1) % categories.length
        const nextItem = categories[nextIndex]
        if (nextItem && !out.some(existing => existing.id === nextItem.id)) {
          out.push({
            ...nextItem,
            sliderIndex: i
          })
        }
      }
    }
    return out
  }, [start, itemsPerView, categories])

  const prev = () => {
    if (categories.length === 0) return
    setStart((s) => (s - 1 + categories.length) % categories.length)
  }

  const next = () => {
    if (categories.length === 0) return
    setStart((s) => (s + 1) % categories.length)
  }

  // Slower Auto-slide: 7000ms (7 seconds) - only if we have categories
  useEffect(() => {
    if (categories.length === 0) return

    const id = setInterval(() => {
      setStart((s) => (s + 1) % categories.length)
    }, 7000)

    return () => clearInterval(id)
  }, [categories.length])

  // --- Modal Logic ---

  const openModal = (category, e) => {
    if (!category) return

    e.preventDefault()
    e.stopPropagation()
    setModalProduct(category)
    // Delay setting isModalOpen to true to initiate the smooth transition
    setTimeout(() => setIsModalOpen(true), 10)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    // Delay setting modalProduct to null until the smooth transition completes
    setTimeout(() => setModalProduct(null), TRANSITION_DURATION)
  }

  // Component for the Quick View Modal (Internal Component)
  const QuickViewModal = () => {
    if (!modalProduct) return null

    // Tailwind classes for smooth transition
    const backdropClass = `fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isModalOpen ? 'opacity-100' : 'opacity-0'} ${isModalOpen ? 'bg-black/40' : 'bg-black/0'}`
    const modalContentClass = `w-11/12 max-w-2xl rounded-lg bg-white p-6 shadow-2xl transition-all duration-300 transform ${isModalOpen ? 'scale-100 translate-y-0' : 'scale-90 translate-y-4'}`

    return (
      <div
        className={backdropClass} // Smooth dimming
        onClick={closeModal}
      >
        <div
          className={modalContentClass} // Smooth scaling/moving
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Category: {modalProduct.title}</h3>
            <button
              onClick={closeModal}
              className="p-1 rounded-full text-gray-400 hover:text-gray-700 transition"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex gap-6">
            <div className="w-1/2 flex flex-col items-center">
              <img
                src={modalProduct.img}
                alt={modalProduct.title}
                className="w-full h-56 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = `https://picsum.photos/seed/cat${modalProduct.id}/600/400`
                }}
              />
              <div className="mt-3 text-center">
                <p className="text-sm text-gray-600">{modalProduct.description}</p>
                <div className="mt-2 p-2 bg-blue-50 rounded-md">
                  <span className="text-blue-600 font-semibold">{modalProduct.product_count}</span>
                  <span className="text-gray-600 ml-2">products available</span>
                </div>
              </div>
            </div>

            <div className="w-1/2">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Category Details</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Active Status</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>Contains {modalProduct.product_count} items</span>
                  </li>
                </ul>
              </div>

              <div className="mt-4">
                <Link
                  to={`/category-products/?category=${modalProduct.id}`}
                  className="block w-full text-center rounded-md bg-blue-600 py-3 text-white font-medium hover:bg-blue-700 transition"
                >
                  View All Products
                </Link>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Explore subcategories and products in this category</p>
                <div className="flex gap-2">
                  <button className="flex-1 rounded-md bg-orange-500 py-2 text-white font-medium hover:bg-orange-600 transition text-sm">
                    Shop Now
                  </button>
                  <button className="flex-1 rounded-md bg-gray-800 py-2 text-white font-medium hover:bg-gray-900 transition text-sm">
                    Add to Favorites
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ✅ Main Conditional Return: If no featured categories, return null
  if (!hasFeaturedCategories && !loading && !error) {
    return null; // This will hide the entire component
  }

  // Loading state
  if (loading) {
    return (
      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">FEATURED CATEGORIES</h2>
          <div className="text-sm text-gray-400">Loading...</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: itemsPerView }).map((_, i) => (
            <div key={`loading-${i}`} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm h-full">
              <div className="h-40 w-full bg-gray-200 animate-pulse rounded-lg"></div>
              <div className="mt-2 h-4 bg-gray-200 animate-pulse rounded"></div>
              <div className="mt-1 h-3 bg-gray-100 animate-pulse rounded"></div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  // Error state
  if (error) {
    return (
      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">FEATURED CATEGORIES</h2>
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
    )
  }

  // Empty state (should not happen now, but keeping as safety)
  if (categories.length === 0) {
    return null; // Hide the component
  }

  // Debug log
  // console.log('Visible items for rendering:', visible.map(v => ({ id: v.id, title: v.title })))

  // --- Main Render ---

  return (
    <section className="mt-8 ">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">FEATURED CATEGORIES</h2>
        <Link to="/categorylist" className="text-sm text-blue-600 hover:text-blue-700">View all</Link>
      </div>
      <div className="relative group">
        <div className="flex overflow-hidden">
          {visible.map((category, index) => {
            // Use unique key combining id and sliderIndex
            const uniqueKey = `${category.id}-${category.sliderIndex || index}-${start}`

            return (
              <Link
                to={`/category-products/?category=${category.id}`}
                key={uniqueKey}
                className="flex-shrink-0 w-1/2 md:w-1/3 lg:w-1/4 xl:w-[16.29%] px-2 group flex justify-center"
              >
                <div
                  className="w-44 h-64 bg-white flex flex-col border border-blue-400 overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  style={{ borderRadius: "50% 50% 5% 5%" }}
                >

                  {/* Image Area */}
                  <div className="flex-1 flex items-center justify-center">
                    <img
                      src={category.img}
                      alt={category.title}
                      className="w-32 h-32 object-contain mix-blend-multiply"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = `https://picsum.photos/seed/cat${category.id}/600/400`
                      }}
                    />
                  </div>

                  {/* Separator Line */}
                  {/*<div className="mx-6 border-t border-gray-400"></div> */}

                  {/* Text Section */}
                  <div className="py-4 text-center bg-blue-100">
                    <h3 className="text-sm font-semibold text-black capitalize">
                      {category.title}
                    </h3>
                    <p className="text-xs text-gray-700">
                      {category.product_count} Products
                    </p>
                  </div> 

                </div>
              </Link>
            )
          })}
        </div>

        {/* Navigation buttons: opacity-0 group-hover:opacity-100 for hover visibility */}
        {categories.length > itemsPerView && (
          <>
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow border border-gray-200 hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition duration-300 z-30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow border border-gray-200 hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition duration-300 z-30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Smooth Modal Implementation */}
      <QuickViewModal />

    </section>
  )
}
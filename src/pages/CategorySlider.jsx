import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { publicAxios } from '../api/axios'

const DEFAULT_EYEBROW = 'Shop by category'
const DEFAULT_HEADING = 'Curated for retailers and shoppers'

export default function CategorySlider() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasFeaturedCategories, setHasFeaturedCategories] = useState(false)

  // ✅ Section heading (admin panel se aata hai)
  const [section, setSection] = useState({
    eyebrow: DEFAULT_EYEBROW,
    heading: DEFAULT_HEADING,
  })

  // Fetch section heading (alag effect: fail ho to bhi categories chalein)
  useEffect(() => {
    const fetchSection = async () => {
      try {
        const res = await publicAxios.get('api/ecommerce/public/category-section/')
        setSection({
          eyebrow: res.data?.eyebrow ?? DEFAULT_EYEBROW,
          heading: res.data?.heading || DEFAULT_HEADING,
        })
      } catch (err) {
        console.error('Error fetching section heading:', err)
      }
    }
    fetchSection()
  }, [])

  // Fetch featured categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)

        const response = await publicAxios.get(
          '/ecommerce/public/categories/featured/'
        )

        if (response.data && response.data.length > 0) {
          setHasFeaturedCategories(true)

          const mappedCategories = response.data.map((category, index) => ({
            id: category.id,
            uniqueId: `${category.id}-${index}`,
            title: category.name,
            img:
              category.icon_url ||
              `https://picsum.photos/seed/cat${category.id}/600/400`,
            banner:
              category.banner_url ||
              category.icon_url ||
              `https://picsum.photos/seed/cat${category.id}/800/500`,
            hasBanner: !!category.banner_url,
            description: category.description || `Category ${category.name}`,
            product_count: category.product_count || 0,
            is_featured: category.is_featured || false,
          }))

          // Remove duplicates by id
          const uniqueCategories = Array.from(
            new Map(mappedCategories.map((item) => [item.id, item])).values()
          )

          setCategories(uniqueCategories)
          setError(null)
        } else {
          setHasFeaturedCategories(false)
          setCategories([])
          setError(null)
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError('Failed to load categories. Please try again later.')
        setHasFeaturedCategories(false)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Reusable heading block
  const SectionHeading = () => (
    <div>
      {section.eyebrow && (
        <p className="text-[11px] tracking-widest text-gray-500 uppercase">
          {section.eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-bold text-slate-900 max-w-md leading-tight">
        {section.heading}
      </h2>
    </div>
  )

  // Loading state
  if (loading) {
    return (
      <section className="mt-10">
        <div className="flex items-end justify-between mb-5">
          <SectionHeading />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="aspect-[8/5] w-full bg-gray-200 animate-pulse rounded-2xl"
            />
          ))}
        </div>
      </section>
    )
  }

  // Error state
  if (error) {
    return (
      <section className="mt-10">
        <div className="flex items-end justify-between mb-5">
          <SectionHeading />
        </div>
        <div className="text-center p-8 border border-red-200 bg-red-50 rounded-2xl">
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

  // No featured categories -> hide entire section
  if (!hasFeaturedCategories || categories.length === 0) {
    return null
  }

  const gridItems = categories.slice(0, 7)

  return (
    <section className="mt-10">
      <div className="flex items-end justify-between mb-5">
        <SectionHeading />
        <Link
          to="/categorylist"
          className="text-sm font-semibold text-slate-700 hover:text-blue-600 flex items-center gap-1"
        >
          All categories <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {gridItems.map((c) => (
          <Link
            key={c.uniqueId}
            to={`/category-products/?category=${c.id}`}
            className="group relative block aspect-[8/5] overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-shadow"
          >
            <img
              src={c.banner}
              alt={c.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = `https://picsum.photos/seed/cat${c.id}/800/500`
              }}
            />

            {/* banner na ho to title overlay */}
            {!c.hasBanner && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <span className="text-white text-xl font-bold uppercase text-center px-3">
                  {c.title}
                </span>
              </div>
            )}

            <span className="absolute bottom-3 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow text-xs">
              ↗
            </span>
          </Link>
        ))}

        {/* Last tile: Explore all */}
        <Link
          to="/categorylist"
          className="group relative block aspect-[8/5] overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-shadow bg-gradient-to-br from-amber-400 to-orange-400"
        >
          <img
            src="/explore-all-categories.jpg"
            alt="Explore all categories"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
          <span className="absolute bottom-3 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow text-xs">
            ↗
          </span>
        </Link>
      </div>
    </section>
  )
}
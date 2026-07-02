// MobileTopSellers.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { publicAxios } from '../api/axios'
import { FiChevronRight } from 'react-icons/fi'

// ================= INFINITE HORIZONTAL CARD SLIDER =================
// Clone trick: [lastClone, ...realCards, firstClone]
// Jab clone pe pahunche → silently real card pe jump (no animation)
// Result: har direction me infinite smooth scroll, koi jump nahi
function HorizontalCardSlider({ cards, renderCard, onActiveChange, autoIntervalMs = 5000 }) {
  const total = cards.length
  const [realIdx, setRealIdx] = useState(0)
  const containerRef = useRef(null)
  const autoTimerRef = useRef(null)
  const resumeTimerRef = useRef(null)
  const isTouchingRef = useRef(false)
  const isSnapJumpingRef = useRef(false)
  const realIdxRef = useRef(0)

  useEffect(() => { realIdxRef.current = realIdx }, [realIdx])

  const scrollToDomIdx = useCallback((domIdx, animated = true) => {
    const el = containerRef.current
    if (!el) return
    const child = el.children[domIdx]
    if (!child) return
    const target = child.offsetLeft - (el.offsetWidth - child.offsetWidth) / 2
    el.scrollTo({ left: Math.max(0, target), behavior: animated ? 'smooth' : 'instant' })
  }, [])

  useEffect(() => {
    if (total === 0) return
    requestAnimationFrame(() => scrollToDomIdx(1, false))
  }, [total, scrollToDomIdx])

  const goToReal = useCallback((idx, animated = true) => {
    if (total === 0) return
    const next = ((idx % total) + total) % total
    setRealIdx(next)
    realIdxRef.current = next
    onActiveChange?.(next)
    scrollToDomIdx(next + 1, animated)
  }, [total, onActiveChange, scrollToDomIdx])

  const stopAuto = useCallback(() => clearInterval(autoTimerRef.current), [])

  const startAuto = useCallback(() => {
    if (total < 2) return
    clearInterval(autoTimerRef.current)
    autoTimerRef.current = setInterval(() => {
      if (!isTouchingRef.current) {
        goToReal(realIdxRef.current + 1)
      }
    }, autoIntervalMs)
  }, [total, goToReal, autoIntervalMs])

  const scheduleResume = useCallback(() => {
    clearTimeout(resumeTimerRef.current)
    resumeTimerRef.current = setTimeout(() => startAuto(), 2000)
  }, [startAuto])

  useEffect(() => {
    startAuto()
    return () => {
      clearInterval(autoTimerRef.current)
      clearTimeout(resumeTimerRef.current)
    }
  }, [startAuto])

  useEffect(() => {
    const el = containerRef.current
    if (!el || total === 0) return
    let t = null
    const onScroll = () => {
      clearTimeout(t)
      t = setTimeout(() => {
        if (isTouchingRef.current) return
        const center = el.scrollLeft + el.offsetWidth / 2
        let closestDom = 0, minDist = Infinity
        Array.from(el.children).forEach((child, i) => {
          const dist = Math.abs(child.offsetLeft + child.offsetWidth / 2 - center)
          if (dist < minDist) { minDist = dist; closestDom = i }
        })
        const domCount = total + 2
        if (closestDom === 0) {
          isSnapJumpingRef.current = true
          scrollToDomIdx(total, false)
          setRealIdx(total - 1); realIdxRef.current = total - 1
          onActiveChange?.(total - 1)
          setTimeout(() => { isSnapJumpingRef.current = false }, 50)
        } else if (closestDom === domCount - 1) {
          isSnapJumpingRef.current = true
          scrollToDomIdx(1, false)
          setRealIdx(0); realIdxRef.current = 0
          onActiveChange?.(0)
          setTimeout(() => { isSnapJumpingRef.current = false }, 50)
        } else {
          const newReal = closestDom - 1
          if (newReal !== realIdxRef.current) {
            setRealIdx(newReal); realIdxRef.current = newReal
            onActiveChange?.(newReal)
          }
        }
      }, 80)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => { el.removeEventListener('scroll', onScroll); clearTimeout(t) }
  }, [total, onActiveChange, scrollToDomIdx])

  const onTouchStart = useCallback(() => {
    isTouchingRef.current = true
    stopAuto()
    clearTimeout(resumeTimerRef.current)
  }, [stopAuto])

  const onTouchEnd = useCallback(() => {
    isTouchingRef.current = false
    scheduleResume()
  }, [scheduleResume])

  if (!cards.length) return null

  const displayCards = [cards[total - 1], ...cards, cards[0]]

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-2 px-3 py-3"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        {displayCards.map((card, domI) => {
          const realI = domI === 0 ? total - 1 : domI === total + 1 ? 0 : domI - 1
          return (
            <div
              key={`${domI}-${card?.id ?? domI}`}
              className="flex-shrink-0 snap-center transition-all duration-300 w-[55%]"
            >
              {renderCard(card, realI, realI === realIdx)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ================= VENDOR CARD =================
function VendorCard({ vendor, isActive, index }) {
  return (
    <Link to={`/vendor/${vendor.id}`} className="block">
      <div className="bg-white rounded-xl overflow-hidden shadow-md p-3">
        <div className="flex items-center gap-3">
          <img
            src={vendor.logo}
            className="w-12 h-12 rounded-full object-cover"
            onError={(e) => e.target.src = `https://picsum.photos/seed/logo${vendor.id}/100/100`}
            alt={vendor.name}
          />
          <div>
            <h3 className="font-semibold text-gray-800">{vendor.name}</h3>
            <p className="text-xs text-gray-500">{vendor.stats?.products} products</p>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ================= MAIN EXPORT =================
export default function MobileTopSellers() {
  const [topSellers, setTopSellers] = useState([])
  const [topSellersLoading, setTopSellersLoading] = useState(true)
  const [activeSellerIdx, setActiveSellerIdx] = useState(0)

  useEffect(() => {
    const fetchTopSellers = async () => {
      try {
        setTopSellersLoading(true)
        const response = await publicAxios.get('/ecommerce/public/vendors/')

        const mappedVendors = response.data
          .filter(vendor => vendor.is_approved === true)
          .slice(0, 12)
          .map((vendor, idx) => ({
            id: vendor.id,
            name: vendor.business_name,
            owner: vendor.owner_name || 'Vendor',
            city: vendor.city || '',
            state: vendor.state || '',
            stats: {
              reviews: Math.floor(Math.random() * 200) + 10,
              products: vendor.product_count || Math.floor(Math.random() * 200) + 1,
            },
            banner: vendor.store_logo_url || `https://picsum.photos/seed/vendor${vendor.id}/300/150`,
            logo: vendor.store_logo_url || `https://picsum.photos/seed/logo${vendor.id}/100/100`,
            vendor_type: vendor.vendor_type || 'product',
            is_approved: vendor.is_approved || false,
          }))

        const uniqueVendors = Array.from(
          new Map(mappedVendors.map(item => [item.id, item])).values()
        )

        setTopSellers(uniqueVendors)
      } catch (err) {
        console.error('Error fetching top sellers:', err)
        const fallbackData = Array.from({ length: 8 }).map((_, i) => ({
          id: i + 1,
          name: ['Kids Corner', 'ElectroHub', 'Fashion Store', 'Home Decor',
                 'Sports Zone', 'Book World', 'Grocery Mart', 'Tech Store'][i],
          stats: { reviews: Math.floor(Math.random() * 200), products: Math.floor(Math.random() * 200) + 1 },
          banner: `https://picsum.photos/seed/vendor${i}/300/150`,
          logo: `https://picsum.photos/seed/logo${i}/100/100`,
        }))
        setTopSellers(fallbackData)
      } finally {
        setTopSellersLoading(false)
      }
    }
    fetchTopSellers()
  }, [])

  if (topSellersLoading) {
    return (
      <section className="mt-6">
        <div className="px-4 py-2">
          <div className="h-5 w-28 bg-gray-300 rounded animate-pulse" />
        </div>
        <div className="px-3 py-2">
          <div className="h-[280px] bg-gray-300 rounded-xl animate-pulse" />
        </div>
      </section>
    )
  }

  if (!topSellers.length) return null

  return (
    <section className="mt-6">
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-purple-500 to-pink-500"></div>
          <h2 className="text-base font-bold text-gray-800"> Top Sellers</h2>
        </div>
        <Link to="/sellerlist" className="text-xs text-purple-600 font-semibold flex items-center gap-0.5">
          View All <FiChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <HorizontalCardSlider
        cards={topSellers}
        renderCard={(vendor, idx, isActive) => (
          <VendorCard
            vendor={vendor}
            isActive={isActive}
            index={idx}
          />
        )}
        onActiveChange={setActiveSellerIdx}
        autoIntervalMs={5000}
      />

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  )
}
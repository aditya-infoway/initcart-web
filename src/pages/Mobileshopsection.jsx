// MobileShopSection.jsx - COMPLETE FINAL VERSION
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { publicAxios, axiosInstance } from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { FiTruck, FiRefreshCw, FiZap, FiShield, FiChevronRight, FiStar, FiShoppingBag, FiUsers } from 'react-icons/fi'

// Import Mobile Service Slider (alag file se)
import MobileServiceSlider from './MobileServiceSegments';
import MobileUpcomingDeals from './MobileUpcomingDeals';
import MobileDealOfTheDay from './MobileDealofDay';
import MobileFeaturedDeal from './MobileFeaturedDeals';
import MobileBrandSlider from './MobileBrands';

// Extracted Sections
import MobileFlashDeals from './MobileFlashDeal';
import MobileTopSellers from './MobileTopSallers';
import MobileHomeSliders from './MobileHomeSliders';

// Bold Vertical Gradients
const getBoldVerticalGradient = (color) => {
  return `linear-gradient(180deg, ${color}08 0%, ${color}20 30%, ${color}35 70%, ${color}45 100%)`
}

// Bold Card Color Palettes
const CARD_PALETTES = [
  { color: '#1565C0', borderColor: '#1976D2', lightColor: '#42A5F5', name: 'Blue' },
  { color: '#E65100', borderColor: '#EF6C00', lightColor: '#FF9800', name: 'Orange' },
  { color: '#2E7D32', borderColor: '#388E3C', lightColor: '#66BB6A', name: 'Green' },
  { color: '#C62828', borderColor: '#D32F2F', lightColor: '#EF5350', name: 'Red' },
  { color: '#4527A0', borderColor: '#5E35B1', lightColor: '#7E57C2', name: 'Purple' },
  { color: '#00695C', borderColor: '#00897B', lightColor: '#4DB6AC', name: 'Teal' },
  { color: '#F57F17', borderColor: '#F9A825', lightColor: '#FFD54F', name: 'Amber' },
  { color: '#6A1B9A', borderColor: '#8E24AA', lightColor: '#AB47BC', name: 'Lavender' },
]

const getPalette = (idx) => CARD_PALETTES[idx % CARD_PALETTES.length]

const getImg = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  const clean = path.replace(/^\/+/, '')
  const baseUrl = process.env.REACT_APP_API_URL || 'https://api.initcart.in'
  return `${baseUrl}/${clean.startsWith('media/') ? '' : 'media/'}${clean}`
}

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

      {/* {total > 1 && (
        <div className="flex justify-center gap-1.5 mt-1 pb-2">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => goToReal(i)}
              className={`transition-all duration-300 rounded-full ${
                i === realIdx ? 'w-5 h-1.5 bg-gray-700' : 'w-1.5 h-1.5 bg-gray-400'
              }`}
            />
          ))}
        </div>
      )} */}
    </div>
  )
}

// ================= BANNER CARD =================
function BannerCard({ banner, isActive }) {
  return (
    <div 
      className={`rounded-xl overflow-hidden shadow-md transition-all duration-300 h-[300px] border-2 border-gray-200 ${
        isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-80'
      }`}
    >
      {banner.image ? (
        <div className="relative w-full h-full">
          {banner.title && (
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b to-transparent p-3 rounded-t-xl">
              <h2 className="text-black text-base font-bold text-left">{banner.title}</h2>
            </div>
          )}
          <img
            src={getImg(banner.image)}
            alt={banner.title || 'Banner'}
            className="w-full h-full object-cover"
          />
          {(banner.subtitle || banner.button_text) && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 rounded-b-xl">
              {banner.subtitle && (
                <p className="text-white/80 text-[10px] mt-0.5 text-left">{banner.subtitle}</p>
              )}
              {banner.button_text && banner.button_url && (
                <a 
                  href={banner.button_url}
                  className="inline-block mt-1.5 px-3 py-1 bg-white rounded-lg text-orange-600 text-[10px] font-semibold shadow-sm"
                >
                  {banner.button_text}
                </a>
              )}
            </div>
          )}
        </div>
      ) : (
        <div 
          className="w-full h-full flex flex-col items-start justify-between p-4 text-white"
          style={{ background: 'linear-gradient(135deg, #FF6B35, #F7931E)' }}
        >
          {banner.title && (
            <h2 className="text-white text-base font-bold text-left w-full">{banner.title}</h2>
          )}
          <div className="w-full">
            {banner.subtitle && (
              <p className="text-white/90 text-[10px] mt-0.5 text-left">{banner.subtitle}</p>
            )}
            {banner.button_text && banner.button_url && (
              <a 
                href={banner.button_url}
                className="inline-block mt-2 px-3 py-1 bg-white rounded-full text-orange-600 text-[10px] font-semibold"
              >
                {banner.button_text}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ================= CATEGORY CARD =================
function CategoryCard({ category, products, isActive, index }) {
  const palette = getPalette(index)
  const displayProducts = (products || []).slice(0, 4)
  const emptySlots = 4 - displayProducts.length

  return (
    <Link
      to={`/category-products/?subcategory=${category.id}`}
      className={`block rounded-xl overflow-hidden shadow-lg transition-all duration-300 h-[300px] ${
        isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-80'
      }`}
      style={{ 
        background: getBoldVerticalGradient(palette.color),
        border: `2px solid ${palette.borderColor}`,
        boxShadow: `0 4px 12px ${palette.color}30`
      }}
    >
      <div className="p-2 h-full flex flex-col">
        <div className="mb-2 pb-1 border-b-2" style={{ borderBottomColor: `${palette.borderColor}50` }}>
          <h3 className="text-sm font-bold text-gray-800 text-center">{category.title}</h3>
          <p className="text-[10px] text-center mt-0.5" style={{ color: palette.color }}>
            {products?.length || category.product_count || 0} items
          </p>
        </div>

        <div className="flex-1 min-h-0">
          <div className="grid grid-cols-2 gap-1.5 aspect-square">
            {displayProducts.map((prod, pi) => (
              <div
                key={prod.id || pi}
                className="rounded-lg overflow-hidden bg-white/90 backdrop-blur-sm aspect-square flex items-center justify-center shadow-sm border"
                style={{ borderColor: `${palette.borderColor}40` }}
              >
                <img
                  src={getImg(prod.stocks?.[0]?.variant_image_url || prod.main_image) || `https://picsum.photos/seed/p${prod.id}/200/200`}
                  alt={prod.name || 'Product'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
            {[...Array(emptySlots)].map((_, ei) => (
              <div
                key={`empty-${ei}`}
                className="rounded-lg overflow-hidden bg-white/60 backdrop-blur-sm aspect-square flex items-center justify-center border border-dashed"
                style={{ borderColor: `${palette.borderColor}60` }}
              >
                <FiShoppingBag className="w-5 h-5" style={{ color: palette.color }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}

// ================= MAIN COMPONENT =================
export default function MobileShopSection({ onBgColorChange }) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addToast } = useToast()

  const [allCards, setAllCards] = useState([])
  const [categories, setCategories] = useState([])
  const [categoryProducts, setCategoryProducts] = useState({})
  const [activeCardIdx, setActiveCardIdx] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch Main Data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true)
        
        let banners = []
        try {
          const bannersRes = await publicAxios.get('/api/banners/mobile/banners/')
          banners = bannersRes.data || []
        } catch (err) {
          console.error('Banner fetch error:', err)
          banners = []
        }
        
        const catsRes = await publicAxios.get('/ecommerce/public/subcategories/')
        const data = catsRes.data || []
        const uniqueCats = Array.from(new Map(data.map(d => [d.id, {
          id: d.id,
          title: d.name,
          product_count: d.product_count || 0,
        }])).values()).slice(0, 10)
        
        setCategories(uniqueCats)

        if (uniqueCats.length > 0) {
          const ids = uniqueCats.map(s => s.id).join(',')
          const pRes = await publicAxios.get(`/ecommerce/public/subcategory-products/?subcategory_ids=${ids}&products_per_subcat=4`)
          if (pRes.data.success) {
            setCategoryProducts(pRes.data.data)
          }
        }
        
        const combined = []
        
        if (banners.length > 0) {
          const maxLength = Math.max(banners.length, uniqueCats.length)
          for (let i = 0; i < maxLength; i++) {
            if (i < banners.length) {
              combined.push({ type: 'banner', data: banners[i] })
            }
            if (i < uniqueCats.length) {
              combined.push({ type: 'category', data: uniqueCats[i] })
            }
          }
        } else {
          uniqueCats.forEach(cat => {
            combined.push({ type: 'category', data: cat })
          })
        }
        
        setAllCards(combined)
        
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAllData()
  }, [])

  useEffect(() => {
    if (allCards[activeCardIdx]?.type === 'category') {
      const catIndex = categories.findIndex(c => c.id === allCards[activeCardIdx]?.data?.id)
      const palette = getPalette(catIndex)
      onBgColorChange?.(`${palette.color}20`)
    } else {
      onBgColorChange?.('#f8f9fa')
    }
  }, [activeCardIdx, allCards, categories, onBgColorChange])

  const renderCard = (card, idx, isActive) => {
    if (card.type === 'banner') {
      return <BannerCard banner={card.data} isActive={isActive} />
    } else {
      const catIndex = categories.findIndex(c => c.id === card.data?.id)
      return (
        <CategoryCard
          category={card.data}
          products={categoryProducts[card.data?.id]?.products}
          isActive={isActive}
          index={catIndex}
        />
      )
    }
  } 

  return (
    <div className="bg-gray-100 pb-20">
      
      {/* 1. MAIN SLIDER - Banners + Categories */}
      {!loading && allCards.length > 0 && (
        <section className="mt-3">
          <div className="px-4 py-2 flex items-center justify-end">
            <Link to="/subcategorieslist" className="text-xs text-blue-600 font-semibold flex items-center gap-0.5">
              See All <FiChevronRight className="w-3 h-3" />
            </Link>
          </div>
          
          <HorizontalCardSlider
            cards={allCards}
            renderCard={renderCard}
            onActiveChange={setActiveCardIdx}
            autoIntervalMs={5000}
          />
        </section>
      )}

      {loading && (
        <section className="mt-3">
          <div className="px-4 py-2">
            <div className="h-5 w-28 bg-gray-300 rounded animate-pulse" />
          </div>
          <div className="px-3 py-2">
            <div className="h-[300px] bg-gray-300 rounded-xl animate-pulse" />
          </div>
        </section>
      )}

      {/* 2. SERVICE SEGMENT SLIDER */}
      <MobileServiceSlider />

      {/* 3. FLASH DEALS - Extracted to MobileFlashDeals.jsx */}
      <MobileFlashDeals />

      {/* 4. UPCOMING FLASH DEALS */}
      <MobileUpcomingDeals />

      {/* 5. TOP SELLERS - Extracted to MobileTopSellers.jsx */}
      <MobileTopSellers />

      {/* 6. FEATURED DEAL */}
      <MobileFeaturedDeal />
    
      {/* 7. DEAL OF THE DAY */}
      <MobileDealOfTheDay />

      <MobileBrandSlider />

      <MobileHomeSliders />
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
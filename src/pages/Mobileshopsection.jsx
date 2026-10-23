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

// ================= OVERLAY COLOUR HELPERS (website SubCategorySlider jaisa) =================
const hexToRgb = (hex) => {
  const h = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : '#000000'
  return {
    r: parseInt(h.slice(1, 3), 16),
    g: parseInt(h.slice(3, 5), 16),
    b: parseInt(h.slice(5, 7), 16),
  }
}

// Colour halka ho to text kala, gehra ho to text safed
const textColorFor = (hex) => {
  const { r, g, b } = hexToRgb(hex)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? '#111111' : '#ffffff'
}

const overlayGradient = (hex) => {
  const { r, g, b } = hexToRgb(hex)
  return `linear-gradient(to bottom, rgba(${r},${g},${b},0.92) 0%, rgba(${r},${g},${b},0.65) 45%, rgba(${r},${g},${b},0) 100%)`
}

const getImg = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  const clean = path.replace(/^\/+/, '')
  const baseUrl = process.env.REACT_APP_API_URL || 'https://api.initcart.com/'
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
    </div>
  )
}

// ================= BANNER CARD (marketing banners - UNCHANGED) =================
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

// ================= SUBCATEGORY CARD (website SubCategorySlider jaisa) =================
// Banner/icon image + upar overlay gradient (admin ka overlay_color) + title + description + SHOP NOW
function CategoryCard({ category, overlayColor, isActive }) {
  return (
    <Link
      to={`/category-products/?subcategory=${category.id}`}
      className={`group relative block h-[300px] overflow-hidden rounded-xl bg-gray-900 shadow-md transition-all duration-300 ${
        isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-80'
      }`}
    >
      {/* Banner image */}
      <img
        src={category.image}
        alt={category.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => {
          e.target.onerror = null
          e.target.src = `https://picsum.photos/seed/sub${category.id}/600/1000`
        }}
      />

      {/* Overlay layer for text visibility */}
      <div
        className="absolute inset-x-0 top-0 h-[70%] pointer-events-none"
        style={{ background: overlayGradient(overlayColor) }}
      />

      {/* Text */}
      <div
        className="absolute top-0 left-0 right-0 p-3"
        style={{ color: textColorFor(overlayColor) }}
      >
        <h3 className="text-sm font-semibold line-clamp-1">{category.title}</h3>
        {category.description && (
          <p className="mt-1 text-xs opacity-90 line-clamp-2">{category.description}</p>
        )}
        <span className="mt-2 inline-block text-xs font-medium border-b border-current/70">
          SHOP NOW →
        </span>
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
  const [activeCardIdx, setActiveCardIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [overlayColor, setOverlayColor] = useState('#000000')

  // Fetch Main Data (banners + subcategories — subcategories website jaise)
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true)
        
        // Marketing banners — jaise pehle the
        let banners = []
        try {
          const bannersRes = await publicAxios.get('/api/banners/mobile/banners/')
          banners = bannersRes.data || []
        } catch (err) {
          console.error('Banner fetch error:', err)
          banners = []
        }
        
        // Subcategories — website SubCategorySlider ke same fetch + mapping
        let uniqueCats = []
        try {
          const catsRes = await publicAxios.get('/ecommerce/public/subcategories/')
          const mapped = (catsRes.data || []).map((subCat) => ({
            id: subCat.id,
            title: subCat.name,
            description: subCat.description || '',
            image: subCat.banner_url || subCat.icon_url,
          }))
          // Remove duplicates by id
          uniqueCats = Array.from(new Map(mapped.map((i) => [i.id, i])).values())
        } catch (err) {
          console.error('Error fetching subcategories:', err)
          uniqueCats = []
        }
        
        // Banner / category interleave — jaise pehle tha
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

  // Global overlay colour (alag effect — fail ho to bhi cards chalenge)
  useEffect(() => {
    const fetchColor = async () => {
      try {
        const res = await publicAxios.get('api/ecommerce/public/subcategory-section/')
        setOverlayColor(res.data?.overlay_color || '#000000')
      } catch (err) {
        console.error('Error fetching section colour:', err)
      }
    }
    fetchColor()
  }, [])

  // Page background: subcategory card active ho to admin ke overlay colour ki halki jhalak
  useEffect(() => {
    const isCategory = allCards[activeCardIdx]?.type === 'category'
    if (isCategory && /^#[0-9a-fA-F]{6}$/.test(overlayColor)) {
      onBgColorChange?.(`${overlayColor}20`)
    } else {
      onBgColorChange?.('#f8f9fa')
    }
  }, [activeCardIdx, allCards, overlayColor, onBgColorChange])

  const renderCard = (card, idx, isActive) => {
    if (card.type === 'banner') {
      return <BannerCard banner={card.data} isActive={isActive} />
    }
    return (
      <CategoryCard
        category={card.data}
        overlayColor={overlayColor}
        isActive={isActive}
      />
    )
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
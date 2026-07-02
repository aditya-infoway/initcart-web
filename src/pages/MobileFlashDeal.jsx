// MobileFlashDeals.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { publicAxios, axiosInstance } from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { FiZap, FiChevronRight, FiShoppingBag } from 'react-icons/fi'

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

  // On mount: position at first real card (dom index 1) without animation
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

  // After scroll settles: detect clone → silent jump to real counterpart
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
          // last-clone → real last
          isSnapJumpingRef.current = true
          scrollToDomIdx(total, false)
          setRealIdx(total - 1); realIdxRef.current = total - 1
          onActiveChange?.(total - 1)
          setTimeout(() => { isSnapJumpingRef.current = false }, 50)
        } else if (closestDom === domCount - 1) {
          // first-clone → real first
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

  // [lastCard, ...allCards, firstCard]
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

// ================= DEAL CARD =================
function DealCard({ product, isActive, index, dealType = 'flash', onAddToCart }) {
  const palette = getPalette(index)
  const imgUrl = getImg(product?.productData?.stocks?.[0]?.variant_image || product?.productData?.main_image || product?.img) || `https://picsum.photos/seed/deal${product.id}/300/300`
  const finalPrice = product.price - (product.price * (product.discount || 0) / 100)

  return (
    <Link
      to={`/product/${product.id}`}
      className={`block rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
        isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-80'
      }`}
      style={{
        background: getBoldVerticalGradient(palette.color),
        border: `2px solid ${palette.borderColor}`,
        boxShadow: `0 4px 12px ${palette.color}30`
      }}
    >
      <div className="p-2">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-white/90 backdrop-blur-sm">
          <img
            src={imgUrl}
            alt={product.title}
            className="w-full h-full object-contain p-1"
            loading="lazy"
          />

          {product.discount > 0 && (
            <div
              className="absolute top-1 right-1 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm"
              style={{ backgroundColor: palette.color }}
            >
              {product.discount}% OFF
            </div>
          )}

          <div className="absolute top-1 left-1 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-black/50 backdrop-blur-sm">
            {dealType === 'flash' ? '' : ''} {dealType === 'flash' ? 'FLASH' : 'FEATURED'}
          </div>
        </div>
      </div>

      <div className="px-2 pb-2">
        <p className="text-xs font-medium text-gray-800 truncate">{product.title}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-sm font-bold" style={{ color: palette.color }}>
            ₹{finalPrice.toFixed(0)}
          </span>
          {product.original_price > product.price && (
            <span className="text-[9px] text-gray-400 line-through">
              ₹{Number(product.original_price).toFixed(0)}
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault()
            onAddToCart?.(product)
          }}
          className="mt-1.5 w-full py-1 rounded-lg text-white text-[9px] font-semibold transition-all active:scale-95 shadow-sm"
          style={{ backgroundColor: palette.color }}
        >
          Add to Cart
        </button>
      </div>
    </Link>
  )
}

// ================= MAIN EXPORT =================
export default function MobileFlashDeals() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addToast } = useToast()
  const [flashProducts, setFlashProducts] = useState([])

  useEffect(() => {
    const fetchFlashDeals = async () => {
      try {
        const campaignRes = await publicAxios.get('/api/ecommerce/public/campaigns/')
        const campaigns = campaignRes.data || []

        const flash = campaigns.find(c => c.campaign_type === 'Flash')
        if (flash) {
          const pRes = await publicAxios.get(`/api/ecommerce/public/campaigns/${flash.id}/products/`)
          setFlashProducts(pRes.data.map((p) => ({
            id: p.product_details?.id || p.id,
            title: p.product_details?.product_name || 'Product',
            price: p.final_price || p.original_price || 0,
            original_price: p.original_price,
            discount: p.discount_percentage,
            productData: p.product_details || p,
          })))
        }
      } catch (err) {
        console.error('Flash deals fetch error:', err)
      }
    }
    fetchFlashDeals()
  }, [])

  const addToCart = async (product) => {
    if (!isAuthenticated) {
      addToast?.('Please login to add items to cart', 'warning')
      navigate('/customer/login')
      return
    }
    try {
      const stockId = product.productData?.stocks?.[0]?.id || product.id
      await axiosInstance.post('api/public/cart/', { product_stock: stockId, quantity: 1 })
      addToast?.('Added to cart!', 'success')
    } catch (err) {
      console.error('Add to cart error:', err)
      addToast?.('Failed to add to cart', 'error')
    }
  }

  if (!flashProducts.length) return null

  return (
    <section className="mt-4">
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <FiZap className="text-red-600 text-sm" />
          <h2 className="text-base font-bold text-red-600">Flash Deals</h2>
        </div>
        <Link to="/FlashDealListPage" className="text-xs text-red-600 font-semibold flex items-center gap-0.5">
          See All <FiChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <HorizontalCardSlider
        cards={flashProducts}
        renderCard={(prod, idx, isActive) => (
          <DealCard
            product={prod}
            isActive={isActive}
            index={idx + 10}
            dealType="flash"
            onAddToCart={addToCart}
          />
        )}
        onActiveChange={() => {}}
        autoIntervalMs={4000}
      />

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  )
}
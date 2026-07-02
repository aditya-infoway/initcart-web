// MobileAppHeader.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { publicAxios } from '../api/axios'
import { FiSearch } from 'react-icons/fi'
import logo from "/logo.png"

// Pastel colours matching MobileShopSection CARD_PALETTES order
const PASTEL_COLORS = [
  { bg: '#DBEAFE', border: '#93C5FD' }, // Blue
  { bg: '#FFEDD5', border: '#FDBA74' }, // Orange
  { bg: '#DCFCE7', border: '#86EFAC' }, // Green
  { bg: '#FEE2E2', border: '#FCA5A5' }, // Red
  { bg: '#EDE9FE', border: '#C4B5FD' }, // Purple
  { bg: '#CCFBF1', border: '#5EEAD4' }, // Teal
  { bg: '#FEF9C3', border: '#FDE047' }, // Amber
  { bg: '#F3E8FF', border: '#D8B4FE' }, // Lavender
]

export default function MobileAppHeader({ activeBgColor = '#1565C0', onHeightChange }) {
  const navigate = useNavigate()
  const headerRef = useRef(null)
  const sugRef = useRef(null)
  const searchInputRef = useRef(null)
  const debounceRef = useRef(null)

  const [categories, setCategories] = useState([])
  const [loadingCats, setLoadingCats] = useState(true)

  const [searchText, setSearchText] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSug, setShowSug] = useState(false)
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState(false)

  // ── Fetch featured categories ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    const fetchCats = async () => {
      try {
        setLoadingCats(true)
        const res = await publicAxios.get('/ecommerce/public/categories/featured/')
        if (cancelled) return
        if (Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map((c, i) => ({
            id: c.id,
            title: c.name,
            img: c.icon_url || `https://picsum.photos/seed/cat${c.id}/80/80`,
            pastel: PASTEL_COLORS[i % PASTEL_COLORS.length],
          }))
          // Deduplicate by id
          const unique = Array.from(new Map(mapped.map(m => [m.id, m])).values())
          setCategories(unique)
        }
      } catch {
        // silent fail — no categories shown
      } finally {
        if (!cancelled) setLoadingCats(false)
      }
    }
    fetchCats()
    return () => { cancelled = true }
  }, [])

  // ── Report header height to parent (for paddingTop offset) ────────────────
  useEffect(() => {
    if (!headerRef.current || !onHeightChange) return
    const ro = new ResizeObserver(entries => {
      onHeightChange(entries[0].contentRect.height)
    })
    ro.observe(headerRef.current)
    return () => ro.disconnect()
  }, [onHeightChange])

  // ── Debounced search ───────────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!searchText.trim() || selected) {
      setSuggestions([])
      setShowSug(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setSearching(true)
        const res = await publicAxios.get('ecommerce/public/search/', {
          params: { query: searchText },
        })
        const data = Array.isArray(res.data) ? res.data : []
        setSuggestions(data)
        setShowSug(data.length > 0)
      } catch {
        setSuggestions([])
        setShowSug(false)
      } finally {
        setSearching(false)
      }
    }, 350)

    return () => clearTimeout(debounceRef.current)
  }, [searchText, selected])

  // ── Close suggestions on outside click ────────────────────────────────────
  useEffect(() => {
    const close = (e) => {
      if (sugRef.current && !sugRef.current.contains(e.target)) {
        setShowSug(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const goSearch = useCallback(() => {
    const v = searchText.trim()
    if (!v) return
    setShowSug(false)
    setSelected(false)
    navigate(`/searchlist?keywords=${encodeURIComponent(v)}`)
  }, [searchText, navigate])

  const onKey = useCallback((e) => {
    if (e.key === 'Enter') goSearch()
  }, [goSearch])

  const selectSug = useCallback((item) => {
    setShowSug(false)
    setSearchText(item.productName || '')
    setSelected(true)
    navigate(`/product/${item.id}`)
  }, [navigate])

  const handleSearchChange = useCallback((e) => {
    setSearchText(e.target.value)
    setSelected(false)
  }, [])

  const handleInputFocus = useCallback(() => {
    if (suggestions.length > 0) setShowSug(true)
  }, [suggestions.length])

  const headerBg = activeBgColor || '#1565C0'

  return (
    <div
      ref={headerRef}
      className="md:hidden fixed top-0 left-0 right-0 z-50"
      style={{ backgroundColor: headerBg, transition: 'background-color 0.4s ease' }}
    >
      {/* ── Logo Row ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 pt-2.5 pb-1">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0">
            <img
              src={logo}
              alt="InitCart"
              className="h-6 w-6 object-contain"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          </div>
          <span
            className="font-bold text-sm tracking-wide"
            style={{ color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
          >
            InitCart
          </span>
        </Link>
      </div>

      {/* ── Category Icons ────────────────────────────────────────────────── */}
      {loadingCats ? (
        <div className="overflow-x-auto px-3 pt-1 pb-1.5" style={{ scrollbarWidth: 'none' }}>
          <div className="flex gap-2 w-max">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="w-11 h-11 rounded-2xl bg-white/20 animate-pulse flex-shrink-0" />
            ))}
          </div>
        </div>
      ) : categories.length > 0 ? (
        <div
          className="overflow-x-auto px-3 pt-1 pb-1.5"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex gap-2 w-max">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category-products/?category=${cat.id}`}
                className="flex-shrink-0 flex flex-col items-center gap-0.5"
                title={cat.title}
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center overflow-hidden shadow-sm"
                  style={{
                    backgroundColor: cat.pastel.bg,
                    border: `1.5px solid ${cat.pastel.border}`,
                  }}
                >
                  <img
                    src={cat.img}
                    alt={cat.title}
                    className="w-7 h-7 object-contain"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = `https://picsum.photos/seed/cat${cat.id}/80/80`
                    }}
                  />
                </div>
                <span
                  className="text-[8px] font-medium text-center leading-tight max-w-[44px] truncate"
                  style={{ color: 'rgba(255,255,255,0.92)', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
                >
                  {cat.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {/* ── Search Bar ───────────────────────────────────────────────────── */}
      <div className="px-3 pt-1 pb-3" ref={sugRef}>
        <div className="relative">
          {/* Input row */}
          <div
            className="flex items-center bg-white overflow-hidden shadow-md"
            style={{ borderRadius: 12, height: 40 }}
          >
            {/* Left icon */}
            <div className="pl-3 pr-1 flex items-center flex-shrink-0">
              <FiSearch className="h-4 w-4 text-gray-400" />
            </div>

            {/* Input */}
            <input
              ref={searchInputRef}
              type="text"
              value={searchText}
              onChange={handleSearchChange}
              onKeyDown={onKey}
              onFocus={handleInputFocus}
              placeholder="Search products, brands..."
              className="flex-1 h-full px-1 text-sm text-gray-800 outline-none bg-transparent placeholder-gray-400"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />

            {/* Search button — light blue, full height */}
            <button
              type="button"
              onClick={goSearch}
              className="h-full flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: '#60A5FA',
                width: 52,
                borderRadius: '0 12px 12px 0',
              }}
              aria-label="Search"
            >
              <FiSearch className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* ── Suggestions Dropdown ──────────────────────────────────────── */}
          {showSug && (
            <div
              className="absolute left-0 right-0 bg-white border border-gray-100 overflow-hidden z-50"
              style={{
                top: 'calc(100% + 4px)',
                borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                maxHeight: 320,
                overflowY: 'auto',
              }}
            >
              {searching ? (
                <div className="flex items-center justify-center gap-2 p-4">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gray-400">Searching...</span>
                </div>
              ) : suggestions.length > 0 ? (
                <>
                  {suggestions.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      onClick={() => selectSug(item)}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 last:border-none active:bg-blue-50"
                      style={{ transition: 'background 0.15s' }}
                      onTouchStart={(e) => e.currentTarget.style.background = '#EFF6FF'}
                      onTouchEnd={(e) => e.currentTarget.style.background = ''}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.productName || ''}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                            <FiSearch className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {item.productName || 'Product'}
                        </p>
                        {item.price && (
                          <p className="text-xs text-green-600 font-semibold mt-0.5">
                            ₹{item.price}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* View all */}
                  <button
                    onClick={goSearch}
                    className="w-full text-center text-sm text-blue-600 font-medium py-3 bg-gray-50 active:bg-gray-100"
                  >
                    View all results for "{searchText}"
                  </button>
                </>
              ) : (
                <div className="p-4 text-center text-sm text-gray-400">
                  No results found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hide scrollbars globally for this component */}
      <style>{`
        .md\\:hidden ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
// MobileSearchBar.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch, FiX, FiArrowLeft } from 'react-icons/fi'
import { publicAxios } from '../api/axios'

export default function MobileSearchBar({ onClose, isOpen }) {
  const [searchText, setSearchText] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const inputRef = useRef(null)

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!searchText.trim() || searchText.length < 2) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        const response = await publicAxios.get('/ecommerce/public/search/', {
          params: { query: searchText }
        })
        setSuggestions(response.data.slice(0, 10))
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchText])

  const saveToRecent = (term) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const handleSearch = () => {
    if (!searchText.trim()) return
    saveToRecent(searchText)
    navigate(`/searchlist?keywords=${encodeURIComponent(searchText)}`)
    if (onClose) onClose()
  }

  const handleSuggestionClick = (product) => {
    saveToRecent(product.productName)
    navigate(`/product/${product.id}`)
    if (onClose) onClose()
  }

  const clearRecent = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Search Header */}
      <div className="flex items-center gap-3 p-3 border-b border-gray-200 bg-white">
        <button onClick={onClose} className="p-1">
          <FiArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex-1 flex items-center bg-gray-100 rounded-lg px-3 py-2">
          <FiSearch className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for products, brands and more..."
            className="flex-1 bg-transparent outline-none ml-2 text-sm"
          />
          {searchText && (
            <button onClick={() => setSearchText('')} className="p-1">
              <FiX className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        <button onClick={handleSearch} className="text-blue-600 font-medium text-sm">
          Search
        </button>
      </div>

      {/* Search Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {searchText ? (
          // Search Suggestions
          <div>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Searching...</p>
              </div>
            ) : suggestions.length > 0 ? (
              <div>
                <p className="text-xs text-gray-500 mb-2">Suggestions</p>
                {suggestions.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSuggestionClick(product)}
                    className="flex items-center gap-3 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                  >
                    <img 
                      src={product.image || 'https://via.placeholder.com/50'} 
                      alt={product.productName}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{product.productName}</p>
                      {product.price && (
                        <p className="text-xs text-blue-600 font-semibold">₹{product.price}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No results found for "{searchText}"</p>
              </div>
            )}
          </div>
        ) : (
          // Recent Searches
          <div>
            {recentSearches.length > 0 && (
              <>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-medium text-gray-700">Recent Searches</p>
                  <button onClick={clearRecent} className="text-xs text-blue-600">
                    Clear All
                  </button>
                </div>
                {recentSearches.map((term, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSearchText(term)
                      handleSearch()
                    }}
                    className="flex items-center gap-3 py-2 cursor-pointer"
                  >
                    <FiSearch className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{term}</span>
                  </div>
                ))}
              </>
            )}
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Popular Categories</p>
              <div className="flex flex-wrap gap-2">
                {['Electronics', 'Fashion', 'Home', 'Books', 'Toys', 'Sports'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSearchText(cat)
                      handleSearch()
                    }}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}       
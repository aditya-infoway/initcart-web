// MobileHomeView.jsx
import React, { useState, useEffect, useCallback } from 'react'
import MobileAppHeader from './MobileAppHeader'
import MobileShopSection from './MobileShopSection'

// Desktop Components
import Banner from './Banner.jsx'
import CategorySlider from './CategorySlider.jsx'
import SubCategorySlider from './SubCategorySlider.jsx'
import TopSellers from './TopSellers.jsx'
import ServiceSegmentSlider from './Services.jsx'
import FlashDeal from './FlashDeal.jsx'
import FeaturedDeal from './FeaturedDeal.jsx'
import Deal from './Deal-of-the-day.jsx'
import Brand from './Brand.jsx'
import FeatureBoxes from './FeatureBox.jsx'
import UpcomingDealsSlider from './UpcomingDealsSlider.js'
import HomeSliders from './HomeSliders.jsx'

// Card palette colours — same order as MobileShopSection CARD_PALETTES
const CARD_PALETTES = [
  '#1565C0', // Blue
  '#E65100', // Orange
  '#2E7D32', // Green
  '#C62828', // Red
  '#4527A0', // Purple
  '#00695C', // Teal
  '#F57F17', // Amber
  '#6A1B9A', // Lavender
]

export default function MobileHomeView() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  const [activeCardIndex, setActiveCardIndex] = useState(0)

  // Dynamic header height — measured via ResizeObserver in MobileAppHeader
  const [headerHeight, setHeaderHeight] = useState(140)

  // ── Responsive check ──────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── Card index handler (memoised to avoid MobileShopSection re-renders) ───
  const handleCardIndexChange = useCallback((idx) => {
    setActiveCardIndex(idx)
  }, [])

  // ── Header height handler ─────────────────────────────────────────────────
  const handleHeaderHeight = useCallback((h) => {
    setHeaderHeight(h)
  }, [])

  // Solid colour that both the outer wrapper AND header share
  const activeSolidColor = CARD_PALETTES[activeCardIndex % CARD_PALETTES.length]

  // ── Mobile layout ─────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="md:hidden min-h-screen bg-gray-100">
        {/* Fixed header — sits above everything */}
        <MobileAppHeader
          activeBgColor={activeSolidColor}
          onHeightChange={handleHeaderHeight}
        />

        {/*
          Coloured band that fills the gap between the fixed header and the
          first card section, so no white strip appears.
          Height matches the fixed header exactly.
        */}
        <div
          style={{
            height: headerHeight,
            backgroundColor: activeSolidColor,
            transition: 'background-color 0.4s ease',
            flexShrink: 0,
          }}
        />

        {/* Main scrollable content */}
        <MobileShopSection
          onBgColorChange={() => {}}          // colour now controlled here
          onCardIndexChange={handleCardIndexChange}
        />
      </div>
    )
  }

  // ── Desktop layout ────────────────────────────────────────────────────────
  return (
    <main className="hidden md:block bg-gray-50">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-1">
        <Banner />
        <ServiceSegmentSlider />
        <CategorySlider />
        <SubCategorySlider />
        <TopSellers />
        <FlashDeal />
        <div className="my-8">
          <UpcomingDealsSlider />
        </div>
        <FeaturedDeal />
        <Deal />
        <Brand />
        <HomeSliders />
        <FeatureBoxes />
      </section>
    </main>
  )
}
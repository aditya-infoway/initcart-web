import React from 'react'
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


export default function Home() {
  return (
    <main className=" bg-gray-50">
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
        <HomeSliders/>
        <FeatureBoxes />
      </section>
    </main>
  )
}

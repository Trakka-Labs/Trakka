import ScrollProgressBar from '../components/ui/ScrollProgressBar'
import Navbar from '../components/Navbar'
import Hero from '../components/sections/Hero'
import ProblemStatement from '../components/sections/ProblemStatement'
import Features from '../components/sections/Features'
import HowItWorks from '../components/sections/HowItWorks'
import ProductShowcase from '../components/sections/ProductShowcase'
import WhyTrakka from '../components/sections/WhyTrakka'
import Pricing from '../components/sections/Pricing'
import FAQ from '../components/sections/FAQ'
import FinalCTA from '../components/sections/FinalCTA'
import Footer from '../components/Footer'

export default function Landing() {
  return (
    <>
      <ScrollProgressBar />
      <Navbar />
      <main>
        <Hero />
        <ProblemStatement />
        <Features />
        <HowItWorks />
        <ProductShowcase />
        <WhyTrakka />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}

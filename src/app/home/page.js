"use client";
import styles from "./home.module.css";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import ProductGallery from "./components/ProductGallery";
import CustomizationFeatures from "./components/CustomizationFeatures";
import HowItWorks from "./components/HowItWorks";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div>
      <Navbar />
      {/* Keep HeroSection outside light background */}
      <HeroSection />

      {/* Light sections start here */}
      <div className={styles["home-page"]}>
        <ProductGallery />
        <CustomizationFeatures />
        <HowItWorks />
        <Testimonials />
        <Footer />
      </div>
    </div>
  );
}

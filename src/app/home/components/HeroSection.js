"use client";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative h-screen flex items-center justify-center overflow-hidden hero-section"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/generated_images/backgroundimage.png')",
        }}
      />

      {/* Gradient overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1
          className="text-5xl md:text-7xl font-extrabold font-serif text-white mb-6 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
          data-testid="text-hero-title"
        >
          Craft Your Perfect
          <br />
          Leather Jacket
        </h1>

        <p
          className="text-xl md:text-2xl text-gray-100 mb-8 max-w-2xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
          data-testid="text-hero-subtitle"
        >
          Premium handcrafted leather jackets tailored to your exact
          specifications. Choose your style, material, and details.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            className="px-8 py-3 text-lg font-medium bg-amber-600 text-white rounded-md shadow-lg hover:bg-amber-700 transition-colors"
            data-testid="button-hero-customize"
          >
            Customize Now
          </button>

          <button
            className="px-8 py-3 text-lg font-medium bg-transparent border border-white/50 text-white rounded-md shadow-lg hover:bg-white/10 transition-colors"
            data-testid="button-hero-collection"
          >
            View Collection
          </button>
        </div>
      </div>
    </section>
  );
}

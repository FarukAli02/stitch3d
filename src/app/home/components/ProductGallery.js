const products = [
  { 
    id: 1, 
    name: "Classic Biker", 
    description: "Timeless black leather with asymmetric zipper", 
    image: "/generated_images/Jacket1.png" 
  },
  { 
    id: 2, 
    name: "Vintage Bomber", 
    description: "Rich brown leather with ribbed cuffs", 
    image: "/generated_images/Jacket2.png" 
  },
  { 
    id: 3, 
    name: "Moto Racer", 
    description: "Tan leather with racing stripes", 
    image: "/generated_images/Jacket3.png" 
  },
  { 
    id: 4, 
    name: "Urban Rouge", 
    description: "Bold burgundy with modern cut", 
    image: "/generated_images/Jacket4.png" 
  },
  { 
    id: 5, 
    name: "Aviator Elite", 
    description: "Distressed brown with fur collar", 
    image: "/generated_images/Jacket5.png" 
  },
  { 
    id: 6, 
    name: "Minimalist", 
    description: "Sleek black with clean lines", 
    image: "/generated_images/Jacket6.png" 
  },
];

export default function ProductGallery() {
  return (
    <section id="gallery" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-serif mb-4">
            Our Collection
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our handpicked selection of premium leather jackets, each designed to make a statement
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="overflow-hidden rounded-lg border border-gray-200 bg-white hover:shadow-lg cursor-pointer transition-all"
            >
              <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600">
                  {product.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

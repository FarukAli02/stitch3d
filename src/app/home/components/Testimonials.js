
const testimonials = [
  {
    id: 1,
    name: "Michael Chen",
    image: "/generated_images/Customer1.png",
    rating: 5,
    text: "Absolutely love my custom leather jacket! The quality is exceptional and the fit is perfect. Worth every penny."
  },
  {
    id: 2,
    name: "Sarah Williams",
    image: "/generated_images/Customer2.png",
    rating: 5,
    text: "The customization process was so easy and fun. My burgundy jacket gets compliments everywhere I go!"
  },
  {
    id: 3,
    name: "Alex Rodriguez",
    image: "/generated_images/Customer3.png",
    rating: 5,
    text: "Best investment I've made in years. The craftsmanship is outstanding and the jacket feels like it was made just for me."
  }
];

export default function Testimonials() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-serif mb-4">
           Hear from our customers
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers who've crafted their perfect jacket
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 fill-amber-500 text-amber-500" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600">
                "{testimonial.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

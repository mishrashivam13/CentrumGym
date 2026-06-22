export default function CallToAction() {
  return (
    <section className="relative py-20 md:py-28 px-4 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1600&q=80)",
        }}
      />
      <div className="absolute inset-0 bg-black/65" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white uppercase mb-5 leading-tight">
          Join Now and Unlock Exclusive Offers
        </h2>
        <p className="text-gray-300 tracking-widest uppercase text-sm mb-8">
          Achieve your fitness goals with confidence and care.
        </p>
        <a
          href="#contact"
          className="inline-block border-2 border-orange-500 text-white hover:bg-orange-500 font-bold tracking-widest uppercase px-8 sm:px-12 py-3 sm:py-4 text-sm transition-colors duration-200"
        >
          Book an Appointment
        </a>
      </div>
    </section>
  );
}

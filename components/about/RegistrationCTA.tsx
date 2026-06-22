export default function RegistrationCTA() {
  return (
    <section className="relative py-28 px-4 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&q=80)",
        }}
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-black text-white uppercase mb-5 leading-tight">
          Registration Now To Get More Deals
        </h2>
        <p className="text-gray-300 tracking-widest uppercase text-sm mb-10">
          Where Health, Beauty and Fitness Meet.
        </p>
        <a
          href="#contact"
          className="inline-block border-2 border-orange-500 text-white hover:bg-orange-500 font-bold tracking-widest uppercase px-12 py-4 transition-colors duration-200"
        >
          Appointment
        </a>
      </div>
    </section>
  );
}

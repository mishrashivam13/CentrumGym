export default function ExerciseCTA() {
  return (
    <section className="relative py-36 px-4 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&q=80)",
        }}
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-black text-white uppercase mb-5 leading-tight">
          Exercise Until The Body Obeys.
        </h2>
        <p className="text-gray-300 tracking-widest uppercase text-sm">
          Where Health, Beauty and Fitness Meet.
        </p>
      </div>
    </section>
  );
}

const branch = {
  name: "Govindpura Branch",
  phone: "+91 78780 58724",
  address: "2nd Floor, LN Plaza, Near Govindpura, Niwaru Link Road, Jhotwara, Jaipur - 302012, Rajasthan",
  images: [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80",
    "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&q=80",
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80",
    "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400&q=80",
    "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=400&q=80",
  ],
};

export default function Branches() {
  return (
    <section className="bg-zinc-950 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-orange-500 text-sm font-bold tracking-[0.3em] uppercase mb-3">
            Our Location
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white uppercase">
            Centrum Gym — Govindpura
          </h2>
        </div>

        {/* Branch header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <h3 className="text-orange-500 font-bold text-xl flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            {branch.name}
          </h3>
          <div className="flex flex-col sm:items-end gap-1">
            <span className="text-white text-sm flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
              {branch.phone}
            </span>
            <span className="text-gray-400 text-xs">{branch.address}</span>
          </div>
        </div>

        {/* Photo grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {branch.images.map((img, j) => (
            <div key={j} className="overflow-hidden rounded-sm group">
              <img
                src={img}
                alt={`Centrum Gym photo ${j + 1}`}
                className="w-full h-36 object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

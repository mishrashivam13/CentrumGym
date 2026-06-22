const services = [
  {
    img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    title: "1-on-1 Personal Training",
    desc: "Get customized workout plans and personal guidance to fast-track your transformation journey.",
    imgLeft: true,
  },
  {
    img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80",
    title: "Group Fitness Sessions",
    desc: "Fun, high-energy group classes like Zumba, HIIT, and circuit training to keep you motivated.",
    imgLeft: false,
  },
  {
    img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80",
    title: "Strength & Conditioning",
    desc: "Enhance endurance and power with weightlifting, resistance workouts, and dynamic routines.",
    imgLeft: false,
  },
  {
    img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80",
    title: "Bodybuilding Programs",
    desc: "Build lean muscle mass and increase strength with structured routines and expert support.",
    imgLeft: true,
  },
  {
    img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80",
    title: "Cardio & Endurance",
    desc: "Improve stamina and burn calories with tailored cardio programs suited to your fitness level.",
    imgLeft: true,
  },
  {
    img: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&q=80",
    title: "Nutrition Coaching",
    desc: "Expert diet plans and one-on-one nutrition consultation to fuel your workouts and recovery.",
    imgLeft: false,
  },
];

export default function ServiceGrid() {
  return (
    <section className="bg-zinc-950 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-orange-500 text-sm font-bold tracking-[0.3em] uppercase mb-3">
            What We Offer
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase">
            Achieve Your Fitness Goals With Us
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {services.map((s, i) => {
            const isEven = i % 2 === 0;
            return (
              <div
                key={i}
                className={`flex ${isEven ? "flex-row" : "flex-row-reverse"} group`}
              >
                {/* Image half */}
                <div className="w-1/2 overflow-hidden">
                  <img
                    src={s.img}
                    alt={s.title}
                    className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Text half */}
                <div className="w-1/2 bg-zinc-900 p-8 flex flex-col justify-center">
                  <h3 className="text-white font-black text-xl mb-3 leading-snug">
                    {s.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-5">{s.desc}</p>
                  <a
                    href="#contact"
                    className="text-white font-bold text-sm tracking-widest uppercase hover:text-orange-500 transition-colors"
                  >
                    Explore
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

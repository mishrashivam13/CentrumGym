const plans = [
  {
    name: "Single Day Pass",
    duration: "ONE-TIME ENTRY",
    features: [
      "Access to gym floor",
      "Locker & shower",
      "Cardio + strength equipment",
      "Basic trainer guidance",
      "No commitment",
      "Valid for one day",
    ],
  },
  {
    name: "Annual Membership",
    duration: "12 MONTHS",
    features: [
      "Unlimited gym access",
      "Personalized workout plan",
      "1 Free fitness assessment",
      "Group classes included",
      "Month-to-month flexibility",
      "No time restrictions",
    ],
  },
  {
    name: "Half-Yearly Plan",
    duration: "6 MONTHS",
    features: [
      "Unlimited gym access",
      "Diet consultation (1 session)",
      "Certified personal trainer support",
      "Weight loss/strength programs",
      "Flexible entry hours",
      "Month-to-month renewal option",
    ],
  },
];

export default function Membership() {
  return (
    <section id="services" className="bg-black py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-orange-500 text-sm font-bold tracking-[0.3em] uppercase mb-3">
            Our Plans
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white uppercase">
            Choose Your Membership Plan
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <div
              key={i}
              className="group border border-zinc-700 p-8 flex flex-col bg-black hover:bg-white hover:border-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/30"
            >
              <h3 className="text-2xl font-black mb-1 text-white group-hover:text-black transition-colors duration-500">
                {plan.name}
              </h3>
              <p className="text-xs font-bold tracking-widest mb-8 text-gray-400 group-hover:text-gray-500 transition-colors duration-500">
                {plan.duration}
              </p>

              <ul className="flex flex-col gap-3 mb-10 flex-1">
                {plan.features.map((f, j) => (
                  <li
                    key={j}
                    className="text-sm text-center text-gray-400 group-hover:text-orange-500 transition-colors duration-500"
                  >
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className="block text-center font-bold tracking-widest uppercase py-4 transition-all duration-500 bg-zinc-800 text-white group-hover:bg-orange-500 group-hover:text-white"
              >
                Join Now
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

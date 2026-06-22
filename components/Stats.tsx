"use client";
import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 1500, label: "Happy Members", suffix: "+" },
  { value: 25, label: "Expert Trainers", suffix: "+" },
  { value: 10, label: "Years Experience", suffix: "+" },
  { value: 98, label: "Success Rate", suffix: "%" },
];

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const duration = 1500;
          const step = Math.ceil(target / (duration / 16));
          const timer = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, 16);
        }
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section className="bg-orange-500 py-16 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 text-center text-white">
        {stats.map((s, i) => (
          <div key={i}>
            <div className="text-3xl sm:text-4xl md:text-5xl font-black mb-2">
              <Counter target={s.value} suffix={s.suffix} />
            </div>
            <p className="text-sm font-semibold tracking-widest uppercase opacity-90">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

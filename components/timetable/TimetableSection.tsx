"use client";
import { useState } from "react";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const timeSlots = [
  "6.00am - 8.00am",
  "10.00am - 12.00pm",
  "5.00pm - 7.00pm",
  "7.00pm - 9.00pm",
];

// null = empty slot (shows diagonal lines)
const schedule: (string | null)[][] = [
  // Mon               Tue            Wed               Thu                  Fri     Sat                Sun
  ["WEIGHT TRAINING",  "CARDIO",      "YOGA",           "FUNCTIONAL TRAINING", null, "BOXING",          "BODY BUILDING"],
  [null,               "ZUMBA",       "WEIGHT TRAINING", "HIIT",             "BODY BUILDING", "FUNCTIONAL TRAINING", null],
  ["BOXING",           "HIIT",        "BODY BUILDING",  null,                "YOGA",  "CARDIO",          "ZUMBA"],
  ["HIIT",             null,          "BOXING",         "YOGA",              "ZUMBA", "FUNCTIONAL TRAINING", "WEIGHT TRAINING"],
];

const filters = ["All event", "Fitness tips", "Motivation", "Workout"];

const classColors: Record<string, string> = {
  "WEIGHT TRAINING":     "text-orange-400",
  "CARDIO":              "text-blue-400",
  "YOGA":                "text-green-400",
  "HIIT":                "text-yellow-400",
  "BOXING":              "text-red-400",
  "BODY BUILDING":       "text-purple-400",
  "ZUMBA":               "text-pink-400",
  "FUNCTIONAL TRAINING": "text-cyan-400",
};

export default function TimetableSection() {
  const [activeFilter, setActiveFilter] = useState("All event");

  return (
    <section className="bg-zinc-950 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="text-orange-500 text-sm font-bold tracking-[0.3em] uppercase mb-2">
              Find Your Time
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white uppercase">
              Find Your Time
            </h2>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center bg-black border border-zinc-700">
            {filters.map((f, i) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-5 py-3 text-sm font-semibold transition-colors ${
                  activeFilter === f
                    ? "text-white font-bold"
                    : "text-gray-400 hover:text-white"
                } ${i < filters.length - 1 ? "border-r border-zinc-700" : ""}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Timetable */}
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full border-collapse min-w-[640px]">
            <thead>
              <tr>
                {/* Empty corner cell */}
                <th className="bg-orange-500 border border-zinc-700 w-28 sm:w-36" />
                {days.map((day) => (
                  <th
                    key={day}
                    className="bg-orange-500 text-white font-bold text-sm py-4 px-2 text-center border border-zinc-700 tracking-wide"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot, rowIdx) => (
                <tr key={slot}>
                  {/* Time cell */}
                  <td className="bg-black border border-zinc-700 px-3 py-5 text-center">
                    <span className="text-orange-500 text-xs font-semibold">{slot}</span>
                  </td>

                  {/* Class cells */}
                  {days.map((day, colIdx) => {
                    const cls = schedule[rowIdx][colIdx];
                    return (
                      <td
                        key={day}
                        className="bg-black border border-zinc-700 text-center px-2 py-5 relative"
                      >
                        {cls ? (
                          <span className={`text-white font-black text-xs md:text-sm tracking-wide`}>
                            {cls}
                          </span>
                        ) : (
                          /* Diagonal lines for empty cells */
                          <div className="absolute inset-0 overflow-hidden opacity-20">
                            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                              <line x1="0" y1="0" x2="100%" y2="100%" stroke="white" strokeWidth="1" />
                            </svg>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap gap-4">
          {Object.entries(classColors).map(([cls, color]) => (
            <span key={cls} className={`text-xs font-bold tracking-widest ${color}`}>
              ● {cls}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

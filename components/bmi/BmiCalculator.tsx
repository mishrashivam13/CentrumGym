"use client";
import { useState } from "react";

const bmiChart = [
  { range: "Below 18.5", status: "Underweight", color: "text-blue-400" },
  { range: "18.5 – 24.9", status: "Healthy",     color: "text-green-400" },
  { range: "25.0 – 29.9", status: "Overweight",   color: "text-yellow-400" },
  { range: "30.0 and Above", status: "Obese",    color: "text-red-400" },
];

type Result = {
  bmi: number;
  status: string;
  color: string;
} | null;

export default function BmiCalculator() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge]       = useState("");
  const [sex, setSex]       = useState("");
  const [result, setResult] = useState<Result>(null);
  const [error, setError]   = useState("");

  const calculate = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const h = parseFloat(height);
    const w = parseFloat(weight);

    if (!h || !w || h <= 0 || w <= 0) {
      setError("Please enter valid height and weight.");
      return;
    }

    const heightM = h / 100;
    const bmi = w / (heightM * heightM);
    const rounded = Math.round(bmi * 10) / 10;

    let status = "";
    let color  = "";
    if (bmi < 18.5)       { status = "Underweight"; color = "text-blue-400"; }
    else if (bmi < 25)    { status = "Healthy";     color = "text-green-400"; }
    else if (bmi < 30)    { status = "Overweight";  color = "text-yellow-400"; }
    else                  { status = "Obese";        color = "text-red-400"; }

    setResult({ bmi: rounded, status, color });
  };

  return (
    <section className="bg-zinc-950 py-20 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">

        {/* Left – Chart */}
        <div>
          <p className="text-orange-500 text-sm font-bold tracking-[0.3em] uppercase mb-3">
            Check Your Body
          </p>
          <h2 className="text-4xl font-black text-white uppercase mb-10">
            BMI Calculator Chart
          </h2>

          <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[280px]">
            <thead>
              <tr>
                <th className="bg-zinc-800 text-white font-bold text-sm py-4 px-6 text-left border border-zinc-700 tracking-widest uppercase">
                  BMI
                </th>
                <th className="bg-zinc-800 text-white font-bold text-sm py-4 px-6 text-left border border-zinc-700 tracking-widest uppercase">
                  Weight Status
                </th>
              </tr>
            </thead>
            <tbody>
              {bmiChart.map((row, i) => (
                <tr key={i} className="hover:bg-zinc-800/50 transition-colors">
                  <td className={`border border-zinc-700 px-6 py-5 text-sm font-semibold ${row.color}`}>
                    {row.range}
                  </td>
                  <td className={`border border-zinc-700 px-6 py-5 text-sm font-semibold ${row.color}`}>
                    {row.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {/* Right – Calculator */}
        <div>
          <p className="text-orange-500 text-sm font-bold tracking-[0.3em] uppercase mb-3">
            Check Your Body
          </p>
          <h2 className="text-4xl font-black text-white uppercase mb-6">
            Calculate Your BMI
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-10">
            Enter your height, weight, age, and sex below to instantly calculate
            your Body Mass Index and find out which weight category you fall into.
            Use this as a guide alongside professional fitness advice.
          </p>

          <form onSubmit={calculate} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Height / cm"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min="1"
                required
                className="bg-black border border-zinc-700 focus:border-orange-500 text-white px-4 py-4 outline-none transition-colors placeholder-gray-500 text-sm"
              />
              <input
                type="number"
                placeholder="Weight / kg"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min="1"
                required
                className="bg-black border border-zinc-700 focus:border-orange-500 text-white px-4 py-4 outline-none transition-colors placeholder-gray-500 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="1"
                className="bg-black border border-zinc-700 focus:border-orange-500 text-white px-4 py-4 outline-none transition-colors placeholder-gray-500 text-sm"
              />
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                className="bg-black border border-zinc-700 focus:border-orange-500 text-white px-4 py-4 outline-none transition-colors text-sm appearance-none cursor-pointer"
              >
                <option value="" disabled>Sex (Male/Female)</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-black tracking-widest uppercase py-5 transition-colors text-sm mt-2"
            >
              Calculate
            </button>
          </form>

          {/* Result */}
          {result && (
            <div className="mt-8 border border-zinc-700 p-6 bg-black">
              <p className="text-gray-400 text-sm mb-2">Your BMI Result</p>
              <p className={`text-5xl font-black mb-3 ${result.color}`}>{result.bmi}</p>
              <p className={`text-xl font-bold tracking-widest uppercase ${result.color}`}>
                {result.status}
              </p>
              <p className="text-gray-500 text-xs mt-3">
                BMI is a screening tool, not a diagnostic measure. Consult a healthcare professional for advice.
              </p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

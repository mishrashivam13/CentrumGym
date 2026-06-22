"use client";
import { useState } from "react";

// WhatsApp icon SVG
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: "", phone: "", message: "" });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <section id="contact" className="bg-zinc-950 py-20 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Left – Info */}
          <div>
            <p className="text-orange-500 text-sm font-bold tracking-[0.3em] uppercase mb-3">
              Contact Us
            </p>
            <h2 className="text-4xl font-black text-white uppercase mb-10">
              Get In Touch
            </h2>

            {/* Single branch */}
            <div className="flex items-start gap-5 mb-8">
              <div className="w-14 h-14 rounded-full bg-zinc-700 flex-shrink-0 flex items-center justify-center text-orange-500">
                <WhatsAppIcon />
              </div>
              <div>
                <p className="text-white font-bold text-base mb-1">
                  Centrum Gym — +91 78780 58724
                </p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  2nd Floor, LN Plaza, Near Govindpura,<br />
                  Niwaru Link Road, Jhotwara,<br />
                  Jaipur - 302012, Rajasthan
                </p>
              </div>
            </div>

            {/* Quick info pills */}
            <div className="flex flex-col gap-3 mt-8">
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                <span>Mon – Sat: 5:00 AM – 10:00 PM</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                <span>Sunday: 6:00 AM – 8:00 PM</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                <span>CentrumGym@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Right – Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Your Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-black border border-zinc-700 focus:border-orange-500 text-white px-5 py-4 outline-none transition-colors placeholder-gray-500 text-sm"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="bg-black border border-zinc-700 focus:border-orange-500 text-white px-5 py-4 outline-none transition-colors placeholder-gray-500 text-sm"
            />
            <textarea
              placeholder="Your Message"
              rows={5}
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="bg-black border border-zinc-700 focus:border-orange-500 text-white px-5 py-4 outline-none transition-colors placeholder-gray-500 text-sm resize-none"
            />
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-black tracking-widest uppercase py-5 transition-colors text-sm"
            >
              Send Message
            </button>
            {sent && (
              <p className="text-green-400 text-sm text-center">
                Message sent! We will get back to you shortly.
              </p>
            )}
          </form>
        </div>

        {/* Map section */}
        <div className="mt-20">
          <div className="text-center mb-10">
            <p className="text-orange-500 text-sm font-bold tracking-[0.3em] uppercase mb-3">
              Our Location
            </p>
            <h2 className="text-4xl font-black text-white uppercase">
              Find Us On Map
            </h2>
          </div>

          {/* Orange header bar */}
          <div className="bg-orange-500 px-4 sm:px-6 py-4 sm:py-5">
            <h3 className="text-white font-black text-base sm:text-lg uppercase tracking-wide">
              Centrum Gym — +91 78780 58724
            </h3>
            <p className="text-white/90 text-xs sm:text-sm mt-1 flex items-start gap-2">
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              2nd Floor, LN Plaza, Near Govindpura, Niwaru Link Road, Jhotwara, Jaipur - 302012, Rajasthan
            </p>
          </div>

          <iframe
            title="Centrum Gym Location"
            src="https://maps.google.com/maps?q=26.952056,75.702222&z=17&output=embed"
            width="100%"
            height="350"
            style={{ border: 0, display: "block" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[250px] sm:h-[350px] md:h-[450px]"
          />
        </div>
      </div>
    </section>
  );
}

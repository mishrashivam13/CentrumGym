const socialLinks = [
  {
    label: "Facebook",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "Twitter",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    label: "Email",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
];

const quickLinks = ["Home", "About Us", "Classes", "Services", "Team", "Contact Us"];

export default function Footer() {
  return (
    <footer className="bg-black border-t border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand */}
        <div>
          <div className="text-2xl font-black italic mb-4">
            <span className="text-yellow-400">CEN</span>
            <span className="text-orange-500">TRUM</span>
            <span className="text-white ml-2">GYM</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Join our fitness journey and transform your health with the best
            trainers, modern equipment, and personalized programs. Multiple
            locations across Rajasthan.
          </p>
          <div className="flex gap-4 text-gray-400">
            {socialLinks.map((s) => (
              <a key={s.label} href="#" aria-label={s.label} className="hover:text-orange-500 transition-colors">
                {s.svg}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-bold text-lg mb-5">Quick Links</h4>
          <ul className="flex flex-col gap-3">
            {quickLinks.map((link) => (
              <li key={link}>
                <a
                  href={`#${link.toLowerCase().replace(/ /g, "")}`}
                  className="text-gray-400 hover:text-orange-500 text-sm transition-colors"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Get in Touch */}
        <div>
          <h4 className="text-white font-bold text-lg mb-5">Get in Touch</h4>
          <p className="text-gray-400 text-sm mb-5">
            We&apos;d love to hear from you! Reach out for memberships,
            collaborations, or fitness consultations.
          </p>
          <p className="text-gray-300 text-sm mb-2">
            📍 2nd Floor, LN Plaza, Near Govindpura, Niwaru Link Road, Jhotwara, Jaipur - 302012
          </p>
          <p className="text-gray-300 text-sm mb-2">✉ CentrumGym@gmail.com</p>
          <p className="text-gray-300 text-sm">☎ +91 78780 58724</p>
        </div>
      </div>

      <div className="border-t border-zinc-800 py-5 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} All rights reserved | Built with{" "}
        <span className="text-red-500">♥</span>
      </div>
    </footer>
  );
}

import Link from "next/link";

interface PageHeroProps {
  title: string;
  breadcrumb: string;
  bg: string;
}

export default function PageHero({ title, breadcrumb, bg }: PageHeroProps) {
  return (
    <section className="relative h-72 md:h-96 flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bg})` }}
      />
      <div className="absolute inset-0 bg-black/65" />
      <div className="relative z-10 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white uppercase mb-4 px-4">{title}</h1>
        <p className="text-sm">
          <Link href="/" className="text-white hover:text-orange-400 transition-colors">
            Home
          </Link>
          <span className="text-white mx-2">›</span>
          <span className="text-orange-500">{breadcrumb}</span>
        </p>
      </div>
    </section>
  );
}

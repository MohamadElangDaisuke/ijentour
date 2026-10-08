import Image from "next/image";
import { defaultExperienceSteps } from "../../lib/experienceStorage";

export default function ExperienceSections() {
  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="relative isolate overflow-hidden bg-white px-4 sm:px-8 py-20 sm:py-24 lg:py-28 text-secondary-950"
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-full md:w-1/2">
        <Image
          src="/images/HeroSection.webp"
          alt="Pemandangan Kawah Ijen dari jalur pendakian Banyuwangi"
          fill
          sizes="(max-width: 768px) 100vw, 66vw"
          className="object-cover object-center opacity-20 mask-[linear-gradient(to_left,black_35%,transparent_100%)]"
        />
        <div className="experience-gradient absolute inset-0 bg-linear-to-l from-transparent via-secondary-50/35 to-secondary-50" />
      </div>
      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
        <div className="text-center lg:text-left">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-600">Easy and memorable</p>
          <h2 id="experience-heading" className="mt-4 text-2xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-secondary-950">
            Cara menikmati wisata Kawah Ijen
          </h2>
          <p className="mt-5 max-w-md mx-auto lg:mx-0 text-sm sm:text-base leading-relaxed text-secondary-700">
            Semua kebutuhan perjalanan kami siapkan agar kamu bisa fokus menikmati lanskap dan cerita di sepanjang perjalanan.
          </p>
        </div>
        <div className="grid gap-5">
          {defaultExperienceSteps.map((stepItem, index) => (
            <article
              key={stepItem.step}
              className={`flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left ${
                index !== defaultExperienceSteps.length - 1 ? 'border-b border-secondary-200/60 pb-5' : ''
              }`}
            >
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-black shadow-xs ${stepItem.colorClass}`}>
                {stepItem.step}
              </span>
              <div>
                <h3 className="text-base font-bold text-secondary-950">{stepItem.title}</h3>
                <p className="mt-1 text-xs sm:text-sm leading-relaxed text-secondary-700">{stepItem.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
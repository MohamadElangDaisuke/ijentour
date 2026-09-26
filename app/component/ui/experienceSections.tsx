import Image from "next/image";
import { defaultExperienceSteps } from "../../lib/experienceStorage";

export default function ExperienceSections() {
  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="relative isolate overflow-hidden bg-white px-6 py-20 text-secondary-950 md:px-12 md:py-28"
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
          <h2 id="experience-heading" className="mt-4 max-w-xl text-3xl font-black leading-tight tracking-tight md:text-6xl">Cara menikmati wisata Kawah Ijen</h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-secondary-700">Semua kebutuhan perjalanan kami siapkan agar kamu bisa fokus menikmati lanskap dan cerita di sepanjang perjalanan.</p>
        </div>
        <div className="grid gap-5">
          {defaultExperienceSteps.map((stepItem, index) => (
            <article
              key={stepItem.step}
              className={`flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:text-left ${
                index !== defaultExperienceSteps.length - 1 ? 'border-b border-secondary-100 pb-5' : ''
              }`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black ${stepItem.colorClass}`}>
                {stepItem.step}
              </span>
              <div>
                <h3 className="font-bold text-secondary-950">{stepItem.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-secondary-700">{stepItem.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
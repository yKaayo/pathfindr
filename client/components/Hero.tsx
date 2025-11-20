"use client";

import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import SplitText from "gsap/SplitText";

gsap.registerPlugin(useGSAP, SplitText);

// Icons
import Arrow from "@/assets/icons/Arrow";
import Logo from "@/assets/icons/Logo";

const Hero = () => {
  useGSAP(() => {
    const timeline = gsap.timeline();

    gsap.from("#logo", {
      opacity: 1,
      scale: 1.5,
      duration: 1.5,
    });

    gsap.set("#cta-button", {
      y: 200,
      opacity: 0,
    });

    const split = new SplitText("#headline", { type: "lines" });
    gsap.set(split.lines, {
      x: 200,
      opacity: 0,
    });

    timeline
      .to({}, { duration: 1 })

      .to("#cta-button", {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
      })

      .to(
        split.lines,
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          stagger: 0.5,
        },
        "<0.3",
      );
  }, []);

  return (
    <main className="relative container mx-auto flex min-h-svh flex-col items-center justify-center gap-8 overflow-hidden pb-5">
      <Logo color="#13418c" className="flex min-h-fit w-[60%] justify-center" />

      <Link
        id="cta-button"
        href="/habilidades"
        className="btn group relative flex cursor-pointer items-center gap-3 overflow-hidden after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-1/3 after:-translate-x-1/2 after:rounded-full after:bg-zinc-900 after:transition-all after:duration-500 after:content-[''] hover:after:w-[90%]"
      >
        COMECE SUA JORNADA AGORA
        <Arrow className="-mr-14 size-12 transition-all duration-500 group-hover:mr-0" />
      </Link>

      <h2
        id="headline"
        className="headline absolute right-3 bottom-3 text-end leading-12 font-medium text-balance"
      >
        TRANSFORME MUDANÇA <br />
        <span className="text-blue-dark">EM OPORTUNIDADE</span>
      </h2>
    </main>
  );
};

export default Hero;

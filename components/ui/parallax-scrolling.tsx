'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

export interface ParallaxComponentProps {
  title?: string;
  subtitle?: string;
  images?: {
    layer1?: string;
    layer2?: string;
    layer4?: string;
  };
}

export function ParallaxComponent({
  title = "Balaji Foods",
  subtitle = "Diwali Delights & Pure Ghee Faral",
  images = {
    layer1: "/balaji_royal_platter.png",
    layer2: "/balaji_ladoo_hero.png",
    layer4: "/chivda_new.png",
  }
}: ParallaxComponentProps) {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const triggerElement = parallaxRef.current?.querySelector('[data-parallax-layers]');

    if (triggerElement) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerElement,
          start: "0% 0%",
          end: "100% 0%",
          scrub: 0
        }
      });

      const layers = [
        { layer: "1", yPercent: 70 },
        { layer: "2", yPercent: 55 },
        { layer: "3", yPercent: 40 },
        { layer: "4", yPercent: 10 }
      ];

      layers.forEach((layerObj, idx) => {
        tl.to(
          triggerElement.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
          {
            yPercent: layerObj.yPercent,
            ease: "none"
          },
          idx === 0 ? undefined : "<"
        );
      });
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    return () => {
      // Clean up GSAP and ScrollTrigger instances
      ScrollTrigger.getAll().forEach(st => st.kill());
      if (triggerElement) gsap.killTweensOf(triggerElement);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="parallax bg-stone-950 text-amber-50 relative overflow-hidden" ref={parallaxRef}>
      <section className="parallax__header relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="parallax__visuals relative w-full h-full flex items-center justify-center">
          <div className="parallax__black-line-overflow absolute inset-0 bg-gradient-to-b from-stone-950/80 via-transparent to-stone-950 z-10 pointer-events-none" />
          
          <div data-parallax-layers className="parallax__layers relative w-full h-full flex items-center justify-center">
            {/* Layer 1 - Background Royal Platter */}
            <img 
              src={images.layer1} 
              loading="eager" 
              width="900" 
              data-parallax-layer="1" 
              alt="Royal Faral Platter" 
              className="parallax__layer-img absolute w-[80vw] max-w-[700px] object-cover rounded-3xl opacity-75 shadow-2xl border border-amber-500/20" 
            />
            
            {/* Layer 2 - Floating Besan Ladoo Platter */}
            <img 
              src={images.layer2} 
              loading="eager" 
              width="650" 
              data-parallax-layer="2" 
              alt="Pure Ghee Besan Ladoo" 
              className="parallax__layer-img absolute w-[60vw] max-w-[500px] object-cover rounded-2xl shadow-amber-900/50 shadow-2xl border border-amber-400/40 translate-x-12 -translate-y-8" 
            />
            
            {/* Layer 3 - Typography Title */}
            <div data-parallax-layer="3" className="parallax__layer-title z-30 text-center px-4">
              <span className="px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs md:text-sm font-semibold tracking-widest uppercase backdrop-blur-md mb-4 inline-block">
                {subtitle}
              </span>
              <h2 className="parallax__title text-5xl md:text-8xl font-serif font-black tracking-tight text-amber-100 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
                {title}
              </h2>
            </div>

            {/* Layer 4 - Foreground Spicy Chivda Dish */}
            <img 
              src={images.layer4} 
              loading="eager" 
              width="500" 
              data-parallax-layer="4" 
              alt="Spicy Chivda Special" 
              className="parallax__layer-img absolute z-40 w-[45vw] max-w-[380px] object-cover rounded-2xl shadow-2xl border border-amber-500/40 -translate-x-24 translate-y-16" 
            />
          </div>

          <div className="parallax__fade absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-950 to-transparent z-40" />
        </div>
      </section>

      {/* Parallax Content Footer */}
      <section className="parallax__content py-16 px-6 bg-stone-950 text-center flex flex-col items-center justify-center border-t border-amber-500/20">
        <div className="max-w-2xl space-y-4">
          <h3 className="text-2xl md:text-4xl font-serif font-bold text-amber-200">
            Handcrafted Delicacies for Every Celebration
          </h3>
          <p className="text-stone-300 text-sm md:text-base font-light leading-relaxed">
            From golden Besan Ladoo roasted in 100% pure Gir cow ghee to crunchy Pohe Chivda and sweet diamond Shankarpali, Balaji Foods brings authentic taste to your family.
          </p>
        </div>
      </section>
    </div>
  );
}

export default ParallaxComponent;

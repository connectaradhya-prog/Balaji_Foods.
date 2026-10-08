"use client";

import React, { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles, ShoppingBag, Award, Heart } from "lucide-react";

export interface ScrollChoreographyProps {
  className?: string;
  title?: string;
  subtitle?: string;
  images?: {
    topLeft: string;
    topRight: string;
    bottomLeft: string;
    bottomRight: string;
  };
  labels?: {
    topLeft?: string;
    topRight?: string;
    bottomLeft?: string;
    bottomRight?: string;
  };
}

export function ScrollChoreography({
  className,
  title = "Balaji Foods — Royal Festive Faral",
  subtitle = "Handcrafted with Pure Gir Cow Ghee & Authentic Maharashtrian Heritage",
  images = {
    topLeft: "/ladoo.jpg",
    topRight: "/balaji_royal_platter.png",
    bottomLeft: "/chivda_new.png",
    bottomRight: "/gift_box_new.png",
  },
  labels = {
    topLeft: "Pure Ghee Besan Ladoo",
    topRight: "Royal Diwali Platter",
    bottomLeft: "Spicy Pohe Chivda",
    bottomRight: "Silk Gift Box",
  },
}: ScrollChoreographyProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 400, // Faster, responsive spring feel
    damping: 50,
    mass: 1.2,
    restDelta: 0.001,
  });

  // Relative offsets for floating cards relative to viewport center
  const xLeft = "-22vw";
  const xRight = "22vw";
  const yTop = "-16vh";
  const yBottom = "16vh";

  // Transformation tracks for card positions across scroll progress:
  // Phase 1: 0 - 0.3 (Diagonal floating movement)
  // Phase 2: 0.35 - 0.65 (Stack alignment to center)
  // Phase 3: 0.7 - 1.0 (Top Right expand & full showcase reveal)

  const tlX = useTransform(smoothProgress, [0, 0.3, 0.35, 0.65, 1], [xLeft, xLeft, xLeft, "0vw", "0vw"]);
  const tlY = useTransform(smoothProgress, [0, 0.3, 0.35, 0.65, 1], [yTop, yBottom, yBottom, "0vh", "0vh"]);

  const brX = useTransform(smoothProgress, [0, 0.3, 0.35, 0.65, 1], [xRight, xRight, xRight, "0vw", "0vw"]);
  const brY = useTransform(smoothProgress, [0, 0.3, 0.35, 0.65, 1], [yBottom, yTop, yTop, "0vh", "0vh"]);

  const blX = useTransform(smoothProgress, [0, 0.3, 0.35, 0.65, 1], [xLeft, xLeft, xLeft, "0vw", "0vw"]);
  const blY = useTransform(smoothProgress, [0, 0.3, 0.35, 0.65, 1], [yBottom, yBottom, yBottom, "0vh", "0vh"]);

  const trX = useTransform(smoothProgress, [0, 0.3, 0.35, 0.65, 1], [xRight, xRight, xRight, "0vw", "0vw"]);
  const trY = useTransform(smoothProgress, [0, 0.3, 0.35, 0.65, 1], [yTop, yTop, yTop, "0vh", "0vh"]);

  // Hero Card scaling properties
  const heroWidth = useTransform(smoothProgress, [0.65, 0.7, 0.9, 1], ["36vw", "36vw", "100vw", "100vw"]);
  const heroHeight = useTransform(smoothProgress, [0.65, 0.7, 0.9, 1], ["26vh", "26vh", "100vh", "100vh"]);

  // Fading for non-hero elements as hero card expands
  const underImagesOpacity = useTransform(smoothProgress, [0.72, 0.85], [1, 0]);
  const heroOverlayOpacity = useTransform(smoothProgress, [0.7, 0.9], [0, 0.6]);

  const baseImageClasses =
    "absolute left-1/2 top-1/2 w-[85vw] max-w-[420px] md:w-[36vw] h-[24vh] md:h-[28vh] overflow-hidden -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-stone-900 shadow-2xl border border-amber-500/30 will-change-transform group transition-all duration-300";

  return (
    <div ref={containerRef} className={cn("relative h-[300vh] w-full bg-stone-950 text-amber-50", className)}>
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        
        {/* Floating Top Banner Header */}
        <motion.div 
          style={{ opacity: underImagesOpacity }}
          className="absolute top-8 left-0 right-0 z-50 text-center px-4 pointer-events-none"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs md:text-sm font-semibold tracking-wider uppercase backdrop-blur-md mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" /> Diwali Special Pure Ghee Faral
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-amber-100 tracking-tight drop-shadow-md">
            {title}
          </h2>
          <p className="text-stone-300 text-sm md:text-base max-w-xl mx-auto mt-2 font-light">
            {subtitle}
          </p>
        </motion.div>

        {/* Central Choreography Canvas */}
        <div className="absolute inset-0 flex items-center justify-center">

          {/* Top Left Image Card */}
          <motion.div
            style={{ x: tlX, y: tlY, opacity: underImagesOpacity }}
            className={cn(baseImageClasses, "z-10")}
          >
            <img src={images.topLeft} alt={labels.topLeft} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
              <span className="text-xs md:text-sm font-semibold text-amber-200 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" /> {labels.topLeft}
              </span>
            </div>
          </motion.div>

          {/* Bottom Right Image Card */}
          <motion.div
            style={{ x: brX, y: brY, opacity: underImagesOpacity }}
            className={cn(baseImageClasses, "z-20")}
          >
            <img src={images.bottomRight} alt={labels.bottomRight} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
              <span className="text-xs md:text-sm font-semibold text-amber-200 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-amber-400" /> {labels.bottomRight}
              </span>
            </div>
          </motion.div>

          {/* Bottom Left Image Card */}
          <motion.div
            style={{ x: blX, y: blY, opacity: underImagesOpacity }}
            className={cn(baseImageClasses, "z-30")}
          >
            <img src={images.bottomLeft} alt={labels.bottomLeft} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
              <span className="text-xs md:text-sm font-semibold text-amber-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" /> {labels.bottomLeft}
              </span>
            </div>
          </motion.div>

          {/* Top Right Image Card (Hero - expands to full screen) */}
          <motion.div
            style={{
              x: trX,
              y: trY,
              width: heroWidth,
              height: heroHeight,
            }}
            className={cn(baseImageClasses, "z-40 origin-center bg-stone-900 border-amber-500/50 shadow-amber-900/40")}
          >
            <img src={images.topRight} alt={labels.topRight} className="h-full w-full object-cover" />
            
            {/* Expanded Hero Overlay */}
            <motion.div 
              style={{ opacity: heroOverlayOpacity }}
              className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent flex flex-col justify-end p-6 md:p-16 text-left"
            >
              <div className="max-w-3xl space-y-4">
                <span className="px-3 py-1 bg-amber-600 text-stone-950 text-xs font-bold uppercase rounded-full tracking-widest inline-block">
                  Signature Dish
                </span>
                <h3 className="text-3xl md:text-6xl font-serif font-extrabold text-amber-100">
                  {labels.topRight}
                </h3>
                <p className="text-stone-300 text-sm md:text-lg font-light leading-relaxed max-w-xl">
                  Prepared daily with 100% pure cow ghee, roasted saffron, crushed pistachios, and centuries-old family recipes.
                </p>
                <div className="pt-2 flex items-center gap-4">
                  <a href="#menu" className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold rounded-full shadow-lg shadow-amber-600/30 transition-all flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" /> Order Fresh Now
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Instruction Bar */}
        <motion.div 
          style={{ opacity: underImagesOpacity }}
          className="absolute bottom-6 left-0 right-0 z-50 text-center text-xs text-amber-200/70 font-mono tracking-widest uppercase"
        >
          ↓ Scroll Down to Experience the Faral Symphony ↓
        </motion.div>

      </div>
    </div>
  );
}

export default ScrollChoreography;

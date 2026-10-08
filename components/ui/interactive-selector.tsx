import React, { useState, useEffect } from 'react';
import { FaCrown, FaCookieBite, FaFire, FaGift, FaHeart } from 'react-icons/fa';

export interface ProductOption {
  id?: string;
  title: string;
  description: string;
  image: string;
  price?: string;
  tag?: string;
  icon: React.ReactNode;
}

interface InteractiveSelectorProps {
  options?: ProductOption[];
  onProductClick?: (option: ProductOption, index: number) => void;
  title?: string;
  subtitle?: string;
}

const defaultHeroProducts: ProductOption[] = [
  {
    id: "prod-2",
    title: "Besan Ladoo",
    description: "Pure Gir Cow Ghee & Saffron",
    price: "₹450 / 500g",
    tag: "Bestseller",
    image: "balaji_ladoo_hero.png",
    icon: <FaCrown size={22} className="text-amber-300" />
  },
  {
    id: "prod-1",
    title: "Spicy Chivda",
    description: "Golden Crunchy Poha & Roasted Nuts",
    price: "₹320 / 500g",
    tag: "Traditional",
    image: "chivda_new.png",
    icon: <FaFire size={22} className="text-orange-400" />
  },
  {
    id: "prod-3",
    title: "Sweet Shankarpali",
    description: "Flaky Pure Ghee Diamond Bites",
    price: "₹380 / 500g",
    tag: "Crispy",
    image: "shankarpali.jpg",
    icon: <FaCookieBite size={22} className="text-yellow-400" />
  },
  {
    id: "prod-4",
    title: "Royal Silk Gift Box",
    description: "Luxury Diwali Faral Hamper",
    price: "₹1,250 / Box",
    tag: "Gift Special",
    image: "gift_box_new.png",
    icon: <FaGift size={22} className="text-red-400" />
  },
  {
    id: "prod-5",
    title: "Royal Faral Platter",
    description: "Grand Festival Collection",
    price: "₹1,499 / Pack",
    tag: "Festive Combo",
    image: "balaji_royal_platter.png",
    icon: <FaHeart size={22} className="text-rose-400" />
  }
];

const InteractiveSelector: React.FC<InteractiveSelectorProps> = ({
  options = defaultHeroProducts,
  onProductClick,
  title = "Explore Our Hero Products",
  subtitle = "Click on any delicacy to expand & discover traditional Maharashtrian flavours"
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animatedOptions, setAnimatedOptions] = useState<number[]>([]);

  const handleOptionClick = (index: number, option: ProductOption) => {
    if (index !== activeIndex) {
      setActiveIndex(index);
    } else if (onProductClick) {
      onProductClick(option, index);
    }
  };

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    options.forEach((_, i) => {
      const timer = setTimeout(() => {
        setAnimatedOptions(prev => [...prev, i]);
      }, 150 * i);
      timers.push(timer);
    });
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [options]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full py-8 font-sans text-white"> 
      {/* Header Section */}
      <div className="w-full max-w-2xl px-6 mb-6 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-amber-200 mb-2 tracking-tight drop-shadow-lg animate-fadeInTop delay-300">
          {title}
        </h2>
        <p className="text-sm md:text-base text-amber-100/80 font-medium max-w-xl mx-auto animate-fadeInTop delay-600">
          {subtitle}
        </p>
      </div>

      {/* Options Container */}
      <div className="options flex w-full max-w-[960px] min-w-[320px] md:min-w-[650px] h-[380px] md:h-[420px] mx-auto items-stretch overflow-hidden relative rounded-2xl border border-amber-500/30 bg-stone-950/80 shadow-2xl backdrop-blur-md">
        {options.map((option, index) => (
          <div
            key={option.id || index}
            className={`
              option relative flex flex-col justify-end overflow-hidden transition-all duration-700 ease-in-out
              ${activeIndex === index ? 'active' : ''}
            `}
            style={{
              backgroundImage: `linear-gradient(to top, rgba(15,8,6,0.92) 0%, rgba(15,8,6,0.3) 50%, rgba(0,0,0,0.1) 100%), url('${option.image}')`,
              backgroundSize: activeIndex === index ? 'cover' : 'cover',
              backgroundPosition: 'center',
              backfaceVisibility: 'hidden',
              opacity: animatedOptions.includes(index) ? 1 : 0,
              transform: animatedOptions.includes(index) ? 'translateX(0)' : 'translateX(-40px)',
              minWidth: '55px',
              margin: 0,
              borderRadius: 0,
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: activeIndex === index ? 'rgba(212, 175, 55, 0.8)' : 'rgba(255, 255, 255, 0.08)',
              cursor: 'pointer',
              backgroundColor: '#18181b',
              boxShadow: activeIndex === index 
                ? '0 20px 50px rgba(0,0,0,0.65), inset 0 0 20px rgba(212,175,55,0.2)' 
                : '0 10px 25px rgba(0,0,0,0.4)',
              flex: activeIndex === index ? '6 1 0%' : '1 1 0%',
              zIndex: activeIndex === index ? 10 : 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              position: 'relative',
              overflow: 'hidden',
              willChange: 'flex-grow, box-shadow, background-size, background-position'
            }}
            onClick={() => handleOptionClick(index, option)}
          >
            {/* Tag Badge */}
            {option.tag && activeIndex === index && (
              <div className="absolute top-4 left-4 bg-amber-600/90 text-amber-50 text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-amber-300/40 backdrop-blur-md animate-fadeInTop">
                {option.tag}
              </div>
            )}

            {/* Price Badge on top right when active */}
            {option.price && activeIndex === index && (
              <div className="absolute top-4 right-4 bg-red-950/90 text-amber-300 text-xs font-extrabold px-3 py-1 rounded-full shadow-lg border border-amber-500/50 backdrop-blur-md">
                {option.price}
              </div>
            )}

            {/* Shadow effect at bottom */}
            <div 
              className="shadow absolute left-0 right-0 pointer-events-none transition-all duration-700 ease-in-out"
              style={{
                bottom: activeIndex === index ? '0' : '-40px',
                height: '140px',
                boxShadow: activeIndex === index 
                  ? 'inset 0 -130px 100px -60px rgba(12, 5, 3, 0.95)' 
                  : 'inset 0 -100px 80px -50px rgba(0,0,0,0.9)'
              }}
            ></div>
            
            {/* Label with icon and info */}
            <div className="label absolute left-0 right-0 bottom-4 flex items-center justify-start h-14 z-2 pointer-events-none px-3 md:px-4 gap-3 w-full">
              <div className="icon min-w-[44px] max-w-[44px] h-[44px] flex items-center justify-center rounded-full bg-stone-900/85 backdrop-blur-md shadow-lg border-2 border-amber-500/50 flex-shrink-0 flex-grow-0 transition-all duration-300 group-hover:scale-110">
                {option.icon}
              </div>
              
              <div className="info text-white whitespace-nowrap overflow-hidden relative pr-2">
                <div 
                  className="main font-bold text-base md:text-lg text-amber-100 transition-all duration-700 ease-in-out drop-shadow"
                  style={{
                    opacity: activeIndex === index ? 1 : 0,
                    transform: activeIndex === index ? 'translateX(0)' : 'translateX(25px)'
                  }}
                >
                  {option.title}
                </div>
                <div 
                  className="sub text-xs md:text-sm text-stone-300 transition-all duration-700 ease-in-out drop-shadow"
                  style={{
                    opacity: activeIndex === index ? 1 : 0,
                    transform: activeIndex === index ? 'translateX(0)' : 'translateX(25px)'
                  }}
                >
                  {option.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Custom keyframe styles */}
      <style>{`
        @keyframes fadeInFromTop {
          0% {
            opacity: 0;
            transform: translateY(-15px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInTop {
          opacity: 0;
          animation: fadeInFromTop 0.8s ease-in-out forwards;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        .delay-600 {
          animation-delay: 0.6s;
        }
      `}</style>
    </div>
  );
};

export default InteractiveSelector;

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const IndexPageComponent: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Scroll to bottom on component mount
  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }, 500);
    }
  }, [isLoaded]);

  const carouselImages = [
    "https://cdn.donmai.us/original/71/23/__gotoh_hitori_kita_ikuyo_ijichi_nijika_and_yamada_ryo_bocchi_the_rock__71232ed5875d888cdd098e77004fcd59.jpg",
    "https://cdn.donmai.us/original/25/9e/__chihaya_anon_nagasaki_soyo_shiina_taki_takamatsu_tomori_and_kaname_raana_bang_dream_and_1_more_drawn_by_bison_cangshu__259eaaefb7e422493ded2c01f8249df1.jpg",
    "https://cdn.donmai.us/original/a0/38/__togawa_sakiko_wakaba_mutsumi_yahata_umiri_misumi_uika_mortis_and_5_more_bang_dream_and_1_more_drawn_by_y_o_u_k_a__a03852deeb70a029642b927549c8e34c.png",
    "https://cdn.donmai.us/original/68/12/__hikawa_sayo_imai_lisa_minato_yukina_shirokane_rinko_and_udagawa_ako_bang_dream_drawn_by_nobusawa_osamu__68129a02a8613c1db14f526777aeb95b.jpg",
    "https://cdn.donmai.us/original/d7/06/__akiyama_mio_hirasawa_yui_tainaka_ritsu_and_kotobuki_tsumugi_k_on_and_1_more_drawn_by_akitake_seiichi__d70613749bb7f145042b4b1175169b2d.jpg",
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Fixed carousel without flicker
  useEffect(() => {
    if (!isLoaded) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isLoaded, carouselImages.length]);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  const prevSlide = () =>
    setCurrentSlide(
      (prev) => (prev - 1 + carouselImages.length) % carouselImages.length
    );

  const handleUpArrowClick = () => {
    // Smooth scroll to top with bounce effect
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Completely seamless crossfade transition variants
  const slideVariants = {
    enter: {
      opacity: 0,
    },
    center: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.2, ease: "easeOut" },
    },
  };

  // Combined animations for Band and Brand
  const bandBrandVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.8,
        ease: "easeOut",
      },
    }),
    glow: {
      textShadow: [
        "0 0 20px rgba(147, 197, 253, 0.5)",
        "0 0 40px rgba(147, 197, 253, 0.7)",
        "0 0 20px rgba(147, 197, 253, 0.5)",
      ],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  // Animation for N
  const nVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.2,
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const rubberBand = {
    rubber: {
      scale: [1, 1.25, 0.9, 1.1, 1],
      transition: {
        duration: 0.6,
        ease: "easeInOut",
      },
    },
  };

  if (!isLoaded) {
    return (
      <div className="h-screen w-full bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Import fonts */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        `}
      </style>

      {/* Completely Seamless Carousel - Multiple images stacked with opacity */}
      <div className="relative h-screen w-full z-0">
        {carouselImages.map((image, index) => (
          <motion.div
            key={image}
            className="absolute inset-0"
            initial={{ opacity: index === 0 ? 1 : 0 }}
            animate={{
              opacity: index === currentSlide ? 1 : 0,
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
            }}
          >
            <img
              src={image}
              alt={`Concert scene ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Consistent overlay for all images */}
            <div className="absolute inset-0 bg-black/20" />
          </motion.div>
        ))}
      </div>

      {/* Particles */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              background: `rgba(147, 197, 253, ${Math.random() * 0.6 + 0.3})`,
            }}
            animate={{
              y: [0, -150, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}

        {/* Sparkle particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute text-blue-200"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 12 + 8}px`,
            }}
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 0.7, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            ✦
          </motion.div>
        ))}
      </div>

      {/* Up Arrow Button */}
      <motion.button
        onClick={handleUpArrowClick}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-300 border border-white/20"
        whileHover="rubber"
        variants={rubberBand}
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      </motion.button>

      {/* Dots */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-white scale-125"
                : "bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>

      {/* Text Content - "Band N Brand" with better spacing */}
      <div className="absolute inset-0 z-20 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="text-center text-white w-full max-w-5xl">
          <motion.div
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="mb-8 sm:mb-12"
          >
            {/* Main Title - Static tilt, single elegant font with better spacing */}
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 md:gap-6 mb-8 px-4"
              style={{ transform: "rotate(-3deg)" }}
            >
              {/* BAND */}
              <motion.span
                custom={0}
                variants={bandBrandVariants}
                initial="hidden"
                animate={["visible", "glow"]}
                className="block text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-8xl"
                style={{
                  fontFamily: "'Dancing Script', cursive",
                  background:
                    "linear-gradient(45deg, #e0f2fe, #93c5fd, #6366f1)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 600,
                  lineHeight: 1,
                }}
              >
                Band
              </motion.span>

              {/* N - No pulsing animation */}
              <motion.span
                variants={nVariants}
                initial="hidden"
                animate="visible"
                className="block text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-7xl mx-2 sm:mx-3"
                style={{
                  fontFamily: "'Dancing Script', cursive",
                  color: "#fef3c7",
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                N
              </motion.span>

              {/* BRAND */}
              <motion.span
                custom={2}
                variants={bandBrandVariants}
                initial="hidden"
                animate={["visible", "glow"]}
                className="block text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-8xl"
                style={{
                  fontFamily: "'Dancing Script', cursive",
                  background:
                    "linear-gradient(45deg, #fce7f3, #f9a8d4, #ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 600,
                  lineHeight: 1,
                }}
              >
                Brand
              </motion.span>
            </div>
          </motion.div>

          {/* Subtitle - Normal white font for "Analog in the Digital Age" */}
          <motion.div
            variants={textVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.8 }}
            className="mb-8 sm:mb-12 px-2"
          >
            <p
              className="text-xl sm:text-2xl md:text-3xl text-white max-w-2xl mx-auto leading-relaxed py-3 sm:py-4 font-semibold"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                textShadow: `
                  0 0 25px rgba(0, 0, 0, 0.9),
                  0 0 50px rgba(0, 0, 0, 0.8),
                  0 2px 12px rgba(0, 0, 0, 0.9),
                  0 4px 24px rgba(0, 0, 0, 0.7)
                `,
                letterSpacing: "0.5px",
              }}
            >
              Analog, in the Digital Age.
            </p>
          </motion.div>

          {/* CTA Buttons - Normal font */}
          <motion.div
            variants={textVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-2"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-blue-600 to-purple-700 text-white font-semibold px-6 sm:px-10 py-3 sm:py-4 rounded-lg text-base sm:text-lg hover:shadow-xl transition-all duration-300 shadow-lg w-full sm:w-auto"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
              }}
            >
              Shop Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="border-2 border-white text-white font-semibold px-6 sm:px-10 py-3 sm:py-4 rounded-lg text-base sm:text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm w-full sm:w-auto"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
              }}
            >
              Explore Bands
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default IndexPageComponent;

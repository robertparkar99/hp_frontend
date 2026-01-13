"use client";

import { useEffect, useRef, useState } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import animationData from "../../../public/assets/loading/loading.json";

type LoaderProps = {
  isRouteLoading?: boolean;
};

export default function Loader({ isRouteLoading = false }: LoaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(1.5);
    }

    // Minimum loader visibility (prevents flash)
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const showLoader = isVisible || isRouteLoading;

  if (!showLoader) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
      <div className="relative flex items-center justify-center w-[200px] h-[200px] md:w-[250px] md:h-[250px]">
        {/* Center Logo */}
        <img
          src="/assets/loading/logo.png"
          alt="Scholar Clone Logo"
          className="absolute z-10 w-14 md:w-16 top-[62%] left-1/2 -translate-x-1/2 -translate-y-1/2"
        />

        {/* Lottie Animation */}
        <Lottie
          lottieRef={lottieRef}
          animationData={animationData}
          loop
          autoplay
        />
      </div>

      <h2 className="mt-2 text-lg md:text-xl font-semibold text-[#2A518A] animate-pulse">
        Streamlining Success, Energizing Employees
      </h2>
    </div>
  );
}


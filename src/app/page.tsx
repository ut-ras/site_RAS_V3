"use client"

import Navbar from "./components/Navbar";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Awards from './components/awardsData';
import Committees from "./components/committees";
import Footer from "./components/footer";
import BackgroundPic from "../../public/images/vex/vex.jpeg"
import RoboMTeamPic from "../../public/images/rbm/rmteamlead.jpg"

export default function Home() {

  const [opacity, setOpacity] = useState(1);

  // Effect for fading text based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const startFade = 100; // Start fading after 100px scroll
      const endFade = 500;   // Fully faded out at 500px scroll

      let newOpacity = 1 - (scrollY - startFade) / (endFade - startFade);
      newOpacity = Math.min(Math.max(newOpacity, 0), 1);
      setOpacity(newOpacity);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative">
      <Navbar scrollSet={true} inverse={false} />
      {/* Background image */}
      <div className="relative w-full h-screen overflow-hidden">
        <Image
          id="home"
          className="w-full h-screen object-cover transform scale-110"
          src={BackgroundPic}
          alt="Background"
          fill
          placeholder="blur"
          priority
        />
        {/* Home Gradient */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,black_0%,black_5%,transparent_35%,transparent_100%)]"></div> 
        <p className="text-5xl flex left-15 md:left-30 top-70 md:top-60 absolute">
          UT Austin Chapter 
        </p>        {/* Home content */}
        <p className="text-2xl flex left-20 md:left-40 top-100 md:top-110 absolute">
          MAKING ROBOTICS ACCESSIBLE
        </p>
        <p className="text-3xl md:text-4xl flex left-15 md:left-35 top-120 absolute">
          Teaching practical robotics skills to<br/> 
          all as one of the largest robotics orgs<br/>
          at UT with over 100 students across <br/>
          7 majors 
        </p>
        <p
          className="fixed flex left-[20vw] top-10 md:left-30 md:top-30 md:mt-0 mt-35 text-center text-white font-extrabold"
        >
          <span className="text-7xl md:text-9xl" style={{ opacity: opacity }}>
            IEEE RAS
          </span>
        </p>
      </div>

      {/* Post-home, about */}
      <div id="parent" className="px-4 py-8 flex flex-col md:flex-row">
        <div id="narrow" className="ml-8 md:pr-8 text-4xl md:text-7xl text-center text-black mt-8 pr-0">
          What <br /> is <br /> RAS?
        </div>
        <div
          id="wide"
          className="mt-6 md:pl-8 text-xl md:text-3xl text-center text-black leading-relaxed min-w-[20ch] max-w-full"
        >
          We are a student organization open to students from any background and major.<br />
          Since 1997, we&apos;ve helped students gain practical multi-disciplinary experience<br />
          in the lab, then demonstrated our abilities at various robotics competitions while<br />
          promoting robotics via community outreach.
        </div>
      </div>

      {/* Awards and total club photo */}
      <div className="flex flex-col md:flex-row items-center mt-8 md:mt-15 px-4">
        <Image
          src={RoboMTeamPic}
          className="w-full md:w-1/2 object-contain mt-10"
          alt="Team Lead"
          width={500}
          height={500}
          placeholder="blur"
        />
        <div className="w-full md:w-1/2">
          <Awards />
        </div>
      </div>

      <div id="committees" className="text-6xl text-center text-black mt-8 md:mt-20">
        Committees
      </div>
      <div className="px-4 mt-4">
        <Committees />
      </div>
      <Footer />
    </div>
  );
}

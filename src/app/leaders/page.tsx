"use client"

import React from 'react';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import { leaders, officers, teamleads } from '../components/officersData';
import Footer from '../components/footer';


const blurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyEhck+C3Hx2lhE6mZAFr2n7CRaIDFwJULk5LlhQDg/f5Vfo";

const LeaderPage: React.FC = () => {
  const handleClick = (link) => {
    if (link) {
      window.open(link, '_blank');
    }
  };
  
  return (
    <>
      <Navbar scrollSet={false} />
      <main className="mx-4 sm:mx-12 md:mx-24 py-8 mt-20">
        <h1 className="text-[clamp(1.5rem,4vw,3rem)] font-bold text-black text-center mb-8">
          RAS Leadership
        </h1>
        <h2 className="text-[clamp(1.25rem,3.5vw,2.5rem)] font-bold text-black text-start mb-5">
          Officers
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 md:gap-12">
          {officers.map((member, index) => (
            <div
              onClick={() => handleClick(member.profileLink)} 
              key = {index}
              className={`bg-[#e6e4d8] shadow rounded-lg p-3 sm:p-6 text-center flex flex-col items-center
                        hover:cursor-pointer  ${member.profileLink.length < 5 ? "pointer-events-none" : ""}`}
            >
              <div className="w-full aspect-square relative mb-4">
                  <Image
                    src={member.picture ? member.picture : "/images/ras_logo_big.png"}
                    alt={member.name}
                    className="object-contain rounded-full"
                    placeholder='blur'
                    blurDataURL={blurDataURL}
                    priority={index < 4}
                    loading={index < 4 ? "eager" : "lazy"}
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 25vw, (max-width: 1024px) 25vw, 200px"
                    fill
                  />
              </div>
              <h3 className="font-semibold text-[clamp(1rem,2.5vw,1.5rem)] text-black">
                {member.name}
              </h3>
              <p className="text-[clamp(0.8rem,2vw,1.2rem)] text-black">
                {member.title}
              </p>
              
              <p className="text-[clamp(0.7rem,1.8vw,1rem)] text-[#BF5700]">
                <a href={`mailto:${member.email}`}>{member.email}</a>
              </p>
            </div>
          ))}
        </div>

        <h2 className="text-[clamp(1.25rem,3.5vw,2.5rem)] font-bold text-black text-start mb-5 mt-8">
          Committee Heads
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 md:gap-12">
          {teamleads.map((member, index) => (
            <div
              key={index}
              className={`bg-[#e6e4d8] shadow rounded-lg p-3 sm:p-6 text-center flex flex-col items-center"
                        ${member.profileLink.length < 5 ? "pointer-events-none" : ""} hover:cursor-pointer`}
              onClick={() => handleClick(member.profileLink)} 
            >
              <div className="w-full aspect-square relative mb-4">
                  <Image
                    src={member.picture ? member.picture : "/images/ras_logo_big.png"}
                    alt={member.name}
                    className="object-cover rounded-full"
                    placeholder='blur'
                    blurDataURL={blurDataURL}
                    priority={index < 4}
                    loading={index < 4 ? "eager" : "lazy"}
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 25vw, (max-width: 1024px) 25vw, 200px"
                    fill
                  />
              </div>
              <h3 className="font-semibold text-[clamp(1rem,2.5vw,1.5rem)] text-black">
                {member.name}
              </h3>
              <p className="text-[clamp(0.8rem,2vw,1.2rem)] text-black mb-2">
                {member.title}
              </p>
              <p className="text-[clamp(0.7rem,1.8vw,1rem)] text-[#BF5700]">
                Discord: {member.discord}
              </p>
            </div>
          ))}
        </div>

        <h2 className="text-[clamp(1.25rem,3.5vw,2.5rem)] font-bold text-black text-start mb-5 mt-8">
          General Leaders
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 md:gap-12">
          {leaders.map((member, index) => (
            <div
              key={index}
              className={`bg-[#e6e4d8] shadow rounded-lg p-3 sm:p-6 flex items-center
                        ${member.profileLink.length < 5 ? "pointer-events-none" : ""} hover:cursor-pointer`}
              onClick={() => handleClick(member.profileLink)} 
            >
              <div className="relative rounded-full w-16 h-16 md:w-24 md:h-24">
                <Image
                  src={member.picture ? member.picture : "/images/ras_logo_big.png"}
                  alt={member.name}
                  className="object-cover rounded-full"
                  placeholder='blur'
                  blurDataURL={blurDataURL}
                  priority={index < 6}
                  loading={index < 6 ? "eager" : "lazy"}
                  sizes="(max-width: 640px) 64px, (max-width: 768px) 96px, 96px"
                  fill
                />
              </div>
              <div className="ml-2 w-full">
                <h3 className="text-center font-semibold text-[clamp(0.9rem,2vw,1.3rem)] text-black">
                  {member.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default LeaderPage;

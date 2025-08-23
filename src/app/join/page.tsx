'use client';
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import Iframe from 'react-iframe';

const JoinPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="mb-8">
        <Navbar scrollSet={false} />
      </header>

      <main className="flex-1 mx-4 sm:mx-8 md:mx-24 py-8">
        <h1 className="text-center text-black font-bold text-[clamp(2rem,5vw,3rem)] mt-5">
          Join RAS!
        </h1>

        <p className="text-black font-bold text-[clamp(1rem,4vw,1.5rem)] md:ml-[3%] mt-10 mx-auto max-w-4xl text-left">
          We live in EER room 0.822C, come in and say hi!
          <br />
          New members can join at any time. No experience necessary!
          <br />
          New members are required to fill a{' '}
          <a
            href="https://forms.gle/ApJrJw7zuGN56PVf9"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#BF5700] underline hover:text-[#cc7933]"
          >
            Membership & Attendance Form
          </a>
          .
          <br />
          Pay membership dues{' '}
          <a
            href="https://hcb.hackclub.com/donations/start/austin-ieee-ras"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#BF5700] underline hover:text-[#cc7933]"
          >
            here!
          </a>
        </p>

        <div className="flex flex-col md:flex-row items-start mt-10 gap-8">
          <div className="flex flex-col space-y-4 md:w-1/2">
            <a
              href="https://www.instagram.com/ut_ieee_ras/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#BF5700] text-[clamp(1.5rem,4vw,2rem)] font-bold underline hover:text-[#cc7933]"
            >
              Instagram
            </a>
            <a
              href="https://discord.gg/ehmhUTZ2NZ"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#BF5700] text-[clamp(1.5rem,4vw,2rem)] font-bold underline hover:text-[#cc7933]"
            >
              Main Discord
            </a>
            <a
              href="https://www.youtube.com/@ut_ieee_ras"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#BF5700] text-[clamp(1.5rem,4vw,2rem)] font-bold underline hover:text-[#cc7933]"
            >
              Youtube
            </a>
            <a
              href="https://github.com/ut-ras"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#BF5700] text-[clamp(1.5rem,4vw,2rem)] font-bold underline hover:text-[#cc7933]"
            >
              Github
            </a>
            <div className="text-black text-[clamp(1.5rem,4vw,2rem)] mt-6">
              Committee Specific Discords
            </div>
            <a
              href="https://discord.gg/Tcs987kkTp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#BF5700] text-[clamp(1rem,3vw,1.5rem)] font-bold underline hover:text-[#cc7933]"
            >
              IGVC
            </a>
            <a
              href="https://discord.gg/fU7qEDc322"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#BF5700] text-[clamp(1rem,3vw,1.5rem)] font-bold underline hover:text-[#cc7933]"
            >
              Demobots
            </a>
            <a
              href="https://discord.gg/dXjmUvAm4q"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#BF5700] text-[clamp(1rem,3vw,1.5rem)] font-bold underline hover:text-[#cc7933]"
            >
              Robomaster
            </a>
            <a
              href="https://discord.gg/DvPsTE94qe"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#BF5700] text-[clamp(1rem,3vw,1.5rem)] font-bold underline hover:text-[#cc7933]"
            >
              VexU
            </a>
          </div>

          <div className="flex-1">
            <div className="relative w-full">
              <Iframe
                url="https://www.youtube.com/embed/VXGF3trD92Q?si=vq6xR2tMxp60jdIi"
                width="100%"
                height="100%"
                id=""
                className="md:w-[50vw] md:h-[50vh] w-[92vw] h-[30vh]"
                display="block"
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full">
        <Footer />
      </footer>
    </div>
  );
};

export default JoinPage;

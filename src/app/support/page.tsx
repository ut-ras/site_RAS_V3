'use client'
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import SponsorDisplay from '../components/sponsorsData';

const Support: React.FC = () => {
  return (
    <div>
      <div className="mb-25">
        <Navbar scrollSet={false}/>
      </div>
      <div className="relative min-h-screen">
        <div className="text-black text-center font-bold text-3xl md:text-5xl mt-5 mb-5">
          Support RAS!
        </div>
        <div className="text-black text-center text-lg md:text-2xl mb-15 font-semibold">
          RAS is always excited to collaborate with corporate partners through general meetings and tech talks, 
          workshops, and social events. <br /> We offer virtual, in-person, and hybrid events. 
          Please{' '}
          <a 
            className="text-[#BF5700] font-bold underline hover:text-[#cc7933] hover:cursor-pointer"
            href="mailto:utrascorporate@gmail.com"
          >
            contact us
          </a>{' '}
          if you have any questions or for more information. <br /> <br />
          If you would like to become a supporter, please view our{' '}
          <a 
            href="/ut_ieee_ras_corp_packet.pdf"
            target="_blank"
            rel="noopener"
            className="text-[#BF5700] font-bold underline hover:text-[#cc7933] hover:cursor-pointer"
          >
            corporate packet
          </a>{' '}
          for details.
<br/>
          However, if you would like to simply donate to us, you can do that on
          {' '}
           <a 
            href="https://hcb.hackclub.com/donations/start/austin-ieee-ras"
            target="_blank"
            rel="noopener"
            className="text-[#BF5700] font-bold underline hover:text-[#cc7933] hover:cursor-pointer"
          >
           our donation page.
          </a>{' '}
        </div>

        <div className="text-black text-center font-bold text-3xl md:text-5xl mt-5 mb-5">
          Spring 2025 Partners
        </div> 
        <div className="text-black text-center text-lg md:text-2xl mb-10 font-semibold">
          We would like to thank our company partners for supporting and collaborating with us. We look forward to continuing to work with you!
        </div>
        <main>
          <SponsorDisplay/>
        </main>
      </div>
      <div className="w-full">
        <Footer/>
      </div>
    </div>
  );
};

export default Support;

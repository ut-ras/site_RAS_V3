import { useState } from "react";

export default function Awards() {
  const initialHeader = "Awards";
  const initialAwardContent = (
    <>
      <div className="font-bold">2025</div>
      VEX AI Robotics Competition World Champion (Tournament)
      <br />
      <div className="font-bold">2025</div>
      VEX U Robotics Texas Semifinalist & Design Award
      <br />
      <div className="font-bold">2024</div>
      VEX AI Robotics Competition World Champion (Excellence Award)
      <br />
      <div className="font-bold">2023</div> VEXU World Championship Build Award
      <br />
      <div className="font-bold">2022</div> RoboMaster - First Prize - 4th in 2022 North American RoboMaster Competition
    </>
  );

  const newHeader = "";
  const newAwardContent = (
    <>
      <div className="font-bold">2013</div>
      IGVC - 15th AutoNav Challenge - DoloRAS 
      <br />
      <div className="font-bold">2007</div> 
      IGVC JAUS Level 1 Award; BlastyRAS  
      <br />
      IEEE Region 5 - 5th Best Run - Whiny 1.1 
      <br />
      FIRST - Rookie All-Star Award        
      <br />
      Nationals Qualification - TinMan      
      <br />
      <div className="font-bold">2006</div> 
      IGVC - Highest Rookie Score           
      <br />
      IEEE Region 5 - Final Qualification       
      <br />
      4th Highest Score - Whiny             
      <br />
      DPRG - 2nd Place - RASlow           
      <br />
      BEST Mentor Award                     
      <br />
      <div className="font-bold">2005</div> 
      DPRG - RoboRama 2nd Place                 
      <br />
      <div className="font-bold">2004</div> 
      IEEE Region 5 - Finals Qualification - Kim Smith
      <br />
    </>
  );

  const [headerText, setHeaderText] = useState(initialHeader);
  const [awardContent, setAwardContent] = useState(initialAwardContent);
  const [visible, setVisible] = useState(true);
  const [view, setView] = useState("initial");

  const handleClick = () => {
    setVisible(false);
    setTimeout(() => {
      if (view === "initial") {
        setHeaderText(newHeader);
        setAwardContent(newAwardContent);
        setView("new");
      } else {
        setHeaderText(initialHeader);
        setAwardContent(initialAwardContent);
        setView("initial");
      }
      setVisible(true);
    }, 500); // transition time
  };

  return (
    <div className="p-5">
      <div
        className={`text-6xl relative text-center text-black transition-opacity duration-500 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {headerText}
      </div>
      <div
        className={`flex flex-col w-full text-black text-3xl mt-10 text-center lg:text-start transition-opacity duration-500 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {awardContent}
      </div>
      <button
        onClick={handleClick}
        className="text-black underline text-2xl mt-5 hover:cursor-pointer"
      >
        {view === "initial" ? "More" : "Back"}
      </button>
    </div>
  );
}

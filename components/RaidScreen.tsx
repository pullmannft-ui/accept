
import React, { useState } from 'react';
import { UserData } from '../types';
import { MISSIONS_DEFAULT } from '../constants';

interface RaidScreenProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  onNext: () => void;
  onBack: () => void;
}

const RaidScreen: React.FC<RaidScreenProps> = ({ userData, setUserData, onNext, onBack }) => {
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const totalMissions = MISSIONS_DEFAULT.length;
  const requiredMissions = totalMissions;
  
  const isQuoteValid = userData.proofLinks.quote.trim().startsWith('http');
  const isTagsValid = userData.proofLinks.tags.trim().startsWith('http');
  // Require all missions + both proof links
  const isComplete = isQuoteValid && isTagsValid && completedMissions.length >= requiredMissions;

  const handleMissionClick = (id: string, link: string) => {
    window.open(link, '_blank');
    if (!completedMissions.includes(id)) {
      setCompletedMissions(prev => [...prev, id]);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#c0c0c0] text-black font-mono relative overflow-hidden">
      {/* Scrolling Header */}
      <div className="bg-[#ff00ff] h-10 border-b-2 border-black flex items-center overflow-hidden whitespace-nowrap">
        <div className="animate-[scroll_10s_linear_infinite] flex gap-8">
          <span className="text-xl font-black italic">RAID_THE_TIMELINE RAID_THE_TIMELINE RAID_THE_TIMELINE RAID_THE_TIMELINE RAID_THE_TIMELINE</span>
        </div>
      </div>
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <div className="p-4 flex flex-col gap-4 overflow-y-auto">
        <div className="flex justify-between items-center px-1">
          <span className="text-[#000080] font-black italic text-xs uppercase">MISSION_QUEUE [{Math.min(completedMissions.length, totalMissions)}/{totalMissions.toString().padStart(2, '0')}]:</span>
          <div className="flex gap-1">
            {Array.from({ length: totalMissions }, (_, idx) => idx + 1).map(i => (
              <div key={i} className={`w-2 h-2 rounded-full ${completedMissions.length >= i ? 'bg-green-500' : 'bg-red-600 ' + (completedMissions.length === i - 1 ? 'animate-pulse' : 'opacity-30')}`}></div>
            ))}
          </div>
        </div>

        {/* Missions */}
        <div className="space-y-3">
          {MISSIONS_DEFAULT.map(mission => {
            const isDone = completedMissions.includes(mission.id);
            return (
              <div key={mission.id} className="bg-white border-2 border-black p-1 shadow-[2px_2px_0_0_#000]">
                <div className="p-2 border-2 border-black relative">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] font-black uppercase">{mission.title}</p>
                    {isDone && (
                      <span className="text-[8px] bg-green-500 text-white px-1 font-bold animate-bounce">✓ CHECKED</span>
                    )}
                  </div>
                  <button 
                    onClick={() => handleMissionClick(mission.id, mission.link)}
                    className={`w-full border-2 border-black py-2 font-black text-sm active:translate-y-0.5 shadow-[2px_2px_0_0_#000] active:shadow-none transition-all
                      ${isDone ? 'bg-white text-green-600' : 'bg-[#00ff00] hover:bg-white text-black'}
                    `}
                  >
                    {isDone ? 'MISSION_VERIFIED' : mission.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Proof of Work */}
        <div className="bg-[#111] border-2 border-black p-4 space-y-4 shadow-[4px_4px_0_0_#000] mt-2">
          <h3 className="text-[#00ff00] text-xs font-black italic tracking-widest">_ PROOF_OF_WORK_LOGS</h3>
          
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-[#808080] uppercase">QUOTE_EVIDENCE_URL (X/TWITTER):</label>
            <div className="border-2 border-[#00ff00] p-1">
              <input 
                type="text" 
                placeholder="https://x.com/your_quote..."
                className="w-full bg-black text-[#00ff00] p-2 text-xs outline-none font-mono"
                value={userData.proofLinks.quote}
                onChange={(e) => setUserData(prev => ({ ...prev, proofLinks: { ...prev.proofLinks, quote: e.target.value } }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-bold text-[#808080] uppercase">TAGS_EVIDENCE_URL (X/TWITTER):</label>
            <div className="border-2 border-[#00ff00] p-1">
              <input 
                type="text" 
                placeholder="https://x.com/your_tags..."
                className="w-full bg-black text-[#00ff00] p-2 text-xs outline-none font-mono"
                value={userData.proofLinks.tags}
                onChange={(e) => setUserData(prev => ({ ...prev, proofLinks: { ...prev.proofLinks, tags: e.target.value } }))}
              />
            </div>
          </div>
        </div>

        <p className="text-[9px] text-center opacity-50 uppercase mt-4">COMMIT LOGS VIA STATUS BAR TERMINAL BELOW...</p>
      </div>

      {/* Footer Navigation */}
      <div className="mt-auto bg-[#111] p-2 border-t-2 border-black space-y-2">
        <div className="flex gap-2 h-16">
          <button 
            onClick={onBack}
            className="w-24 bg-[#c0c0c0] border-2 border-white border-r-[#808080] border-b-[#808080] font-black text-xs hover:bg-white active:border-r-white active:border-b-white text-black"
          >
            BACK
          </button>
          <button 
            onClick={onNext}
            disabled={!isComplete}
            className={`flex-1 font-black text-xl tracking-[0.2em] border-2 border-black relative overflow-hidden transition-all
              ${!isComplete ? 'bg-[#222] text-[#444] cursor-not-allowed opacity-50' : 'bg-green-600 text-white hover:bg-green-400'}
            `}
          >
            COMMIT
            {isComplete && <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:10px_10px]"></div>}
          </button>
        </div>

        <div className="space-y-1 px-1">
          <div className="flex justify-between text-[8px] text-[#00ff00] font-black uppercase">
            <span>PROTOCOL_SYNC:</span>
            <span>{Math.min(75 + completedMissions.length * 5, 95)}%</span>
          </div>
          <div className="w-full h-3 bg-[#222] border border-black overflow-hidden flex">
            <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${75 + completedMissions.length * 5}%` }}></div>
            <div className="h-full bg-green-800 w-[10%] animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaidScreen;


import React, { useState, useEffect } from 'react';
import { AppStep } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  progress: number;
  step: AppStep;
  currentStepIndex: number;
  totalSteps: number;
  onHelp: () => void;
  onClose?: () => void;
  onOpenApp?: (step: AppStep) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  progress, 
  step, 
  currentStepIndex, 
  totalSteps,
  onHelp,
  onClose,
  onOpenApp
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (step === AppStep.DESKTOP) {
    return (
      <div className="min-h-screen w-full bg-[#008080] relative overflow-hidden font-mono flex flex-col">
        <div className="flex-1 p-4 md:p-8 grid grid-cols-2 sm:grid-cols-1 content-start gap-8 w-fit">
          <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={() => onOpenApp?.(AppStep.WELCOME)}>
            <div className="w-12 h-12 bg-[#c0c0c0] border-2 border-white border-r-[#808080] border-b-[#808080] flex items-center justify-center text-2xl shadow-sm group-hover:bg-[#dfdfdf]">
              🐒
            </div>
            <span className="text-white text-[10px] bg-black/20 px-1">Jungle.exe</span>
          </div>
          <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={() => onOpenApp?.(AppStep.FORGE)}>
            <div className="w-12 h-12 bg-[#c0c0c0] border-2 border-white border-r-[#808080] border-b-[#808080] flex items-center justify-center text-2xl shadow-sm group-hover:bg-[#dfdfdf]">
              🛠️
            </div>
            <span className="text-white text-[10px] bg-black/20 px-1">Forge.sys</span>
          </div>
          <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={() => onOpenApp?.(AppStep.APPLICATION)}>
            <div className="w-12 h-12 bg-[#c0c0c0] border-2 border-white border-r-[#808080] border-b-[#808080] flex items-center justify-center text-2xl shadow-sm group-hover:bg-[#dfdfdf]">
              📋
            </div>
            <span className="text-white text-[10px] bg-black/20 px-1">Form.v3</span>
          </div>
          <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={() => onOpenApp?.(AppStep.AIRDROP)}>
            <div className="w-12 h-12 bg-[#c0c0c0] border-2 border-white border-r-[#808080] border-b-[#808080] flex items-center justify-center text-2xl shadow-sm group-hover:bg-[#dfdfdf]">
              🍌
            </div>
            <span className="text-white text-[10px] bg-black/20 px-1">Airdrop.exe</span>
          </div>
          <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={() => onOpenApp?.(AppStep.PRESALE)}>
            <div className="w-12 h-12 bg-[#c0c0c0] border-2 border-white border-r-[#808080] border-b-[#808080] flex items-center justify-center text-2xl shadow-sm group-hover:bg-[#dfdfdf]">
              🗳️
            </div>
            <span className="text-white text-[10px] bg-black/20 px-1">Presale.exe</span>
          </div>
          <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={() => onOpenApp?.(AppStep.ADMIN)}>
            <div className="w-12 h-12 bg-[#c0c0c0] border-2 border-white border-r-[#808080] border-b-[#808080] flex items-center justify-center text-2xl shadow-sm group-hover:bg-[#dfdfdf]">
              ⚙️
            </div>
            <span className="text-white text-[10px] bg-black/20 px-1">Admin.cfg</span>
          </div>
        </div>

        {/* Taskbar */}
        <div className="h-10 bg-[#c0c0c0] border-t-2 border-white flex items-center px-1 z-50">
          <button className="flex items-center gap-1 bg-[#c0c0c0] border-2 border-white border-r-[#808080] border-b-[#808080] px-3 py-0.5 font-bold text-black active:border-r-white active:border-b-white">
            <span className="text-sm">🐒</span> <span className="text-xs">Start</span>
          </button>
          <div className="flex-1"></div>
          <div className="bg-[#c0c0c0] border-2 border-[#808080] border-r-white border-b-white px-3 py-0.5 font-bold text-black flex items-center gap-2 text-[10px]">
            <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#008080] flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="absolute text-4xl animate-pulse" style={{ top: `${Math.random()*100}%`, left: `${Math.random()*100}%`, animationDelay: `${i*0.5}s` }}>🍌</div>
        ))}
      </div>

      <div className="flex-1 flex items-center justify-center p-2 md:p-4 relative z-10">
        <div className="w-full max-w-2xl bg-[#c0c0c0] border-2 border-white border-r-[#808080] border-b-[#808080] overflow-hidden window-shadow flex flex-col max-h-[92dvh]">
          <div className="bg-[#000080] flex items-center justify-between p-1 px-2 text-white font-bold text-xs md:text-sm shrink-0">
            <div className="flex items-center gap-2 truncate pr-2">
              <span className="text-base flex-shrink-0">🐒</span>
              <span className="truncate">
                {step === AppStep.PRESALE ? 'PRESALE_CONTRIBUTION :: MONKY_MAKER' : 
                 step === AppStep.AIRDROP ? 'ENGAGE_TO_AIRDROP :: MONKY_FUN' : 
                 step === AppStep.FORGE ? 'RITUAL_FORGE :: BANANA_MINER' : 
                 step === AppStep.APPLICATION ? 'AGENT_REGISTRATION :: PROTOCOL_V3' :
                 `MONKY_PROTOCOL - STEP ${currentStepIndex}/${totalSteps}`}
              </span>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={onHelp} className="bg-[#c0c0c0] border border-white border-r-[#808080] border-b-[#808080] px-1.5 text-black text-[10px] font-bold">?</button>
              <button onClick={onClose} className="bg-[#c0c0c0] border border-white border-r-[#808080] border-b-[#808080] px-1.5 text-black text-[10px] font-bold">X</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-black text-green-500 p-1 flex flex-col min-h-0">
             <div className="flex-1 flex flex-col border border-[#444] min-h-0 relative">
                {children}
             </div>
          </div>

          <div className="bg-[#c0c0c0] border-t-2 border-[#808080] p-1 flex gap-1 items-stretch h-8 flex-shrink-0">
            <div className="flex-1 border border-[#808080] border-r-white border-b-white px-2 flex items-center text-[9px] md:text-[10px] text-black font-bold truncate">
              SYNC_STATUS: {progress}% COMPLETE
            </div>
            <div className="hidden sm:flex w-24 border border-[#808080] border-r-white border-b-white px-2 items-center text-[10px] text-black font-bold">
              AUTH: OK
            </div>
            <div className="w-16 md:w-24 border border-[#808080] border-r-white border-b-white px-2 flex items-center text-[9px] md:text-[10px] text-black font-bold">
              SYS: V99
            </div>
          </div>
        </div>
      </div>

      <div className="h-10 bg-[#c0c0c0] border-t-2 border-white flex items-center px-1 z-50">
        <button 
          onClick={() => onOpenApp?.(AppStep.DESKTOP)}
          className="flex items-center gap-1 bg-[#c0c0c0] border-2 border-white border-r-[#808080] border-b-[#808080] px-3 py-0.5 font-bold text-black active:border-r-white active:border-b-white"
        >
          <span className="text-sm">🐒</span> <span className="text-xs">Start</span>
        </button>
        <div className="w-[2px] h-6 bg-[#808080] border-r-[1px] border-r-white mx-2"></div>
        <div className="bg-[#c0c0c0] border-2 border-r-white border-b-white border-[#808080] px-2 md:px-4 py-0.5 font-bold text-black text-[10px] flex items-center gap-2 truncate max-w-[150px] md:max-w-none">
          🛠️ <span className="truncate">
            {step === AppStep.PRESALE ? 'Presale.exe' : 
             step === AppStep.AIRDROP ? 'Airdrop.exe' : 
             step === AppStep.FORGE ? 'Forge.sys' : 
             step === AppStep.APPLICATION ? 'Form.v3' :
             'Ritual_Protocol.exe'}
          </span>
        </div>
        <div className="flex-1"></div>
        <div className="bg-[#c0c0c0] border-2 border-[#808080] border-r-white border-b-white px-3 py-0.5 font-bold text-black flex items-center gap-2 text-xs">
          <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
};

export default Layout;

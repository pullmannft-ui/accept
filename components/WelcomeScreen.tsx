
import React from 'react';

interface WelcomeScreenProps {
  onNext: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter bg-green-500 text-black px-4 py-2 inline-block transform -rotate-1">
          JUNGLE PROTOCOL
        </h1>
        <p className="text-pink-500 text-xs tracking-widest font-bold uppercase">// ESTABLISHED_SINCE_BEFORE_YOU</p>
      </div>

      <div className="relative group cursor-pointer w-48 h-48 md:w-64 md:h-64" onClick={onNext}>
        <div className="absolute inset-0 bg-pink-500 transform rotate-3"></div>
        <img 
          src="https://picsum.photos/300/300?monkey" 
          alt="Monky"
          className="relative w-full h-full object-cover border-4 border-white grayscale hover:grayscale-0 transition-all duration-500"
        />
        <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-black p-1 text-[10px] font-black border-2 border-black">LIVE_FEED</div>
      </div>

      <div className="space-y-4 max-w-sm text-center">
        <p className="text-xs md:text-sm font-bold leading-relaxed">
          The ritual has begun. Prove your spirit on the timeline. Collect rewards. 
          Become eternal in the $MONKY ecosystem.
        </p>
        <div className="flex flex-col gap-2">
          <p className="text-[10px] text-green-500/50 uppercase font-bold">Estimated time: ~60 SECONDS</p>
          <p className="text-[10px] text-green-500/50 uppercase font-bold">No wallet connect required</p>
        </div>
      </div>

      <button 
        onClick={onNext}
        className="w-full max-w-xs bg-green-500 text-black py-4 font-black text-2xl hover:bg-white transition-all transform hover:scale-105 active:scale-95 border-b-4 border-green-900"
      >
        I N I T I A T E
      </button>

      <button className="text-[10px] underline uppercase font-bold opacity-50 hover:opacity-100">
        [ WHAT IS MONKY? ]
      </button>
    </div>
  );
};

export default WelcomeScreen;

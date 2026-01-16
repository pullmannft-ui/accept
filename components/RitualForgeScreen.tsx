
import React, { useState, useEffect, useCallback } from 'react';

interface NFT {
  id: string;
  name: string;
  rarity: 'COMMON' | 'RARE' | 'ALPHA' | 'LEGENDARY';
  icon: string;
}

const RitualForgeScreen: React.FC = () => {
  const [juice, setJuice] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [inventory, setInventory] = useState<NFT[]>([]);
  const [isMining, setIsMining] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');
  const [miningCharge, setMiningCharge] = useState(0);

  // Auto-decay charge
  useEffect(() => {
    const timer = setInterval(() => {
      setMiningCharge(prev => Math.max(0, prev - 2));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const harvest = useCallback(() => {
    setIsMining(true);
    const gain = 1 * multiplier;
    setJuice(prev => prev + gain);
    setMiningCharge(prev => Math.min(100, prev + 10));
    setLastAction(`+${gain} JJ_INJECTED`);
    
    // Check for NFT drop (low chance)
    if (Math.random() < 0.05) {
      const nftOptions: NFT[] = [
        { id: '1', name: 'PIXEL_PEEL', rarity: 'COMMON', icon: '🍌' },
        { id: '2', name: 'JUNGLE_VISOR', rarity: 'RARE', icon: '🕶️' },
        { id: '3', name: 'ALPHA_IDOL', rarity: 'ALPHA', icon: '🗿' },
        { id: '4', name: 'CRYSTAL_MONKY', rarity: 'LEGENDARY', icon: '💎' },
      ];
      const roll = Math.random();
      let selected;
      if (roll < 0.01) selected = nftOptions[3];
      else if (roll < 0.1) selected = nftOptions[2];
      else if (roll < 0.3) selected = nftOptions[1];
      else selected = nftOptions[0];

      setInventory(prev => [...prev, { ...selected, id: Date.now().toString() }]);
      setLastAction(`!!! ARTIFACT_UNEARTHED: ${selected.name} !!!`);
    }

    setTimeout(() => setIsMining(false), 100);
  }, [multiplier]);

  const activateRitual = (cost: number, boost: number, name: string) => {
    if (juice < cost) {
      setLastAction("INSUFFICIENT_JUICE_SIGNAL");
      return;
    }
    setJuice(prev => prev - cost);
    setMultiplier(prev => prev + boost);
    setLastAction(`RITUAL_ACTIVATED: ${name} (+${boost} MULT)`);
  };

  return (
    <div className="flex-1 flex flex-col bg-black text-[#ec4899] font-mono overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
         <div className="grid grid-cols-8 gap-4 p-4">
            {[...Array(32)].map((_, i) => (
              <div key={i} className="text-2xl">🌴</div>
            ))}
         </div>
      </div>

      {/* Main Stats HUD */}
      <div className="grid grid-cols-2 gap-2 p-2 shrink-0 z-10">
        <div className="bg-[#0a000a] border border-pink-900/40 p-3 shadow-[4px_4px_0_0_#000]">
           <p className="text-[8px] font-black uppercase text-pink-700 italic tracking-widest">SIGNAL_JUICE (JJ):</p>
           <p className="text-3xl font-black text-white italic tracking-tighter leading-none">{juice.toLocaleString()}</p>
        </div>
        <div className="bg-[#0a000a] border border-pink-900/40 p-3 shadow-[4px_4px_0_0_#000]">
           <p className="text-[8px] font-black uppercase text-pink-700 italic tracking-widest">EXTRACTION_MULT:</p>
           <p className="text-3xl font-black text-white italic tracking-tighter leading-none">x{multiplier.toFixed(1)}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-8 z-10 min-h-0">
        {/* The Central Node */}
        <div className="relative group">
          <div className={`absolute inset-0 rounded-full blur-3xl transition-all duration-300 ${isMining ? 'bg-pink-500/40 scale-125' : 'bg-pink-500/10'}`}></div>
          <button 
            onClick={harvest}
            className={`relative w-40 h-40 md:w-56 md:h-56 bg-[#0a000a] border-4 border-pink-900 rounded-full flex items-center justify-center text-6xl md:text-8xl transition-all active:scale-95 shadow-[0_0_30px_rgba(236,72,153,0.2)] hover:border-white group
              ${isMining ? 'border-white -translate-y-1' : ''}`}
          >
            <span className={`transition-all ${isMining ? 'rotate-12 scale-110' : ''}`}>🗿</span>
            {/* Charge Meter Surround */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle 
                cx="50%" cy="50%" r="48%" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="4" 
                strokeDasharray="301.59" 
                strokeDashoffset={301.59 - (301.59 * miningCharge / 100)}
                className="text-pink-600 opacity-40"
              />
            </svg>
            <div className="absolute -bottom-4 bg-pink-600 text-white text-[9px] px-3 font-black py-0.5 shadow-lg uppercase tracking-tighter group-hover:bg-white group-hover:text-pink-600">
               FEED_THE_IDOL
            </div>
          </button>
        </div>

        {/* Console Output */}
        <div className="w-full max-w-sm bg-black/80 border border-pink-900/40 p-2 h-10 flex items-center justify-center">
           <p className="text-[10px] font-black italic uppercase tracking-widest animate-pulse truncate">
              {lastAction || '> STANDBY_FOR_SIGNAL_HARVEST'}
           </p>
        </div>

        {/* Ritual Shop */}
        <div className="w-full space-y-3">
           <h3 className="text-[10px] font-black uppercase text-pink-800 tracking-widest text-center italic border-b border-pink-900/20 pb-1">AVAILABLE_RITUALS</h3>
           <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => activateRitual(50, 0.2, 'BANANA_RAIN')}
                className="bg-[#0a000a] border border-pink-900/40 p-2 hover:bg-pink-900/10 transition-colors flex flex-col items-center group"
              >
                <span className="text-xl">🌧️</span>
                <span className="text-[8px] font-black text-white group-hover:text-pink-500">BANANA_RAIN</span>
                <span className="text-[7px] text-pink-800">COST: 50 JJ</span>
              </button>
              <button 
                onClick={() => activateRitual(250, 1.0, 'MOON_HOWL')}
                className="bg-[#0a000a] border border-pink-900/40 p-2 hover:bg-pink-900/10 transition-colors flex flex-col items-center group"
              >
                <span className="text-xl">🌕</span>
                <span className="text-[8px] font-black text-white group-hover:text-pink-500">MOON_HOWL</span>
                <span className="text-[7px] text-pink-800">COST: 250 JJ</span>
              </button>
           </div>
        </div>
      </div>

      {/* Artifact Inventory Panel */}
      <div className="bg-[#050005] border-t border-pink-900/40 p-4 shrink-0 h-48 overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-3">
           <h3 className="text-[10px] font-black uppercase text-pink-700 italic tracking-widest">UNEARTHED_ARTIFACTS (NFTs)</h3>
           <span className="text-[8px] text-pink-900 font-bold">{inventory.length} TOTAL</span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
           {inventory.map((item) => (
             <div key={item.id} className="relative aspect-square bg-black border border-pink-900/30 flex items-center justify-center group hover:border-white cursor-help">
                <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full border border-black
                  ${item.rarity === 'LEGENDARY' ? 'bg-yellow-400 shadow-[0_0_5px_#facc15]' : 
                    item.rarity === 'ALPHA' ? 'bg-pink-500 shadow-[0_0_5px_#ec4899]' :
                    item.rarity === 'RARE' ? 'bg-blue-400' : 'bg-gray-600'}`}>
                </div>
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#1a001a] border border-pink-500 px-2 py-1 text-[7px] font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                   {item.name} [{item.rarity}]
                </div>
             </div>
           ))}
           {[...Array(Math.max(0, 12 - inventory.length))].map((_, i) => (
             <div key={i} className="aspect-square bg-black/20 border border-pink-900/10 flex items-center justify-center">
                <span className="text-pink-950 text-[10px] font-black">?</span>
             </div>
           ))}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #000; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ec489922; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ec4899; }
      `}</style>
    </div>
  );
};

export default RitualForgeScreen;

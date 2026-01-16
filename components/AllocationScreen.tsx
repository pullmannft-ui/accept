
import React, { useState, useEffect } from 'react';
import { UserData, SignalLevel } from '../types';
import { TOKENOMICS, DISCLAIMER, TIERS } from '../constants';
import { calculateMonkyEstimate } from '../utils/simulation';

interface AllocationScreenProps {
  userData: UserData;
}

const AllocationScreen: React.FC<AllocationScreenProps> = ({ userData }) => {
  const [phase, setPhase] = useState<'IDLE' | 'ROLLING' | 'REVEALED'>('IDLE');
  const [statusText, setStatusText] = useState('');
  const [estimate, setEstimate] = useState<number | null>(null);

  useEffect(() => {
    if (phase === 'IDLE') {
      const startSequence = async () => {
        setPhase('ROLLING');
        const sequences = [
          "> SYNCING WITH JUNGLE_POOL...",
          "> ANALYZING COMMITMENT SHARE...",
          "> CALCULATING PRESALE DIVIDEND...",
          "> TOKENOMICS VERIFIED: 450M POOL",
          "> FINALIZING ALLOCATION..."
        ];

        for (const msg of sequences) {
          setStatusText(msg);
          await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
        }

        const final = calculateMonkyEstimate(userData);
        setEstimate(final);
        setPhase('REVEALED');
      };
      startSequence();
    }
  }, [phase, userData]);

  const handleShare = () => {
    if (!estimate) return;
    const text = `> X SIGNAL: ${userData.signalLevel}\n> COMMIT: ${userData.actualCommit} SOL\n> EST: ${estimate.toLocaleString()} $MONKY\n\nFollow @monky_fun for more info.\n#MONKY #Ritual`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const currentTier = [...TIERS].reverse().find(t => userData.actualCommit >= t.min) || TIERS[0];

  if (phase === 'ROLLING') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 bg-black">
        <div className="w-16 h-16 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
        <div className="space-y-2 text-center">
          <p className="text-xl font-black italic tracking-tighter text-green-500 uppercase">
             {statusText}
          </p>
        </div>
      </div>
    );
  }

  if (estimate === null) return null;

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 bg-black overflow-y-auto">
      <div className="bg-[#111] border-2 border-yellow-500 p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[8px] px-2 font-black uppercase">SYNC_LOCKED</div>
        <h2 className="text-2xl font-black italic tracking-tighter text-yellow-500 uppercase">ALLOCATION_ESTIMATE</h2>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[10px] font-black uppercase ${currentTier.color}`}>Tier: {currentTier.label}</span>
          {userData.signalLevel === SignalLevel.HIGH && (
            <span className="text-[8px] font-bold text-pink-500 animate-pulse uppercase">Alpha Bonus +20%</span>
          )}
        </div>
      </div>

      <div className="bg-[#111] border-2 border-green-500 p-8 flex flex-col items-center space-y-4 relative">
        <div className="text-center space-y-1">
          <p className="text-[10px] font-black text-green-500/50 uppercase tracking-[0.3em]">ESTIMATED $MONKY SHARE</p>
          <p className="text-5xl font-black text-white italic tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
            {estimate.toLocaleString()}
          </p>
        </div>

        <div className="w-full flex justify-between gap-2">
          <div className="flex-1 bg-black/40 border border-green-900/50 p-2 text-center">
            <p className="text-[8px] text-gray-500 uppercase">Commitment</p>
            <p className="text-sm font-bold text-white">{userData.actualCommit.toFixed(3)} SOL</p>
          </div>
          <div className="flex-1 bg-black/40 border border-green-900/50 p-2 text-center">
            <p className="text-[8px] text-gray-500 uppercase">Signal</p>
            <p className="text-sm font-bold text-white">{userData.signalLevel}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[8px] font-bold uppercase text-gray-500 mono">
        <div className="bg-[#0a0a0a] border border-[#222] p-2">
          Presale Pool: {TOKENOMICS.PRESALE_TOKENS.toLocaleString()}
        </div>
        <div className="bg-[#0a0a0a] border border-[#222] p-2">
          Total Supply: 1B
        </div>
      </div>

      <div className="bg-blue-900/20 border border-blue-900/50 p-3 text-center">
        <p className="text-[10px] font-bold text-blue-400 uppercase italic">
          Calculated against {TOKENOMICS.PRESALE_POOL_PERCENT}% of supply
        </p>
        <p className="text-[9px] text-gray-500 uppercase mt-1 italic leading-tight">
          This is a simulated share based on projected pool weight.
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-end space-y-3">
        <button 
          onClick={handleShare}
          className="w-full bg-green-500 text-black py-4 font-black text-xl hover:bg-white transition-all border-b-4 border-green-900 shadow-[0_10px_30px_rgba(0,0,0,0.5)] uppercase tracking-tighter"
        >
          SHARE_ON_X
        </button>
        <p className="text-[8px] font-bold text-gray-600 text-center uppercase italic leading-tight">
          {DISCLAIMER}
        </p>
      </div>
    </div>
  );
};

export default AllocationScreen;

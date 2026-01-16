
import React from 'react';
import { UserData } from '../types';
import { GLOBAL_COMMIT_LIMITS } from '../constants';

interface CommitmentScreenProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  onNext: () => void;
  onBack: () => void;
}

const CommitmentScreen: React.FC<CommitmentScreenProps> = ({ userData, setUserData, onNext, onBack }) => {
  const handleChange = (val: string) => {
    let n = parseFloat(val);
    if (isNaN(n)) n = 0;
    // Limit to user's discovered max
    if (n > userData.maxAllowedCommit) n = userData.maxAllowedCommit;
    setUserData(prev => ({ ...prev, actualCommit: n }));
  };

  const handleBlur = () => {
    let n = userData.actualCommit;
    if (n < GLOBAL_COMMIT_LIMITS.MIN) n = GLOBAL_COMMIT_LIMITS.MIN;
    if (n > userData.maxAllowedCommit) n = userData.maxAllowedCommit;
    setUserData(prev => ({ ...prev, actualCommit: parseFloat(n.toFixed(3)) }));
  };

  const fomoPercent = ((userData.actualCommit - GLOBAL_COMMIT_LIMITS.MIN) / (userData.maxAllowedCommit - GLOBAL_COMMIT_LIMITS.MIN)) * 100;

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-black italic text-pink-500 uppercase">STEP 2/3: COMMITMENT_INPUT</h2>
        <p className="text-[10px] font-bold opacity-70 italic uppercase">Your Signal allows 0.01 - {userData.maxAllowedCommit} SOL.</p>
      </div>

      <div className="bg-[#111] border-2 border-blue-900 p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-end">
             <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest italic">COMMIT_INTENT:</label>
             <span className="text-xs font-black text-white">{userData.actualCommit.toFixed(3)} / {userData.maxAllowedCommit} SOL</span>
          </div>
          
          <input 
            type="range" 
            min={GLOBAL_COMMIT_LIMITS.MIN} 
            max={userData.maxAllowedCommit} 
            step="0.001"
            className="w-full h-4 bg-blue-900 rounded-lg appearance-none cursor-pointer accent-green-500"
            value={userData.actualCommit}
            onChange={(e) => handleChange(e.target.value)}
          />

          <input 
            type="number" 
            className="w-full bg-black border-2 border-blue-900 p-4 text-3xl font-black text-center text-green-500 outline-none"
            value={userData.actualCommit}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
          />
          <p className="text-[8px] text-center text-yellow-500 font-bold uppercase">
            {userData.actualCommit >= userData.maxAllowedCommit ? "SIGNAL MAX REACHED" : `SIGNAL CAP: ${userData.maxAllowedCommit} SOL`}
          </p>
        </div>

        <div className="space-y-2">
           <div className="flex justify-between text-[10px] font-black uppercase">
              <span className="text-gray-500 italic">ALLOCATION_SHARE_STRENGTH:</span>
              <span className={`italic ${fomoPercent > 80 ? 'text-green-500' : 'text-blue-500'}`}>
                {fomoPercent.toFixed(0)}%
              </span>
           </div>
           <div className="w-full h-4 bg-gray-800 border border-gray-700 p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                style={{ width: `${fomoPercent}%` }}
              ></div>
           </div>
        </div>
      </div>

      <div className="bg-black/50 border border-pink-900/30 p-3">
        <p className="text-[9px] text-pink-500/70 uppercase leading-tight italic">
          {'>'} System discovered max commitment level based on your X Signal. To increase your cap, ensure your profile is raid-ready before the final snapshot.
        </p>
      </div>

      <div className="flex-1"></div>

      <div className="flex gap-2">
        <button onClick={onBack} className="bg-[#333] border-b-4 border-[#111] px-6 py-2 font-bold uppercase text-xs hover:bg-[#444]">Back</button>
        <button 
          onClick={onNext}
          className="flex-1 bg-white text-black py-4 font-black text-xl tracking-widest uppercase hover:bg-green-500 hover:scale-[1.02] transition-all shadow-[0_5px_15px_rgba(34,197,94,0.3)]"
        >
          LOCK_PROTOCOL
        </button>
      </div>
    </div>
  );
};

export default CommitmentScreen;

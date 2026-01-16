
import React from 'react';
import { UserData } from '../types';

interface BioScanScreenProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  onNext: () => void;
  onBack: () => void;
}

const BioScanScreen: React.FC<BioScanScreenProps> = ({ userData, setUserData, onNext, onBack }) => {
  const isHandleValid = userData.handle.startsWith('@') && userData.handle.length > 2;
  const isReferrerValid = userData.isSolo || (userData.referrer.startsWith('@') && userData.referrer.length > 2);
  const isInvalid = !isHandleValid || !isReferrerValid;

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-black italic text-pink-500 uppercase">BIO_SCAN_01</h2>
        <p className="text-[10px] font-bold opacity-70 italic uppercase">Input your social ID for verification.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-1">
          <div className="flex justify-between items-end">
            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest italic">X_COORDINATES:</label>
            {userData.handle && !isHandleValid && <span className="text-[8px] text-red-500 font-bold uppercase">Invalid format</span>}
            {isHandleValid && <span className="text-[8px] text-green-500 font-bold uppercase">Signal acquired</span>}
          </div>
          <input 
            type="text"
            placeholder="@your_handle"
            className={`w-full bg-black border-2 p-4 text-xl font-bold outline-none transition-colors 
              ${!userData.handle ? 'border-[#444]' : isHandleValid ? 'border-green-500 text-green-400' : 'border-red-500 text-red-500'}`}
            value={userData.handle}
            onChange={(e) => setUserData(prev => ({ ...prev, handle: e.target.value }))}
          />
          <p className="text-[8px] opacity-40 italic uppercase">Helper: Used to verify links and allocations.</p>
        </div>

        <div className={`space-y-1 transition-opacity ${userData.isSolo ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
          <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest italic">REFERRER_ID:</label>
          <input 
            type="text"
            placeholder="@referer_id"
            className={`w-full bg-black border-2 p-4 text-xl font-bold outline-none transition-colors border-[#444] focus:border-green-500`}
            value={userData.referrer}
            onChange={(e) => setUserData(prev => ({ ...prev, referrer: e.target.value }))}
            disabled={userData.isSolo}
          />
          <p className="text-[8px] opacity-40 italic uppercase">Helper: Boost your odds slightly. (No guarantees.)</p>
        </div>

        <div className="bg-[#111] border border-[#333] p-4 flex items-center gap-4 cursor-pointer hover:bg-black group transition-colors"
             onClick={() => setUserData(prev => ({ ...prev, isSolo: !prev.isSolo }))}>
          <div className={`w-6 h-6 border-2 flex items-center justify-center transition-colors 
            ${userData.isSolo ? 'border-green-500 bg-green-900/50' : 'border-[#444]'}`}>
            {userData.isSolo && <span className="text-green-500 font-bold">✓</span>}
          </div>
          <div className="flex-1">
            <label className="font-bold text-sm uppercase tracking-tighter cursor-pointer">ACTIVATE SOLO PROTOCOL</label>
            <p className="text-[8px] opacity-40 italic uppercase">Solo mode: fewer boosts, still eligible.</p>
          </div>
        </div>
      </div>

      <div className="flex-1"></div>

      <div className="flex gap-2">
        <button onClick={onBack} className="bg-[#333] border-b-4 border-[#111] px-6 py-2 font-bold uppercase text-xs hover:bg-[#444]">Back</button>
        <button 
          onClick={onNext}
          disabled={isInvalid}
          className={`flex-1 py-4 font-black text-xl tracking-widest uppercase transition-all
            ${isInvalid ? 'bg-[#222] text-[#444] cursor-not-allowed opacity-50' : 'bg-green-500 text-black hover:bg-white hover:scale-[1.02]'}`}
        >
          {isInvalid ? 'LOCKED' : 'VERIFY_ID'}
        </button>
      </div>
    </div>
  );
};

export default BioScanScreen;

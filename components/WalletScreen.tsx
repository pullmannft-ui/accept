
import React, { useState } from 'react';
import { UserData } from '../types';

interface WalletScreenProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  onNext: () => void;
  onBack: () => void;
}

const WalletScreen: React.FC<WalletScreenProps> = ({ userData, setUserData, onNext, onBack }) => {
  const [scanning, setScanning] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  // Simple Base58 regex for Solana
  const isSolana = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(userData.wallet);

  const startScan = async () => {
    if (!isSolana) return;
    setScanning(true);
    const messages = [
      "> INITIATING_WALLET_SCAN...",
      "> DETECTING CHAIN: SOLANA",
      "> VERIFYING_ADDRESS_INTEGRITY...",
      "> CHECKING_REPUTATION_HISTORY...",
      "> SCAN_COMPLETE: ELIGIBLE"
    ];
    for (const msg of messages) {
      setLog(prev => [...prev, msg]);
      await new Promise(r => setTimeout(r, 400));
    }
    onNext();
  };

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6 bg-black text-green-500 font-mono">
      <div className="space-y-1">
        <h2 className="text-2xl font-black italic text-pink-500 uppercase">STEP 3/5: WALLET_VERIFICATION</h2>
        <p className="text-[10px] font-bold opacity-70 italic uppercase">Input your Solana address to register your identity.</p>
      </div>

      {!scanning ? (
        <div className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest italic">SOL_ADDRESS:</label>
            <input 
              type="text"
              placeholder="Enter Solana Address..."
              className={`w-full bg-black border-2 p-4 text-sm font-bold outline-none transition-colors 
                ${!userData.wallet ? 'border-[#444]' : isSolana ? 'border-green-500 text-green-400' : 'border-red-500 text-red-500'}`}
              value={userData.wallet}
              onChange={(e) => setUserData(prev => ({ ...prev, wallet: e.target.value }))}
            />
            {!isSolana && userData.wallet && <p className="text-[8px] text-red-500 mt-1">INVALID SOLANA ADDRESS DETECTED</p>}
          </div>

          <div className="bg-[#111] border border-green-900/50 p-4 space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="opacity-50">CHAIN_DETECTION:</span>
              <span className={isSolana ? "text-green-500 font-bold" : "text-gray-600"}>{isSolana ? "SOLANA" : "UNKNOWN"}</span>
            </div>
            <p className="text-[8px] opacity-40 italic leading-tight">
              NOTE: WE WILL NEVER ASK FOR YOUR SEED PHRASE. THIS IS FOR IDENTITY SYNC ONLY.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 border border-green-900 p-4 font-mono text-[10px] overflow-hidden">
          <div className="space-y-1">
            {log.map((line, i) => (
              <div key={i} className="animate-in fade-in slide-in-from-left-2 duration-300">{line}</div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1"></div>

      <div className="flex gap-2">
        <button onClick={onBack} disabled={scanning} className="bg-[#333] px-6 py-2 font-bold uppercase text-xs hover:bg-[#444] disabled:opacity-50">Back</button>
        <button 
          onClick={startScan}
          disabled={!isSolana || scanning}
          className={`flex-1 py-4 font-black text-xl tracking-widest uppercase transition-all
            ${!isSolana || scanning ? 'bg-[#222] text-[#444] cursor-not-allowed opacity-50' : 'bg-green-500 text-black hover:bg-white'}
          `}
        >
          {scanning ? 'SCANNING...' : 'SYNC_IDENTITY'}
        </button>
      </div>
    </div>
  );
};

export default WalletScreen;

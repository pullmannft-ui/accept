
import React, { useState } from 'react';
import { UserData, SignalLevel } from '../types';
import { generateScanResult } from '../utils/simulation';
import { SIGNAL_CONFIG } from '../constants';

interface ScanScreenProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  onNext: () => void;
}

const ScanScreen: React.FC<ScanScreenProps> = ({ userData, setUserData, onNext }) => {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  const runScan = async () => {
    if (!userData.handle.startsWith('@')) return;
    setScanning(true);
    const messages = [
      `> SCANNING ${userData.handle.toUpperCase()}...`,
      "> EXTRACTING TIMELINE PATTERNS...",
      "> ANALYZING SOCIAL REPUTATION...",
      "> CALCULATING SIGNAL INTENSITY...",
      "> DETERMINING ALLOCATION_CAP...",
      "> SCAN COMPLETE: AUTH_SUCCESS"
    ];

    for (let i = 0; i < messages.length; i++) {
      setLog(prev => [...prev, messages[i]]);
      setProgress(((i + 1) / messages.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 300));
    }

    const { level, discoveredMax, multiplier, baseRate } = generateScanResult(userData.handle);
    setUserData(prev => ({
      ...prev,
      signalLevel: level,
      maxAllowedCommit: discoveredMax,
      actualCommit: discoveredMax, // Default to max
      multiplier,
      baseRate
    }));
    setScanning(false);
  };

  const isInvalid = !userData.handle.startsWith('@') || userData.handle.length < 3 || (!userData.isSolo && (!userData.referrer || !userData.referrer.startsWith('@')));

  if (userData.signalLevel && !scanning) {
    const config = SIGNAL_CONFIG[userData.signalLevel];
    return (
      <div className="flex-1 flex flex-col p-6 space-y-6">
        <div className="border-4 border-green-500 p-4 bg-[#111] space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black italic text-green-500 uppercase">SIGNAL_REPORT</h2>
            <span className="text-[10px] bg-green-500 text-black px-1 font-bold">LOCKED</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-baseline border-b border-green-900 pb-1">
              <span className="text-xs uppercase font-bold text-gray-500">SIGNAL_LEVEL:</span>
              <span className={`text-2xl font-black italic ${config.color}`}>{userData.signalLevel}</span>
            </div>
            <div className="flex justify-between items-baseline border-b border-green-900 pb-1">
              <span className="text-xs uppercase font-bold text-gray-500">MAX_DISCOVERED_CAP:</span>
              <span className="text-xl font-bold text-white">{userData.maxAllowedCommit} SOL</span>
            </div>
          </div>
          <p className="mono text-sm italic font-bold text-green-400">"{config.flavor}"</p>
        </div>
        <p className="text-[10px] text-center text-gray-500 uppercase italic">
          Your X signal strength limits your maximum allowed commitment in the next step.
        </p>
        <div className="flex-1"></div>
        <button onClick={onNext} className="w-full bg-green-500 text-black py-4 font-black text-2xl hover:bg-white transition-all border-b-4 border-green-900 uppercase tracking-tighter">
          PROCEED TO COMMITMENT
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-black italic text-pink-500 uppercase">STEP 1/6: X_SIGNAL_SCAN</h2>
        <p className="text-[10px] font-bold opacity-70 italic uppercase">Your handle determines your maximum allocation eligibility.</p>
      </div>

      {!scanning ? (
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest italic">X_COORDINATES:</label>
            <input 
              type="text"
              placeholder="@your_handle"
              className="w-full bg-black border-2 border-[#444] p-4 text-xl font-bold outline-none text-green-500 focus:border-green-500"
              value={userData.handle}
              onChange={(e) => setUserData(prev => ({ ...prev, handle: e.target.value }))}
            />
          </div>

          {!userData.isSolo && (
            <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
              <label className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest italic">REFERRAL_X:</label>
              <input 
                type="text"
                placeholder="@referral_handle"
                className="w-full bg-black border-2 border-[#444] p-4 text-xl font-bold outline-none text-yellow-500 focus:border-yellow-500"
                value={userData.referrer}
                onChange={(e) => setUserData(prev => ({ ...prev, referrer: e.target.value }))}
              />
            </div>
          )}

          <div className="bg-[#111] border border-[#333] p-4 flex items-center gap-4 cursor-pointer hover:bg-black group transition-colors"
               onClick={() => setUserData(prev => ({ ...prev, isSolo: !prev.isSolo }))}>
            <div className={`w-6 h-6 border-2 flex items-center justify-center transition-colors 
              ${userData.isSolo ? 'border-green-500 bg-green-900/50' : 'border-[#444]'}`}>
              {userData.isSolo && <span className="text-green-500 font-bold">✓</span>}
            </div>
            <div className="flex-1">
              <label className="font-bold text-sm uppercase tracking-tighter cursor-pointer">ACTIVATE SOLO PROTOCOL</label>
              <p className="text-[8px] opacity-40 italic uppercase">No referrals? Toggle this.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-black border border-green-900 p-4 font-mono text-[10px] overflow-hidden flex flex-col">
          <div className="flex-1 space-y-1">
            {log.map((line, i) => (
              <div key={i} className="text-green-500">{line}</div>
            ))}
          </div>
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-green-500/50 font-bold uppercase">
              <span>SCAN_PROGRESS</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-green-900">
              <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
      )}

      {!scanning && (
        <button 
          onClick={runScan}
          disabled={isInvalid}
          className={`w-full py-4 font-black text-2xl tracking-widest uppercase transition-all
            ${isInvalid ? 'bg-[#222] text-[#444] cursor-not-allowed' : 'bg-green-500 text-black hover:bg-white'}`}
        >
          SCAN SIGNAL
        </button>
      )}
    </div>
  );
};

export default ScanScreen;


import React, { useState, useEffect, useMemo } from 'react';
import { UserData, Submission } from '../types';
import { PRESALE_CONFIG, PRESALE_END_TIME, TOKENOMICS } from '../constants';

interface PresaleScreenProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
}

type PresaleView = 'VERIFY' | 'CONTRIBUTE';

const STORAGE_KEY = 'monky_presale_ledger_v2';
const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

// Mock Database of users from Jungle.exe phase
const MOCK_JUNGLE_DB: Record<string, { wallet: string, commit: number }> = {
  'monky_king': { wallet: '7xKX99kR7xKX99kR7xKX99kR7xKX99kR7xKX99kR', commit: 10.0 },
  'degen_ape': { wallet: 'Ape1111111111111111111111111111111111111', commit: 5.0 },
  'sol_surfer': { wallet: 'Surf222222222222222222222222222222222222', commit: 2.5 },
  'banana_farmer': { wallet: 'Farm333333333333333333333333333333333333', commit: 0.8 },
};

const PresaleScreen: React.FC<PresaleScreenProps> = ({ userData, setUserData }) => {
  const [view, setView] = useState<PresaleView>('VERIFY');
  const [loginHandle, setLoginHandle] = useState(userData.handle || '');
  const [loginWallet, setLoginWallet] = useState(userData.wallet || '');
  const [amount, setAmount] = useState<number>(0.1);
  const [txHash, setTxHash] = useState('');
  const [history, setHistory] = useState<Submission[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'ERROR' | 'SUCCESS' } | null>(null);
  const [detectedCap, setDetectedCap] = useState<number>(userData.actualCommit || 0.15);
  const [timeLeft, setTimeLeft] = useState<string>('24:00:00');

  // Countdown timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const distance = PRESALE_END_TIME - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft('CLOSED');
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load history on handle change
  useEffect(() => {
    if (userData.handle) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const allData = JSON.parse(saved);
        const handleKey = userData.handle.toLowerCase().replace('@', '');
        setHistory(allData[handleKey] || []);
      }
    }
  }, [userData.handle]);

  const handleVerify = () => {
    const handle = loginHandle.replace('@', '').trim().toLowerCase();
    const wallet = loginWallet.trim();

    if (!handle || !wallet) {
      setNotification({ message: "CREDENTIALS_MISSING: Input X Handle and Wallet.", type: 'ERROR' });
      return;
    }

    if (!SOLANA_ADDRESS_REGEX.test(wallet)) {
      setNotification({ message: "FORMAT_ERROR: Invalid Solana Address.", type: 'ERROR' });
      return;
    }

    const record = MOCK_JUNGLE_DB[handle];
    let userCap = record ? record.commit : (userData.actualCommit || 0.15);
    
    if (record && record.wallet !== wallet) {
      setNotification({ message: "SECURITY_WARNING: Wallet mismatch with records.", type: 'ERROR' });
      return;
    }

    setDetectedCap(userCap);
    setAmount(userCap);

    setUserData(prev => ({
      ...prev,
      handle: handle.startsWith('@') ? handle : `@${handle}`,
      wallet: wallet,
      actualCommit: userCap
    }));

    setView('CONTRIBUTE');
    setNotification({ message: `UPLINK_STABLE: Verified @${handle}. Detected Cap: ${userCap} SOL`, type: 'SUCCESS' });
  };

  const handleAmountChange = (val: string) => {
    let n = parseFloat(val);
    if (isNaN(n)) n = 0;
    if (n > detectedCap) n = detectedCap;
    setAmount(n);
  };

  const handleAmountBlur = () => {
    let n = amount;
    if (n < 0.01) n = 0.01;
    if (n > detectedCap) n = detectedCap;
    setAmount(parseFloat(n.toFixed(3)));
  };

  const submitTx = () => {
    if (timeLeft === 'CLOSED') {
      setNotification({ message: "PHASE_END: Presale window is closed.", type: 'ERROR' });
      return;
    }
    if (!txHash || txHash.length < 32) {
      setNotification({ message: "HASH_INVALID: Enter valid TX signature.", type: 'ERROR' });
      return;
    }

    const newSub: Submission = {
      id: crypto.randomUUID(),
      missionId: 'presale_contribution',
      proofUrl: txHash,
      amount: amount,
      status: 'PENDING',
      timestamp: Date.now()
    };

    const newHistory = [newSub, ...history];
    setHistory(newHistory);

    const saved = localStorage.getItem(STORAGE_KEY);
    const allData = saved ? JSON.parse(saved) : {};
    const handleKey = userData.handle.toLowerCase().replace('@', '');
    allData[handleKey] = newHistory;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));

    setTxHash('');
    setNotification({ message: "TRANSMISSION_COMPLETE: Proof submitted for audit.", type: 'SUCCESS' });
  };

  const sharePresaleStatus = () => {
    if (history.length === 0) return;
    const latest = history[0];
    const text = `I just transmitted ${latest.amount} SOL to the $MONKY Presale! 🐒\n\nMission: PRESALE_UPLINK\nStatus: PENDING_AUDIT\n\nJoin the jungle: ${window.location.origin}/presale\n\n#MONKY #Solana #Presale @monkymakereth @monky_fun`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(PRESALE_CONFIG.RECEIVE_WALLET);
    setNotification({ message: "ADDRESS_COPIED: Ready for transfer.", type: 'SUCCESS' });
  };

  return (
    <div className="flex-1 flex flex-col bg-black text-pink-500 font-mono overflow-hidden relative min-h-0">
      {/* Dynamic HUD Header */}
      <div className="bg-[#1a001a] border-b border-pink-900/50 p-2 md:p-3 flex justify-between items-center text-[10px] md:text-xs font-black flex-shrink-0 z-30">
        <div className="flex items-center gap-2 truncate pr-2">
          <span className="w-2.5 h-2.5 bg-pink-500 animate-pulse rounded-full flex-shrink-0"></span>
          <span className="tracking-widest uppercase truncate">PRESALE_UPLINK</span>
        </div>
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <div className="flex items-center gap-2 bg-pink-900/20 px-2 py-1 border border-pink-500/30">
             <span className="text-pink-700 hidden sm:inline">TIMER:</span>
             <span className={`font-black ${timeLeft === 'CLOSED' ? 'text-red-500' : 'text-white'}`}>{timeLeft}</span>
          </div>
          {view === 'CONTRIBUTE' && (
             <span className="hidden md:inline text-pink-700 italic truncate max-w-[120px]">@{userData.handle}</span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-10 min-h-0 no-scrollbar">
        {view === 'VERIFY' && (
          <div className="max-w-md mx-auto space-y-10 pt-4 animate-in fade-in duration-700">
            <div className="text-center space-y-4">
               <div className="text-7xl md:text-8xl animate-pulse">🗳️</div>
               <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase transform -skew-x-12 leading-none">
                 VERIFY_NODE
               </h1>
               <div className="p-2 bg-pink-950/20 border border-pink-900/40 inline-block">
                 <p className="text-[10px] text-pink-400 font-bold uppercase tracking-widest italic">
                    QUERYING_JUNGLE_DATABASE...
                 </p>
               </div>
            </div>

            <div className="bg-[#0a000a] border-2 border-pink-900 p-6 space-y-6 shadow-[12px_12px_0_0_#1a001a]">
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-pink-800 uppercase">IDENTIFIER (@handle):</label>
                 <input 
                  type="text" placeholder="@handle" 
                  className="w-full bg-black border border-pink-900 p-4 text-xl font-bold focus:border-white outline-none text-white transition-all shadow-inner"
                  value={loginHandle} onChange={e => setLoginHandle(e.target.value)}
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-pink-800 uppercase">VAULT_ADDRESS (SOL):</label>
                 <input 
                  type="text" placeholder="Solana Wallet..." 
                  className="w-full bg-black border border-pink-900 p-4 text-[10px] font-mono focus:border-white outline-none text-white transition-all shadow-inner"
                  value={loginWallet} onChange={e => setLoginWallet(e.target.value)}
                 />
               </div>
               <button 
                onClick={handleVerify}
                className="w-full bg-pink-600 text-white py-5 font-black text-2xl hover:bg-white hover:text-pink-600 transition-all shadow-[0_6px_0_0_#4d004d] active:translate-y-1 active:shadow-none uppercase"
               >
                 ENTER_UPLINK
               </button>
            </div>
          </div>
        )}

        {view === 'CONTRIBUTE' && (
          <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-5 duration-500 pb-20">
             {/* Stats HUD */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-[#0a000a] border-2 border-pink-900 p-5 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 bg-pink-600 text-black text-[8px] font-black px-2 py-0.5 uppercase italic">Verified_Node</div>
                   <p className="text-[9px] font-black text-pink-800 uppercase mb-1">PERSONAL_SIGNAL_CAP</p>
                   <p className="text-4xl font-black text-white italic tracking-tighter">{detectedCap} <span className="text-sm">SOL</span></p>
                   <div className="h-1 bg-pink-900/20 w-full mt-3 overflow-hidden">
                      <div className="h-full bg-pink-600 shadow-[0_0_10px_#ec4899]" style={{ width: `${Math.min(100, (detectedCap / 10) * 100)}%` }}></div>
                   </div>
                </div>
                <div className="bg-[#0a000a] border-2 border-pink-900 p-5 relative">
                   <p className="text-[9px] font-black text-pink-800 uppercase mb-1">POOL_DYNAMICS</p>
                   <p className="text-4xl font-black text-white italic tracking-tighter uppercase">UNLIMITED</p>
                   <p className="text-[8px] text-pink-900 font-bold mt-2 italic">PRICE_DISCOVERY_ACTIVE</p>
                </div>
                <div className="bg-[#0a000a] border-2 border-pink-900 p-5 relative sm:col-span-2 lg:col-span-1">
                   <p className="text-[9px] font-black text-pink-800 uppercase mb-1">WINDOW_CLOSING_IN</p>
                   <p className={`text-4xl font-black italic tracking-tighter ${timeLeft === 'CLOSED' ? 'text-red-500' : 'text-yellow-500'} animate-pulse`}>
                      {timeLeft}
                   </p>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Section 1: Instructions & Address */}
                <div className="space-y-4">
                   <h3 className="text-xs font-black uppercase text-pink-600 italic tracking-[0.3em] flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-pink-600 rounded-full"></span>
                     01: TRANSMIT_SOLANA
                   </h3>
                   <div className="bg-[#0a000a] border-2 border-pink-900 p-6 space-y-6 shadow-xl">
                      <div className="bg-pink-950/20 border-l-4 border-pink-600 p-3 italic">
                        <p className="text-[11px] text-pink-400 font-bold leading-relaxed">
                          Final allocation determined post-presale. 45% (450M) of supply reserved for this window. Send SOL within your cap to the official address.
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                         <p className="text-[10px] text-pink-800 font-black uppercase tracking-tighter italic">OFFICIAL_PRESALE_WALLET:</p>
                         <div className="flex flex-col sm:flex-row gap-2">
                            <code className="flex-1 bg-black border border-pink-900 p-4 text-[11px] break-all font-mono text-pink-300 shadow-inner">
                               {PRESALE_CONFIG.RECEIVE_WALLET}
                            </code>
                            <button 
                              onClick={copyAddress}
                              className="bg-pink-600 text-white px-8 py-3 font-black hover:bg-white hover:text-pink-600 transition-all text-xs border border-pink-900 shadow-[4px_4px_0_0_#4d004d] active:translate-y-1 active:shadow-none"
                            >
                               COPY
                            </button>
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="p-3 border border-pink-900/30 bg-pink-900/5">
                           <p className="text-[8px] font-black text-pink-700 uppercase">SUPPLY_SHARE</p>
                           <p className="text-2xl font-black text-white">45%</p>
                        </div>
                        <div className="p-3 border border-pink-900/30 bg-pink-900/5">
                           <p className="text-[8px] font-black text-pink-700 uppercase">LP_LOCK</p>
                           <p className="text-2xl font-black text-white">25%</p>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Section 2: Input & Logs */}
                <div className="space-y-4">
                   <h3 className="text-xs font-black uppercase text-pink-600 italic tracking-[0.3em] flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-pink-600 rounded-full"></span>
                     02: VERIFY_TX
                   </h3>
                   <div className="bg-[#0a000a] border-2 border-pink-900 p-6 space-y-6 shadow-xl relative overflow-hidden">
                      <div className="space-y-4">
                         <div className="flex justify-between items-end">
                            <label className="text-[10px] font-black text-pink-800 uppercase italic">SENT_AMOUNT (SOL):</label>
                            <span className="text-[10px] font-black text-white italic">{amount} / {detectedCap} SOL</span>
                         </div>
                         <div className="relative group">
                            <input 
                              type="number" step="0.01"
                              className="w-full bg-black border border-pink-900 p-5 text-5xl font-black text-white outline-none focus:border-pink-500 transition-all text-center shadow-inner group-hover:bg-[#0d000d]"
                              value={amount}
                              onChange={e => handleAmountChange(e.target.value)}
                              onBlur={handleAmountBlur}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-900 font-black text-2xl italic opacity-30 select-none">SOL</span>
                         </div>
                         <input 
                            type="range" min="0.01" max={detectedCap} step="0.01" 
                            className="w-full h-3 bg-pink-900/20 rounded-lg appearance-none cursor-pointer accent-pink-600 border border-pink-900/30"
                            value={amount} onChange={e => handleAmountChange(e.target.value)}
                         />
                      </div>
                      
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-pink-800 uppercase italic">TX_SIGNATURE / SIGNATURE:</label>
                         <input 
                           type="text" placeholder="Paste signature from explorer..."
                           className="w-full bg-black border border-pink-900 p-4 text-[10px] font-mono text-white outline-none focus:border-white transition-all shadow-inner"
                           value={txHash} onChange={e => setTxHash(e.target.value)}
                         />
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        <button 
                          onClick={submitTx}
                          disabled={timeLeft === 'CLOSED'}
                          className={`w-full py-6 font-black text-3xl transition-all shadow-[0_10px_0_0_#4d004d] active:translate-y-2 active:shadow-none tracking-tighter uppercase
                            ${timeLeft === 'CLOSED' ? 'bg-gray-900 text-gray-500 cursor-not-allowed shadow-none' : 'bg-pink-600 text-white hover:bg-white hover:text-pink-600'}`}
                        >
                           {timeLeft === 'CLOSED' ? 'LOCKED' : 'AUDIT_TX'}
                        </button>
                        
                        {history.length > 0 && (
                          <button 
                            onClick={sharePresaleStatus}
                            className="w-full py-4 bg-transparent border-2 border-pink-600 text-pink-500 font-black text-sm uppercase hover:bg-pink-600 hover:text-white transition-all flex items-center justify-center gap-3 animate-in zoom-in-95 duration-300"
                          >
                            <span className="text-lg">𝕏</span> BROADCAST_TRANSMISSION
                          </button>
                        )}
                      </div>
                   </div>

                   {/* Local History */}
                   <div className="bg-[#050005] border border-pink-900 p-4 shadow-inner max-h-[200px] overflow-y-auto no-scrollbar">
                      <p className="text-[9px] font-black uppercase text-pink-800 border-b border-pink-900/30 mb-3 pb-1 tracking-[0.2em] italic">TRANSMISSION_HISTORY</p>
                      <div className="space-y-2">
                         {history.map((sub) => (
                           <div key={sub.id} className="bg-pink-950/10 border border-pink-900/20 p-3 flex justify-between items-center group transition-colors">
                              <div className="min-w-0 flex-1">
                                 <p className="text-sm font-black text-white italic">{sub.amount} SOL <span className="text-[8px] opacity-40 not-italic uppercase font-bold ml-2">Deposited</span></p>
                                 <p className="text-[8px] opacity-20 font-mono truncate mt-1 italic">{sub.proofUrl}</p>
                              </div>
                              <div className={`ml-4 px-2 py-1 text-[8px] font-black uppercase ${sub.status === 'COMPLETED' ? 'bg-green-600' : sub.status === 'PENDING' ? 'bg-blue-600' : 'bg-red-600'} text-white shadow-sm`}>
                                 {sub.status}
                              </div>
                           </div>
                         ))}
                         {history.length === 0 && (
                            <div className="text-center py-10 opacity-20 italic font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">_EMPTY_SIGNAL_LOG_</div>
                         )}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Global Notification */}
      {notification && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[250] w-[90vw] max-w-sm animate-in slide-in-from-top-10">
           <div className="bg-[#c0c0c0] border-2 border-white border-r-[#808080] border-b-[#808080] shadow-[12px_12px_0_0_rgba(0,0,0,0.6)]">
              <div className={`${notification.type === 'ERROR' ? 'bg-red-800' : 'bg-[#000080]'} p-1.5 px-3 text-white font-bold text-[10px] flex justify-between items-center`}>
                 <span className="uppercase italic">System Message</span>
                 <button onClick={() => setNotification(null)} className="bg-[#c0c0c0] text-black px-1.5 border border-white font-black">X</button>
              </div>
              <div className="p-5 bg-black">
                 <p className="text-[11px] font-black italic text-pink-500 leading-tight uppercase text-center border-l-4 border-pink-600 pl-4 py-2 bg-pink-950/10">
                    {notification.message}
                 </p>
              </div>
              <div className="bg-[#c0c0c0] p-2 flex justify-end">
                 <button onClick={() => setNotification(null)} className="px-10 py-1.5 bg-[#c0c0c0] border-2 border-white border-r-[#808080] border-b-[#808080] text-black text-[11px] font-black active:border-r-white active:border-b-white uppercase">OK</button>
              </div>
           </div>
        </div>
      )}

      {/* Footer Ticker */}
      <div className="bg-[#0a000a] h-10 border-t border-pink-900/50 flex items-center overflow-hidden flex-shrink-0 z-40">
        <div className="animate-[ticker_60s_linear_infinite] whitespace-nowrap text-[9px] font-black text-pink-900/10 flex gap-24 uppercase tracking-[0.5em]">
          <span>{'>'} PHASE: 24H_PRESALE</span>
          <span>{'>'} ALLOCATION: 450,000,000 $MONKY</span>
          <span>{'>'} POOL_CAP: UNLIMITED</span>
          <span>{'>'} SYBIL_DEFENSE: ACTIVE</span>
          <span>{'>'} PRICE_DISCOVERY: REAL_TIME</span>
          <span>{'>'} MANUAL_AUDIT: REQUIRED</span>
        </div>
      </div>

      <style>{`
        @keyframes ticker { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default PresaleScreen;

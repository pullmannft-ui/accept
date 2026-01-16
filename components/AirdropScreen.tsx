
import React, { useState, useEffect, useMemo } from 'react';
import { Participant, Mission, TaskStatus, Submission, UserData } from '../types';
import { AIRDROP_MISSIONS, TIERS_POINTS, TOKENOMICS, PRESALE_CONFIG } from '../constants';

interface AirdropScreenProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  initialView?: string;
}

type AirdropSubView = 'LOGIN' | 'LOGIN_PRESALE' | 'FARM' | 'PRESALE' | 'LEADERBOARD' | 'HISTORY' | 'ADMIN_PANEL';

const STORAGE_KEY = 'monky_airdrop_v3';
// Simulating the "Jungle Database" for validation
const JUNGLE_DB_KEY = 'monky_jungle_backup_v1';
const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

const AirdropScreen: React.FC<AirdropScreenProps> = ({ userData, setUserData, initialView }) => {
  const [view, setView] = useState<AirdropSubView>(initialView as AirdropSubView || 'LOGIN');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentUserHandle, setCurrentUserHandle] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'ERROR' | 'SUCCESS' | 'INFO' } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Forms
  const [loginHandle, setLoginHandle] = useState('');
  const [loginWallet, setLoginWallet] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Presale Form
  const [presaleAmount, setPresaleAmount] = useState<number>(0.1);
  const [presaleHash, setPresaleHash] = useState('');

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setParticipants(JSON.parse(saved));
    }
    
    // If user arrived from Jungle flow in the same session, pre-fill
    if (userData.handle && userData.wallet) {
      setLoginHandle(userData.handle);
      setLoginWallet(userData.wallet);
    }
  }, [userData]);

  // 2. Data Persistence
  const saveAll = (newList: Participant[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    setParticipants(newList);
  };

  // 3. Current Participant Context
  const currentParticipant = useMemo(() => {
    return participants.find(p => p.xUsername === currentUserHandle);
  }, [participants, currentUserHandle]);

  // 4. Handlers
  const handleLogin = (isPresaleFlow: boolean) => {
    const handle = loginHandle.replace('@', '').trim().toLowerCase();
    const wallet = loginWallet.trim();

    if (!handle || !wallet) {
      setNotification({ message: "CREDENTIALS REQUIRED: Please input your X handle and Solana wallet.", type: 'ERROR' });
      return;
    }

    if (handle === 'monky_maker' && wallet === 'AppleMusic') {
      setIsAdmin(true);
      setView('ADMIN_PANEL');
      setNotification({ message: "ROOT_ACCESS_GRANTED: Welcome, Admin.", type: 'SUCCESS' });
      return;
    }

    if (!SOLANA_ADDRESS_REGEX.test(wallet)) {
      setNotification({ message: "INVALID ADDRESS: Solana wallet format mismatch.", type: 'ERROR' });
      return;
    }

    // Lookup in our simulated "v3" database
    let participant = participants.find(p => p.xUsername === handle);
    
    if (isPresaleFlow) {
      // In presale flow, we strictly verify handle and wallet match the "Database"
      // If no participant found, we assume they might be in Jungle DB only
      const jungleBackup = JSON.parse(localStorage.getItem(JUNGLE_DB_KEY) || '[]');
      const inJungle = jungleBackup.find((p: any) => p.xUsername === handle && p.walletAddress === wallet);
      
      if (!participant && !inJungle && !userData.handle) {
         setNotification({ message: "ACCESS DENIED: Credentials not found in Jungle Protocol records.", type: 'ERROR' });
         return;
      }
      
      if (participant && participant.walletAddress !== wallet) {
        setNotification({ message: "IDENTITY MISMATCH: Handle exists but wallet does not match record.", type: 'ERROR' });
        return;
      }
    }

    if (!participant) {
      participant = {
        id: crypto.randomUUID(),
        xUsername: handle,
        walletAddress: wallet,
        totalPoints: 0,
        submissions: [],
        jungleCommit: userData.actualCommit || 0.05
      };
      saveAll([...participants, participant]);
    }

    setCurrentUserHandle(handle);
    setView(isPresaleFlow ? 'PRESALE' : 'FARM');
    setNotification({ message: `UPLINK ESTABLISHED: Welcome back @${handle}.`, type: 'SUCCESS' });
  };

  const submitContribution = () => {
    if (!currentParticipant || !presaleHash) {
      setNotification({ message: "SUBMISSION FAILED: Transaction Hash required.", type: 'ERROR' });
      return;
    }

    if (presaleAmount < PRESALE_CONFIG.MIN_CONTRIBUTION || presaleAmount > PRESALE_CONFIG.MAX_CONTRIBUTION) {
      setNotification({ message: `RANGE ERROR: Contributions must be ${PRESALE_CONFIG.MIN_CONTRIBUTION} - ${PRESALE_CONFIG.MAX_CONTRIBUTION} SOL.`, type: 'ERROR' });
      return;
    }

    const newSub: Submission = {
      id: crypto.randomUUID(),
      missionId: 'presale_contribution',
      proofUrl: presaleHash,
      amount: presaleAmount,
      status: 'PENDING',
      timestamp: Date.now()
    };

    const updatedParticipants = participants.map(p => {
      if (p.id === currentParticipant.id) {
        return { ...p, submissions: [...p.submissions, newSub] };
      }
      return p;
    });

    saveAll(updatedParticipants);
    setPresaleHash('');
    setNotification({ message: "TRANSMISSION SUCCESS: Contribution queued for manual verification.", type: 'SUCCESS' });
  };

  const submitProof = () => {
    if (!activeMission || !currentParticipant) return;
    const trimmedProof = proofUrl.trim();
    if (!trimmedProof || !trimmedProof.startsWith('http')) {
      setNotification({ message: "URL ERROR: Provide a valid X status link.", type: 'ERROR' });
      return;
    }

    const newSubmission: Submission = {
      id: crypto.randomUUID(),
      missionId: activeMission.id,
      proofUrl: trimmedProof,
      status: 'PENDING',
      timestamp: Date.now()
    };

    const updatedParticipants = participants.map(p => {
      if (p.id === currentParticipant.id) {
        return { ...p, submissions: [...p.submissions, newSubmission] };
      }
      return p;
    });

    saveAll(updatedParticipants);
    setProofUrl('');
    setActiveMission(null);
    setNotification({ message: "SIGNAL SENT: Verification in progress.", type: 'SUCCESS' });
  };

  const handleAdminApproval = (participantId: string, submissionId: string, status: TaskStatus) => {
    const updatedParticipants = participants.map(p => {
      if (p.id === participantId) {
        let pointsToAdd = 0;
        const updatedSubmissions = p.submissions.map(s => {
          if (s.id === submissionId) {
            const mission = AIRDROP_MISSIONS.find(m => m.id === s.missionId);
            if (status === 'COMPLETED' && s.status !== 'COMPLETED' && mission) {
              pointsToAdd = mission.points;
            }
            return { ...s, status };
          }
          return s;
        });
        return { ...p, submissions: updatedSubmissions, totalPoints: p.totalPoints + pointsToAdd };
      }
      return p;
    });
    saveAll(updatedParticipants);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setNotification({ message: "ADDRESS COPIED: Paste into your wallet app.", type: 'SUCCESS' });
  };

  const filteredLeaderboard = useMemo(() => {
    return [...participants]
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .filter(p => p.xUsername.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [participants, searchTerm]);

  return (
    <div className="flex-1 flex flex-col bg-black text-yellow-500 font-mono overflow-hidden relative">
      {/* OS Navigation Header */}
      <div className="bg-[#1a1a1a] border-b border-[#333] p-1.5 flex justify-between items-center text-[10px] font-black italic flex-shrink-0 z-30">
        <div className="flex gap-2 items-center truncate mr-2">
          <span className="text-pink-600 animate-pulse flex-shrink-0">● {isAdmin ? 'ADMIN' : 'LIVE'}</span>
          <span className="opacity-40 uppercase truncate hidden sm:inline">MONKY_PRESALE_TERMINAL</span>
        </div>
        {(view !== 'LOGIN' && view !== 'LOGIN_PRESALE') && (
          <div className="flex gap-0.5 overflow-x-auto no-scrollbar">
            {!isAdmin ? (
              <>
                <button onClick={() => setView('PRESALE')} className={`px-2 py-0.5 border flex-shrink-0 ${view === 'PRESALE' ? 'bg-pink-600 text-white border-pink-600' : 'border-pink-900 text-pink-500'}`}>PRESALE</button>
                <button onClick={() => setView('FARM')} className={`px-2 py-0.5 border flex-shrink-0 ${view === 'FARM' ? 'bg-yellow-500 text-black border-yellow-500' : 'border-yellow-900'}`}>MISSIONS</button>
                <button onClick={() => setView('LEADERBOARD')} className={`px-2 py-0.5 border flex-shrink-0 ${view === 'LEADERBOARD' ? 'bg-yellow-500 text-black border-yellow-500' : 'border-yellow-900'}`}>RANKINGS</button>
                <button onClick={() => setView('HISTORY')} className={`px-2 py-0.5 border flex-shrink-0 ${view === 'HISTORY' ? 'bg-yellow-500 text-black border-yellow-500' : 'border-yellow-900'}`}>LOGS</button>
              </>
            ) : (
              <>
                <button onClick={() => setView('ADMIN_PANEL')} className={`px-2 py-0.5 border flex-shrink-0 ${view === 'ADMIN_PANEL' ? 'bg-yellow-500 text-black border-yellow-500' : 'border-yellow-900'}`}>MOD_DESK</button>
                <button onClick={() => setView('LEADERBOARD')} className={`px-2 py-0.5 border flex-shrink-0 ${view === 'LEADERBOARD' ? 'bg-yellow-500 text-black border-yellow-500' : 'border-yellow-900'}`}>DATABASE</button>
              </>
            )}
            <button onClick={() => { setCurrentUserHandle(''); setIsAdmin(false); setView('LOGIN'); }} className="px-2 py-0.5 border border-red-900 text-red-500 hover:bg-red-500 hover:text-white flex-shrink-0 uppercase">EXIT</button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0 relative">
        {(view === 'LOGIN' || view === 'LOGIN_PRESALE') && (
          <div className="max-w-sm mx-auto pt-6 space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
              <div className="text-6xl mb-4 animate-bounce">🐒</div>
              <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase transform -skew-x-12 leading-none">
                {view === 'LOGIN_PRESALE' ? 'PRESALE ACCESS' : 'JUNGLE SYSTEM'}
              </h1>
              <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-[0.2em] opacity-80">STRICT IDENTIFICATION REQUIRED</p>
            </div>

            <div className="bg-[#0a0a0a] border-2 border-yellow-900 p-5 space-y-4 shadow-[8px_8px_0_0_#111]">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-500">X_USERNAME:</label>
                <input 
                  type="text" placeholder="@username" 
                  className="w-full bg-black border border-yellow-900 p-3 text-sm focus:border-yellow-500 outline-none text-white font-bold"
                  value={loginHandle} onChange={e => setLoginHandle(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-500">WALLET_ADDRESS (SOL):</label>
                <input 
                  type="text" placeholder="Paste Solana address..." 
                  className="w-full bg-black border border-yellow-900 p-3 text-xs focus:border-yellow-500 outline-none text-white font-mono"
                  value={loginWallet} onChange={e => setLoginWallet(e.target.value)}
                />
              </div>
              <button 
                onClick={() => handleLogin(view === 'LOGIN_PRESALE')}
                className="w-full bg-yellow-500 text-black py-4 font-black text-xl hover:bg-white active:translate-y-1 transition-all shadow-[0_4px_0_0_#856404]"
              >
                CONNECT_TERMINAL
              </button>
              <div className="p-2 bg-yellow-900/10 border border-yellow-900/30">
                <p className="text-[8px] italic text-yellow-600 font-bold uppercase leading-tight">
                  NOTICE: Data must match your Jungle Phase submission.
                </p>
              </div>
            </div>
          </div>
        )}

        {view === 'PRESALE' && currentParticipant && (
          <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
             <div className="bg-pink-600 text-white p-5 flex flex-col md:flex-row justify-between items-center gap-4 border-b-8 border-pink-900">
                <div className="text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase leading-none">PRESALE_UPLINK</h2>
                  <p className="text-[10px] font-bold opacity-80 mt-1 uppercase">DETECTED_JUNGLE_COMMIT: {currentParticipant.jungleCommit || '0.05'} SOL</p>
                </div>
                <div className="flex gap-2">
                   <div className="bg-black/30 p-2 text-center border border-white/20 min-w-[80px]">
                      <p className="text-[8px] font-black opacity-60">MIN_CAP</p>
                      <p className="text-sm font-black">0.01 SOL</p>
                   </div>
                   <div className="bg-black/30 p-2 text-center border border-white/20 min-w-[80px]">
                      <p className="text-[8px] font-black opacity-60">MAX_CAP</p>
                      <p className="text-sm font-black">10.0 SOL</p>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                   <div className="bg-[#0a0a0a] border-2 border-pink-900 p-5 space-y-4">
                      <h3 className="text-sm font-black uppercase text-pink-500 italic tracking-widest">1. TRANSFER_FUNDS</h3>
                      <p className="text-[10px] text-gray-400 italic leading-snug">
                         Send your contribution to the address below. No fixed token price; $MONKY allocation finalized post-presale.
                      </p>
                      <div className="bg-black border border-pink-900 p-3 space-y-2">
                         <p className="text-[9px] text-pink-800 uppercase font-black tracking-tighter">OFFICIAL_SOL_PRESALE_WALLET:</p>
                         <div className="flex gap-2">
                            <code className="flex-1 bg-pink-900/10 p-2 text-[9px] break-all text-pink-400 font-mono border border-pink-900/30">
                               {PRESALE_CONFIG.RECEIVE_WALLET}
                            </code>
                            <button 
                              onClick={() => copyToClipboard(PRESALE_CONFIG.RECEIVE_WALLET)}
                              className="bg-pink-600 text-white px-3 text-[10px] font-black hover:bg-white hover:text-pink-600 transition-colors border border-pink-500"
                            >
                               COPY
                            </button>
                         </div>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-[8px] font-black uppercase">
                        <div className="bg-pink-900/10 p-1 text-center text-pink-700">Presale: 45%</div>
                        <div className="bg-pink-900/10 p-1 text-center text-pink-700">LP: 25%</div>
                        <div className="bg-pink-900/10 p-1 text-center text-pink-700">Comm: 20%</div>
                      </div>
                   </div>
                </div>

                <div className="bg-[#0a0a0a] border-2 border-yellow-900 p-5 space-y-4">
                   <h3 className="text-sm font-black uppercase text-yellow-500 italic tracking-widest">2. VERIFY_SIGNAL</h3>
                   <div className="space-y-4">
                      <div className="space-y-1">
                         <label className="text-[9px] font-black text-gray-500 uppercase">AMOUNT_SENT (SOL):</label>
                         <div className="relative">
                           <input 
                             type="number" 
                             step="0.01"
                             className="w-full bg-black border border-yellow-900 p-3 text-2xl font-black text-yellow-500 outline-none focus:border-white transition-all"
                             value={presaleAmount}
                             onChange={e => setPresaleAmount(parseFloat(e.target.value))}
                           />
                           <span className="absolute right-3 top-1/2 -translate-y-1/2 font-black text-yellow-900">SOL</span>
                         </div>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[9px] font-black text-gray-500 uppercase">TRANSACTION_HASH / SIGNATURE:</label>
                         <input 
                           type="text" 
                           placeholder="Paste tx signature from explorer..."
                           className="w-full bg-black border border-yellow-900 p-3 text-[10px] font-mono text-white outline-none focus:border-white"
                           value={presaleHash}
                           onChange={e => setPresaleHash(e.target.value)}
                         />
                      </div>
                      <button 
                        onClick={submitContribution}
                        className="w-full bg-yellow-500 text-black py-4 font-black text-lg hover:bg-white transition-all shadow-[0_5px_0_0_#856404] active:translate-y-1 active:shadow-none"
                      >
                         SUBMIT_CONTRIBUTION
                      </button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {view === 'FARM' && currentParticipant && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* HUD */}
            <div className="bg-yellow-500 text-black p-4 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-[4px_4px_0_0_#1a1a1a]">
               <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-10 h-10 bg-black text-yellow-500 flex items-center justify-center text-2xl font-black">
                     {currentParticipant.xUsername[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] font-black uppercase opacity-60">AIRDROP_SESSION:</p>
                    <h2 className="text-xl md:text-2xl font-black italic tracking-tighter truncate leading-none">@{currentParticipant.xUsername}</h2>
                  </div>
               </div>
               <div className="text-center sm:text-right w-full sm:w-auto border-t sm:border-t-0 border-black/10 pt-2 sm:pt-0">
                 <p className="text-[8px] font-black uppercase opacity-60">SIGNAL_POINTS:</p>
                 <p className="text-4xl font-black leading-none flex items-baseline justify-center sm:justify-end gap-1">
                    {currentParticipant.totalPoints} 
                    <span className="text-[10px] uppercase bg-black text-yellow-500 px-1 font-bold">PTS</span>
                 </p>
               </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-sm font-black italic uppercase tracking-widest text-white border-b-2 border-yellow-900 pb-1">Harvest_Missions</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                 {AIRDROP_MISSIONS.map(mission => {
                   const status = (currentParticipant.submissions.find(s => s.missionId === mission.id)?.status === 'COMPLETED') ? 'COMPLETED' : 'AVAILABLE';
                   const isLocked = status === 'COMPLETED';
                   return (
                     <div key={mission.id} className={`p-4 border-2 group transition-all ${isLocked ? 'bg-[#111] border-yellow-900 opacity-40' : 'bg-[#050505] border-yellow-900/30 hover:border-yellow-500'}`}>
                        <div className="flex justify-between items-start mb-3">
                           <span className="text-3xl">{mission.icon}</span>
                           <span className={`text-[10px] font-black px-1.5 py-0.5 ${isLocked ? 'bg-yellow-500 text-black' : 'bg-green-900/30 text-green-500'}`}>
                             {isLocked ? 'VERIFIED' : `+${mission.points} PTS`}
                           </span>
                        </div>
                        <h4 className="text-xs font-black text-white group-hover:text-yellow-500 transition-colors uppercase mb-1">{mission.title}</h4>
                        <p className="text-[10px] opacity-60 italic mb-4 h-[2.4em] overflow-hidden">{mission.description}</p>
                        {!isLocked && (
                          <button 
                            onClick={() => setActiveMission(mission)}
                            className="w-full bg-white text-black py-2 font-black text-[10px] uppercase hover:bg-yellow-500 transition-all active:translate-y-0.5 shadow-[3px_3px_0_0_#333]"
                          >
                            RUN_TASK
                          </button>
                        )}
                     </div>
                   );
                 })}
               </div>
            </div>
          </div>
        )}

        {view === 'LEADERBOARD' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 border-b-2 border-yellow-900 pb-4">
              <div>
                <h2 className="text-3xl font-black italic uppercase leading-none">RANKINGS</h2>
                <p className="text-[10px] opacity-40 uppercase">Global social signal leaderboard.</p>
              </div>
              <input 
                type="text" 
                placeholder="SEARCH AGENT..." 
                className="w-full sm:w-64 bg-black border-2 border-yellow-900 p-2 text-[10px] outline-none focus:border-yellow-500 text-white font-mono"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Mobile View: High Contrast Cards */}
            <div className="sm:hidden space-y-2">
              {filteredLeaderboard.map((p, idx) => {
                const tier = [...TIERS_POINTS].reverse().find(t => p.totalPoints >= t.min) || TIERS_POINTS[0];
                return (
                  <div key={p.id} className={`bg-[#0a0a0a] border-2 p-3 flex justify-between items-center ${p.xUsername === currentUserHandle ? 'border-yellow-500 bg-yellow-900/10' : 'border-yellow-900/40'}`}>
                    <div className="flex items-center gap-3">
                       <span className={`text-xl font-black italic ${idx < 3 ? 'text-yellow-500' : 'text-gray-600'}`}>#{idx + 1}</span>
                       <div className="min-w-0">
                          <p className="text-xs font-black text-white truncate">@{p.xUsername}</p>
                          <p className={`text-[8px] font-black uppercase ${tier.color}`}>{tier.label}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-lg font-black text-white tracking-tighter">{p.totalPoints}</p>
                       <p className="text-[8px] opacity-50 uppercase">POINTS</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Terminal Table */}
            <div className="hidden sm:block bg-[#050505] border-2 border-yellow-900 shadow-[6px_6px_0_0_#1a1a1a]">
               <table className="w-full text-left text-[11px]">
                 <thead className="bg-yellow-900/20 text-[9px] uppercase text-yellow-500 border-b border-yellow-900">
                    <tr>
                      <th className="p-3">RANK</th>
                      <th className="p-3">AGENT_ID</th>
                      <th className="p-3">TIER_CLASS</th>
                      <th className="p-3">SIGNAL_PTS</th>
                      <th className="p-3 text-right">SYNC_STATE</th>
                    </tr>
                 </thead>
                 <tbody>
                    {filteredLeaderboard.map((p, idx) => {
                      const tier = [...TIERS_POINTS].reverse().find(t => p.totalPoints >= t.min) || TIERS_POINTS[0];
                      return (
                        <tr key={p.id} className={`border-t border-yellow-900/10 ${p.xUsername === currentUserHandle ? 'bg-yellow-500/5' : ''}`}>
                          <td className="p-3 font-black text-white italic">#{idx + 1}</td>
                          <td className="p-3 font-bold text-yellow-500">@{p.xUsername}</td>
                          <td className={`p-3 font-black uppercase text-[9px] ${tier.color}`}>{tier.label}</td>
                          <td className="p-3 font-black text-white text-lg tracking-tighter">{p.totalPoints}</td>
                          <td className="p-3 text-right text-[8px] opacity-40 font-black">ACTIVE</td>
                        </tr>
                      );
                    })}
                 </tbody>
               </table>
            </div>
          </div>
        )}

        {view === 'HISTORY' && currentParticipant && (
          <div className="space-y-4 animate-in slide-in-from-right-5 duration-500">
             <h2 className="text-2xl font-black italic uppercase border-b-2 border-yellow-900 pb-1">PROTOCOL_LOGS</h2>
             <div className="space-y-2">
                {[...currentParticipant.submissions].reverse().map(sub => {
                   const m = AIRDROP_MISSIONS.find(mission => mission.id === sub.missionId);
                   const isPresale = sub.missionId === 'presale_contribution';
                   return (
                     <div key={sub.id} className={`bg-[#0a0a0a] border p-3 flex justify-between items-center group ${isPresale ? 'border-pink-900/50' : 'border-yellow-900/30'}`}>
                        <div className="flex gap-3 items-center min-w-0">
                           <span className="text-xl flex-shrink-0">{isPresale ? '💰' : m?.icon}</span>
                           <div className="min-w-0">
                              <p className={`text-xs font-black truncate uppercase ${isPresale ? 'text-pink-500' : 'text-white'}`}>
                                 {isPresale ? `PRESALE: ${sub.amount} SOL` : m?.title}
                              </p>
                              <p className="text-[8px] text-gray-500 font-bold truncate">
                                {new Date(sub.timestamp).toLocaleString()} | 
                                <span className="ml-1 opacity-70 italic break-all font-mono">{sub.proofUrl}</span>
                              </p>
                           </div>
                        </div>
                        <div className={`px-2 py-0.5 text-[8px] font-black uppercase ${sub.status === 'COMPLETED' ? 'bg-green-600' : sub.status === 'PENDING' ? 'bg-blue-600' : 'bg-red-600'} text-white`}>
                           {sub.status}
                        </div>
                     </div>
                   );
                })}
                {currentParticipant.submissions.length === 0 && (
                   <div className="text-center py-20 border-2 border-dashed border-yellow-900/20 opacity-20 italic font-black uppercase">NO ACTIVITY LOGGED</div>
                )}
             </div>
          </div>
        )}

        {view === 'ADMIN_PANEL' && isAdmin && (
          <div className="space-y-6">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b-2 border-red-900 pb-2">
                <h2 className="text-2xl font-black italic uppercase text-red-500">MODERATOR_PANEL</h2>
                <p className="text-[10px] text-red-500/50 uppercase">{participants.reduce((acc, p) => acc + p.submissions.filter(s => s.status === 'PENDING').length, 0)} PENDING VERIFICATIONS</p>
             </div>
             <div className="space-y-3">
               {participants.flatMap(p => p.submissions.filter(s => s.status === 'PENDING').map(s => ({ participant: p, submission: s }))).map(({ participant, submission }) => {
                 const mission = AIRDROP_MISSIONS.find(m => m.id === submission.missionId);
                 const isPresale = submission.missionId === 'presale_contribution';
                 return (
                   <div key={submission.id} className="bg-[#050505] border-2 border-red-900/50 p-3 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="w-full sm:min-w-0 overflow-hidden">
                         <p className="text-red-500 font-black text-xs">@{participant.xUsername}</p>
                         <p className="text-white text-[10px] font-bold uppercase truncate">{isPresale ? `PRESALE_DEPOSIT: ${submission.amount} SOL` : mission?.title}</p>
                         <p className="text-[8px] text-gray-500 truncate font-mono italic">{submission.proofUrl}</p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                         <button onClick={() => handleAdminApproval(participant.id, submission.id, 'REJECTED')} className="flex-1 sm:flex-none px-4 py-1.5 bg-red-900/30 border border-red-900 text-red-500 font-black text-[10px] uppercase hover:bg-red-600 hover:text-white transition-all">REJECT</button>
                         <button onClick={() => handleAdminApproval(participant.id, submission.id, 'COMPLETED')} className="flex-1 sm:flex-none px-4 py-1.5 bg-green-900/30 border border-green-900 text-green-500 font-black text-[10px] uppercase hover:bg-green-600 hover:text-white transition-all">APPROVE</button>
                      </div>
                   </div>
                 );
               })}
             </div>
          </div>
        )}
      </div>

      {/* Modal: Mission Evidence */}
      {activeMission && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
          <div className="bg-[#c0c0c0] border-2 border-white border-r-[#808080] border-b-[#808080] w-full max-w-sm overflow-hidden shadow-[12px_12px_0_0_rgba(0,0,0,0.5)]">
            <div className="bg-[#000080] p-1 px-3 flex justify-between items-center text-white font-bold text-[10px]">
              <span className="truncate pr-2 uppercase italic">Mission: {activeMission.title}</span>
              <button onClick={() => setActiveMission(null)} className="bg-[#c0c0c0] text-black px-1.5 border border-white font-black text-[10px]">X</button>
            </div>
            <div className="p-5 bg-black space-y-4">
              <div className="border-l-4 border-yellow-500 pl-3">
                <h3 className="text-lg font-black italic text-white uppercase leading-none">{activeMission.title}</h3>
                <p className="text-[10px] text-gray-500 font-bold mt-1 leading-tight italic">{activeMission.description}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-600 tracking-tighter">X_STATUS_URL:</label>
                <input 
                  type="text" placeholder="https://x.com/status/..." 
                  className="w-full bg-[#111] p-2 text-[10px] outline-none text-white font-mono border border-yellow-900 focus:border-white transition-all"
                  value={proofUrl} onChange={(e) => setProofUrl(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setActiveMission(null)} className="px-4 py-2 border border-[#666] text-gray-500 font-bold uppercase text-[10px]">CANCEL</button>
                <button onClick={submitProof} className="flex-1 bg-yellow-500 text-black py-2 font-black uppercase text-xs shadow-[0_3px_0_0_#856404] active:translate-y-0.5 transition-all">TRANSMIT</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Notification */}
      {notification && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[200] w-[90vw] max-w-xs animate-in slide-in-from-top-10">
           <div className="bg-[#c0c0c0] border-2 border-white border-r-[#808080] border-b-[#808080] shadow-[8px_8px_0_0_rgba(0,0,0,0.4)]">
              <div className={`${notification.type === 'ERROR' ? 'bg-red-800' : notification.type === 'SUCCESS' ? 'bg-green-800' : 'bg-[#000080]'} p-1 px-2 text-white font-bold text-[9px] flex justify-between items-center`}>
                 <span>MONKY_PROTOCOL_MESSAGE</span>
                 <button onClick={() => setNotification(null)} className="bg-[#c0c0c0] text-black px-1 border border-white">X</button>
              </div>
              <div className="p-4 bg-black">
                 <p className="text-[10px] font-black italic text-white leading-tight uppercase text-center">{notification.message}</p>
              </div>
              <div className="bg-[#c0c0c0] p-1.5 flex justify-end">
                 <button onClick={() => setNotification(null)} className="px-5 py-1 bg-[#c0c0c0] border border-white border-r-[#808080] border-b-[#808080] text-black text-[10px] font-bold active:border-r-white active:border-b-white">OK</button>
              </div>
           </div>
        </div>
      )}

      {/* Global Status Ticker */}
      <div className="bg-[#111] h-7 border-t border-[#333] flex items-center overflow-hidden flex-shrink-0 z-20">
        <div className="animate-[ticker_45s_linear_infinite] whitespace-nowrap text-[8px] font-black text-yellow-900/20 flex gap-20 uppercase tracking-[0.4em]">
          <span>{'>'} PROTOCOL_UP_TO_DATE</span>
          <span>{'>'} NO_WALLET_CONNECT_REQUIRED</span>
          <span>{'>'} 45%_PRESALE_ALLOCATION</span>
          <span>{'>'} MANUAL_VERIFICATION_ONLY</span>
          <span>{'>'} 25%_LIQUIDITY_POOL</span>
          <span>{'>'} 20%_COMMUNITY_FUND</span>
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

export default AirdropScreen;

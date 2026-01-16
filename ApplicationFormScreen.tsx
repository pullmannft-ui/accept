
import React, { useState, useEffect, useRef } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { SOCIAL_LINKS } from '../constants';
import { getFirestoreDb } from '../utils/firebase';

interface ApplicationFormScreenProps {
  onComplete: () => void;
}

type FormView = 'INTRO' | 'FORM' | 'SUCCESS';

const DEFAULT_FORM_DATA = {
  twitterName: '',
  walletAddress: '',
  source: '',
  alphaGroups: '',
  biggestTrade: '',
  interestReason: '',
  intendedAmount: '',
  riskAcknowledged: false,
  accreditedDegen: 'NO',
  followMaker: false,
  followFun: false,
  promoteRaid: false,
  joinTelegram: false
};

const ApplicationFormScreen: React.FC<ApplicationFormScreenProps> = ({ onComplete }) => {
  const [view, setView] = useState<FormView>(() => {
    const saved = localStorage.getItem('monky_application_state');
    if (saved === 'SUCCESS') return 'SUCCESS';
    return 'INTRO';
  });
  const [page, setPage] = useState(() => {
    const savedPage = localStorage.getItem('monky_application_page');
    return savedPage ? parseInt(savedPage, 10) : 1;
  });
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(() => localStorage.getItem('monky_application_id'));
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('monky_application_form');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_FORM_DATA;
      }
    }
    return DEFAULT_FORM_DATA;
  });
  const scanTimerRef = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem('monky_application_state', view);
  }, [view]);

  useEffect(() => {
    localStorage.setItem('monky_application_page', page.toString());
  }, [page]);

  useEffect(() => {
    localStorage.setItem('monky_application_id', applicationId);
  }, [applicationId]);

  useEffect(() => {
    localStorage.setItem('monky_application_form', JSON.stringify(formData));
  }, [formData]);

  // Intro Scan Logic
  const startScan = () => {
    setIsScanning(true);
    const step = 4;
    scanTimerRef.current = window.setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(scanTimerRef.current!);
          setView('FORM');
          return 100;
        }
        return prev + step;
      });
    }, 50);
  };

  const stopScan = () => {
    setIsScanning(false);
    if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    setScanProgress(0);
  };

  const handleNext = () => setPage(p => Math.min(3, p + 1));
  const handleBack = () => setPage(p => Math.max(1, p - 1));

  const handleSubmit = async () => {
    if (!formData.riskAcknowledged) {
      setErrorModal("STOP: You must acknowledge the risks associated with volatile memecoins before the wizard can complete registration.");
      return;
    }
    
    const missing = [];
    if (!formData.followMaker) missing.push("Follow @monkymakereth");
    if (!formData.followFun) missing.push("Follow @monky_fun");
    if (!formData.joinTelegram) missing.push("Join Monky Telegram");
    if (!formData.promoteRaid) missing.push("Raid the Signal");

    if (missing.length > 0) {
      setErrorModal(`INCOMPLETE_WIZARD: Please finish these tasks first: ${missing.join(', ')}`);
      return;
    }

    setSubmitting(true);
    try {
      const TIMEOUT_MS = 15000;
      const firestoreWrite = addDoc(collection(getFirestoreDb(), 'applications'), {
        twitterName: formData.twitterName.trim(),
        walletAddress: formData.walletAddress.trim(),
        source: formData.source,
        alphaGroups: formData.alphaGroups,
        biggestTrade: formData.biggestTrade,
        interestReason: formData.interestReason,
        intendedAmount: formData.intendedAmount,
        riskAcknowledged: formData.riskAcknowledged,
        accreditedDegen: formData.accreditedDegen,
        followMaker: formData.followMaker,
        followFun: formData.followFun,
        promoteRaid: formData.promoteRaid,
        joinTelegram: formData.joinTelegram,
        status: 'PENDING',
        createdAt: serverTimestamp()
      });

      const docRef = await Promise.race([
        firestoreWrite,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`FIRESTORE_TIMEOUT: Submission took longer than ${Math.round(TIMEOUT_MS / 1000)}s. Check Firestore rules, network, adblock/VPN, and Firebase env configuration.`)), TIMEOUT_MS)
        )
      ]);
      setApplicationId(docRef.id);
      setView('SUCCESS');
    } catch (e: any) {
      setErrorModal(e?.message || 'SUBMIT_FAILED');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const shareStatus = () => {
    const text = `I just submitted my MONKY application!\n\nSecurity Status: VERIFIED\nTier: ELITE\n\nInitialize ritual: https://form.monkymaker.fun\n\n#MONKY @monkymakereth`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const resetApplication = () => {
    localStorage.removeItem('monky_application_state');
    localStorage.removeItem('monky_application_page');
    localStorage.removeItem('monky_application_id');
    localStorage.removeItem('monky_application_form');
    setView('INTRO');
    setPage(1);
    setApplicationId(null);
    setFormData(DEFAULT_FORM_DATA);
  };

  return (
    <div
      className={`flex-1 flex flex-col bg-[#c0c0c0] font-mono select-none min-h-0 ${
        view === 'FORM' ? 'overflow-hidden' : 'overflow-y-auto'
      }`}
    >
      {view === 'INTRO' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6 animate-in fade-in duration-500">
          <div className="text-center space-y-4 max-w-sm">
            <h2 className="text-xl md:text-2xl font-bold text-black uppercase tracking-tight">SYSTEM_SECURITY_CHECK</h2>
            <p className="text-[11px] text-[#333] uppercase leading-tight">
              Authentication required. Press and hold the biometric sensor to initialize the Agent Setup Wizard.
            </p>
          </div>

          <div className="relative">
            <button 
              onMouseDown={startScan} onMouseUp={stopScan} onMouseLeave={stopScan}
              onTouchStart={startScan} onTouchEnd={stopScan}
              className={`relative w-48 h-48 bg-black border-2 flex items-center justify-center text-7xl md:text-8xl transition-all shadow-[inset_2px_2px_10px_rgba(0,0,0,0.5)]
                ${isScanning ? 'border-blue-500 bg-blue-950/20' : 'border-[#808080] hover:border-white'}`}
            >
              <span className={`${isScanning ? 'animate-pulse blur-[1px]' : ''}`}>✋</span>
              {isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none overflow-hidden">
                  <div className="w-full h-1 bg-blue-500 absolute top-0 animate-[scan_1s_infinite]"></div>
                </div>
              )}
            </button>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold text-[#444] animate-pulse">
              {isScanning ? 'DECRYPTING_SIGNAL...' : 'HOLD_TO_START_SYNC'}
            </div>
          </div>

          <div className="w-full max-w-xs space-y-1 pt-4">
            <div className="flex justify-between text-[10px] text-black font-bold uppercase italic">
              <span>SCANNING_PROGRESS</span>
              <span>{scanProgress}%</span>
            </div>
            <div className="h-5 bg-[#808080] border border-white border-l-black border-t-black p-0.5">
              <div className="h-full bg-[#000080] transition-all" style={{ width: `${scanProgress}%` }}></div>
            </div>
          </div>
        </div>
      )}

      {view === 'FORM' && (
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* Wizard Sidebar - Responsive (Top on mobile, left on desktop) */}
          <div className="w-full md:w-44 bg-[#808080] p-3 md:p-5 flex md:flex-col gap-3 border-b-2 md:border-b-0 md:border-r-2 border-[#444] overflow-x-auto no-scrollbar">
            <div className="hidden md:block text-4xl mb-4">🐒</div>
            {[1, 2, 3].map(i => (
              <div key={i} className={`flex items-center gap-2 transition-all flex-shrink-0 ${page === i ? 'text-yellow-400 translate-x-1' : 'opacity-50 text-white'}`}>
                <div className={`w-5 h-5 flex items-center justify-center border text-[10px] font-bold ${page === i ? 'border-yellow-400' : 'border-white'}`}>{i}</div>
                <span className="text-[10px] font-black uppercase tracking-tighter">PHASE_{i}</span>
              </div>
            ))}
            <div className="hidden md:block mt-auto pt-4 border-t border-white/10">
              <p className="text-[8px] italic text-white/40 uppercase font-bold">Monky_Setup_v3</p>
            </div>
          </div>

          {/* Wizard Form Area */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            <div className="p-4 md:p-6 border-b border-[#c0c0c0] shrink-0">
              <h3 className="text-lg md:text-xl font-bold text-black uppercase">
                {page === 1 && "Identity Coordinates"}
                {page === 2 && "Degen Verification"}
                {page === 3 && "Ritual Protocol"}
              </h3>
              <p className="text-[11px] text-[#666] leading-tight mt-1">
                {page === 1 && "Establish your social link and vault address for identification."}
                {page === 2 && "Prove your history of jungle extraction and active signal nodes."}
                {page === 3 && "Finalize commitment and verify external mission parameters."}
              </p>
            </div>

            <div className="flex-1 p-4 md:p-6 overflow-y-auto no-scrollbar space-y-6">
              {page === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-black uppercase">X (Twitter) Handle:</label>
                    <input 
                      type="text" placeholder="@your_handle"
                      className="w-full bg-[#f0f0f0] border-2 border-[#808080] border-r-white border-b-white p-3 text-sm outline-none focus:bg-blue-50 focus:border-blue-800"
                      value={formData.twitterName}
                      onChange={(e) => updateField('twitterName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-black uppercase">Solana Payout Wallet:</label>
                    <input 
                      type="text" placeholder="Wallet Address..."
                      className="w-full bg-[#f0f0f0] border-2 border-[#808080] border-r-white border-b-white p-3 text-[10px] font-mono outline-none focus:bg-blue-50"
                      value={formData.walletAddress}
                      onChange={(e) => updateField('walletAddress', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-black uppercase">Source of Recruitment:</label>
                    <select 
                      className="w-full bg-[#f0f0f0] border-2 border-[#808080] border-r-white border-b-white p-3 text-sm outline-none cursor-pointer"
                      value={formData.source}
                      onChange={(e) => updateField('source', e.target.value)}
                    >
                      <option value="">- Select -</option>
                      <option value="X">X (Twitter)</option>
                      <option value="Telegram">Alpha Node</option>
                      <option value="Referral">Agent Referral</option>
                      <option value="Other">External Signal</option>
                    </select>
                  </div>
                </div>
              )}

              {page === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-black uppercase">Active Alpha Channels:</label>
                    <input 
                      type="text" placeholder="Which groups are you in?"
                      className="w-full bg-[#f0f0f0] border-2 border-[#808080] border-r-white border-b-white p-3 text-sm outline-none"
                      value={formData.alphaGroups}
                      onChange={(e) => updateField('alphaGroups', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-black uppercase">Highest ROI Trade:</label>
                    <input 
                      type="text" placeholder="e.g. 100x $PEPE"
                      className="w-full bg-[#f0f0f0] border-2 border-[#808080] border-r-white border-b-white p-3 text-sm outline-none"
                      value={formData.biggestTrade}
                      onChange={(e) => updateField('biggestTrade', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-black uppercase">Motivation for joining:</label>
                    <textarea 
                      rows={3} placeholder="Why the Monky Protocol?"
                      className="w-full bg-[#f0f0f0] border-2 border-[#808080] border-r-white border-b-white p-3 text-sm outline-none resize-none"
                      value={formData.interestReason}
                      onChange={(e) => updateField('interestReason', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {page === 3 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 pb-10">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-black uppercase">Intended Contribution (SOL):</label>
                    <input 
                      type="number" step="0.1" placeholder="SOL Amount"
                      className="w-full bg-[#f0f0f0] border-2 border-[#808080] border-r-white border-b-white p-3 text-sm font-bold"
                      value={formData.intendedAmount}
                      onChange={(e) => updateField('intendedAmount', e.target.value)}
                    />
                  </div>

                  <div className="p-4 bg-red-50 border-2 border-red-200 space-y-3">
                    <p className="text-[10px] font-bold text-red-800 leading-tight uppercase italic">
                      ⚠ CRITICAL: Memecoins involve high risk. Capital loss is probable. Confirm your status as an experienced participant.
                    </p>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="radio" name="risk" checked={formData.riskAcknowledged} 
                          onChange={() => updateField('riskAcknowledged', true)}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span className="text-[11px] font-black text-black group-hover:text-blue-800">YES, SYNC</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="radio" name="risk" checked={!formData.riskAcknowledged} 
                          onChange={() => updateField('riskAcknowledged', false)}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span className="text-[11px] font-black text-black group-hover:text-red-700">NO, ABORT</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <h4 className="text-[11px] font-black text-black border-b border-[#eee] pb-1 uppercase tracking-widest">MISSION_SYNC</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-[#f9f9f9] border border-[#ddd]">
                        <span className="text-[10px] font-bold uppercase truncate pr-2">Follow @monkymakereth</span>
                        <button 
                          onClick={() => { window.open(SOCIAL_LINKS.MONKY_MAKER, '_blank'); updateField('followMaker', true); }}
                          className={`px-4 py-1.5 text-[9px] font-black border-2 flex-shrink-0 ${formData.followMaker ? 'bg-green-100 text-green-700 border-green-700' : 'bg-[#c0c0c0] border-white border-r-[#808080] border-b-[#808080] active:border-r-white active:border-b-white'}`}
                        >
                          {formData.followMaker ? 'VERIFIED' : 'RUN'}
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[#f9f9f9] border border-[#ddd]">
                        <span className="text-[10px] font-bold uppercase truncate pr-2">Follow @monky_fun</span>
                        <button 
                          onClick={() => { window.open(SOCIAL_LINKS.MONKY_FUN, '_blank'); updateField('followFun', true); }}
                          className={`px-4 py-1.5 text-[9px] font-black border-2 flex-shrink-0 ${formData.followFun ? 'bg-green-100 text-green-700 border-green-700' : 'bg-[#c0c0c0] border-white border-r-[#808080] border-b-[#808080] active:border-r-white active:border-b-white'}`}
                        >
                          {formData.followFun ? 'VERIFIED' : 'RUN'}
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[#f9f9f9] border border-[#ddd]">
                        <span className="text-[10px] font-bold uppercase truncate pr-2">Join Monky Telegram</span>
                        <button 
                          onClick={() => { window.open(SOCIAL_LINKS.MONKY_TELEGRAM, '_blank'); updateField('joinTelegram', true); }}
                          className={`px-4 py-1.5 text-[9px] font-black border-2 flex-shrink-0 ${formData.joinTelegram ? 'bg-green-100 text-green-700 border-green-700' : 'bg-[#c0c0c0] border-white border-r-[#808080] border-b-[#808080] active:border-r-white active:border-b-white'}`}
                        >
                          {formData.joinTelegram ? 'VERIFIED' : 'RUN'}
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[#f9f9f9] border border-[#ddd]">
                        <span className="text-[10px] font-bold uppercase truncate pr-2">Raid the Signal (RT)</span>
                        <button 
                          onClick={() => { window.open(SOCIAL_LINKS.RAID_TWEET, '_blank'); updateField('promoteRaid', true); }}
                          className={`px-4 py-1.5 text-[9px] font-black border-2 flex-shrink-0 ${formData.promoteRaid ? 'bg-green-100 text-green-700 border-green-700' : 'bg-[#c0c0c0] border-white border-r-[#808080] border-b-[#808080] active:border-r-white active:border-b-white'}`}
                        >
                          {formData.promoteRaid ? 'VERIFIED' : 'RUN'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Controls Area */}
            <div className="p-4 md:p-6 bg-[#f0f0f0] border-t border-[#c0c0c0] flex justify-between md:justify-end gap-3 shrink-0">
              <button 
                onClick={handleBack} disabled={page === 1}
                className={`px-8 py-2 bg-[#c0c0c0] border-2 border-white border-r-[#808080] border-b-[#808080] font-bold text-xs uppercase shadow-sm ${page === 1 ? 'opacity-30 cursor-not-allowed' : 'active:border-r-white active:border-b-white'}`}
              >
                &lt; Back
              </button>
              <div className="flex gap-2">
                {page < 3 ? (
                  <button 
                    onClick={handleNext}
                    className="px-8 py-2 bg-[#c0c0c0] border-2 border-white border-r-[#808080] border-b-[#808080] font-bold text-xs uppercase active:border-r-white active:border-b-white shadow-sm"
                  >
                    Next &gt;
                  </button>
                ) : (
                  <button 
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-8 py-2 bg-[#c0c0c0] border-2 border-white border-r-[#808080] border-b-[#808080] font-black text-xs uppercase active:border-r-white active:border-b-white shadow-sm text-blue-800"
                  >
                    {submitting ? 'Submitting...' : 'Finish'}
                  </button>
                )}
                <button onClick={onComplete} className="px-6 py-2 bg-[#c0c0c0] border-2 border-white border-r-[#808080] border-b-[#808080] font-bold text-xs uppercase hidden sm:block">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'SUCCESS' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8 animate-in zoom-in-95 duration-500">
          <div className="text-center space-y-2">
            <div className="text-7xl md:text-8xl drop-shadow-[4px_4px_0_#fff]">🐒</div>
            <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter text-black uppercase">SYNC_COMPLETE!</h2>
            <p className="text-[11px] text-[#444] font-bold max-w-xs mx-auto uppercase">
              Identity verified. Agent coordinates recorded in the Jungle Registry.
            </p>
          </div>

          <div className="w-full max-w-sm bg-white border-2 border-[#808080] border-r-white border-b-white p-6 space-y-4 shadow-[4px_4px_0_0_#808080]">
             <div className="flex justify-between items-center border-b border-[#eee] pb-2">
                <span className="text-[10px] font-black uppercase text-[#888]">Agent_Handle:</span>
                <span className="text-sm font-black text-blue-800 uppercase italic">@{formData.twitterName || 'UNKNOWN'}</span>
             </div>
             <div className="flex justify-between items-center border-b border-[#eee] pb-2">
                <span className="text-[10px] font-black uppercase text-[#888]">Clearance:</span>
                <span className="text-sm font-black text-green-600 uppercase italic">ELITE_NODE</span>
             </div>
             <div className="bg-[#f0f0f0] p-3 border-l-4 border-blue-800 italic">
                <p className="text-[9px] text-[#555] font-bold leading-tight">
                  "Signal detected from high-activity node. Allocation capacity confirmed. Proceed to nucleus for final instructions."
                </p>
             </div>
             <div className="flex justify-between items-center border-t border-[#eee] pt-3">
               <span className="text-[10px] font-black uppercase text-[#888]">Application_ID:</span>
               <span className="text-[10px] font-black text-black font-mono truncate max-w-[180px]">{applicationId || 'PENDING_WRITE'}</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-[10px] font-black uppercase text-[#888]">Status:</span>
               <span className="text-[10px] font-black text-blue-800 uppercase italic">PENDING</span>
             </div>
          </div>

          <div className="w-full max-w-xs flex flex-col gap-3">
             <button 
              onClick={shareStatus}
              className="w-full bg-[#c0c0c0] border-2 border-white border-r-[#808080] border-b-[#808080] py-4 font-black text-sm uppercase active:border-r-white active:border-b-white shadow-md hover:bg-white"
             >
               📣 BROADCAST_STATUS
             </button>
             <button 
              onClick={resetApplication}
              className="w-full bg-[#000080] text-white py-4 font-black text-sm uppercase hover:bg-blue-700 shadow-md active:translate-y-1 transition-all"
             >
               NEW_APPLICATION
             </button>
          </div>
        </div>
      )}

      {/* ERROR MODAL (BSOD Style) */}
      {errorModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-[#0000aa] font-mono text-white text-center">
          <div className="max-w-xl space-y-8">
            <div className="bg-white text-[#0000aa] px-6 py-1 inline-block font-bold text-xl">MONKY_OS</div>
            <div className="space-y-4">
              <p className="text-sm md:text-base leading-relaxed">
                A fatal protocol exception 0E has occurred at JUNGLE_SYNC.DLL. Registration cannot proceed without mandatory ritual alignment.
              </p>
              <div className="p-6 bg-black/30 border border-white/20 text-yellow-400">
                <p className="text-xs font-black uppercase mb-2">Detailed Error Report:</p>
                <p className="italic text-sm">{errorModal}</p>
              </div>
            </div>
            <p className="text-[11px] animate-pulse">
              * Press RETRY to return to the wizard and correct parameters.
            </p>
            <button 
              onClick={() => setErrorModal(null)}
              className="bg-white text-[#0000aa] px-12 py-3 font-black uppercase text-lg hover:bg-yellow-400 transition-colors shadow-lg"
            >
              RETRY_PROTOCOL
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { top: -5%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 105%; opacity: 0; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ApplicationFormScreen;

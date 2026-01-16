
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import WelcomeScreen from './components/WelcomeScreen';
import ScanScreen from './components/ScanScreen';
import RaidScreen from './components/RaidScreen';
import WalletScreen from './components/WalletScreen';
import CommitmentScreen from './components/CommitmentScreen';
import AllocationScreen from './components/AllocationScreen';
import AirdropScreen from './components/AirdropScreen';
import PresaleScreen from './components/PresaleScreen';
import AdminScreen from './components/AdminScreen';
import RitualForgeScreen from './components/RitualForgeScreen';
import ApplicationFormScreen from './components/ApplicationFormScreen';
import { AppStep, UserData } from './types';

const App: React.FC = () => {
  // Detect if we should start in a specific mode based on URL
  const [step, setStep] = useState<AppStep>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('/presale')) return AppStep.PRESALE;
      if (path.includes('/airdrop')) return AppStep.AIRDROP;
      if (path.includes('/forge')) return AppStep.FORGE;
      if (path.includes('/apply')) return AppStep.APPLICATION;
      if (path.includes('/admin')) return AppStep.ADMIN;
    }
    return AppStep.APPLICATION;
  });
  
  const [showHelp, setShowHelp] = useState(false);
  
  const [userData, setUserData] = useState<UserData>({
    handle: 'demo_user',
    referrer: 'demo_ref',
    isSolo: false,
    signalLevel: null,
    maxAllowedCommit: 2,
    actualCommit: 0.5,
    multiplier: 1,
    baseRate: 400000,
    monkyEstimate: 0,
    wallet: 'DemoWallet11111111111111111111111111111111',
    proofLinks: {
      quote: '',
      tags: ''
    },
    raidScore: 0,
    airdropPoints: 0,
    airdropSubmissions: [],
    airdropStreak: 0,
    airdropTier: 'BRONZE'
  });

  const stepsOrder = [
    AppStep.WELCOME,
    AppStep.SCAN,
    AppStep.RAID,
    AppStep.WALLET,
    AppStep.COMMIT,
    AppStep.REVEAL
  ];

  const currentStepIndex = stepsOrder.includes(step) ? stepsOrder.indexOf(step) + 1 : 0;
  const totalSteps = stepsOrder.length;
  
  const progressMap = {
    [AppStep.DESKTOP]: 0,
    [AppStep.WELCOME]: 5,
    [AppStep.SCAN]: 20,
    [AppStep.RAID]: 40,
    [AppStep.WALLET]: 60,
    [AppStep.COMMIT]: 80,
    [AppStep.REVEAL]: 100,
    [AppStep.AIRDROP]: 100,
    [AppStep.PRESALE]: 100,
    [AppStep.ADMIN]: 100,
    [AppStep.FORGE]: 100,
    [AppStep.APPLICATION]: 100
  };

  const nextStep = () => {
    const idx = stepsOrder.indexOf(step);
    if (idx < stepsOrder.length - 1) {
      setStep(stepsOrder[idx + 1]);
    }
  };

  const backStep = () => {
    const idx = stepsOrder.indexOf(step);
    if (idx > 0) setStep(stepsOrder[idx - 1]);
    else setStep(AppStep.DESKTOP);
  };

  return (
    <Layout 
      progress={progressMap[step]} 
      step={step} 
      currentStepIndex={currentStepIndex}
      totalSteps={totalSteps}
      onHelp={() => setShowHelp(true)}
      onClose={() => setStep(AppStep.DESKTOP)}
      onOpenApp={(s) => setStep(s)}
    >
      {step === AppStep.WELCOME && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
           <WelcomeScreen onNext={nextStep} />
        </div>
      )}
      {step === AppStep.SCAN && (
        <ScanScreen 
          userData={userData} 
          setUserData={setUserData} 
          onNext={nextStep} 
        />
      )}
      {step === AppStep.RAID && (
        <RaidScreen 
          userData={userData} 
          setUserData={setUserData} 
          onNext={nextStep} 
          onBack={backStep}
        />
      )}
      {step === AppStep.WALLET && (
        <WalletScreen 
          userData={userData} 
          setUserData={setUserData} 
          onNext={nextStep} 
          onBack={backStep}
        />
      )}
      {step === AppStep.COMMIT && (
        <CommitmentScreen 
          userData={userData} 
          setUserData={setUserData} 
          onNext={nextStep} 
          onBack={backStep} 
        />
      )}
      {step === AppStep.REVEAL && (
        <AllocationScreen userData={userData} />
      )}
      {step === AppStep.AIRDROP && (
        <AirdropScreen 
          userData={userData} 
          setUserData={setUserData} 
        />
      )}
      {step === AppStep.PRESALE && (
        <PresaleScreen 
          userData={userData} 
          setUserData={setUserData} 
        />
      )}
      {step === AppStep.ADMIN && (
        <AdminScreen userData={userData} />
      )}
      {step === AppStep.FORGE && (
        <RitualForgeScreen />
      )}
      {step === AppStep.APPLICATION && (
        <ApplicationFormScreen onComplete={() => setStep(AppStep.DESKTOP)} />
      )}

      {showHelp && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/40">
           <div className="bg-[#c0c0c0] border-2 border-white border-r-[#808080] border-b-[#808080] w-full max-w-sm p-1 shadow-2xl">
              <div className="bg-[#000080] p-1 px-2 text-white font-bold text-xs flex justify-between items-center">
                 <span>HELP_SYSTEM_V2.1</span>
                 <button onClick={() => setShowHelp(false)} className="bg-[#c0c0c0] text-black px-1 border border-white">X</button>
              </div>
              <div className="p-4 bg-black text-green-500 font-mono text-[11px] space-y-3">
                 <p className="uppercase italic">// TERMINAL_INFO:</p>
                 <p>Complete the agent registration form to prove your alignment with the Monky protocol. Success rewards access to the presale tier.</p>
                 <button onClick={() => setShowHelp(false)} className="w-full bg-[#c0c0c0] text-black py-2 border-2 border-white border-r-[#808080] border-b-[#808080] font-black uppercase text-xs">OK</button>
              </div>
           </div>
        </div>
      )}
    </Layout>
  );
};

export default App;


import React, { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, doc, limit, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { UserData } from '../types';
import { getAdminEmail, getFirebaseAuth, getFirestoreDb } from '../utils/firebase';
import AdminLoginScreen from './AdminLoginScreen';

interface AdminScreenProps {
  userData: UserData;
}

const AdminScreen: React.FC<AdminScreenProps> = ({ userData }) => {
  const firebaseAuth = useMemo(() => getFirebaseAuth(), []);
  const firestoreDb = useMemo(() => getFirestoreDb(), []);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, (u) => {
      setAuthUser(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const isAllowed = useMemo(() => {
    if (!authUser?.email) return false;
    const adminEmail = getAdminEmail();
    if (!adminEmail) return false;
    return authUser.email.toLowerCase() === adminEmail.toLowerCase();
  }, [authUser?.email]);

  useEffect(() => {
    if (!authReady || !isAllowed) {
      setApplications([]);
      return;
    }
    const q = query(collection(firestoreDb, 'applications'), orderBy('createdAt', 'desc'), limit(50));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setActionError(null);
        const rows = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any)
        }));
        setApplications(rows.filter((r) => (r.status || 'PENDING') === 'PENDING'));
      },
      (err) => {
        setApplications([]);
        setActionError(err?.message || 'FIRESTORE_SUBSCRIBE_FAILED');
      }
    );
    return () => unsub();
  }, [authReady, isAllowed, firestoreDb]);

  const updateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setActionError(null);
    try {
      await updateDoc(doc(firestoreDb, 'applications', id), {
        status,
        reviewedAt: new Date().toISOString(),
        reviewer: authUser?.email || null
      });

      if (status === 'APPROVED') {
        setToast('APPROVED: Application status updated.');
        window.setTimeout(() => setToast(null), 2000);
      }
    } catch (e: any) {
      setActionError(e?.message || 'UPDATE_FAILED');
    }
  };

  const handleLogout = async () => {
    await signOut(firebaseAuth);
  };

  if (!authReady) {
    return (
      <div className="flex-1 flex flex-col bg-[#111] text-red-500 font-mono p-6 space-y-6 overflow-y-auto">
        <div className="border-b border-red-900 pb-2">
          <h2 className="text-2xl font-black uppercase tracking-tighter">CENTRAL_COMMAND_V99</h2>
          <p className="text-[10px] opacity-50 uppercase">SYNCING_AUTH...</p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return <AdminLoginScreen onLoggedIn={() => {}} />;
  }

  if (!isAllowed) {
    return (
      <div className="flex-1 flex flex-col bg-[#111] text-red-500 font-mono p-6 space-y-6 overflow-y-auto">
        <div className="border-b border-red-900 pb-2">
          <h2 className="text-2xl font-black uppercase tracking-tighter">ACCESS_DENIED</h2>
          <p className="text-[10px] opacity-50 uppercase">This account is not authorized for admin.</p>
        </div>
        <div className="bg-black border border-red-900 p-4 space-y-2">
          <p className="text-[10px] font-black uppercase">SIGNED_IN_AS</p>
          <p className="text-[12px] text-white font-bold break-words">{authUser.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white py-3 font-black text-xs hover:bg-red-400"
        >
          LOGOUT
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#111] text-red-500 font-mono p-6 space-y-6 overflow-y-auto">
      <div className="border-b border-red-900 pb-2 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter">CENTRAL_COMMAND_V99</h2>
          <p className="text-[10px] opacity-50 uppercase">Applications Audit Queue</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-[#c0c0c0] text-black px-4 py-2 font-black text-[10px] uppercase hover:bg-white"
        >
          LOGOUT
        </button>
      </div>

      {actionError && (
        <div className="bg-black border border-red-900 p-3 text-[10px] uppercase break-words text-red-400">
          {actionError}
        </div>
      )}

      {toast && (
        <div className="bg-black border border-green-900 p-3 text-[10px] uppercase break-words text-green-400">
          {toast}
        </div>
      )}

      <div className="bg-black border border-red-900 p-4 space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-xs font-black uppercase">QUEUE_SIZE</p>
          <p className="text-xs font-black text-white">{applications.length}</p>
        </div>
        <div className="space-y-2">
          {applications.map((a) => (
            <div key={a.id} className="border border-red-900/40 p-3 bg-[#111]">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase text-red-400">{a.status || 'PENDING'}</p>
                  <p className="text-[12px] font-black text-white truncate">@{a.twitterName || 'unknown'}</p>
                  <p className="text-[9px] opacity-50 truncate">{a.walletAddress || ''}</p>
                  <p className="text-[9px] opacity-30 font-mono truncate">{a.id}</p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => updateStatus(a.id, 'APPROVED')}
                    disabled={a.status === 'APPROVED'}
                    className="bg-green-600 text-white px-4 py-2 font-black text-[10px] uppercase disabled:opacity-40"
                  >
                    APPROVE
                  </button>
                  <button
                    onClick={() => updateStatus(a.id, 'REJECTED')}
                    disabled={a.status === 'REJECTED'}
                    className="bg-red-600 text-white px-4 py-2 font-black text-[10px] uppercase disabled:opacity-40"
                  >
                    REJECT
                  </button>
                </div>
              </div>
            </div>
          ))}
          {applications.length === 0 && (
            <div className="text-center py-10 opacity-30 italic font-black uppercase text-[10px] tracking-[0.3em]">_EMPTY_QUEUE_</div>
          )}
        </div>
      </div>

      <div className="flex-1 bg-black border border-red-900 p-4 overflow-hidden">
        <p className="text-[10px] font-black uppercase mb-2">Live_Activity_Feed</p>
        <div className="text-[9px] opacity-50 space-y-1">
          <p>{'>'} User {userData.handle || 'Guest'} logged {userData.airdropPoints} pts</p>
          <p>{'>'} Syncing with RPC: mainnet-beta</p>
          <p>{'>'} Filtering bots: 1,402 detected</p>
          <p>{'>'} Snapshot pending in 48h</p>
        </div>
      </div>
    </div>
  );
};

export default AdminScreen;

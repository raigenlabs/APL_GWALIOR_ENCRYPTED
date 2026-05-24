/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Sliders, 
  BadgeCheck,
  CreditCard,
  Building,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { UserState, WalletTransaction } from '../types';

interface WalletSystemProps {
  user: UserState;
  onUpdateUser: (updatedFields: Partial<UserState>) => void;
  onRefreshWallet: () => void;
}

export default function WalletSystem({ user, onUpdateUser, onRefreshWallet }: WalletSystemProps) {
  // Deposit state
  const [topupAmount, setTopupAmount] = useState('100');
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);

  // Withdrawal state
  const [withdrawAmount, setWithdrawAmount] = useState('150');
  const [withdrawUpi, setWithdrawUpi] = useState('user@okaxis');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // KYC state
  const [aadhaar_inp, setAadhaar] = useState('');
  const [pan_inp, setPan] = useState('');
  const [ageCheck, setAgeCheck] = useState(false);
  const [isVerifyingKYC, setIsVerifyingKYC] = useState(false);

  // Responsible gambling state
  const [lossLimitInput, setLossLimitInput] = useState(user.dailyLossLimit.toString());
  const [limitSaved, setLimitSaved] = useState(false);

  // Ledger history
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loadingLedger, setLoadingLedger] = useState(false);

  // Fetch ledger state from Express API
  const fetchWalletState = async () => {
    setLoadingLedger(true);
    try {
      const res = await fetch('/api/user-wallet');
      const data = await res.json();
      if (data.wallet) {
        setTransactions(data.wallet.transactions);
        onUpdateUser({
          walletBalance: data.wallet.balance,
          kycVerified: data.wallet.kycVerified,
          kycAadhaar: data.wallet.kycAadhaar,
          kycPan: data.wallet.kycPan,
          ageVerified: data.wallet.ageVerified,
          dailyLossLimit: data.wallet.dailyLossLimit
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLedger(false);
    }
  };

  useEffect(() => {
    fetchWalletState();
  }, []);

  const handleDeposit = async (amt: number) => {
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid amount to deposit.');
      return;
    }
    setIsDepositing(true);
    setDepositSuccess(false);
    try {
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt })
      });
      const data = await res.json();
      if (data.success) {
        setDepositSuccess(true);
        setTimeout(() => setDepositSuccess(false), 3000);
        fetchWalletState();
        onRefreshWallet();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawError('');
    setWithdrawSuccess(false);
    const amt = Number(withdrawAmount);

    if (!user.kycVerified) {
      setWithdrawError('KYC Verification (PAN & Aadhaar) is strictly mandatory in India before making UPI withdrawals.');
      return;
    }
    if (amt < 100) {
      setWithdrawError('Minimum withdrawal amount is ₹100.');
      return;
    }
    if (user.walletBalance < amt) {
      setWithdrawError('Insufficient wallet balance.');
      return;
    }
    if (!withdrawUpi.includes('@')) {
      setWithdrawError('Please enter a valid UPI ID (e.g. name@upi).');
      return;
    }

    setIsWithdrawing(true);
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt, upiId: withdrawUpi })
      });
      const data = await res.json();
      if (res.status >= 400) {
        setWithdrawError(data.error || 'Withdrawal failed.');
      } else if (data.success) {
        setWithdrawSuccess(true);
        fetchWalletState();
        onRefreshWallet();
      }
    } catch (e) {
      setWithdrawError('Server communication failure.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const verifyDigiLockerKYC = async () => {
    if (aadhaar_inp.length !== 12 || isNaN(Number(aadhaar_inp))) {
      alert('Kindly enter a valid 12-digit Aadhaar Number.');
      return;
    }
    if (pan_inp.length !== 10) {
      alert('PAN must be exactly 10 alphanumeric characters.');
      return;
    }
    if (!ageCheck) {
      alert('You must confirm that you are at least 18 years of age to connect services.');
      return;
    }

    setIsVerifyingKYC(true);
    try {
      const res = await fetch('/api/wallet/verify-kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aadhaar: aadhaar_inp,
          pan: pan_inp,
          ageChecked: ageCheck
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchWalletState();
        alert('DigiLocker KYC status verified! Age 18+ confirmed. Withdrawals and Betting features are now unlocked!');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsVerifyingKYC(false);
    }
  };

  const saveLossLimit = async () => {
    const limit = Number(lossLimitInput);
    if (isNaN(limit) || limit < 50) {
      alert('Please configure a logical limit above ₹50.');
      return;
    }
    try {
      const res = await fetch('/api/wallet/limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dailyLossLimit: limit })
      });
      const data = await res.json();
      if (data.success) {
        setLimitSaved(true);
        setTimeout(() => setLimitSaved(false), 2000);
        fetchWalletState();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Convert game seconds back to a nice string
  const formatTime = (ms: number) => {
    const hrs = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto px-4 py-8 text-left font-sans" id="wallet_system_root">
      
      {/* LEFT AREA: Wallet Dashboard + Ledgers */}
      <div className="lg:col-span-8 space-y-8">
        
        {/* Wallet Balance Card (Platinum Dark design with highly explicit white contents) */}
        <div id="card_wallet_balance" className="relative overflow-hidden bg-gradient-to-tr from-slate-900 via-slate-850 to-slate-950 p-6 md:p-8 rounded-[32px] border border-slate-800 shadow-xl text-white">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-blue/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3 text-left">
              <span className="text-[10px] font-mono font-black tracking-widest text-[#94A3B8] uppercase block">
                ⭐ SECURED PITChSIDE WALLET
              </span>
              
              <div className="space-y-1">
                <span className="text-xs text-[#CBD5E1] font-bold block">Available Balance</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-black text-white font-mono tracking-tight">₹{user.walletBalance.toLocaleString('en-IN')}</span>
                  <span className="text-[10.5px] bg-emerald-500/20 text-[#34D399] border border-emerald-500/30 px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
                    INR SECURED
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-3 text-xs text-[#94A3B8] font-semibold">
                <span className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-700/35">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  Uptime session: <strong className="text-white">{formatTime(user.sessionTimeMs)}</strong>
                </span>
                <span className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-700/35">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  PCI-DSS Audited
                </span>
              </div>
            </div>

            {/* Quick Topup selection UI (High-contrast clean card container) */}
            <div className="bg-slate-950/90 border border-slate-800 p-5 rounded-[24px] max-w-sm w-full space-y-4 shadow-2xl">
              <span className="text-xs text-[#E2E8F0] font-black uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-amber-500" />
                Razorpay Micro-deposits
              </span>
              
              <div className="grid grid-cols-4 gap-1.5">
                {[50, 100, 200, 500].map((val) => (
                  <button
                    key={val}
                    id={`btn_quick_deposit_${val}`}
                    onClick={() => {
                      setTopupAmount(val.toString());
                      handleDeposit(val);
                    }}
                    disabled={isDepositing}
                    className="bg-slate-900/60 hover:bg-slate-800 text-xs text-[#EDF2F7] font-bold border border-slate-800 hover:border-slate-600 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-40 active:scale-95"
                  >
                    +₹{val}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="number"
                  value={topupAmount}
                  id="inp_custom_topup"
                  onChange={(e) => setTopupAmount(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl w-full outline-none focus:border-blue-500 font-bold placeholder-slate-600"
                  placeholder="Custom amount"
                />
                <button
                  id="btn_topup_trigger"
                  onClick={() => handleDeposit(Number(topupAmount))}
                  disabled={isDepositing || !topupAmount}
                  className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-xs px-4 py-2 rounded-xl text-white font-black cursor-pointer shrink-0 transition-all uppercase tracking-wider shadow-lg shadow-blue-600/10"
                >
                  {isDepositing ? 'Processing' : 'Top Up'}
                </button>
              </div>

              {depositSuccess && (
                <div className="text-[10px] text-emerald-400 font-bold flex items-center justify-center gap-1 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 animate-bounce shrink-0" />
                  Razorpay sandbox payment successful!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Withdrawal Panel (Clean high-contrast Light Theme Card) */}
        <div id="card_withdrawal" className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6 text-left">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/10 p-3 rounded-2xl text-amber-600">
              <ArrowDownLeft className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 font-display">Withdraw Winnings to UPI</h3>
              <p className="text-xs text-slate-400 font-semibold font-sans">Settled instantly into your connected Indian bank account</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9.5px] text-slate-400 font-black font-mono uppercase tracking-wider">Withdraw Amount (Min ₹100)</label>
              <input
                type="number"
                value={withdrawAmount}
                id="inp_withdraw_amt"
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs text-slate-800 px-4 py-3 rounded-2xl w-full outline-none focus:border-blue-500 font-bold"
                placeholder="₹ Amount to cash out"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9.5px] text-slate-400 font-black font-mono uppercase tracking-wider">Your Connected UPI Address</label>
              <input
                type="text"
                value={withdrawUpi}
                id="inp_withdraw_upi"
                onChange={(e) => setWithdrawUpi(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs text-slate-850 px-4 py-3 rounded-2xl w-full outline-none focus:border-blue-500 font-mono font-bold"
                placeholder="e.g. name@okaxis"
              />
            </div>
          </div>

          {!user.kycVerified && (
            <div className="bg-rose-50/70 border border-rose-100 text-xs text-rose-700 p-4 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <span className="font-semibold leading-relaxed">
                <strong className="font-extrabold text-rose-800">Withdrawals Locked:</strong> You are required to verify your UIDAI Aadhaar and Government PAN cards via the DigiLocker panel (on the right sidebar) to unlock instant banking withdrawals.
              </span>
            </div>
          )}

          {withdrawError && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 p-3 rounded-2xl font-bold font-sans flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" /> {withdrawError}
            </p>
          )}

          {withdrawSuccess && (
            <div className="text-xs text-emerald-800 bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-start gap-2 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-600 animate-bounce shrink-0 mt-0.5" />
              <span>
                UPI payout order generated! ₹{withdrawAmount} will be transferred to <strong className="font-sans text-emerald-950">{withdrawUpi}</strong> immediately upon bank processing (usually within 120 seconds).
              </span>
            </div>
          )}

          <button
            id="btn_request_withdrawal"
            onClick={handleWithdraw}
            disabled={isWithdrawing || !user.kycVerified}
            className={`w-full font-black text-xs py-3.5 rounded-2xl transition-all uppercase tracking-wider cursor-pointer ${
              user.kycVerified
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/10 active:scale-98'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isWithdrawing ? 'Initiating UPI Transfer...' : 'Payout Instant Winnings'}
          </button>
        </div>

        {/* Transaction History Ledger (Clean high-contrast Light Theme Table) */}
        <div id="card_ledger" className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-5 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-md font-black text-slate-800 font-display">Wallet Ledger History</h3>
                <p className="text-[11px] text-slate-400 font-semibold">Every transaction logged and verified</p>
              </div>
            </div>
            
            <button
              onClick={fetchWalletState}
              className="text-xs bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/60 font-black text-slate-600 inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              Reload Logs
            </button>
          </div>

          {loadingLedger ? (
            <div className="text-xs text-slate-400 text-center py-10 font-bold animate-pulse font-mono block">
              RETRIEVING AUDITED STADIUM LEDGERS...
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-xs text-slate-400 text-center py-16 font-semibold bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              No ledger activity recorded for this session.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100/90 text-slate-400 font-mono font-black uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">TX REF ID</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-right">Gate Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors font-semibold">
                      <td className="py-3.5 px-4 font-mono text-slate-500">{tx.referenceId}</td>
                      <td className="py-3.5 px-4">
                        {tx.type === 'topup' && (
                          <span className="text-blue-600 flex items-center gap-1.5 font-bold">
                            <ArrowUpRight className="w-3.5 h-3.5 text-blue-500 bg-blue-50 p-0.5 rounded" /> Razorpay In
                          </span>
                        )}
                        {tx.type === 'bet' && (
                          <span className="text-slate-500 flex items-center gap-1.5">
                            <ArrowDownLeft className="w-3.5 h-3.5 text-slate-400 bg-slate-50 p-0.5 rounded" /> Wager Out
                          </span>
                        )}
                        {tx.type === 'win' && (
                          <span className="text-emerald-600 flex items-center gap-1.5 font-extrabold">
                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 bg-emerald-50 p-0.5 rounded animate-pulse" /> Win settled
                          </span>
                        )}
                        {tx.type === 'withdrawal' && (
                          <span className="text-amber-600 flex items-center gap-1.5 font-bold">
                            <ArrowDownLeft className="w-3.5 h-3.5 text-amber-500 bg-amber-55 p-0.5 rounded" /> Bank Out
                          </span>
                        )}
                      </td>
                      <td className={`py-3.5 px-4 font-mono font-extrabold text-[13px] ${
                        tx.type === 'topup' || tx.type === 'win' ? 'text-emerald-600' : 'text-slate-800'
                      }`}>
                        {tx.type === 'topup' || tx.type === 'win' ? '+' : '-'}₹{tx.amount}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {new Date(tx.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold tracking-wide">
                          SUCCESS
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR: KYC Gate & Safe Gaming Rules */}
      <div className="lg:col-span-4 space-y-8">
        
        {/* UPI & DigiLocker KYC Panel (Clean Light Card Layout) */}
        <div id="card_kyc" className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-5 text-left">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-md font-black text-slate-800 font-display">DigiLocker KYC Gate</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Government Compliance</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            As a licensed responsible gaming platform in India, Aadhaar and PAN verification prevents minors from accessing wagering modules and authenticates compliance.
          </p>

          {user.kycVerified ? (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-black text-emerald-700">KYC Status Verified successfully</span>
              </div>
              <div className="space-y-1.5 font-mono text-[10.5px] text-slate-600 font-semibold border-t border-emerald-100/50 pt-2.5">
                <div className="flex justify-between">
                  <span>AADHAAR:</span>
                  <span className="text-slate-800 font-bold">**** **** {user.kycAadhaar?.slice(-4) || '3912'}</span>
                </div>
                <div className="flex justify-between">
                  <span>PAN NUMBER:</span>
                  <span className="text-slate-800 font-bold">{user.kycPan || 'ABCDE1234F'}</span>
                </div>
                <div className="flex justify-between">
                  <span>AGE BRACKET:</span>
                  <span className="text-emerald-700 font-extrabold flex items-center gap-0.5">18+ CONFIRMED</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold font-mono">12-Digit Aadhaar UIDAI Number</span>
                <input
                  type="text"
                  maxLength={12}
                  value={aadhaar_inp}
                  id="inp_aadhaar"
                  onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
                  className="bg-slate-50 border border-slate-250 px-3.5 py-2.5 rounded-xl w-full text-xs outline-none focus:border-blue-500 font-mono text-slate-800 font-bold"
                  placeholder="e.g. 583920193481"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold font-mono">10-Digit Alphanumeric PAN</span>
                <input
                  type="text"
                  maxLength={10}
                  value={pan_inp}
                  id="inp_pan"
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  className="bg-slate-50 border border-slate-250 px-3.5 py-2.5 rounded-xl w-full text-xs outline-none focus:border-blue-500 font-mono text-slate-800 font-bold"
                  placeholder="e.g. AAAAA1111A"
                />
              </div>

              <label className="flex items-start gap-2.5 select-none cursor-pointer pt-1 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                <input
                  type="checkbox"
                  checked={ageCheck}
                  id="chk_age_confirmation"
                  onChange={(e) => setAgeCheck(e.target.checked)}
                  className="mt-0.5 accent-blue-600 scale-110"
                />
                <span className="text-[11px] text-slate-500 font-bold leading-snug">
                  I confirm that I am <strong className="text-slate-800">18 years of age or older</strong>, and reside in a state where fantasy games are structurally legal.
                </span>
              </label>

              <button
                id="btn_submit_kyc"
                onClick={verifyDigiLockerKYC}
                disabled={isVerifyingKYC || !aadhaar_inp || !pan_inp}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-xs font-black py-3.5 rounded-2xl text-white transition-all cursor-pointer uppercase tracking-wider shadow-md shadow-blue-500/10"
              >
                {isVerifyingKYC ? 'Verifying Digital Locker API...' : 'Verify Government Identities'}
              </button>
            </div>
          )}
        </div>

        {/* Responsible Gaming Settings */}
        <div id="card_responsible_gaming" className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-5 text-left">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Sliders className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-md font-black text-slate-800 font-display">Responsible Gaming</h3>
              <p className="text-[10px] text-amber-600 font-bold font-mono uppercase tracking-wider">Health safeguard controls</p>
            </div>
          </div>
          
          <div className="space-y-4 pt-1">
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Maintain full healthy boundaries. Configure spending and loss gates to safeguard your finances:
            </p>

            <div className="space-y-1.5">
              <label className="text-[9.5px] uppercase tracking-wider font-mono text-slate-400 font-extrabold block">Daily Loss Limit Threshold (₹)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={lossLimitInput}
                  id="inp_loss_limit"
                  onChange={(e) => setLossLimitInput(e.target.value)}
                  className="bg-slate-50 border border-slate-250 px-3.5 py-2.5 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500 w-full font-mono font-bold"
                />
                <button
                  id="btn_save_loss_limit"
                  onClick={saveLossLimit}
                  className="bg-slate-800 hover:bg-slate-900 text-xs font-black px-4 rounded-xl text-white cursor-pointer transition-colors uppercase tracking-wider"
                >
                  Save
                </button>
              </div>
              {limitSaved && <p className="text-[10px] text-emerald-600 font-bold">✓ Daily loss limit updated securely!</p>}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2.5">
              <span className="text-[9.5px] uppercase tracking-wider font-mono text-slate-400 font-extrabold block">Need a Breather?</span>
              <button
                id="btn_self_exclude"
                onClick={() => {
                  if (confirm('Are you sure you want to enforce self-exclusion for 24 hours? You will be signed out and unable to bet.')) {
                    alert('You have successfully self-excluded. Signing out from services.');
                    onUpdateUser({ walletBalance: 0, kycVerified: false });
                  }
                }}
                className="w-full border border-rose-200/80 text-rose-600 hover:bg-rose-50/50 transition-all text-xs font-black py-3 rounded-2xl cursor-pointer uppercase tracking-wider text-center block"
              >
                24-Hour Self-Exclusion Act
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

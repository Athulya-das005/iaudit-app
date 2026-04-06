import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  CheckCircle2, 
  ArrowRight, 
  Shield, 
  Calendar, 
  CreditCard, 
  Loader2, 
  Zap, 
  AlertTriangle,
  Info,
  ChevronRight,
  HandHeart,
  Ban
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/config";

interface SessionDetails {
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
  amount: string;
  currency: string;
  isMonthly: boolean;
  subscriptionId: string | null;
}

type ModalStep = 'SUCCESS' | 'RENEWAL_PROMPT' | 'OPTIONS' | 'AUTOPAY_CONSENT' | 'MANUAL_WARNING' | 'FINISH';

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<SessionDetails | null>(null);
  const [step, setStep] = useState<ModalStep>('SUCCESS');
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    sessionStorage.removeItem('hasClosedExpiredModal');
    
    if (sessionId) {
      fetch(`${API_BASE_URL}/api/stripe/session/${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setDetails(data);
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            localStorage.setItem("user", JSON.stringify({
              ...parsedUser,
              subscriptionStatus: 'active',
              subscriptionPlan: data.plan
            }));
          }
        })
        .catch(err => console.error("Session fetch error:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const savePreference = async (renewalType: 'AUTOPAY' | 'MANUAL', consent: boolean) => {
    const userId = user?.id || user?._id || user?.userId;
    if (!userId || !details) {
      console.error("❌ [PREFERENCE] Missing user identity or session details", { user, details });
      // Fallback: move to finish anyway to allow dashboard access
      setStep('FINISH');
      return;
    }

    setSaving(true);
    console.log(`⏳ [PREFERENCE] Saving ${renewalType} for user ${userId}...`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/subscription-preference`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          renewalType,
          autopayConsent: consent,
          subscriptionId: details.subscriptionId
        })
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      console.log("✅ [PREFERENCE] Saved successfully");
      setStep('FINISH');
    } catch (err: any) {
      console.warn("⚠️ [PREFERENCE] API error, proceeding to finish screen anyway:", err.message);
      setStep('FINISH');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (step === 'SUCCESS') {
      if (details?.isMonthly) {
        setStep('RENEWAL_PROMPT');
      } else {
        navigate('/subscription');
      }
    } else if (step === 'RENEWAL_PROMPT') {
      setStep('OPTIONS');
    }
  };

  const currentModal = useMemo(() => {
    if (loading) return (
      <div className="py-20 flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#1e855e]" />
        <p className="text-slate-500 font-medium">Finalising your subscription...</p>
      </div>
    );

    if (!details) return (
      <div className="py-8 text-center bg-amber-50 rounded-2xl border border-amber-100 m-8">
        <p className="text-amber-700 text-sm px-4">
          Verification in progress. Your plan will be active shortly.
        </p>
        <Button onClick={() => navigate('/subscription')} className="mt-4 bg-slate-900 text-white px-8">
          Go to Subscription Page
        </Button>
      </div>
    );

    switch (step) {
      case 'SUCCESS':
        return (
          <div className="animate-in fade-in zoom-in duration-500">
            <div className="bg-[#f0fdf4] py-12 flex flex-col items-center">
              <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-[#1e855e]" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payment Successful!</h1>
              <p className="text-[#1e855e] text-sm font-bold uppercase tracking-wider">High Fidelity Activated ✅</p>
            </div>
            <div className="p-8 space-y-6">
              <p className="text-slate-500 text-center text-sm leading-relaxed">
                Thank you for subscribing to <span className="font-bold text-slate-900">{details.plan}</span>. 
                Your premium dashboard is now fully unlocked.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <Shield className="w-3.5 h-3.5 text-slate-400 mb-2" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Plan</p>
                  <p className="text-sm font-black text-slate-900">{details.plan}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400 mb-2" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Paid</p>
                  <p className="text-sm font-black text-slate-900">{details.currency === 'GBP' ? '£' : '$'}{details.amount}</p>
                </div>
              </div>
              <Button onClick={handleNext} className="w-full bg-[#1e855e] hover:bg-[#16654b] text-white py-7 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#1e855e]/20 group transition-all">
                {details.isMonthly ? "Next: Setup Renewal" : "Go to Subscription Page"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        );

      case 'RENEWAL_PROMPT':
        return (
          <div className="p-8 animate-in slide-in-from-right duration-500">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
              < Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-4 leading-tight">One Last Step: <br/>Renewal Method</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              To ensure your account stays active without interruption, please set your preferred monthly renewal method.
            </p>
            <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl mb-8 flex gap-4">
               <Info className="w-5 h-5 text-blue-600 shrink-0" />
               <p className="text-xs font-medium text-blue-800 leading-normal">
                 Please note: Once your renewal method is set, it cannot be changed for this billing cycle.
               </p>
            </div>
            <Button onClick={() => setStep('OPTIONS')} className="w-full bg-slate-900 text-white py-7 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl">
              Set My Renewal Method
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        );

      case 'OPTIONS':
        return (
          <div className="p-8 animate-in slide-in-from-right duration-500">
            <h2 className="text-xl font-black text-slate-900 mb-2">How would you like to pay?</h2>
            <p className="text-slate-400 text-xs mb-8 uppercase font-bold tracking-widest">Select your renewal preference</p>
            
            <div className="space-y-4 mb-8">
              <button 
                onClick={() => setStep('AUTOPAY_CONSENT')}
                className="w-full group text-left p-6 rounded-3xl border-2 border-slate-100 hover:border-[#1e855e] hover:bg-[#f0fdf4]/30 transition-all flex items-center gap-5 active:scale-[0.98]"
              >
                <div className="w-12 h-12 bg-slate-50 group-hover:bg-white rounded-2xl flex items-center justify-center transition-colors">
                  <CreditCard className="w-6 h-6 text-slate-400 group-hover:text-[#1e855e]" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-slate-900 leading-none mb-1 text-sm">Autopay (Recommended)</p>
                  <p className="text-xs text-slate-400 font-medium">Automatic monthly debit from your card</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-[#1e855e]" />
              </button>

              <button 
                onClick={() => setStep('MANUAL_WARNING')}
                className="w-full group text-left p-6 rounded-3xl border-2 border-slate-100 hover:border-amber-500 hover:bg-amber-50/30 transition-all flex items-center gap-5 active:scale-[0.98]"
              >
                <div className="w-12 h-12 bg-slate-50 group-hover:bg-white rounded-2xl flex items-center justify-center transition-colors">
                  <HandHeart className="w-6 h-6 text-slate-400 group-hover:text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-slate-900 leading-none mb-1 text-sm">Pay Manually</p>
                  <p className="text-xs text-slate-400 font-medium">Pay via email invoice before expiry</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-amber-500" />
              </button>
            </div>

            <button onClick={() => setStep('RENEWAL_PROMPT')} className="text-slate-400 text-sm font-bold w-full text-center hover:text-slate-600 transition-colors">
              Go Back
            </button>
          </div>
        );

      case 'AUTOPAY_CONSENT':
        return (
          <div className="p-8 animate-in slide-in-from-bottom duration-500">
            <div className="w-16 h-16 bg-[#f0fdf4] rounded-2xl flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-[#1e855e]" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-4 leading-tight text-center">Autopay Consent</h2>
            <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100">
              <p className="text-slate-600 text-[13px] leading-relaxed mb-4">
                By enabling Autopay, you agree to allow <strong>iAudit Global</strong> to automatically debit the subscription amount (<span className="font-bold text-slate-900">{details.currency === 'GBP' ? '£' : '$'}{details.amount}</span>) from your primary payment method on each billing date.
              </p>
              <ul className="space-y-2 text-[12px] text-slate-400 font-medium">
                <li className="flex gap-2">✅ Securely encrypted transactions</li>
                <li className="flex gap-2">✅ Fixed for your current billing period</li>
                <li className="flex gap-2">✅ Zero interruption to your features</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <Button 
                disabled={saving}
                onClick={() => savePreference('AUTOPAY', true)}
                className="w-full bg-[#1e855e] hover:bg-[#16654b] text-white py-7 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "I Agree & Proceed"}
              </Button>
              <Button onClick={() => setStep('OPTIONS')} variant="ghost" className="w-full text-slate-400 hover:text-slate-600 font-bold py-4">
                Change to Manual Pay
              </Button>
            </div>
          </div>
        );

      case 'MANUAL_WARNING':
        return (
          <div className="p-8 animate-in slide-in-from-bottom duration-500">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-4 leading-tight">Important Notice</h2>
            <div className="bg-amber-50/50 border border-amber-200/50 rounded-3xl p-6 mb-8 space-y-4">
              <div className="flex gap-3">
                 <Ban className="w-5 h-5 text-amber-600 shrink-0" />
                 <p className="text-slate-700 text-sm font-bold leading-tight">Account Suspension Risk</p>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                If the renewal amount is not paid by the billing date, your account will be **automatically suspended**. You will lose access to all premium features until payment is completed.
              </p>
              <div className="pt-2 border-t border-amber-200/40">
                <p className="text-[12px] text-amber-700 italic">
                  * Please check your "Subscription Details" page regularly for payment reminders.
                </p>
              </div>
            </div>
            <Button 
              disabled={saving}
              onClick={() => savePreference('MANUAL', false)}
              className="w-full bg-slate-900 text-white py-7 rounded-2xl font-black flex items-center justify-center gap-2 shadow-2xl transition-all active:scale-[0.98]"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "I Understand & Proceed"}
            </Button>
          </div>
        );

      case 'FINISH':
        return (
          <div className="p-8 text-center animate-in zoom-in duration-500">
             <div className="w-20 h-20 bg-[#f0fdf4] rounded-full flex items-center justify-center mx-auto mb-6">
              <HandHeart className="w-10 h-10 text-[#1e855e]" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Thanks for Subscribing!</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium">
              Your subscription is now active! You can now continue auditing with your premium features. We are excited to support your journey.
            </p>
            <Button 
              type="button"
              onClick={() => {
                console.log("🚀 [NAVIGATION] Finalizing and going to subscription page");
                navigate('/subscription', { replace: true });
              }}
              className="w-full bg-[#1e855e] hover:bg-[#16654b] text-white py-8 rounded-3xl font-black text-lg shadow-xl shadow-[#1e855e]/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              Finish
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        );
    }
  }, [step, loading, details, saving, navigate]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-700">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-slate-100 overflow-hidden relative">
        {currentModal}
        
        {!loading && step !== 'FINISH' && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {['SUCCESS', 'RENEWAL_PROMPT', 'OPTIONS', 'CONSENT', 'FINISH'].map((s, i) => {
               // Simple dots indicator logic
               const steps = ['SUCCESS', 'RENEWAL_PROMPT', 'OPTIONS', 'AUTOPAY_CONSENT', 'MANUAL_WARNING', 'FINISH'];
               const currentIdx = steps.indexOf(step);
               if (i > 3) return null;
               return <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i <= currentIdx ? 'w-4 bg-[#1e855e]' : 'w-1 bg-slate-200'}`} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

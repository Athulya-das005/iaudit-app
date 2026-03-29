import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, ArrowRight, Shield, Calendar, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/config";

interface SessionDetails {
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
  amount: string;
  currency: string;
}

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<SessionDetails | null>(null);

  useEffect(() => {
    // Clear the modal session flag so checking status again shows the app correctly
    sessionStorage.removeItem('hasClosedExpiredModal');
    
    if (sessionId) {
      fetch(`${API_BASE_URL}/api/stripe/session/${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setDetails(data);
          // Update local status
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const user = JSON.parse(storedUser);
            localStorage.setItem("user", JSON.stringify({
              ...user,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500">
        
        {/* Success Icon Header */}
        <div className="bg-[#f0fdf4] py-12 flex flex-col items-center">
          <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 text-[#1e855e]" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payment Successful!</h1>
          <p className="text-[#1e855e] text-sm font-bold uppercase tracking-wider">Plan Activated ✅</p>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="py-12 flex flex-col items-center gap-4 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm">Retrieving your plan details...</p>
            </div>
          ) : details ? (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  You are now subscribed to the <span className="font-bold text-slate-900">{details.plan} Plan</span>. 
                  Your premium features are now unlocked and ready to use.
                </p>
                
                {/* Detail Pills */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Shield className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wide">Plan Name</span>
                    </div>
                    <p className="text-sm font-black text-slate-900">{details.plan}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wide">Amount Paid</span>
                    </div>
                    <p className="text-sm font-black text-slate-900">
                      {details.currency === 'GBP' ? '£' : '$'}{details.amount}
                    </p>
                  </div>
                  {details.currentPeriodEnd && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left col-span-2">
                       <div className="flex items-center gap-2 text-[#1e855e] mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">Next Billing Date</span>
                      </div>
                      <p className="text-sm font-black text-slate-900">
                        {new Date(details.currentPeriodEnd).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-[#1e855e] hover:bg-[#16654b] text-white py-7 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#1e855e]/20 transition-all active:scale-[0.98]"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={() => navigate('/subscription-details')}
                  variant="ghost"
                  className="w-full text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-bold py-6 rounded-2xl"
                >
                  View Subscription
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center bg-amber-50 rounded-2xl border border-amber-100">
              <p className="text-amber-700 text-sm px-4">
                We couldn't load your specific plan details, but your payment was processed successfully.
              </p>
              <Button 
                 onClick={() => navigate('/dashboard')}
                 className="mt-4 bg-slate-900 text-white"
              >
                Continue to App
              </Button>
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Transaction Ref: <span className="font-mono text-slate-300">{sessionId?.substring(0, 20)}...</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  CreditCard, 
  Calendar, 
  Shield, 
  Download, 
  ArrowUpCircle, 
  CheckCircle2, 
  Clock,
  AlertCircle,
  Loader2,
  FileText,
  ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { API_BASE_URL } from "@/config";
import { cn } from "@/lib/utils";

interface Invoice {
  id: string;
  date: string;
  amount: string;
  currency: string;
  status: string;
  invoice_url: string;
  number: string;
}

interface UserStatus {
  subscriptionStatus: string;
  subscriptionPlan: string;
  trialStartDate: string | null;
  trialEndDate: string | null;
  planStartDate: string | null;
  planExpiryDate: string | null;
  nextBillingDate: string | null;
  stripePriceId: string | null;
  email: string;
  firstName: string;
  lastName: string;
}

export default function SubscriptionDetails() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [status, setStatus] = useState<UserStatus | null>(null);
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?.id || user?._id;

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [statusRes, invoicesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/users/${userId}/status`),
          fetch(`${API_BASE_URL}/api/subscription/invoices/${userId}`)
        ]);

        const statusData = await statusRes.json();
        const invoicesData = await invoicesRes.json();

        setStatus(statusData);
        setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      } catch (error) {
        console.error("Failed to fetch subscription data:", error);
        toast({
          title: "Error",
          description: "Failed to load subscription details.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, navigate, toast]);

  const handleUpdatePayment = async () => {
    setIsPortalLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/portal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to open billing portal");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsPortalLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e855e]" />
      </div>
    );
  }

  const isMonthly = status?.stripePriceId?.includes('monthly') || status?.nextBillingDate != null;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/subscription")}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h1 className="text-xl font-bold text-slate-900">Subscription Details</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className={cn(
               "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
               status?.subscriptionStatus === 'active' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
             )}>
               {status?.subscriptionStatus}
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-8">
        {/* Main Plan Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-5 h-5 text-[#1e855e]" />
                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">Current Plan</span>
                  </div>
                  <h2 className="text-3xl font-black text-slate-900">
                    {status?.subscriptionPlan?.toUpperCase() || "FREE TRIAL"}
                  </h2>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">
                    {isMonthly ? "Monthly Billing" : "Yearly/Contract"}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Flexible Subscription
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 pt-8 border-t border-slate-100">
                <div>
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase">Started On</span>
                  </div>
                  <p className="text-[15px] font-bold text-slate-800">
                    {formatDate(status?.planStartDate || status?.trialStartDate || null)}
                  </p>
                </div>
                
                {status?.nextBillingDate && (
                  <div>
                    <div className="flex items-center gap-2 text-[#1e855e] mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase">Next Billing</span>
                    </div>
                    <p className="text-[15px] font-bold text-slate-900">
                      {formatDate(status.nextBillingDate)}
                    </p>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 text-amber-600 mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase">Expires On</span>
                  </div>
                  <p className="text-[15px] font-bold text-slate-800">
                    {formatDate(status?.planExpiryDate || status?.trialEndDate || null)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate("/subscription")}
                className="w-full justify-start gap-3 bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-2xl"
              >
                <ArrowUpCircle className="w-5 h-5" />
                Upgrade Plan
              </Button>
              <Button 
                onClick={handleUpdatePayment}
                disabled={isPortalLoading}
                variant="outline"
                className="w-full justify-start gap-3 border-slate-200 hover:bg-slate-50 py-6 rounded-2xl"
              >
                {isPortalLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CreditCard className="w-5 h-5 text-slate-600" />
                )}
                Update Payment
              </Button>
            </div>
            
            <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Shield className="w-4 h-4 text-[#1e855e]" />
                <span className="text-xs font-bold uppercase">Security</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Secure payments powered by Stripe. Your data is encrypted and managed according to highest security standards.
              </p>
            </div>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Billing History</h3>
              <p className="text-sm text-slate-500">View and download your past invoices</p>
            </div>
            <FileText className="w-6 h-6 text-slate-300" />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice #</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.length > 0 ? invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="text-sm font-bold text-slate-900">
                        {new Date(invoice.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm text-slate-600 font-mono">{invoice.number}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-black text-slate-900">
                        {invoice.currency === 'GBP' ? '£' : '$'}{invoice.amount}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                        invoice.status === 'paid' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {invoice.status === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <a 
                        href={invoice.invoice_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-bold text-[#1e855e] hover:text-[#16654b] transition-colors bg-[#f0fdf4] px-4 py-2 rounded-xl border border-[#1e855e]/10 group-hover:shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                          <FileText className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-sm text-slate-500">No invoices found for this account.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

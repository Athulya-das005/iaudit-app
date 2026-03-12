import React, { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PricingPlan {
  name: string;
  price: {
    usd: {
      "1year": string;
      "3years": string;
      "6years": string;
    };
    gbp: {
      "1year": string;
      "3years": string;
      "6years": string;
    };
  };
  features: string[];
  cta: string;
  highlight?: boolean;
}

const plans: PricingPlan[] = [
  {
    name: "Free",
    price: {
      usd: { "1year": "0", "3years": "0", "6years": "0" },
      gbp: { "1year": "0", "3years": "0", "6years": "0" },
    },
    features: [
      "Gap Analysis",
      "Self Assessment",
      "Findings Dashboard",
      "Data Analytics Summary",
      "Report Download",
    ],
    cta: "Start for Free",
  },
  {
    name: "Unos",
    price: {
      usd: { "1year": "15.60", "3years": "11.60", "6years": "7.60" },
      gbp: { "1year": "12.50", "3years": "9.30", "6years": "6.10" },
    },
    features: [
      "NC Register",
      "Unlimited audits (1 ISO)",
      "Excel, PDF & Word Reports",
      "Role based accesses",
      "Schedule, track & manage audits",
      "Audit mate AI",
      "Audit Evidence Capture",
    ],
    cta: "Get Started",
  },
  {
    name: "Dos",
    price: {
      usd: { "1year": "25.90", "3years": "22.90", "6years": "18.90" },
      gbp: { "1year": "20.70", "3years": "18.30", "6years": "15.10" },
    },
    features: [
      "All features of Starter",
      "Multi-site audits (2 ISO)",
      "NC Dashboards",
      "Priority Email Support",
      "Multi-site Dashboards",
    ],
    cta: "Get Started",
    highlight: true,
  },
  {
    name: "Tres",
    price: {
      usd: { "1year": "30.10", "3years": "25.10", "6years": "21.10" },
      gbp: { "1year": "24.10", "3years": "20.10", "6years": "16.90" },
    },
    features: [
      "AI features of Advanced",
      "Up to 10 sites (3 ISO)",
      "Audit Performance Analytics",
      "Custom Checklists",
      "Dedicated Account Manager",
    ],
    cta: "Get Started",
  },
];

type Duration = "1year" | "3years" | "6years";
type Currency = "usd" | "gbp";

export default function Subscription() {
  const [duration, setDuration] = useState<Duration>("1year");
  const [currency, setCurrency] = useState<Currency>("usd");

  const getPrice = (plan: PricingPlan) => {
    return plan.price[currency][duration];
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Currency Toggle */}
        <div className="flex bg-white rounded-full p-1 border border-slate-200 shadow-sm mb-8">
          <button
            onClick={() => setCurrency("usd")}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200",
              currency === "usd" ? "bg-[#1e855e] text-white shadow-md" : "text-slate-500 hover:text-slate-700"
            )}
          >
            $ USD
          </button>
          <button
            onClick={() => setCurrency("gbp")}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200",
              currency === "gbp" ? "bg-[#1e855e] text-white shadow-md" : "text-slate-500 hover:text-slate-700"
            )}
          >
            £ GBP
          </button>
        </div>

        {/* Contract Billing Label */}
        <div className="mb-6">
          <span className="bg-[#f0fdf4] text-[#1e855e] px-6 py-2 rounded-full border border-[#1e855e]/20 text-sm font-bold">
            Contract Billing
          </span>
        </div>

        {/* Duration Toggle */}
        <div className="flex gap-4 mb-16 items-center">
          <button
            onClick={() => setDuration("1year")}
            className={cn(
              "px-8 py-2 rounded-full text-sm font-bold transition-all duration-200 border",
              duration === "1year" 
                ? "bg-[#1e855e] text-white border-[#1e855e] shadow-lg scale-105" 
                : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
            )}
          >
            1 Year
          </button>
          <button
            onClick={() => setDuration("3years")}
            className={cn(
              "px-8 py-2 rounded-full text-sm font-bold transition-all duration-200 border",
              duration === "3years" 
                ? "bg-[#1e855e] text-white border-[#1e855e] shadow-lg scale-105" 
                : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
            )}
          >
            3 Years
          </button>
          <button
            onClick={() => setDuration("6years")}
            className={cn(
              "px-8 py-2 rounded-full text-sm font-bold transition-all duration-200 border relative",
              duration === "6years" 
                ? "bg-[#1e855e] text-white border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] scale-105" 
                : "bg-white text-[#eab308] border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)]"
            )}
          >
            6 Years
          </button>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "bg-white rounded-[2rem] p-8 flex flex-col border transition-all duration-300 hover:shadow-xl",
                plan.highlight 
                  ? "border-[#1e855e] border-2 scale-105 shadow-lg z-10" 
                  : "border-slate-100 shadow-sm"
              )}
            >
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-slate-800 mb-6">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">
                    {currency === "usd" ? "$" : "£"}{getPrice(plan)}
                  </span>
                  <span className="text-slate-400 text-sm">/mo per user</span>
                </div>
              </div>

              <Button
                className={cn(
                  "w-full py-6 rounded-xl font-bold mb-10 transition-all duration-200",
                  plan.highlight
                    ? "bg-[#1e855e] hover:bg-[#16654b] text-white shadow-md"
                    : "bg-white border border-slate-200 text-slate-800 hover:bg-slate-50"
                )}
              >
                {plan.cta}
              </Button>

              <ul className="space-y-4 flex-grow">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 bg-[#f0fdf4] rounded-full p-0.5">
                      <Check className="h-3.5 w-3.5 text-[#1e855e] stroke-[3]" />
                    </div>
                    <span className="text-sm text-slate-600 leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

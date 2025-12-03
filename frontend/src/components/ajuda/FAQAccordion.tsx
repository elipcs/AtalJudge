"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  title?: string;
}

export default function FAQAccordion({ items, title }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Card className="p-6 bg-white border-slate-200 rounded-3xl">
      {title && (
        <h2 className="text-2xl font-semibold text-slate-900 mb-6">{title}</h2>
      )}

      <div className="w-full space-y-3">
        {items.map((item, index) => (
          <div key={index}>
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors text-left"
            >
              <span className="font-medium text-slate-900">{item.question}</span>
              <ChevronDown
                size={20}
                className={`text-slate-600 transition-transform flex-shrink-0 ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>

            {openIndex === index && (
              <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg border-t-0">
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

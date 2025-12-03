"use client";

import { Card } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";
import { ReactNode } from "react";

interface Step {
  title: string;
  description: string;
  content?: ReactNode;
}

interface StepGuideProps {
  steps: Step[];
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

export default function StepGuide({
  steps,
  currentStep = 0,
  onStepChange,
}: StepGuideProps) {
  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {steps.map((step, index) => (
          <button
            key={index}
            onClick={() => onStepChange?.(index)}
            className="flex items-center gap-2 flex-shrink-0 cursor-pointer transition-all"
          >
            {index <= currentStep ? (
              <CheckCircle2 className="text-green-600" size={24} />
            ) : (
              <Circle className="text-slate-300" size={24} />
            )}
            <span
              className={`text-sm font-medium whitespace-nowrap ${
                index <= currentStep ? "text-green-600" : "text-slate-500"
              }`}
            >
              Passo {index + 1}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <Card className="p-8 bg-gradient-to-br from-blue-50 to-white border-slate-200 rounded-3xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
            {currentStep + 1}
          </div>
          <h3 className="text-2xl font-semibold text-slate-900">
            {steps[currentStep].title}
          </h3>
        </div>

        <p className="text-slate-700 mb-6 leading-relaxed">
          {steps[currentStep].description}
        </p>

        {steps[currentStep].content && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 mt-6">
            {steps[currentStep].content}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4 mt-8 justify-between">
          <button
            onClick={() => onStepChange?.(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-6 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ← Anterior
          </button>
          <button
            onClick={() =>
              onStepChange?.(Math.min(steps.length - 1, currentStep + 1))
            }
            disabled={currentStep === steps.length - 1}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Próximo →
          </button>
        </div>
      </Card>
    </div>
  );
}

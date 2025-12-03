"use client";

import { Card } from "@/components/ui/card";
import { Lightbulb, AlertCircle, CheckCircle, Info } from "lucide-react";
import { ReactNode } from "react";

type TipType = "tip" | "warning" | "success" | "info";

interface TipBoxProps {
  type: TipType;
  title: string;
  children: ReactNode;
}

const typeConfig = {
  tip: {
    icon: Lightbulb,
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    titleColor: "text-amber-900",
    iconColor: "text-amber-600",
  },
  warning: {
    icon: AlertCircle,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    titleColor: "text-red-900",
    iconColor: "text-red-600",
  },
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    titleColor: "text-green-900",
    iconColor: "text-green-600",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    titleColor: "text-blue-900",
    iconColor: "text-blue-600",
  },
};

export default function TipBox({ type, title, children }: TipBoxProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <Card
      className={`p-4 border ${config.bgColor} ${config.borderColor} rounded-xl`}
    >
      <div className="flex gap-3">
        <Icon className={`flex-shrink-0 ${config.iconColor}`} size={20} />
        <div className="flex-1">
          <p className={`font-semibold ${config.titleColor} mb-2`}>{title}</p>
          <div className={`text-sm ${config.titleColor} opacity-90`}>
            {children}
          </div>
        </div>
      </div>
    </Card>
  );
}

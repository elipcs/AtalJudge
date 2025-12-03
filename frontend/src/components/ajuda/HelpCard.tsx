"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { ReactNode } from "react";

interface HelpCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  className?: string;
}

export default function HelpCard({
  title,
  description,
  icon,
  href,
  className = "",
}: HelpCardProps) {
  return (
    <Link href={href}>
      <Card
        className={`p-6 h-full hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer bg-white border-slate-200 rounded-3xl ${className}`}
      >
        <div className="flex items-start gap-4">
          <div className="text-3xl text-blue-600 flex-shrink-0">{icon}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-slate-900 mb-2">
              {title}
            </h3>
            <p className="text-sm text-slate-600 line-clamp-2">{description}</p>
          </div>
          <ArrowRight className="text-slate-400 flex-shrink-0 mt-1" size={20} />
        </div>
      </Card>
    </Link>
  );
}

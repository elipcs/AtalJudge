"use client";
import { Button } from "../ui/button";

interface AuthFooterProps {
  links: Array<{
    text: string;
    href: string;
    variant?: "default" | "outline" | "ghost";
  }>;
  className?: string;
}

export function AuthFooter({ links, className = "" }: AuthFooterProps) {
  return (
    <div className={`flex flex-col sm:flex-row justify-between items-center mt-4 sm:mt-6 gap-3 sm:gap-4 text-sm ${className}`}>
      {links.map((link, index) => (
        <Button
          key={index}
          type="button"
          variant={link.variant || "ghost"}
          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors p-0 h-auto font-normal"
          onClick={() => window.location.href = link.href}
        >
          {link.text}
        </Button>
      ))}
    </div>
  );
}

"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 sm:p-12 text-center">
          {}
          <div className="mb-8 flex justify-center">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg border border-blue-200">
              <svg
                className="w-16 h-16 text-white"
                fill="none"
                stroke="white"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 17h.01M9 9a3 3 0 116 0c0 1.657-1.343 2.5-2.5 3.5-.5.4-.5.9-.5 1.5M12 21a9 9 0 110-18 9 9 0 010 18z"
                />
              </svg>
            </div>
          </div>

          {}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4 leading-tight">
                Página não encontrada
              </h1>
              <p className="text-slate-600 text-lg sm:text-xl leading-relaxed max-w-lg mx-auto">
                Ops! A página que você está procurando não existe ou foi movida para outro lugar.
              </p>
            </div>

            {}
            <Link href="/" className="w-full block">
              <Button size="lg" className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm hover:shadow-md font-semibold transition-all duration-200 transform hover:scale-[1.02]">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Voltar para Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
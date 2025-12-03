"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "./index";
import { Button } from "../ui/button";

export function ResetPasswordSuccess() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <AuthLayout 
      title="Senha redefinida com sucesso!"
      subtitle={`Você será redirecionado para a página de login em ${countdown} segundo${countdown !== 1 ? 's' : ''}...`}
      showLogo={false}
    >
      <div className="text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <p className="text-slate-600 text-sm">
          Sua senha foi redefinida com sucesso! Agora você pode fazer login com sua nova senha.
        </p>
        
        <Link href="/login">
          <Button size="lg" className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
            Ir para o login agora
          </Button>
        </Link>
      </div>
    </AuthLayout>
  );
}

"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 sm:p-12 text-center">
          {}
          <div className="mb-8 flex justify-center items-center gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-blue-600 rounded-xl shadow-lg border border-blue-200 leading-tight">
              <svg
                className="w-16 h-16 text-blue-600"
                fill="white"
                stroke="none"
                viewBox="0 0 500 500"
              >
                <g transform="translate(0,500) scale(0.1,-0.1)">
                  <path d="M2486 4613 c-39 -10 -93 -53 -195 -154 -115 -115 -140 -158 -141 -238 0 -85 25 -124 173 -266 73 -70 195 -188 272 -263 77 -76 199 -193 270 -261 72 -69 186 -179 255 -246 145 -141 181 -160 282 -153 37 2 79 12 101 23 50 27 261 238 283 284 25 52 23 126 -5 183 -25 49 -142 167 -591 598 -134 129 -293 282 -353 340 -128 124 -191 161 -277 159 -30 -1 -64 -4 -74 -6z" />
                  <path d="M1784 3414 c-225 -229 -410 -421 -412 -428 -1 -6 170 -183 380 -393 442 -441 434 -433 455 -433 17 0 826 799 845 834 10 18 -12 42 -183 209 -107 104 -294 288 -415 408 -137 136 -229 219 -241 219 -13 0 -166 -148 -429 -416z" />
                  <path d="M1004 2909 c-40 -15 -74 -43 -160 -132 -117 -119 -134 -150 -134 -239 0 -93 22 -119 482 -579 396 -395 434 -430 486 -449 67 -25 135 -24 197 5 54 25 248 219 269 269 22 53 21 147 -3 194 -16 32 -177 193 -831 833 -122 119 -192 142 -306 98z" />
                  <path d="M2760 2478 c-83 -84 -150 -155 -150 -158 0 -5 7 -13 194 -215 61 -66 134 -145 161 -175 28 -30 80 -86 116 -125 36 -38 86 -92 111 -120 24 -27 105 -115 179 -195 74 -80 175 -190 224 -245 50 -54 119 -131 155 -170 36 -38 112 -122 170 -185 247 -271 300 -310 431 -318 67 -4 84 -1 134 22 66 30 193 148 233 216 24 40 27 55 27 140 0 147 -1 148 -386 481 -138 120 -350 301 -459 393 -14 11 -55 46 -90 77 -75 64 -88 75 -191 161 -251 209 -516 432 -590 495 -47 40 -93 73 -103 73 -9 0 -84 -68 -166 -152z" />
                  <path d="M780 1182 c-19 -9 -45 -32 -57 -51 -20 -30 -23 -47 -23 -132 l0 -99 -70 0 c-87 0 -129 -17 -166 -66 -28 -36 -29 -42 -32 -163 -2 -116 -1 -129 20 -165 13 -21 39 -47 58 -57 33 -18 82 -19 1125 -19 1070 0 1091 0 1123 20 61 37 72 70 72 210 0 193 -29 232 -176 239 l-84 3 0 92 c0 113 -17 151 -80 184 l-44 22 -816 0 c-756 0 -818 -1 -850 -18z" />
                </g>
              </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-normal">
              AtalJudge
            </h1>
          </div>

          {}
          <div className="space-y-8">
            <div>

              <p className="text-slate-600 text-lg sm:text-xl leading-relaxed max-w-lg mx-auto">
                Uma plataforma acadêmica para exercitar algoritmos e desenvolver suas habilidades de programação
              </p>
            </div>

            {}
            <Link href="/login" className="w-full block">
              <Button size="lg" className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm hover:shadow-md font-semibold transition-all duration-200 transform hover:scale-[1.02]">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Acessar Plataforma
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

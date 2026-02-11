'use client';

import InputForm from '@/components/InputForm';
import ResultsCard from '@/components/ResultsCard';
import { Calculator, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
      <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
            <div>
              <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <Calculator className="w-8 h-8 text-blue-600" />
                NaPontaDoLápis
                <span className="text-xs font-normal bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mt-1">Beta</span>
              </h1>
              <p className="text-gray-500 mt-1">Calculadora de Unit Economics para Importadores Simplificados</p>
            </div>
            
            <Link 
              href="/dashboard"
              className="group flex items-center gap-3 px-5 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-300 hover:ring-2 hover:ring-blue-100 transition-all cursor-pointer"
            >
              <div className="bg-blue-50 p-2 rounded-md group-hover:bg-blue-100 transition-colors">
                <LayoutDashboard className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-400 font-medium">Controle</p>
                <p className="text-sm font-bold text-gray-800">Meus Produtos</p>
              </div>
            </Link>
          </div>

          {/* Grid Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Coluna da Esquerda: Inputs (Maior área) */}
            <div className="lg:col-span-7 space-y-6">
              <InputForm />
            </div>

            {/* Coluna da Direita: Resultados (Sticky) */}
            <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 ring-1 ring-blue-50">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Análise de Viabilidade
                </h2>
                <ResultsCard />
              </div>
            </div>

          </div>
        </div>
      </main>
  );
}

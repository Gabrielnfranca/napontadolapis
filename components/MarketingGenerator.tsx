'use client';

import { useState, useEffect } from 'react';
import { useCalculator } from '@/contexts/CalculatorContext';
import { Sparkles, Copy, Check, Key, AlertCircle, Loader2, FileText, Tag } from 'lucide-react';

interface MarketingResult {
  title_ml: string;
  title_shopee: string;
  description: string;
  bullets: string[];
  keywords: string;
}

export default function MarketingGenerator() {
  const { input, setInput } = useCalculator();
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MarketingResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Carregar API Key do LocalStorage ao iniciar
  useEffect(() => {
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSaveKey = (val: string) => {
    setApiKey(val);
    localStorage.setItem('openai_api_key', val);
  };

  const handleGenerate = async () => {
    if (!input.productName) {
      setError('Preencha o Nome do Produto no formulário primeiro.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null); // Clear previous

    try {
      const res = await fetch('/api/generate-copy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: input.productName,
          features: input.productFeatures,
          openAiKey: apiKey // Envia a chave do usuário se existir
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao gerar copy');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
      // Se for erro de chave, abre o input
      if (err.message.includes('Chave') || err.message.includes('API')) {
        setShowKeyInput(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header e Configuração */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-indigo-100">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Gerador de Anúncios IA
            </h3>
            <p className="text-sm text-indigo-700 mt-1">
              Transforme seus dados em anúncios vendedores em segundos.
            </p>
          </div>
          <button 
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="text-xs text-indigo-400 hover:text-indigo-600 flex items-center gap-1"
          >
            <Key className="w-3 h-3" />
            Config
          </button>
        </div>

        {/* Input da API Key (Toggle) */}
        {showKeyInput && (
          <div className="bg-white p-3 rounded-lg border border-indigo-100 mb-4 animate-in fade-in slide-in-from-top-2">
            <label className="block text-xs font-bold text-gray-500 mb-1">OpenAI API Key (Sua chave pessoal)</label>
            <input 
              type="password" 
              value={apiKey}
              onChange={(e) => handleSaveKey(e.target.value)}
              placeholder="sk-..."
              className="w-full text-sm p-2 border border-gray-200 rounded focus:ring-2 focus:ring-indigo-300 outline-none"
            />
            <p className="text-[10px] text-gray-400 mt-1">A chave fica salva apenas no seu navegador.</p>
          </div>
        )}

        {/* Inputs de Contexto (Agora dentro do Gerador) */}
        <div className="bg-white p-4 rounded-lg border border-indigo-100 mb-4 space-y-3 shadow-sm">
          <div>
            <label className="block text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">
              Nome do Produto <span className="text-red-400">*</span>
            </label>
            <input 
              type="text" 
              value={input.productName}
              onChange={e => setInput(prev => ({...prev, productName: e.target.value}))}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              placeholder="Ex: Fone Bluetooth Pro cancelamento ruído"
            />
          </div>

          <div>
             <label className="block text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1 flex justify-between">
               Características / Diferenciais
             </label>
             <textarea 
               value={input.productFeatures || ''}
               onChange={e => setInput(prev => ({...prev, productFeatures: e.target.value}))}
               className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
               placeholder="Ex: Bateria de 24h, Resistente à água, Bluetooth 5.3..."
               rows={3}
             />
          </div>
        </div>


        <button
          onClick={handleGenerate}
          disabled={loading || !input.productName}
          className={`w-full py-3 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2 transition-all ${
            loading 
              ? 'bg-indigo-300 cursor-wait text-white' 
              : !input.productName
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Criando Copy...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Gerar Kit de Venda
            </>
          )}
        </button>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </div>

      {/* RESULTADOS */}
      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
          
          {/* Título ML */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm transition-all hover:border-yellow-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">Mercado Livre (SEO)</span>
              <button 
                onClick={() => copyToClipboard(result.title_ml, 'title_ml')}
                className="text-gray-400 hover:text-blue-500 transition-colors"
                title="Copiar"
              >
                {copiedField === 'title_ml' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="font-medium text-gray-800">{result.title_ml}</p>
            <p className="text-[10px] text-gray-400 mt-1 text-right">{result.title_ml.length} caracteres</p>
          </div>

          {/* Título Shopee */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm transition-all hover:border-orange-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">Shopee (Cauda Longa)</span>
              <button 
                onClick={() => copyToClipboard(result.title_shopee, 'title_shopee')}
                className="text-gray-400 hover:text-blue-500 transition-colors"
              >
                {copiedField === 'title_shopee' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="font-medium text-gray-800">{result.title_shopee}</p>
          </div>

          {/* Descrição */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-gray-700 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Descrição Persuasiva
              </h4>
              <button 
                onClick={() => copyToClipboard(result.description, 'description')}
                className="text-xs flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
              >
                {copiedField === 'description' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                Copiar Texto
              </button>
            </div>
            <div className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-100">
              {result.description}
            </div>
          </div>

          {/* Bullets */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
             <h4 className="font-bold text-gray-700 mb-3 text-sm">Ficha Técnica / Benefícios</h4>
             <ul className="space-y-2">
               {result.bullets.map((bullet, idx) => (
                 <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0" />
                   {bullet}
                 </li>
               ))}
             </ul>
             <button 
                onClick={() => copyToClipboard(result.bullets.map(b => `• ${b}`).join('\n'), 'bullets')}
                className="mt-3 w-full text-xs text-gray-400 hover:text-blue-500 py-1 border border-dashed border-gray-200 hover:border-blue-200 rounded flex justify-center gap-1"
             >
               <Copy className="w-3 h-3" /> Copiar Lista
             </button>
          </div>

           {/* Keywords */}
           <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
               <Tag className="w-4 h-4 text-gray-400" />
               <span className="text-sm font-bold text-gray-700">Tags / Keywords</span>
            </div>
            <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">{result.keywords}</p>
          </div>

        </div>
      )}
    </div>
  );
}

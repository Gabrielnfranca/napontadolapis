'use client';

import { SavedSKU } from '@/contexts/CalculatorContext';
import { X, Copy, Check, ShoppingBag, FileText, List, Tag, Box, Star, HelpCircle, ShieldCheck, Wand2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface ProductDetailsModalProps {
  sku: SavedSKU;
  onClose: () => void;
  onRegenerate: () => Promise<void>;
}

export default function ProductDetailsModal({ sku, onClose, onRegenerate }: ProductDetailsModalProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  const mkt = sku.marketing_kit;
  
  const handleRegenerateClick = async () => {
    if (confirm("Isso irá substituir o título e descrição atuais por uma nova versão criada pela IA. Deseja continuar?")) {
        setIsRegenerating(true);
        await onRegenerate();
        setIsRegenerating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const renderSection = (title: string, content: React.ReactNode, icon: React.ReactNode) => (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mb-4">
      <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3 text-sm uppercase tracking-wide">
        {icon} {title}
      </h3>
      {content}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-gray-50 rounded-2xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-gray-200 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{sku.name}</h2>
            <div className="flex gap-2 text-xs mt-1">
               <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono border border-gray-200">{sku.input.sku || 'SEM SKU'}</span>
               <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold">Lucro: R$ {sku.netProfit.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
                onClick={handleRegenerateClick}
                disabled={isRegenerating}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium border border-indigo-100 disabled:opacity-50"
            >
                {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Wand2 className="w-4 h-4"/>}
                {isRegenerating ? 'Gerando...' : 'Gerar Nova Copy'}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {!mkt ? (
            <div className="text-center py-20">
              <div className="inline-flex bg-gray-100 p-4 rounded-full mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-700">Kit de Venda não gerado</h3>
              <p className="text-gray-500">Este produto foi salvo antes da atualização da IA.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Títulos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderSection("Título Mercado Livre", (
                  <div>
                    <p className="text-lg font-medium text-gray-800 mb-2">{mkt.title_ml}</p>
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>{mkt.title_ml?.length || 0} caracteres</span>
                      <button onClick={() => copyToClipboard(mkt.title_ml, 'title_ml')} className="text-blue-600 hover:text-blue-800 font-bold flex gap-1">
                        {copied === 'title_ml' ? <Check className="w-3 h-3"/> : <Copy className="w-3 h-3"/>} COPIAR
                      </button>
                    </div>
                  </div>
                ), <ShoppingBag className="w-4 h-4 text-yellow-500" />)}

                {renderSection("Título Shopee", (
                  <div>
                    <p className="text-sm font-medium text-gray-800 mb-2">{mkt.title_shopee}</p>
                    <div className="flex justify-end text-xs">
                      <button onClick={() => copyToClipboard(mkt.title_shopee, 'title_shp')} className="text-blue-600 hover:text-blue-800 font-bold flex gap-1">
                        {copied === 'title_shp' ? <Check className="w-3 h-3"/> : <Copy className="w-3 h-3"/>} COPIAR
                      </button>
                    </div>
                  </div>
                ), <ShoppingBag className="w-4 h-4 text-orange-500" />)}
              </div>

               {/* Descrição e Bullets */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 
                 <div className="md:col-span-2">
                   {renderSection("Descrição Persuasiva", (
                     <div className="relative group">
                       <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg text-sm text-gray-700 font-sans leading-relaxed">
                         <ReactMarkdown
                            components={{
                                h1: ({node, ...props}) => <h1 className="text-xl font-black text-gray-900 border-b border-gray-200 pb-2 mb-4 mt-2" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-base font-bold text-gray-800 mt-6 mb-2 uppercase tracking-wide flex items-center gap-2" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-sm font-bold text-gray-800 mt-4 mb-1" {...props} />,
                                p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1 text-gray-600 marker:text-blue-500" {...props} />,
                                li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                            }}
                         >
                            {mkt.description}
                         </ReactMarkdown>
                       </div>
                       <button onClick={() => copyToClipboard(mkt.description, 'desc')} className="absolute top-2 right-2 bg-white shadow-sm border border-gray-200 p-1.5 rounded text-gray-500 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                         {copied === 'desc' ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                       </button>
                     </div>
                   ), <FileText className="w-4 h-4 text-blue-500" />)}

                   {/* FAQ e Garantia */}
                   <div className="mt-4 space-y-4">
                     {mkt.faq && renderSection("Perguntas Frequentes (Quebra de Objeção)", (
                        <div className="space-y-3">
                          {mkt.faq.map((fq: any, idx: number) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded-lg text-sm">
                               <p className="font-bold text-gray-800 mb-1">P: {fq.question}</p>
                               <p className="text-gray-600">R: {fq.answer}</p>
                            </div>
                          ))}
                          <button onClick={() => copyToClipboard(mkt.faq.map((f:any) => `P: ${f.question}\nR: ${f.answer}`).join('\n\n'), 'faq')} className="text-xs text-blue-600 font-bold mt-2 flex items-center gap-1">
                             <Copy className="w-3 h-3" /> Copiar FAQ
                          </button>
                        </div>
                     ), <HelpCircle className="w-4 h-4 text-purple-500" />)}
                   </div>
                 </div>

                 <div className="space-y-4">
                    {/* Ficha Técnica */}
                    {mkt.technical_specs && renderSection("Ficha Técnica", (
                      <div>
                        <div className="border rounded-lg overflow-hidden text-sm">
                           <table className="w-full">
                             <tbody>
                               {mkt.technical_specs.map((spec: any, i: number) => (
                                 <tr key={i} className="border-b last:border-0">
                                   <td className="bg-gray-50 p-2 font-medium text-gray-600 w-1/3">{spec.label}</td>
                                   <td className="p-2 text-gray-800">{spec.value}</td>
                                 </tr>
                               ))}
                             </tbody>
                           </table>
                        </div>
                        <button onClick={() => copyToClipboard(JSON.stringify(mkt.technical_specs, null, 2), 'specs')} className="text-xs text-blue-600 font-bold mt-2 flex items-center gap-1">
                             <Copy className="w-3 h-3" /> Copiar JSON
                        </button>
                      </div>
                    ), <List className="w-4 h-4 text-gray-500" />)}

                    {/* Conteúdo da Caixa */}
                    {mkt.package_contents && renderSection("O que vem na caixa?", (
                      <ul className="text-sm text-gray-700 space-y-1">
                        {mkt.package_contents.map((item: string, i: number) => (
                          <li key={i} className="flex items-center gap-2">
                            <Box className="w-3 h-3 text-green-500" /> {item}
                          </li>
                        ))}
                      </ul>
                    ), <Box className="w-4 h-4 text-green-600" />)}

                    {/* Keywords */}
                    {renderSection("Palavras-Chave (Tags)", (
                      <div className="flex flex-wrap gap-1">
                        {mkt.keywords?.split(',').map((tag: string, i: number) => (
                          <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    ), <Tag className="w-4 h-4 text-gray-400" />)}

                    {/* Warranty */}
                    {mkt.warranty_text && renderSection("Garantia", (
                        <p className="text-sm text-gray-600">{mkt.warranty_text}</p>
                    ), <ShieldCheck className="w-4 h-4 text-green-500" />)}

                 </div>

               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

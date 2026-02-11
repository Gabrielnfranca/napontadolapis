'use client';

import { useCalculator, SavedSKU } from '@/contexts/CalculatorContext';
import { Trash2, ExternalLink, Wand2, Calculator, Search, ChevronRight, ChevronLeft, FileText, Tag, DollarSign, Package, Eye, Loader2 } from 'lucide-react';
import { useState } from 'react';
import ProductDetailsModal from './ProductDetailsModal';
import TextModal from './TextModal';

interface SKURowProps {
  sku: SavedSKU;
  onViewText: (title: string, content: string) => void;
  onSelectSku: (sku: SavedSKU) => void;
}

function SKURow({ sku, onViewText, onSelectSku }: SKURowProps) {
    const { deleteSKU, setInput, updateSavedSKU, savedSKUs } = useCalculator();
    const [isGenerating, setIsGenerating] = useState(false);

    const generateSKU = (skuId: string, productName: string, marketplace: string) => {
        const marketPrefix = marketplace === 'SHOPEE' ? 'SHP' : 'MLB';
        const nameClean = productName.trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const namePrefix = nameClean.length >= 3 ? nameClean.substring(0, 3) : 'GEN';
        const randomSuffix = Math.floor(1000 + Math.random() * 9000); 
        const newCode = `${marketPrefix}-${namePrefix}-${randomSuffix}`;
        updateSavedSKU(skuId, { input: { ...savedSKUs.find(s => s.id === skuId)!.input, sku: newCode } });
    };

    const handleGenerateCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isGenerating) return;
        setIsGenerating(true);
        try {
            const response = await fetch('/api/generate-copy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName: sku.name,
                    features: sku.input.productFeatures || '',
                    reference: '' 
                })
            });
            
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Falha ao conectar com a IA');
            }
            
            await updateSavedSKU(sku.id, { marketing_kit: data });
            
        } catch (error: any) {
            console.error(error);
            alert(`Erro: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const originCurrency = sku.input.productCurrency || 'USD';
    const originCost = sku.input.productCostValue || 0;
    const qty = sku.input.quantity || 1;
    const totalOrigin = originCost * qty;
    
    const safeExchange = sku.input.exchangeRate || 5.0;
    const taxesApprox = (originCost * safeExchange * 0.6); 
    const freightApprox = (sku.input.freightValue || 0) / (qty || 1);
    
    const aiTitle = sku.marketing_kit?.title_ml || sku.marketing_kit?.title_shopee || '';
    const aiFeatures = sku.marketing_kit?.description || sku.marketing_kit?.bullets?.join('\n') || '';

    return (
        <tr className="hover:bg-blue-50/20 group transition-colors duration-150 h-12">
        
        {/* 1. SKU (FIXO) */}
        <td className="sticky left-0 z-20 bg-white group-hover:bg-gray-50 px-3 border-r border-gray-200 align-middle">
            {sku.input.sku ? (
                <span className="font-mono font-bold text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">
                    {sku.input.sku}
                </span>
            ) : (
                <button 
                    onClick={() => generateSKU(sku.id, sku.name, sku.input.marketplace)}
                    className="flex items-center justify-center w-full gap-1 text-[9px] bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 border border-blue-100 font-bold uppercase"
                >
                    Gerar SKU
                </button>
            )}
        </td>

        {/* 2. PRODUTO */}
        <td className="px-3 align-middle">
            <p className="font-semibold text-gray-700 truncate max-w-[200px]" title={sku.name}>
                {sku.name}
            </p>
            <p className="text-[10px] text-gray-400 truncate">
                {sku.input.category || 'Sem categoria'}
            </p>
        </td>

            {/* 3. MARKETPLACE */}
            <td className="px-3 align-middle">
            <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                {sku.input.marketplace || 'GEN'}
            </span>
        </td>

        {/* 4. TÍTULO IA */}
        <td className="px-3 align-middle bg-indigo-50/5 border-l border-indigo-50 cursor-pointer hover:bg-indigo-100/30 transition-colors" 
            title={aiTitle ? "Clique para ver completo" : "Clique no botão para gerar"}>
            {isGenerating ? (
                 <div className="flex items-center gap-2 text-indigo-400 text-[10px] animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" /> Gerando...
                 </div>
            ) : aiTitle ? (
                <div onClick={() => onViewText('Título do Anúncio', aiTitle)} className="flex items-center gap-2 group/text h-full w-full">
                    <span className="truncate max-w-[240px] italic text-indigo-700 font-medium">{aiTitle}</span>
                    <Eye className="w-3 h-3 text-indigo-300 opacity-0 group-hover/text:opacity-100" />
                </div>
            ) : (
                <button onClick={handleGenerateCopy} className="flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 transition-colors shadow-sm">
                    <Wand2 className="w-3 h-3" /> Gerar Title
                </button>
            )}
        </td>

        {/* 5. DESCRIÇÃO / FEATURES */}
        <td className="px-3 align-middle bg-indigo-50/5 border-r border-indigo-50 cursor-pointer hover:bg-indigo-100/30 transition-colors">
            {isGenerating ? (
                 <span className="text-[10px] text-gray-400">Aguarde...</span>
            ) : aiFeatures ? (
                <div onClick={() => onViewText('Descrição de Vendas', aiFeatures)} className="flex items-center gap-2 group/text h-full w-full">
                    <FileText className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span className="truncate max-w-[220px] text-gray-500 text-[11px]">{aiFeatures.substring(0, 50)}...</span>
                </div>
            ) : (
                <button onClick={handleGenerateCopy} className="text-[10px] text-gray-400 hover:text-indigo-600 flex items-center gap-1">
                     <Wand2 className="w-3 h-3" /> Gerar Copy
                </button>
            )}
        </td>

        {/* 6. QUANTIDADE */}
        <td className="px-3 text-center align-middle">
            <span className="font-bold text-gray-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                {qty}
            </span>
        </td>

        {/* 7. FINANCEIRO */}
        <td className="px-3 text-right align-middle text-gray-600">
            {originCurrency} {originCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </td>
        
        <td className="px-3 text-right align-middle text-gray-400 text-[10px]">
            R$ {safeExchange.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </td>

        <td className="px-3 text-right align-middle font-medium text-orange-700 bg-orange-50/10">
            {originCurrency} {totalOrigin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </td>

        {/* 8. IMPOSTOS/FRETE */}
        <td className="px-3 text-right align-middle text-gray-400 text-[10px] border-l border-dashed border-gray-100">
            {taxesApprox.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </td>

        <td className="px-3 text-right align-middle text-gray-400 text-[10px] border-r border-dashed border-gray-100">
            {freightApprox.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </td>

        {/* 9. RESULTADO */}
        <td className="px-3 text-right align-middle bg-blue-50/10 border-l border-blue-50 font-bold text-blue-700 text-sm">
            {sku.landedCostUnit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </td>

        <td className="px-3 text-right align-middle bg-emerald-50/10 border-l border-emerald-50 font-bold text-emerald-700 text-sm">
            {sku.input.salePriceBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </td>
        
        <td className="px-3 text-right align-middle font-black text-sm bg-gray-50/30">
                <span className={sku.netProfit > 0 ? 'text-emerald-600' : 'text-red-500'}>
                {sku.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
        </td>
        
        <td className="px-3 text-center align-middle">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${sku.netMargin > 15 ? 'text-emerald-700 bg-emerald-50' : 'text-orange-700 bg-orange-50'}`}>
                    {sku.netMargin.toFixed(0)}%
                </span>
        </td>

        {/* AÇÕES (FIXA) */}
        <td className="sticky right-0 bg-white group-hover:bg-gray-50 px-3 text-right align-middle border-l border-gray-200 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.05)]">
            <div className="flex justify-end gap-1">
            <button 
                onClick={() => onSelectSku(sku)}
                className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow-sm hover:shadow transition-all"
                title="Abrir Kit AI"
            >
                <Search className="w-3.5 h-3.5" />
            </button>
            
            <button 
            onClick={() => setInput(sku.input)}
            className="p-1.5 text-gray-500 hover:text-blue-600 bg-white border border-gray-200 rounded hover:bg-blue-50 transition-colors"
            title="Editar"
            >
            <Calculator className="w-3.5 h-3.5" />
            </button>
            <button 
            onClick={() => deleteSKU(sku.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 bg-white border border-gray-200 rounded hover:bg-red-50 transition-colors"
            title="Excluir"
            >
            <Trash2 className="w-3.5 h-3.5" />
            </button>
            </div>
        </td>
        </tr>
    );
}

export default function SKUList() {
  const { savedSKUs } = useCalculator();
  const [selectedSku, setSelectedSku] = useState<SavedSKU | null>(null);
  const [viewText, setViewText] = useState<{title: string, content: string} | null>(null);

  if (savedSKUs.length === 0) return null;

  return (
    <>
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col mt-6 overflow-hidden">
      
      {/* Header Compacto */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            Carteira de Produtos
          </h3>
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
             {savedSKUs.length} SKUs Ativos
          </span>
      </div>

      <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-50">
        <table className="w-full text-left min-w-[2000px] border-collapse relative">
          <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 tracking-wider border-b border-gray-200">
            <tr className="h-10">
              {/* === FIXA ESQUERDA === */}
              <th className="sticky left-0 z-20 bg-gray-50 px-3 border-r border-gray-200">SKU</th>
              
              {/* === IDENTIFICAÇÃO === */}
              <th className="px-3 w-[220px]">Produto</th>
              <th className="px-3 w-[100px]">Canal</th>
              
              {/* === MARKETING IA === */}
              <th className="px-3 w-[280px] bg-indigo-50/30 text-indigo-800 border-l border-indigo-50">Título Gerado (IA)</th>
              <th className="px-3 w-[280px] bg-indigo-50/30 text-indigo-800 border-r border-indigo-50">Destaques / Copy</th>

              {/* === DADOS DE QUANTIDADE === */}
              <th className="px-3 text-center">Vol.</th>

              {/* === FINANCEIRO ORIGEM === */}
              <th className="px-3 text-right">Custo Unit.<br/><span className="text-[9px] opacity-60 normal-case">Origem</span></th>
              <th className="px-3 text-right">Câmbio</th>
              <th className="px-3 text-right bg-orange-50/20 text-orange-800">Invest.<br/><span className="text-[9px] opacity-60 normal-case">Total</span></th>

              {/* === CUSTOS === */}
              <th className="px-3 text-right text-gray-400 border-l border-dashed border-gray-200">Impostos</th>
              <th className="px-3 text-right text-gray-400 border-r border-dashed border-gray-200">Frete</th>

              {/* === RESULTADOS === */}
              <th className="px-3 text-right text-blue-700 bg-blue-50/20 border-l border-blue-100">Custo Final</th>
              <th className="px-3 text-right text-emerald-700 bg-emerald-50/20 border-l border-emerald-100">Venda</th>
              <th className="px-3 text-right font-black w-[100px] bg-gray-50/30">Lucro</th>
              <th className="px-3 text-center w-[80px]">Margem</th>

              {/* === FIXA DIREITA === */}
              <th className="sticky right-0 bg-gray-50 z-10 text-right px-3 border-l border-gray-200 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.05)]">Opções</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-xs">
            {savedSKUs.map((sku) => (
                <SKURow 
                    key={sku.id} 
                    sku={sku} 
                    onViewText={(t, c) => setViewText({title: t, content: c})}
                    onSelectSku={setSelectedSku}
                />
            ))}
          </tbody>
        </table>
      </div>
    </div>
    
    {/* Modal de KIT DE VENDAS Completo */}
    {selectedSku && (
        <ProductDetailsModal sku={selectedSku} onClose={() => setSelectedSku(null)} />
    )}

    {/* Modal Rápido de Texto */}
    {viewText && (
        <TextModal 
            title={viewText.title} 
            content={viewText.content} 
            onClose={() => setViewText(null)} 
        />
    )}
    </>
  );
}

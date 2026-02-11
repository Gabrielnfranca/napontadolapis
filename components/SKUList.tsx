'use client';

import { useCalculator } from '@/contexts/CalculatorContext';
import { Trash2, ExternalLink, Wand2, Calculator } from 'lucide-react';
import { useState } from 'react';

export default function SKUList() {
  const { savedSKUs, deleteSKU, setInput, updateSavedSKU } = useCalculator();
  const [editingId, setEditingId] = useState<string | null>(null);

  if (savedSKUs.length === 0) return null;

  const generateSKU = (skuId: string, productName: string, marketplace: string) => {
    // 1. Prefixo do Marketplace
    const marketPrefix = marketplace === 'SHOPEE' ? 'SHP' : 'MLB';
    
    // 2. Prefixo do Nome (3 primeiras letras ou GEN)
    const nameClean = productName.trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const namePrefix = nameClean.length >= 3 ? nameClean.substring(0, 3) : 'GEN';
    
    // 3. Sufixo Aleatório
    const randomSuffix = Math.floor(1000 + Math.random() * 9000); 
    
    const newCode = `${marketPrefix}-${namePrefix}-${randomSuffix}`;
    updateSavedSKU(skuId, { input: { ...savedSKUs.find(s => s.id === skuId)!.input, sku: newCode } });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 rounded-l-lg">SKU / Produto</th>
              <th className="px-4 py-3">Landed Cost</th>
              <th className="px-4 py-3">Venda</th>
              <th className="px-4 py-3">Lucro Liq.</th>
              <th className="px-4 py-3">Margem</th>
              <th className="px-4 py-3 rounded-r-lg text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {savedSKUs.map((sku) => (
              <tr key={sku.id} className="hover:bg-gray-50 group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    {sku.input.sku ? (
                       <span className="font-mono font-bold text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700 border border-gray-200">
                         {sku.input.sku}
                       </span>
                    ) : (
                      <button 
                        onClick={() => generateSKU(sku.id, sku.name, sku.input.marketplace)}
                        className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors font-medium border border-blue-100"
                      >
                        <Wand2 className="w-3 h-3" />
                        Gerar SKU
                      </button>
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-900">{sku.name}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">R$ {sku.landedCostUnit.toFixed(2)}</td>
                <td className="px-4 py-3 font-medium">R$ {sku.input.salePriceBRL.toFixed(2)}</td>
                <td className={`px-4 py-3 font-bold ${sku.netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {sku.netProfit.toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${sku.netMargin > 15 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {sku.netMargin.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => generateSKU(sku.id, sku.name, sku.input.marketplace)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Regerar SKU"
                    >
                      <Wand2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setInput(sku.input)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Recalcular"
                    >
                      <Calculator className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteSKU(sku.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

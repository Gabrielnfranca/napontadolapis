'use client';

import { useCalculator } from '@/contexts/CalculatorContext';
import { ArrowDown, ArrowUp, AlertTriangle, TrendingUp, DollarSign, Package } from 'lucide-react';

export default function ResultsCard() {
  const { result, input, saveCurrentSKU } = useCalculator();

  if (!result) return <div className="p-6 text-center text-gray-400">Preencha os dados para calcular</div>;

  // Verificação de estado inicial (zerado)
  const isZeroState = input.productCostValue === 0 && input.salePriceBRL === 0;

  if (isZeroState) {
    return (
      <div className="text-center p-8 bg-white border border-gray-100 rounded-xl">
        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <DollarSign className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Aguardando Dados</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          Preencha o Custo do Produto e o Preço de Venda para visualizar a análise de viabilidade e os custos detalhados.
        </p>
      </div>
    );
  }

  const isProfit = result.netProfit > 0;
  const healthColor = isProfit ? (result.netMargin > 15 ? 'text-green-600' : 'text-yellow-600') : 'text-red-600';
  const bgHealthColor = isProfit ? (result.netMargin > 15 ? 'bg-green-50' : 'bg-yellow-50') : 'bg-red-50';

  return (
    <div className="space-y-6">
      {/* Cards Principais - Layout ajustado para 4 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Custo Unitário Final (Novo Destaque) */}
        <div className="p-4 rounded-xl border border-blue-100 bg-blue-50" title="Quanto custa cada unidade do produto já na sua mão (com frete e impostos).">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Custo Final (Unitário)</h3>
          <div className="text-2xl font-bold text-gray-900">
            R$ {result.landedCostUnit.toFixed(2)}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Na sua mão
          </div>
        </div>

        {/* Card 2: Preço Zero a Zero */}
        <div className="p-4 rounded-xl border border-gray-100 bg-white" title="Preço de venda onde você não tem lucro nem prejuízo.">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Preço Zero a Zero</h3>
          <div className="text-2xl font-bold text-gray-700">
            R$ {result.breakEvenPrice.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Preço Mínimo
          </div>
        </div>

        {/* Card 3: Lucro Líquido */}
        <div className={`p-4 rounded-xl border ${isProfit ? 'border-green-100' : 'border-red-100'} ${bgHealthColor} relative overflow-hidden`}>
          <div className="relative z-10">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Lucro Líquido</h3>
            <div className={`text-2xl font-bold ${healthColor}`}>
              R$ {result.netProfit.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Margem: <span className="font-bold">{result.netMargin.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Card 4: ROI */}
        <div className="p-4 rounded-xl border border-gray-100 bg-white" title="Retorno sobre o Investimento: Quanto o dinheiro cresceu.">
          <h3 className="text-sm font-medium text-gray-500 mb-1">ROI (Retorno)</h3>
          <div className="text-2xl font-bold text-blue-600">
            {result.roi.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Rentabilidade
          </div>
        </div>
      </div>

      {/* Detalhamento de Custos */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-gray-500" />
          Composição do Custo (Unitário)
        </h3>

        <div className="space-y-3 text-sm">
           {/* Produto + Frete */}
           <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-gray-600">Produto + Frete (Base)</span>
            <span className="font-medium">R$ {((result.totalProductCostBRL + result.totalFreightCostBRL) / input.quantity).toFixed(2)}</span>
          </div>

          {/* Impostos Importação */}
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-gray-600 flex items-center gap-1">
              Impostos Importação <span className="text-xs bg-gray-100 px-1 rounded">II + ICMS</span>
            </span>
            <span className="font-medium text-amber-700">R$ {((result.importTax + result.icmsTax) / input.quantity).toFixed(2)}</span>
          </div>

          {/* Custo Landed */}
          <div className="flex justify-between items-center py-2 bg-gray-50 px-2 rounded -mx-2">
            <span className="font-bold text-gray-700" title="Quanto custou o produto após chegar no Brasil com todos os impostos pagos">
              Custo Final (Na Mão)
            </span>
            <span className="font-bold text-gray-900">R$ {result.landedCostUnit.toFixed(2)}</span>
          </div>

          {/* Marketplace */}
          <div className="flex justify-between items-center py-2 border-b border-gray-50 pt-4">
            <span className="text-gray-600">Comissão Marketplace</span>
            <span className="font-medium text-red-600">- R$ {result.marketplaceCommission.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-gray-600">Taxa Fixa / Frete Saída</span>
            <span className="font-medium text-red-600">- R$ {(result.marketplaceFixedFee + result.marketplaceShippingSupport).toFixed(2)}</span>
          </div>
          
           {/* Impostos Saída */}
           <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-gray-600">Imposto Saída ({input.taxRegime})</span>
            <span className="font-medium text-red-600">- R$ {result.outputTax.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {result.netProfit < 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-red-700 text-sm">Operação no Prejuízo</h4>
            <p className="text-xs text-red-600 mt-1">
              O preço de venda atual não cobre os custos da importação e taxas do marketplace. Tente aumentar o preço ou negociar o custo.
            </p>
          </div>
        </div>
      )}

      {/* Botão Salvar SKU */}
      <div className="pt-4">
        <button
          onClick={() => {
            const name = prompt("Nome para identificar esta simulação:");
            if (name) {
               saveCurrentSKU(name);
               alert("Simulação salva! Acesse 'Meus Produtos' para gerar o SKU.");
            }
          }}
          className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-lg font-bold transition-colors shadow-lg flex items-center justify-center gap-2"
        >
          <DollarSign className="w-4 h-4" />
          Salvar Simulação
        </button>
      </div>
    </div>
  );
}

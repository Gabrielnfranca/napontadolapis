'use client';

import { useCalculator } from '@/contexts/CalculatorContext';
import { DollarSign, Truck, Percent, ShoppingBag, Settings2, RefreshCw } from 'lucide-react';

const STATES_ICMS = [
  { uf: 'PADRAO', name: 'Padrão Remessa Conforme', rate: 17 },
  { uf: 'AC', name: 'Acre', rate: 19 },
  { uf: 'AL', name: 'Alagoas', rate: 19 },
  { uf: 'AM', name: 'Amazonas', rate: 20 },
  { uf: 'AP', name: 'Amapá', rate: 18 },
  { uf: 'BA', name: 'Bahia', rate: 20.5 },
  { uf: 'CE', name: 'Ceará', rate: 20 },
  { uf: 'DF', name: 'Distrito Federal', rate: 20 },
  { uf: 'ES', name: 'Espírito Santo', rate: 17 },
  { uf: 'GO', name: 'Goiás', rate: 19 },
  { uf: 'MA', name: 'Maranhão', rate: 22 },
  { uf: 'MG', name: 'Minas Gerais', rate: 18 },
  { uf: 'MS', name: 'Mato Grosso do Sul', rate: 17 },
  { uf: 'MT', name: 'Mato Grosso', rate: 17 },
  { uf: 'PA', name: 'Pará', rate: 19 },
  { uf: 'PB', name: 'Paraíba', rate: 20 },
  { uf: 'PE', name: 'Pernambuco', rate: 20.5 },
  { uf: 'PI', name: 'Piauí', rate: 21 },
  { uf: 'PR', name: 'Paraná', rate: 19.5 },
  { uf: 'RJ', name: 'Rio de Janeiro', rate: 22 },
  { uf: 'RN', name: 'Rio Grande do Norte', rate: 20 },
  { uf: 'RO', name: 'Rondônia', rate: 17.5 },
  { uf: 'RR', name: 'Roraima', rate: 20 },
  { uf: 'RS', name: 'Rio Grande do Sul', rate: 17 },
  { uf: 'SC', name: 'Santa Catarina', rate: 17 },
  { uf: 'SE', name: 'Sergipe', rate: 19 },
  { uf: 'SP', name: 'São Paulo', rate: 18 },
  { uf: 'TO', name: 'Tocantins', rate: 20 },
];

export default function InputForm() {
  const { input, setInput, isLoadingDollar, refreshDollar } = useCalculator();
  
  // Estado local para controlar o input de Outras Despesas permitindo edição de decimais (ex: 0.50)
  const [localExtraExpenses, setLocalExtraExpenses] = React.useState(input.extraExpenses?.toString() || '');

  // Sincroniza o estado local quando o valor global muda (ex: Clicou nos botões de atalho)
  React.useEffect(() => {
     // Só atualiza se o valor numérico for diferente, para não atrapalhar a digitação de "0."
     const currentNum = parseFloat(localExtraExpenses) || 0;
     if (currentNum !== input.extraExpenses) {
        setLocalExtraExpenses(input.extraExpenses === 0 ? '' : input.extraExpenses.toString());
     }
  }, [input.extraExpenses]);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = STATES_ICMS.find(s => s.uf === e.target.value);
    if (selected) {
      setInput(prev => ({ ...prev, icmsRate: selected.rate }));
    }
  };

  const handleFreightCurrencyToggle = () => {
    setInput(prev => ({
      ...prev,
      freightCurrency: prev.freightCurrency === 'USD' ? 'BRL' : 'USD'
    }));
  };

  const handleProductCurrencyToggle = () => {
    setInput(prev => ({
      ...prev,
      productCurrency: prev.productCurrency === 'USD' ? 'BRL' : 'USD'
    }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-blue-600" />
          Parâmetros de Entrada
        </h2>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg shadow-sm">
           <span className="relative flex h-2 w-2">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
           </span>
           <div className="flex flex-col items-start leading-none ml-1">
             <span className="text-[10px] text-emerald-600 font-medium uppercase tracking-wide">Dólar Hoje</span>
             <span className="text-sm font-bold text-emerald-700">R$ {input.exchangeRate.toFixed(2)}</span>
           </div>
           <div className="h-6 w-px bg-emerald-200 mx-1"></div>
           <button 
             onClick={refreshDollar} 
             className="text-emerald-600 hover:text-emerald-800 p-1 rounded-full hover:bg-emerald-100 transition-colors" 
             title="Atualizar Cotação"
           >
             <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDollar ? 'animate-spin' : ''}`} />
           </button>
        </div>
      </div>

      {/* Custo e Quantidade */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Custo Produto</label>
          <div className="flex">
            <div className="relative flex-1">
              <div className="absolute left-3 top-3 text-gray-400">
                {input.productCurrency === 'USD' ? <DollarSign className="w-4 h-4" /> : <span className="text-xs font-bold">R$</span>}
              </div>
              <input 
                type="number" 
                value={input.productCostValue || ''}
                onChange={e => setInput({...input, productCostValue: parseFloat(e.target.value) || 0})}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-r-0"
                placeholder="0.00"
              />
            </div>
            <button 
              onClick={handleProductCurrencyToggle}
              className={`px-3 py-2 border border-gray-200 rounded-r-lg font-medium text-xs transition-colors ${
                input.productCurrency === 'USD' 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : 'bg-green-50 text-green-700 border-green-200'
              }`}
            >
              {input.productCurrency}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Quantidade</label>
          <input 
            type="number" 
            value={input.quantity}
            onChange={e => setInput({...input, quantity: parseFloat(e.target.value) || 1})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Frete Flexível */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Frete Internacional</label>
        <div className="flex">
          <div className="relative flex-1">
            <Truck className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input 
              type="number" 
              value={input.freightValue || ''}
              onChange={e => setInput({...input, freightValue: parseFloat(e.target.value) || 0})}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-r-0"
              placeholder="Valor do Frete"
            />
          </div>
          <button 
            onClick={handleFreightCurrencyToggle}
            className={`px-4 py-2 border border-gray-200 rounded-r-lg font-medium text-sm transition-colors ${
              input.freightCurrency === 'USD' 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : 'bg-green-50 text-green-700 border-green-200'
            }`}
          >
            {input.freightCurrency}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {input.freightCurrency === 'BRL' 
            ? 'Valor em Reais será convertido para USD base (Imposto) mas somado direto no custo final.'
            : 'Valor em Dólar será somado à base de imposto e convertido pelo câmbio do cartão.'}
        </p>
      </div>

      {/* Outras Despesas (Novo Campo com Sugestões) */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Outras Despesas / Taxas de Despacho
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2 text-gray-500 text-sm font-bold">R$</span>
          <input 
            type="number" 
            step="0.01"
            min="0"
            value={localExtraExpenses}
            onChange={e => {
              const val = e.target.value;
              setLocalExtraExpenses(val); // Atualiza visual
              setInput({...input, extraExpenses: parseFloat(val) || 0}); // Atualiza cálculo
            }}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="0.00"
          />
        </div>
        
        {/* Botões de Sugestão Rápida */}
        <div className="flex flex-wrap gap-2 mt-2">
           <button 
             onClick={() => setInput(prev => ({ ...prev, extraExpenses: 16.00 }))}
             className="text-xs px-2 py-1 bg-yellow-50 text-yellow-700 rounded border border-yellow-200 hover:bg-yellow-100 transition-colors"
           >
             + Correios (R$ 16)
           </button>
           <button 
             onClick={() => setInput(prev => ({ ...prev, extraExpenses: 100.00 }))}
             className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded border border-red-200 hover:bg-red-100 transition-colors"
           >
             + DHL/FedEx (~R$ 100)
           </button>
           <button 
             onClick={() => setInput(prev => ({ ...prev, extraExpenses: 0 }))}
             className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded border border-gray-200 hover:bg-gray-100"
           >
             Limpar
           </button>
        </div>
        
        <p className="text-[10px] text-gray-400 mt-2 leading-tight">
          <span className="font-bold">Nota:</span> O "Despacho Postal" (R$ 16) é cobrado pelos Correios em quase todas as encomendas. 
          Courier (DHL/FedEx) cobram "Taxa de Desembaraço" (aprox. R$ 100 ou 2% do imposto) para liberar a carga mais rápido.
        </p>
      </div>

      {/* Tributação */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Percent className="w-4 h-4 text-emerald-600" />
          Tributação & Regime
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">ICMS Estado (%)</label>
            <div className="flex gap-2">
               <select 
                onChange={handleStateChange}
                className="w-16 px-1 py-2 border border-gray-200 rounded-lg text-xs bg-white text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                title="Selecionar Estado para sugerir alíquota"
              >
                <option value="">UF</option>
                {STATES_ICMS.map(state => (
                  <option key={state.uf} value={state.uf}>{state.uf}</option>
                ))}
              </select>
              <input 
                type="number" 
                value={input.icmsRate}
                onChange={e => setInput({...input, icmsRate: parseFloat(e.target.value) || 0})}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              *17% é o padrão nacional Remessa Conforme, mas verifique sua UF.
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Regime Tributário</label>
            <select 
              value={input.taxRegime}
              onChange={e => setInput({...input, taxRegime: e.target.value as any})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="MEI">MEI (Isento Saída)</option>
              <option value="SIMPLES_NACIONAL">Simples Nacional</option>
              <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
            </select>
          </div>
        </div>

        {input.taxRegime === 'SIMPLES_NACIONAL' && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Taxa do Simples (DAS) %
            </label>
            <input 
              type="number" 
              value={input.simplesNacionalRate}
              onChange={e => setInput({...input, simplesNacionalRate: parseFloat(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              placeholder="Ex: 4.0 (Início Padrão)"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Geralmente inicia em <strong className="text-gray-600">4%</strong> para comércio. Consulte seu contador.
            </p>
          </div>
        )}
      </div>

      {/* Venda e Marketplace */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-purple-600" />
          Venda
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Preço de Venda <span className="text-xs text-purple-600 font-normal ml-1">(Dica: Teste o preço do concorrente)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 text-sm">R$</span>
              <input 
                type="number" 
                value={input.salePriceBRL || ''}
                onChange={e => setInput({...input, salePriceBRL: parseFloat(e.target.value) || 0})}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none font-semibold text-gray-900"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-medium text-gray-500 mb-1" title="Escolha onde vai vender para calcularmos as comissões corretas">
                 Canal de Venda ℹ️
               </label>
               <select 
                  value={input.marketplace}
                  onChange={e => {
                    const newMarketplace = e.target.value as any;
                    // Resetar o tipo de anúncio para o padrão do novo marketplace
                    const defaultAnnouncement = newMarketplace === 'SHOPEE' 
                      ? 'SEM_FRETE_GRATIS' 
                      : 'CLASSICO';
                    
                    setInput({
                      ...input, 
                      marketplace: newMarketplace,
                      announcementType: defaultAnnouncement
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                >
                  <option value="SHOPEE">Shopee</option>
                  <option value="MERCADO_LIVRE">Mercado Livre</option>
                </select>
             </div>

              <div>
               <label className="block text-xs font-medium text-gray-500 mb-1">Tipo de Anúncio</label>
                <select 
                  value={input.announcementType}
                  onChange={e => setInput({...input, announcementType: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                >
                  {input.marketplace === 'SHOPEE' ? (
                    <>
                      <option value="SEM_FRETE_GRATIS">Padrão</option>
                      <option value="COM_FRETE_GRATIS">Programa Frete Grátis</option>
                    </>
                  ) : (
                    <>
                      <option value="CLASSICO">Clássico</option>
                      <option value="PREMIUM">Premium</option>
                    </>
                  )}
                </select>
                {/* Legenda Dinâmica das Taxas */}
                <div className="mt-1 text-xs text-gray-500 flex items-start gap-1">
                  <span className="text-purple-600 font-bold">ℹ️ Custo:</span>
                  {input.marketplace === 'SHOPEE' ? (
                    input.announcementType === 'COM_FRETE_GRATIS' 
                      ? '20% (14% Padrão + 6% Frete Extra)' 
                      : '14% + R$ 4,00 por item'
                  ) : (
                    input.announcementType === 'PREMIUM'
                      ? '~ 17% (Exposição Alta + Parc. s/ Juros)'
                      : '~ 12% (Exposição Média)'
                  )}
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

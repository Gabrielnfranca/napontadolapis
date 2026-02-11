'use client';

import { useCalculator } from '@/contexts/CalculatorContext';
import SKUList from '@/components/SKUList';
import { ArrowLeft, Download, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { savedSKUs } = useCalculator();

  const handleExportCSV = () => {
    if (savedSKUs.length === 0) return;

    // Cabeçalho do CSV
    const headers = [
      "Nome",
      "Data",
      "Custo Produto (USD)",
      "Frete (USD)",
      "Câmbio Efetivo",
      "Imposto Importação (R$)",
      "ICMS (R$)",
      "Landed Cost Unit (R$)",
      "Preço Venda (R$)",
      "Comissão Mkt (R$)",
      "Lucro Líquido (R$)",
      "Margem (%)",
      "ROI (%)"
    ];

    // Linhas do CSV
    const rows = savedSKUs.map(sku => [
      `"${sku.name}"`, // Aspas para evitar quebra se tiver vírgula no nome
      new Date(sku.createdAt).toLocaleDateString('pt-BR'),
      sku.input.productCostValue.toFixed(2),
      sku.input.freightValue.toFixed(2),
      sku.effectiveExchangeRate.toFixed(4),
      sku.importTax.toFixed(2),
      sku.icmsTax.toFixed(2),
      sku.landedCostUnit.toFixed(2),
      sku.input.salePriceBRL.toFixed(2),
      sku.marketplaceCommission.toFixed(2),
      sku.netProfit.toFixed(2),
      sku.netMargin.toFixed(2),
      sku.roi.toFixed(2)
    ]);

    // Montar o arquivo
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `napontadolapis_relatorio_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Dashboard */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <LayoutDashboard className="w-8 h-8 text-blue-600" />
              Meus Produtos
            </h1>
            <p className="text-gray-500 mt-1">Gerencie e compare seus produtos simulados</p>
          </div>
          
          <div className="flex gap-3">
            <Link 
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para Calculadora
            </Link>
            
            {savedSKUs.length > 0 && (
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold shadow-sm"
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </button>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        {savedSKUs.length > 0 ? (
          <SKUList />
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
            <LayoutDashboard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Nenhum produto salvo ainda</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Volte para a calculadora e simule seus produtos. Quando achar um produto viável, clique em "Salvar Simulação".
            </p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              Ir para Calculadora
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

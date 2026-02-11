
// Tipos para os cálculos
export type TaxRegime = 'MEI' | 'SIMPLES_NACIONAL' | 'LUCRO_PRESUMIDO';
export type Marketplace = 'MERCADO_LIVRE' | 'SHOPEE';
export type AnnouncementType = 'CLASSICO' | 'PREMIUM' | 'SEM_FRETE_GRATIS' | 'COM_FRETE_GRATIS';

export interface CalculationInput {
  // Identificação (Novo)
  productName: string;
  sku: string;

  // Dados do Produto (Fornecedor)
  productCostValue: number;
  productCurrency: 'USD' | 'BRL';
  quantity: number;
  freightValue: number;
  freightCurrency: 'USD' | 'BRL';
  
  // Parâmetros Econômicos
  exchangeRate: number; // Dólar PTAX
  spreadPercent: number; // Taxa do cartão/banco (ex: 4-5%)
  iofPercent: number; // Imposto sobre Operação Financeira
  
  // Parâmetros Tributários Nacionais
  icmsRate: number; // Alíquota do estado destino (ex: 17% ou 20%)
  taxRegime: TaxRegime;
  simplesNacionalRate?: number; // Se for ME, qual a aliq efetiva (ex: 4%)

  // Dados de Venda (Marketplace)
  salePriceBRL: number; // Preço de venda sugerido ou testado
  marketplace: Marketplace;
  announcementType: AnnouncementType;
}

export interface CalculationResult {
  // Custos Iniciais
  effectiveExchangeRate: number; // Dólar Final (com Spread + IOF)
  totalProductCostBRL: number;
  totalFreightCostBRL: number; /* Frete total */
  customsValueUSD: number; // Valor Aduaneiro Total (Produto + Frete) em USD
  
  // Tributação Importação (Remessa Conforme)
  importTax: number; // II
  icmsTax: number; // ICMS Importação
  
  // Custo Brasil (Landed Cost)
  landedCostUnit: number; // Custo unitário do produto na prateleira (com impostos importação)
  landedCostTotal: number;
  
  // Custos de Venda
  marketplaceCommission: number;
  marketplaceFixedFee: number;
  marketplaceShippingSupport: number; // Custo de frete do marketplace (ex: ML > 79)
  outputTax: number; // Imposto de saída (DAS/Simples)
  
  // Resultado Final
  totalCostUnit: number; // Soma de todos os custos para vender 1 unidade
  netProfit: number; // Lucro Líquido em R$
  netMargin: number; // Margem Líquida %
  roi: number; // Retorno sobre Investimento %
  breakEvenPrice: number; // Preço mínimo de venda (lucro zero)
}

/**
 * Calcula o custo total e viabilidade de importação
 */
export const calculateLandedCost = (input: CalculationInput): CalculationResult => {
  const {
    productCostValue,
    productCurrency,
    quantity,
    freightValue,
    freightCurrency,
    exchangeRate,
    spreadPercent,
    iofPercent,
    icmsRate,
    taxRegime,
    simplesNacionalRate = 0,
    salePriceBRL,
    marketplace,
    announcementType
  } = input;

  // 1. Definição do Dólar Efetivo (Custo Real da Moeda)
  // Spread bancário entra na base de conversão, IOF é imposto sobre a transação.
  const effectiveExchangeRate = exchangeRate * (1 + spreadPercent / 100) * (1 + iofPercent / 100);

  // 2. Cálculo do Valor Aduaneiro (Base para Impostos de Importação)
  
  // Converter Custo do Produto para USD (se for BRL) para checagem da isenção $50
  let productCostUSD = 0;
  if (productCurrency === 'USD') {
    productCostUSD = productCostValue;
  } else {
    productCostUSD = productCostValue / exchangeRate;
  }

  // Converter Frete para USD (se for BRL)
  let freightCostUSD = 0;
  if (freightCurrency === 'USD') {
    freightCostUSD = freightValue; // Frete total
  } else {
    freightCostUSD = freightValue / exchangeRate;
  }

  // Valor Aduaneiro por Unidade (para definir regra de imposto) vs Total
  // A faixa de isenção de $50 USD é considerada por PACOTE (Remessa), ou seja, Produto Total + Frete.
  const totalCustomsValueUSD = (productCostUSD * quantity) + freightCostUSD;
  
  // 3. Tributação Importação (Remessa Conforme)
  let importDutyInfo = { rate: 0, deduction: 0 };
  
  // Regra 2025: < $50 = 20%, > $50 = 60% com desconto de $20
  if (totalCustomsValueUSD <= 50) {
    importDutyInfo = { rate: 0.20, deduction: 0 };
  } else {
    importDutyInfo = { rate: 0.60, deduction: 20 };
  }
  
  const importDutyTotalUSD = (totalCustomsValueUSD * importDutyInfo.rate) - importDutyInfo.deduction;
  // O imposto não pode ser negativo (caso a dedução exceda o calculado, o que matematicamente não deve ocorrer >$50, mas por segurança)
  const finalImportDutyUSD = Math.max(0, importDutyTotalUSD);
  
  const importDutyBRL = finalImportDutyUSD * exchangeRate; // Imposto paga-se no câmbio do dia (geralmente PTAX ou do gateway)

  // 4. ICMS (Cálculo "Por Dentro" - Gross Up)
  // Base ICMS = (Valor Aduaneiro BRL + Imposto Importação BRL) / (1 - Alíquota ICMS)
  const customsValueBRL = totalCustomsValueUSD * exchangeRate;
  const icmsBase = (customsValueBRL + importDutyBRL) / (1 - (icmsRate / 100));
  const icmsBRL = icmsBase * (icmsRate / 100);

  // 5. Custo Landed (Custo do Produto no Brasil)
  // Determine o custo real em BRL saindo d bolso
  let productCostRealBRL = 0;
  if (productCurrency === 'USD') {
    productCostRealBRL = (productCostValue * quantity) * effectiveExchangeRate;
  } else {
    productCostRealBRL = (productCostValue * quantity);
  }

  const freightCostRealBRL = (freightCurrency === 'USD') 
    ? (freightValue * effectiveExchangeRate) 
    : freightValue;
    
  const landedCostTotal = productCostRealBRL + freightCostRealBRL + importDutyBRL + icmsBRL;
  const landedCostUnit = landedCostTotal / quantity;

  /**
   * CUSTOS DE VENDA (Marketplace)
   */
  let commissionRate = 0;
  let fixedFee = 0;
  let maxFee = Infinity; // Teto da comissão

  // Configuração Mercado Livre
  if (marketplace === 'MERCADO_LIVRE') {
    // Taxa Fixa: R$ 6.00 a R$ 6.75 para itens abaixo de R$ 79 (prompt diz R$ 6.75)
    if (salePriceBRL < 79) {
      fixedFee = 6.75; // Valor atualizado 2025 (pode variar, mas vamos usar o input do prompt)
    }
    
    if (announcementType === 'CLASSICO') commissionRate = 0.12; // Média categorias (10-14%)
    if (announcementType === 'PREMIUM') commissionRate = 0.17; // Média (15-19%)
    
  } 
  // Configuração Shopee
  else if (marketplace === 'SHOPEE') {
    fixedFee = 4.00; // Por item vendido
    maxFee = 103; // Teto atualizado (R$ 100 + R$ 3 de transação? Prompt diz R$ 100) -> Usar R$ 100
    maxFee = 100;

    if (announcementType === 'SEM_FRETE_GRATIS') commissionRate = 0.14; // Padrão + Transação
    if (announcementType === 'COM_FRETE_GRATIS') commissionRate = 0.14 + 0.06; // Programa Frete Grátis Extra (+6%)
  }

  // Cálculo da Comissão
  let commissionValue = salePriceBRL * commissionRate;
  if (commissionValue > maxFee) commissionValue = maxFee;

  // Custo de Frete do Marketplace (Subsídio do Vendedor)
  // No ML, obrigatório frete grátis acima de R$ 79. Custo varia por peso/região. 
  // Vamos estimar um custo médio de saída se o preço > 79.
  // Para MVP: Se > 79 no ML, avisar ou chutar um valor base (ex: R$ 20,00). 
  // Idealmente isso seria um input do usuário "Custo Frete Saída".
  // Vamos deixar ZERO por enquanto, mas o UI deve alertar.
  let marketplaceShippingSupport = 0;
  // TODO: Adicionar input para Custo Frete Saída no futuro.

  // Imposto de Saída (Simples Nacional / MEI)
  let outputTax = 0;
  if (taxRegime === 'MEI') {
    outputTax = 0; // Valor fixo mensal do DAS, custo marginal zero na venda.
  } else if (taxRegime === 'SIMPLES_NACIONAL') {
    outputTax = salePriceBRL * (simplesNacionalRate / 100);
  }

  // Resultado Final Unitário
  const sellingCosts = commissionValue + fixedFee + marketplaceShippingSupport + outputTax;
  const finalProfit = salePriceBRL - landedCostUnit - sellingCosts;
  
  const margin = (finalProfit / salePriceBRL) * 100;
  const roi = (finalProfit / landedCostUnit) * 100;
  
  // Break Even (Preço x onde Lucro = 0)
  // X = LandedCost + FixedFee + (X * Commission) + (X * TaxRate)
  // X - X(Comm + Tax) = Landed + Fixed
  // X (1 - Comm - Tax) = Landed + Fixed
  // X = (Landed + Fixed) / (1 - Comm - Tax)
  
  const breakEvenPrice = (landedCostUnit + fixedFee + marketplaceShippingSupport) / (1 - commissionRate - (taxRegime === 'SIMPLES_NACIONAL' ? simplesNacionalRate/100 : 0));

  return {
    effectiveExchangeRate,
    totalProductCostBRL: productCostRealBRL,
    totalFreightCostBRL: freightCostRealBRL,
    customsValueUSD: totalCustomsValueUSD,
    importTax: importDutyBRL,
    icmsTax: icmsBRL,
    landedCostUnit,
    landedCostTotal,
    marketplaceCommission: commissionValue,
    marketplaceFixedFee: fixedFee,
    marketplaceShippingSupport,
    outputTax,
    totalCostUnit: landedCostUnit + sellingCosts,
    netProfit: finalProfit,
    netMargin: margin,
    roi,
    breakEvenPrice
  };
};

'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CalculationInput, CalculationResult, calculateLandedCost } from '@/utils/financial-math';
import { supabase } from '@/lib/supabaseClient';

export interface SavedSKU extends CalculationResult {
  id: string; // UUID vindo do supabase
  name: string;
  createdAt: string;
  input: CalculationInput;
  marketing_kit?: any; // Dados gerados pela IA
}

interface CalculatorContextData {
  input: CalculationInput;
  setInput: React.Dispatch<React.SetStateAction<CalculationInput>>;
  result: CalculationResult | null;
  savedSKUs: SavedSKU[];
  saveFullProduct: (data: {name: string, sku: string, category: string, features: string, reference?: string}) => Promise<void>;
  updateSavedSKU: (id: string, updates: Partial<SavedSKU>) => Promise<void>;
  deleteSKU: (id: string) => Promise<void>;
  isLoadingDollar: boolean;
  refreshDollar: () => Promise<void>;
}

const DEFAULT_INPUT: CalculationInput = {
  productName: '',
  sku: '',
  productFeatures: '',
  productCostValue: 0,
  productCurrency: 'USD',
  quantity: 1,
  freightValue: 0,
  freightCurrency: 'USD',
  extraExpenses: 0,
  exchangeRate: 0, // Será preenchido pela API
  spreadPercent: 0,
  iofPercent: 0, 
  icmsRate: 0,
  taxRegime: 'MEI',
  simplesNacionalRate: 0,
  salePriceBRL: 0,
  marketplace: 'SHOPEE',
  announcementType: 'SEM_FRETE_GRATIS'
};

const CalculatorContext = createContext<CalculatorContextData>({} as CalculatorContextData);

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const [input, setInput] = useState<CalculationInput>(DEFAULT_INPUT);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [savedSKUs, setSavedSKUs] = useState<SavedSKU[]>([]);
  const [isLoadingDollar, setIsLoadingDollar] = useState(false);

  // Carregar SKUs do Supabase ao iniciar
  useEffect(() => {
    refreshDollar();
    loadSupabaseData();
  }, []);

  const loadSupabaseData = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_skus')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Fallback LocalStorage: Tabela Supabase não encontrada ou erro de permissão.', error.message);
        // Fallback LocalStorage se falhar conexão (ou tabela não existir)
        const saved = localStorage.getItem('napontadolapis_skus');
        if (saved) setSavedSKUs(JSON.parse(saved));
        return;
      }

      if (data) {
        // Mapear do formato DB para formato App
        const loaded: SavedSKU[] = data.map(item => ({
          id: item.id, // UUID
          name: item.name,
          createdAt: item.created_at,
          input: item.input_data,
          ...item.result_data, // Espalha as propriedades do result (netProfit, etc)
        }));
        setSavedSKUs(loaded);
      }
    } catch (err) {
      console.error('Erro ao conectar Supabase:', err);
    }
  };

  // Recalcular sempre que o input mudar
  useEffect(() => {
    const res = calculateLandedCost(input);
    setResult(res);
  }, [input]);

  const refreshDollar = async () => {
    setIsLoadingDollar(true);
    try {
      // API 'USD-BRL'
      const response = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL');
      const data = await response.json();
      if (data.USDBRL) {
        const ask = parseFloat(data.USDBRL.ask);
        setInput(prev => ({ ...prev, exchangeRate: ask }));
      }
    } catch (error) {
      console.error("Erro ao buscar dólar", error);
    } finally {
      setIsLoadingDollar(false);
    }
  };

  const saveFullProduct = async (data: {name: string, sku: string, category: string, features: string, reference?: string}) => {
    if (!result) return;
    
    // 1. Gerar IA Copy (Gemini)
    let marketingData = null;
    try {
       const res = await fetch('/api/generate-copy', {
          method: 'POST',
          body: JSON.stringify({
            productName: data.name,
            features: data.features,
            reference: data.reference
          })
       });
       if (res.ok) {
         marketingData = await res.json();
       }
    } catch (e) {
      console.error("Erro ao gerar copy na hora de salvar", e);
    }

    const inputToSave = { 
        ...input, 
        productName: data.name, 
        sku: data.sku, 
        productFeatures: data.features,
        referenceText: data.reference // Salvando no histórico
    };
    
    const { data: dbData, error } = await supabase
      .from('saved_skus')
      .insert({
        name: data.name,
        sku_code: data.sku,
        input_data: inputToSave,
        result_data: {
            ...result,
            marketing_kit: marketingData // Salvo dentro do result
        },
        net_profit: result.netProfit,
        net_margin: result.netMargin
      })
      .select()
      .single();

    if (error) {
       console.error('Erro Supabase:', error);
       alert('Erro ao salvar: ' + error.message);
       // Fallback LocalStorage para não perder dados
       const newSKU: SavedSKU = {
          id: crypto.randomUUID(), 
          name: data.name,
          createdAt: new Date().toISOString(),
          input: inputToSave,
          ...result,
       };
       // @ts-ignore
       newSKU.marketing_kit = marketingData;
       
       const currentSaved = JSON.parse(localStorage.getItem('napontadolapis_skus') || '[]');
       localStorage.setItem('napontadolapis_skus', JSON.stringify([newSKU, ...currentSaved]));
       setSavedSKUs(prev => [newSKU, ...prev]);
       return;
    }

    if (dbData) {
      const newSKU: SavedSKU = {
        id: dbData.id,
        name: dbData.name,
        createdAt: dbData.created_at,
        input: dbData.input_data,
        ...dbData.result_data
      };
      setSavedSKUs(prev => [newSKU, ...prev]);
    }
  };

  const updateSavedSKU = async (id: string, updates: Partial<SavedSKU>) => {
    // Montar payload de atualização para o Supabase
    // O SavedSKU tem input e result misturados, mas no DB é input_data e result_data
    
    const payload: any = {};
    
    // Se update tem 'input', atualiza input_data
    if (updates.input) {
      payload.input_data = updates.input;
      // Se input tem sku, atualiza sku_code na coluna dedicada também
      if (updates.input.sku) {
        payload.sku_code = updates.input.sku;
      }
    }

    // Se update tem propriedades do result (ex: recalculo), seria complexo separar.
    // Mas geralmente updateSavedSKU neste app só é usado para atualizar SKU Code.
    
    // Se update tem name
    if (updates.name) payload.name = updates.name;

    // Se update tem marketing_kit, precisamos atualizar o result_data inteiro no banco
    if (updates.marketing_kit) {
        // Encontrar o SKU atual para pegar os resultados financeiros existentes
        const currentSku = savedSKUs.find(s => s.id === id);
        if (currentSku) {
             // Reconstrói o objeto result_data com os dados antigos + novo marketing_kit
             const { id: _id, name: _name, createdAt: _createdAt, input: _input, marketing_kit: _oldMkt, ...financialResults } = currentSku;
             
             payload.result_data = {
                 ...financialResults,
                 marketing_kit: updates.marketing_kit
             };
        }
    }
    
    // Se update tem result fields (cálculo), também atualizaria result_data
    // Isso seria mais complexo se quiséssemos suportar edição de cálculo inline, mas por hora foca no marketing_kit.

    const { error } = await supabase
      .from('saved_skus')
      .update(payload)
      .eq('id', id);

    if (error) {
      alert('Erro ao atualizar: ' + error.message);
      console.error(error);
      return;
    }

    // Atualiza estado local
    setSavedSKUs(prev => prev.map(sku => 
      sku.id === id ? { ...sku, ...updates } : sku
    ));
  };

  const deleteSKU = async (id: string) => {
    const { error } = await supabase
      .from('saved_skus')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Erro ao excluir: ' + error.message);
      return;
    }

    setSavedSKUs(prev => prev.filter(sku => sku.id !== id));
  };

  return (
    <CalculatorContext.Provider value={{
      input,
      setInput,
      result,
      savedSKUs,
      saveFullProduct,
      updateSavedSKU,
      deleteSKU,
      isLoadingDollar,
      refreshDollar
    }}>
      {children}
    </CalculatorContext.Provider>
  );
}

export const useCalculator = () => useContext(CalculatorContext);
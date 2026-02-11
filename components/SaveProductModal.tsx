'use client';

import { useState } from 'react';
import { useCalculator } from '@/contexts/CalculatorContext';
import { Sparkles, X, Loader2, Save, Tag, Box, FileText, CheckCircle } from 'lucide-react';

interface SaveProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SaveProductModal({ isOpen, onClose }: SaveProductModalProps) {
  const { input, saveFullProduct } = useCalculator();
  
  const [step, setStep] = useState<'details' | 'generating' | 'success'>('details');
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    features: '',
    reference: '' 
  });

  if (!isOpen) return null;

  const generateSKU = () => {
    const prefix = formData.category ? formData.category.substring(0, 3).toUpperCase() : 'PROD';
    const namePart = formData.name ? formData.name.substring(0, 3).toUpperCase() : 'X';
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setFormData(prev => ({ ...prev, sku: `${prefix}-${namePart}-${random}` }));
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert('Nome do produto é obrigatório');
      return;
    }

    setStep('generating');

    try {
      // Chamar o Contexto para salvar tudo
      await saveFullProduct({
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        features: formData.features,
        reference: formData.reference
      });

      setStep('success');
      setTimeout(() => {
        onClose();
        setStep('details');
        window.location.href = '/dashboard';
      }, 1500);

    } catch (error: any) {
      alert('Erro: ' + error.message);
      setStep('details');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <Save className="w-5 h-5" />
            Oficializar Produto
          </h2>
          <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {step === 'details' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 mb-4">
                Preencha os dados para salvar na sua carteira e gerar o <strong>Kit de Venda IA</strong>.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nome do Produto <span className="text-red-500">*</span></label>
                <input 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: Fone Bluetooth TWS"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Categoria</label>
                    <select 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="">Selecione...</option>
                      <option value="ELETRONICOS">Eletrônicos</option>
                      <option value="CASA">Casa e Cozinha</option>
                      <option value="MODA">Moda e Acessórios</option>
                      <option value="BELEZA">Beleza e Saúde</option>
                      <option value="PET">Pet Shop</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">SKU</label>
                    <div className="flex gap-2">
                      <input 
                        value={formData.sku}
                        onChange={e => setFormData({...formData, sku: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                        placeholder="AUTO-GERAR"
                      />
                      <button 
                        onClick={generateSKU}
                        className="bg-gray-100 hover:bg-gray-200 px-2 rounded-lg border border-gray-200"
                        title="Gerar SKU Automático"
                      >
                         <Tag className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                 </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex justify-between">
                  Diferenciais (Para a IA)
                  <span className="bg-purple-100 text-purple-700 text-[10px] px-2 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Fundamental
                  </span>
                </label>
                <textarea 
                  value={formData.features}
                  onChange={e => setFormData({...formData, features: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm mb-3"
                  rows={2}
                  placeholder="Liste características chaves: Material premium, Bateria longa duração, Garantia, etc..."
                />

                <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex justify-between">
                  Referência de Sucesso / Concorrente (Opcional)
                  <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 rounded-full flex items-center gap-1">
                     IA vai melhorar isso
                  </span>
                </label>
                <textarea 
                  value={formData.reference}
                  onChange={e => setFormData({...formData, reference: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none text-sm bg-yellow-50/30"
                  rows={3}
                  placeholder="Cole aqui o título/descrição do concorrente líder ou dados do fabricante. A IA usará isso como base para superar."
                />
              </div>

              <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-400 text-center">
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      Powered by <strong>Google Gemini</strong> (Free & Fast)
                  </p>
              </div>

              <button 
                onClick={handleSave}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <Sparkles className="w-5 h-5" />
                Salvar e Gerar Kit de Venda
              </button>
            </div>
          )}

          {step === 'generating' && (
            <div className="text-center py-8 space-y-4">
              <div className="relative mx-auto w-16 h-16">
                 <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                 <Sparkles className="absolute inset-0 m-auto text-blue-500 w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Criando com Gemini AI...</h3>
                <p className="text-sm text-gray-500">Escrevendo anúncios de alta conversão para você.</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8 space-y-4 animate-in zoom-in">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Sucesso!</h3>
                <p className="text-sm text-gray-500">Produto salvo e Kit de Venda gerado.</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

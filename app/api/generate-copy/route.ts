import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { productName, features, reference } = await req.json();

    if (!productName) return NextResponse.json({ error: 'Nome do produto é obrigatório' }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) return NextResponse.json({ error: 'Chave API não configurada.' }, { status: 500 });

    const promptText = `
    ATUE COMO UM ESPECIALISTA EM E-COMMERCE, COPYWRITING E SEO DE ALTO NÍVEL (NÍVEL MERCADO LIVRE PLATINUM / SHOPEE OFICIAL).
    Sua tarefa é criar um KIT DE VENDAS COMPLETO E PROFISSIONAL para o produto: ${productName}.
    
    Diferenciais/Contexto: ${features || "Gere baseado no nome do produto"}.
    Referência Extra: ${reference || ""}

    REGRAS DE OURO:
    1. Texto persuasivo, focado em benefícios e quebra de objeções (Copywriting AIDA).
    2. SEO Otimizado: Use palavras-chave de alta busca organicamente.
    3. Formatação Rica: A descrição deve vir pronta para colar, usando Markdown para titulos, negritos e listas.
    
    RETORNE APENAS UM JSON VÁLIDO COM A SEGUINTE ESTRUTURA EXATA:
    {
      "title_ml": "Título Otimizado ML (Máx 60 chars) - Ex: Fone De Ouvido Bluetooth Sem Fio Potente",
      "title_shopee": "Título Shopee (Máx 100 chars, foco em keywords e apelo) - Ex: Fone Bluetooth TWS Original Gamer...",
      "description": "Crie uma descrição completa e vendedora em MARKDOWN. Estruture assim:\n\n# 🌟 [Nome do Produto com Emojis]\n\n> *[Frase de Impacto / Transformação]*\n\nChegou a solução que você esperava! Com o **[Produto]**, você [Benefício Principal].\n\n## 🚀 PRINCIPAIS BENEFÍCIOS:\n- ✅ **[Benefício 1]:** [Explicação curta]\n- ✅ **[Benefício 2]:** [Explicação curta]\n- ✅ **[Benefício 3]:** [Explicação curta]\n\n## 📋 FICHA TÉCNICA:\n- **Material:** ...\n- **Voltagem:** ...\n(Adicione dados técnicos relevantes)\n\n## 📦 O QUE VEM NA CAIXA:\n- 1x [Produto]\n- 1x [Manual]\n\n## ❓ PERGUNTAS FREQUENTES:\n**1. [Pergunta comum?]**\nR: [Resposta quebra objeção]\n\n**2. [Pergunta comum?]**\nR: [Resposta quebra objeção]\n\n## 🛡️ GARANTIA:\nCompromisso de satisfação ou seu dinheiro de volta.",
      "bullets": [
         "Benfício Curto 1 (Para Bullet ML)",
         "Benfício Curto 2 (Para Bullet ML)",
         "Benfício Curto 3 (Para Bullet ML)",
         "Benfício Curto 4 (Para Bullet ML)",
         "Benfício Curto 5 (Para Bullet ML)"
      ],
      "keywords": "Tags separadas por vírgula para SEO (Ex: fone, bluetooth, sem fio, gamer, tws)",
      "technical_specs": [
         {"label": "Conectividade", "value": "Bluetooth 5.3"},
         {"label": "Bateria", "value": "8 Horas"}
      ],
      "package_contents": ["Fone", "Cabo", "Manual"],
      "faq": [
        {"question": "É original?", "answer": "Sim, produto original com nota fiscal."}
      ]
    }`;

    // ESTRATÉGIA DE REDIRECIONAMENTO V3 (BASEADA NAS CHAVES DISPONÍVEIS DO USUÁRIO)
    // Atualizado para usar os modelos Gemini 2.x e 2.5 detectados
    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro"];
    
    let lastErrorMsg = "";
    
    for (const model of models) {
        try {
            console.log(`Tentando modelo: ${model}...`);
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: promptText }] }]
                })
            });

            const data = await response.json();

            if (!response.ok) {
                const msg = data.error?.message || response.statusText;
                console.warn(`Falha no modelo ${model}: ${msg}`);
                lastErrorMsg = msg;
                continue; // Tenta o próximo
            }

            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!rawText) continue;

            // SUCESSO! Processar e retornar
            const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            try {
                return NextResponse.json(JSON.parse(cleanJson));
            } catch (e) {
                return NextResponse.json({ error: 'Erro ao processar JSON da IA', raw: cleanJson }, { status: 500 });
            }

        } catch (e: any) {
            console.error(`Erro de conexão com modelo ${model}:`, e);
        }
    }

    // Se chegou aqui, todos falharam. Vamos tentar listar os modelos para ajudar no debug
    let availableModels = "Não foi possível listar.";
    try {
        const listReq = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const listData = await listReq.json();
        if (listData.models) {
            availableModels = listData.models.map((m: any) => m.name.replace('models/', '')).join(', ');
        }
    } catch (e) {}

    throw new Error(`Nenhum modelo funcionou. Erro: ${lastErrorMsg}. Modelos disponíveis na sua chave: ${availableModels}`);

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

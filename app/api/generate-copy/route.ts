import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { productName, features, reference } = await req.json();

    if (!productName) return NextResponse.json({ error: 'Nome do produto é obrigatório' }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) return NextResponse.json({ error: 'Chave API não configurada.' }, { status: 500 });

    const promptText = `
    Atue como especialista em E-commerce. Crie um Kit de Vendas para: ${productName}.
    Diferenciais: ${features || "Padrão"}.
    
    Retorne APENAS um JSON:
    {
      "title_ml": "Título ML (60 chars)",
      "title_shopee": "Título Shopee",
      "description": "Descrição persuasiva",
      "bullets": ["Ben1", "Ben2"],
      "keywords": "tags",
      "technical_specs": [{"label": "A", "value": "B"}],
      "package_contents": ["Item"],
      "warranty_text": "Garantia",
      "faq": [{"question": "Q", "answer": "A"}]
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

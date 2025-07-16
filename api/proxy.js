// CÓDIGO FINAL v4.0 - À PROVA DE ERROS
export default async function handler(request, response) {
    // Bloco de permissão CORS
    response.setHeader('Access-Control-Allow-Origin', 'https://utilweb.com.br');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
        return response.status(204).end();
    }
    
    // Validações
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const hfToken = process.env.HF_TOKEN;
        if (!hfToken) {
            return response.status(500).json({ error: 'Token da API (HF_TOKEN) não configurado no servidor' });
        }

        // Usando o modelo mais simples e confiável para o teste final
        const apiUrl = "https://api-inference.huggingface.co/models/TinyLlama/TinyLlama-1.1B-Chat-v1.0";
        
        const hfResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${hfToken}`,
                'Content-Type': 'application/json'
            },
            // Usando um input de teste simples que este modelo espera
            body: JSON.stringify({
                inputs: "Utilweb is an amazing tool."
            })
        });

        // --- LÓGICA ROBUSTA (SUGERIDA PELA OUTRA IA) ---
        // Primeiro, lemos a resposta como texto para evitar erros
        const rawResponse = await hfResponse.text();
        
        // Se a resposta da Hugging Face não foi 'OK' (ex: erro 404, 503), registramos e retornamos o erro
        if (!hfResponse.ok) {
            console.error("[ERRO DA API HF] Resposta não-OK:", { status: hfResponse.status, body: rawResponse });
            return response.status(hfResponse.status).json({ error: "A API da Hugging Face retornou um erro.", details: rawResponse });
        }

        // Agora, com segurança, tentamos fazer o parse do JSON
        let data;
        try {
            data = JSON.parse(rawResponse);
        } catch (e) {
            console.error("[ERRO DE PARSE] A resposta da API não é um JSON válido:", rawResponse);
            return response.status(500).json({ error: "A resposta da API não pôde ser processada.", details: rawResponse });
        }
        // --- FIM DA LÓGICA ROBUSTA ---
        
        // Se tudo deu certo, envia a resposta de sucesso de volta para o site
        return response.status(200).json(data);

    } catch (error) {
        console.error("[ERRO FATAL NO PROXY]", error);
        return response.status(500).json({ error: 'Erro interno crítico no proxy.', details: error.message });
    }
}

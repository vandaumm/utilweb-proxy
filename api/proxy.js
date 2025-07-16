export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const HF_TOKEN = process.env.HF_TOKEN;
  if (!HF_TOKEN) {
    return res.status(500).json({ error: 'Token da Hugging Face não configurado.' });
  }

  let body = '';
  for await (const chunk of req) {
    body += chunk;
  }

  try {
    const { prompt } = JSON.parse(body);
    const apiUrl = "https://api-inference.huggingface.co/models/TinyLlama/TinyLlama-1.1B-Chat-v1.0";

    const hfResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          return_full_text: false,
          temperature: 0.7
        }
      })
    });

    const text = await hfResponse.text();

    if (!hfResponse.ok) {
      console.error("[ERRO DA API HF] Resposta não-OK:", { status: hfResponse.status, body: text });
      return res.status(hfResponse.status).json({ error: "Erro na Hugging Face", status: hfResponse.status, body: text });
    }

    let result;
    try {
      result = JSON.parse(text);
    } catch (err) {
      console.error("[ERRO JSON] A resposta da Hugging Face não é JSON válido:", text);
      return res.status(500).json({ error: "Resposta inválida da Hugging Face", raw: text });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("[ERRO INTERNO] Erro inesperado no proxy:", err);
    res.status(500).json({ error: "Erro interno no proxy", details: err.message });
  }
}

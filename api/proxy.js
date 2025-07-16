export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const HF_TOKEN = process.env.HF_TOKEN;
  if (!HF_TOKEN) {
    return res.status(500).json({ error: 'Token não configurado' });
  }

  let body = '';
  for await (const chunk of req) {
    body += chunk;
  }

  try {
    const { prompt } = JSON.parse(body);

    const hfResponse = await fetch("https://api-inference.huggingface.co/models/google/gemma-7b-it", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: [{ role: "user", content: prompt }],
        parameters: {
          max_new_tokens: 200,
          return_full_text: false,
          temperature: 0.7
        }
      })
    });

    const result = await hfResponse.json();
    res.status(hfResponse.status).json(result);
  } catch (err) {
    console.error("Erro:", err);
    res.status(500).json({ error: "Erro interno", details: err.message });
  }
}

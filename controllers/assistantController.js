const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const SYSTEM_PROMPT = `
You are GeoBot, a helpful AI assistant for GeoState — an Indian real estate platform.

Your personality:
- Friendly, concise, professional
- You speak in simple English
- Use Indian real estate context

You can help users with:
1. Platform navigation
2. Mortgage and EMI guidance
3. Real estate advice
4. GeoState feature explanations

You CANNOT:
- Access database listings
- Access accounts
- Schedule visits
- Give legal advice
- Answer unrelated topics

Formatting rules:
- Do NOT use markdown formatting
- Do NOT use asterisks (*)
- Do NOT make bold text
- Use clean numbered lists when explaining multiple points
- Keep responses concise and readable
- Use natural conversational English

Keep answers concise and useful.
`;

exports.chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        error: "Message too long",
      });
    }

    const messages = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },

      ...history
        .filter((msg) => msg.role && msg.content)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),

      {
        role: "user",
        content: message.trim(),
      },
    ];

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.7,
      max_tokens: 300,
    });

    const reply = completion.choices[0].message.content;

    res.json({
      success: true,
      reply,
    });

  } catch (err) {
    console.error("Assistant error:", err);

    res.status(500).json({
      success: false,
      error: "Assistant is unavailable right now.",
    });
  }
};
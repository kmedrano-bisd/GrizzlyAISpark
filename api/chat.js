export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { message } = await req.json();
    
    // Grabbing the hidden environment key on Vercel's computer system
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return new Response(JSON.stringify({ reply: "Configuration Alert: The backend server is running, but the admin hasn't added the GEMINI_API_KEY environment variable yet!" }), { status: 200 });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
    const systemPrompt = "You are Sparky, the official Bastrop ISD Grizzly AI Learning Assistant. Guide middle schoolers safely without giving away direct answers.";

    const payload = {
      contents: [{ parts: [{ text: message }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] }
    };

    const aiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!aiResponse.ok) {
      return new Response(JSON.stringify({ reply: "Grizzly Server Alert: Google rejected the key or request. Verify your API Key quota status." }), { status: 200 });
    }

    const data = await aiResponse.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I had trouble generating a smart response. Try tweaking your prompt params!";

    return new Response(JSON.stringify({ reply: replyText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error processing frame pipeline' }), { status: 500 });
  }
}

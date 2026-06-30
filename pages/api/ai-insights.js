export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userData, repos, langData } = req.body;

  if (!userData || !repos) {
    return res.status(400).json({ error: "Missing required data" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      insights: "[STRENGTHS]\n• Add GEMINI_API_KEY to .env.local to enable AI insights\n• Get a free key (no card required) at aistudio.google.com/apikey\n• Then redeploy and restart the dev server\n\n[TECH_STACK]\nAPI key not configured.\n\n[CONSISTENCY]\nAPI key not configured.\n\n[OPEN_SOURCE]\nAPI key not configured.\n\n[RECRUITER_SUMMARY]\nAdd your Gemini API key to enable this feature.\n\n[IMPROVEMENTS]\n• Add GEMINI_API_KEY to your environment\n• Get a free key at aistudio.google.com/apikey\n• Restart the server after adding the key"
    });
  }

  const topLangs = langData.slice(0, 5).map((l) => l.name).join(", ");
  const totalStars = repos.reduce((a, r) => a + r.stargazers_count, 0);

  const prompt = `Analyze this GitHub developer profile and provide a terminal-style analysis report.

Developer: ${userData.name || userData.login}
Username: ${userData.login}
Bio: ${userData.bio || "N/A"}
Public Repos: ${userData.public_repos}
Followers: ${userData.followers}
Following: ${userData.following}
Total Stars: ${totalStars}
Top Languages: ${topLangs}
Account Created: ${new Date(userData.created_at).getFullYear()}
Location: ${userData.location || "N/A"}
Company: ${userData.company || "N/A"}

Top 5 Repos:
${repos.slice(0, 5).map((r) => `- ${r.name}: ${r.description || "No description"} (${r.stargazers_count}★, ${r.language || "N/A"})`).join("\n")}

Respond in a structured terminal format with these exact section headers on their own lines:
[STRENGTHS]
3 bullet points (use • prefix) about specific developer strengths based on their actual data.

[TECH_STACK]
2-3 sentences assessing their technology choices, stack depth, and specialization.

[CONSISTENCY]
2-3 sentences on coding consistency, activity patterns, and commitment to open source.

[OPEN_SOURCE]
2-3 sentences analyzing their open source contributions and community involvement.

[RECRUITER_SUMMARY]
Exactly 2 sentences. A recruiter-ready professional summary of this developer.

[IMPROVEMENTS]
3 bullet points (use • prefix) with specific, actionable improvement suggestions.

Keep each section concise and specific to their actual data. Use plain text only, no markdown formatting.`;

  // Gemini's free tier needs no credit card. Get a key at https://aistudio.google.com/apikey
  const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1000 },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(500).json({ error: err.error?.message || `Gemini API error ${response.status}` });
    }

    const data = await response.json();
    const insights = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
    return res.status(200).json({ insights });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

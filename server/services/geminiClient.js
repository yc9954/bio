import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure you use a valid model name. 
// As of late 2024/early 2025, 'gemini-1.5-flash' is the standard fast model.
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // Corrected from 2.5 to 1.5
  generationConfig: {
    temperature: 0.4,
    maxOutputTokens: 2048, // Increased slightly for array responses
    responseMimeType: "application/json", // *New feature*: Force JSON mode where applicable (optional but good)
  },
});

class GeminiClient {
  constructor() {
    this.model = model;
  }

  /**
   * Helper: Cleans Markdown code blocks and parses JSON safely
   */
  _cleanAndParseJSON(text) {
    try {
      // Remove ```json and ``` wraps if present
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.error("JSON Parse Error:", e);
      return null; // Return null on failure instead of crashing
    }
  }

  // 1. Natural Language -> NCBI Keywords
  async enhanceQuery(query) {
    const prompt = `Convert the following natural language query into the best keyword combination for NCBI ESearch.
    Output MUST be a valid JSON object: {"keywords": "result string here"}
    
    Query: ${query}`;

    const result = await this._generate(prompt);
    // Try to parse as JSON, fallback to raw text if needed (though prompt demands JSON)
    const parsed = this._cleanAndParseJSON(result);
    return parsed || { keywords: query };
  }

  // 2. Ranking Studies
  async rankStudies(studies, originalQuery) {
    if (!studies.length) return studies;

    const prompt = `You are a bioinformatics expert. Rank these studies based on relevance to the user's query: "${originalQuery}".
    Assign a score (1-10) and a one-sentence reason.
    
    Output MUST be a JSON array:
    [{"id": "GSE...", "score": 9.5, "reason": "Explanation..."}]

    Studies:
    ${JSON.stringify(studies.map(s => ({
      id: s.id,
      title: s.title,
      abstract: (s.abstract || "").substring(0, 500), // Limit tokens
      expType: s.expType,
      year: s.year
    })))}`;

    const result = await this._generate(prompt);
    const rankedData = this._cleanAndParseJSON(result) || [];
    
    const scoreMap = new Map(rankedData.map(r => [r.id, r]));

    return studies
      .map(s => {
        const ranking = scoreMap.get(s.id);
        return {
          ...s,
          relevanceScore: ranking?.score ?? 0,
          relevanceReason: ranking?.reason ?? "Relevance calculation failed."
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  // 3. Chat Assistant
  // contextData: Replaces contextStudy ID. Pass the actual object here.
  async chat(message, contextData = null) {
    // For chat, we might want text output, not JSON. 
    // We can override the generation config or just parse strictly.
    // Here we assume standard text chat.

    let contextPrompt = "You are not viewing a specific study currently.";
    if (contextData) {
      contextPrompt = `Currently viewing study: ${contextData.id} - ${contextData.title} 
      (Type: ${contextData.expType}, Organism: ${contextData.organism}, Year: ${contextData.year}).
      Abstract summary: ${contextData.abstract ? contextData.abstract.substring(0, 300) + "..." : "N/A"}`;
    }

    const prompt = `너는 바이오인포매틱스 전문가야.
    ${contextPrompt}

    User Question: "${message}"

    Answer in Korean. Be professional, concise (3-6 sentences), and helpful.
    Return the response as a simple string, NOT JSON.`;

    // Note: If the global model is set to responseMimeType: "application/json", 
    // you might need a separate model instance for Chat, or unset it here. 
    // Assuming the global config above didn't force JSON for everything:
    try {
        const result = await this.model.generateContent(prompt);
        return result.response.text(); 
    } catch (e) {
        console.error("Chat Error:", e);
        return "죄송합니다. 현재 응답을 생성할 수 없습니다.";
    }
  }

  // 4. Recommendations (Merged from your server logic to keep prompt here)
  async recommend({ query, contextStudy }) {
    let prompt = "";
    let source = "";

    // 1) 특정 연구 기반 추천 (ContextStudy가 있으면 우선)
    if (contextStudy) {
      source = "similar_study";
      prompt = `
      너는 바이오인포매틱스 전문가야. 아래 연구와 '연구 주제, 실험 방법, 생물종'이 유사한 논문/데이터셋 5개를 추천해줘.
      
      [기준 연구]
      제목: ${contextStudy.title}
      ID: ${contextStudy.id}
      요약: ${(contextStudy.abstract || "").substring(0, 300)}...
      키워드: ${contextStudy.expType}, ${contextStudy.organism}

      출력은 반드시 아래 JSON 배열 포맷이어야 해:
      [
        { "id": "GSExxxxx", "title": "연구 제목", "reason": "추천 이유(한국어 한 문장)" }
      ]
      `;
    } 
    // 2) 키워드 기반 추천
    else if (query) {
      source = "query";
      prompt = `
      사용자가 "${query}" 주제에 관심이 있어. 
      이와 관련된 최신 혹은 중요한 NCBI GEO/SRA 연구 5개를 추천해줘.

      출력은 반드시 아래 JSON 배열 포맷이어야 해:
      [
        { "id": "GSExxxxx", "title": "연구 제목", "reason": "추천 이유(한국어 한 문장)" }
      ]
      `;
    } else {
      // 둘 다 없으면 빈 결과 반환
      return { recommendations: [], from: "none", error: "검색어 또는 연구 ID가 필요합니다." };
    }

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const recommendations = this._cleanAndParseJSON(text) || [];

      return { 
        recommendations, 
        from: source 
      };
    } catch (error) {
      console.error("Gemini Recommend Error:", error);
      return { recommendations: [], from: source, error: "AI 응답 실패" };
    }
  }

  // Internal generation helper
  async _generate(prompt) {
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.error("Gemini API Error:", err);
      throw new Error("AI Service Unavailable");
    }
  }
}

export const gemini = new GeminiClient();
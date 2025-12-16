import { GoogleGenAI } from "@google/genai";
import { SPREADS } from "./data";
import { DrawnCard, Spread, ChatMessage } from "./types";

// Helper to get clean string from env
const getApiKey = () => process.env.API_KEY || '';

export const analyzeIntentAndSelectSpread = async (question: string, model: string = 'gemini-2.5-flash'): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  const spreadDescriptions = SPREADS.map(s => `- ID: ${s.id}, Name: ${s.name}, Description: ${s.description}`).join('\n');
  
  const prompt = `
    你是一位专业的塔罗牌占卜师。
    用户的问题是: "${question}"
    
    请根据这个问题，从下面的列表中选择最合适的一个牌阵：
    ${spreadDescriptions}
    
    仅返回选定牌阵的 ID。不要添加任何解释或 Markdown 格式。
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    const text = response.text?.trim() || 'three_card_time';
    // Fallback if AI hallucinates an ID
    const exists = SPREADS.find(s => s.id === text);
    return exists ? text : 'three_card_time';
  } catch (error) {
    console.error("Gemini Intent Error:", error);
    return 'three_card_time'; // Default fallback
  }
};

export const getReadingStream = async (question: string, spread: Spread, drawnCards: DrawnCard[], model: string = 'gemini-2.5-flash') => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  const cardsDescription = drawnCards.map(c => 
    `位置: ${c.spreadPositionIndex + 1} (${spread.positions[c.spreadPositionIndex].name})
     牌名: ${c.name}
     状态: ${c.isReversed ? "逆位 (Reversed)" : "正位 (Upright)"}
     位置含义: ${spread.positions[c.spreadPositionIndex].description}`
  ).join('\n\n');

  const prompt = `
    你是一位神秘、智慧且富有同理心的塔罗牌解读师，使用的是“量子塔罗”系统。
    请使用中文（简体）进行回答。
    
    求问者的问题: "${question}"
    使用的牌阵: ${spread.name} - ${spread.description}
    
    抽出的卡牌:
    ${cardsDescription}
    
    请根据问题，对这些卡牌提供详尽的解读。将所有卡牌的含义联系起来，讲述一个连贯的故事。
    
    **重要格式要求：**
    1. 请直接返回 **HTML** 格式的内容。
    2. **不要**使用 markdown (如 **bold**, # header) 或 code block (如 \`\`\`html)。
    3. 使用 <h3> 标签作为小标题（如“逐张解读”、“综合指引”）。
    4. 使用 <p> 标签作为段落。
    5. 使用 <strong> 标签来强调重点或卡牌名称。
    6. 使用 <ul class="list-disc pl-5"> 和 <li> 来列出建议。
    7. 保持 HTML 结构简洁，不要包含 <html> 或 <body> 标签，只返回内容片段。

    内容结构：
    1. 开场白：简短而神秘，致敬牌阵的能量。
    2. 逐张解读：解析每张牌在对应位置的意义。
    3. 综合指引：总结答案，将所有线索串联。
    4. 量子行动建议：给用户的一条切实可行的建议。
  `;

  return await ai.models.generateContentStream({
    model: model,
    contents: prompt,
  });
};

export const getFollowUpStream = async (
  history: ChatMessage[],
  newMessage: string,
  context: { question: string, spread: Spread, cards: DrawnCard[], initialReading: string },
  model: string = 'gemini-2.5-flash'
) => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    const cardsInfo = context.cards.map(c => 
        `${c.name} (${c.isReversed ? "逆位" : "正位"})`
    ).join(', ');

    // 剥离 HTML 标签以获取纯文本作为上下文，减少 Token 消耗并避免干扰
    const cleanReading = context.initialReading.replace(/<[^>]*>/g, '');

    const systemInstruction = `
    你正在扮演一位神秘的量子塔罗占卜师。
    
    【当前占卜档案】
    求问者问题: "${context.question}"
    牌阵: ${context.spread.name}
    抽出的牌: ${cardsInfo}
    初步解读概要: ${cleanReading.slice(0, 2000)}... (以上是部分之前给出的解读)
    
    【任务】
    用户现在对解读结果提出了追问或想要聊更多。
    请继续以占卜师的身份回答，保持对话的连贯性。
    
    【回答风格】
    1. 保持神秘、睿智、富有同理心。
    2. 结合牌面含义进行进一步阐述，不要脱离牌意。
    3. 简练直接，适合聊天对话场景，不要长篇大论的重复之前的解读。
    4. 请直接输出纯文本，**不要**使用 HTML 标签。
    `;
    
    // Map internal history to API history format
    const apiHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    const chat = ai.chats.create({
        model: model,
        config: { systemInstruction },
        history: apiHistory
    });

    return await chat.sendMessageStream({ message: newMessage });
};
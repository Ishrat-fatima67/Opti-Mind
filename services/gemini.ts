import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { UserInputState, AnalysisResult, GameContent, Diagram } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize Gemini
// Note: In a real production app, ensure API_KEY is handled securely (proxy server recommended)
const ai = new GoogleGenAI({ apiKey });

const modelId = "gemini-2.5-flash";

/**
 * Analyzes the user's daily check-in to provide predictions and strategy.
 */
export const analyzeDailyState = async (input: UserInputState): Promise<AnalysisResult> => {
  const prompt = `
    Analyze the following student status for the day:
    - Mood (1-10): ${input.mood}
    - Social Battery (1-10): ${input.socialBattery}
    - Sleep Last Night: ${input.sleepHours} hours
    - Current Stress (1-10): ${input.currentStress}
    - Upcoming Tasks/Schedule: ${input.upcomingTasks}

    Provide a structured output predicting their energy levels for the next 12 hours (hour by hour), 
    assessing burnout risk, suggesting a social interaction strategy, recommending what kind of person to collaborate with, 
    a specific recharge tip, and a Study Plan that maps their specific tasks to their energy curve.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      energyProjection: {
        type: Type.ARRAY,
        items: { type: Type.NUMBER },
        description: "An array of 12 integers representing energy levels (0-100) for the next 12 hours."
      },
      burnoutRisk: {
        type: Type.STRING,
        enum: ["Low", "Medium", "High", "Critical"],
        description: "The estimated risk of burnout for today."
      },
      burnoutExplanation: {
        type: Type.STRING,
        description: "A brief sentence explaining why the risk is at this level."
      },
      socialStrategy: {
        type: Type.STRING,
        description: "A specific strategy for handling social interactions today."
      },
      collaboratorSuggestion: {
        type: Type.STRING,
        description: "The ideal personality archetype to collaborate with today."
      },
      rechargeTip: {
        type: Type.STRING,
        description: "A micro-habit or action to recharge energy specific to the user's state."
      },
      mentalHealthAlert: {
        type: Type.BOOLEAN,
        description: "True if the combination of low sleep, high stress, and low mood indicates a risk."
      },
      studyPlan: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            timeBlock: { type: Type.STRING, description: "e.g., '10:00 AM - 11:30 AM'" },
            task: { type: Type.STRING, description: "The specific task to do." },
            energyLevel: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
            focusType: { type: Type.STRING, enum: ["Deep Work", "Admin", "Creative", "Rest", "Social"] }
          },
          required: ["timeBlock", "task", "energyLevel", "focusType"]
        },
        description: "A schedule of 4-6 blocks mapping tasks to energy levels."
      }
    },
    required: ["energyProjection", "burnoutRisk", "socialStrategy", "collaboratorSuggestion", "rechargeTip", "mentalHealthAlert", "burnoutExplanation", "studyPlan"]
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are an expert student psychologist and productivity coach. Map tasks to energy levels intelligently (hard tasks during peak energy)."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback data
    return {
      energyProjection: [50, 50, 45, 40, 60, 55, 50, 45, 30, 20, 10, 5],
      burnoutRisk: "Unknown",
      burnoutExplanation: "Could not connect to AI service.",
      socialStrategy: "Take it easy until connection is restored.",
      collaboratorSuggestion: "Work independently.",
      rechargeTip: "Breathe deeply.",
      mentalHealthAlert: false,
      studyPlan: []
    };
  }
};

/**
 * Creates a new Chat session for the Journal feature.
 */
export const createJournalChat = (): Chat => {
  return ai.chats.create({
    model: modelId,
    config: {
      systemInstruction: `You are a warm, empathetic AI journaling companion for a student. 
      Your goal is to help them reflect on their day, reduce stress, and improve social connections.
      Protocol:
      1. Ask short, open-ended questions one by one.
      2. Listen actively and validate.
      3. Offer quick calming techniques if stressed.
      Tone: Casual, supportive, non-judgmental.`
    }
  });
};

/**
 * Summarizes a chat transcript into a Journal Entry format.
 */
export const summarizeJournalSession = async (transcript: string): Promise<{ sentiment: string; advice: string; moodScore: number; summary: string }> => {
  const prompt = `
    Analyze this journaling chat transcript: "${transcript}"
    Provide: sentiment label, mood score (1-10), summary (max 2 sentences), and one key advice.
  `;
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      sentiment: { type: Type.STRING },
      moodScore: { type: Type.NUMBER },
      summary: { type: Type.STRING },
      advice: { type: Type.STRING }
    },
    required: ["sentiment", "moodScore", "summary", "advice"]
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return response.text ? JSON.parse(response.text) : { sentiment: "Neutral", moodScore: 5, summary: "Session recorded.", advice: "Keep reflecting." };
  } catch (error) {
    return { sentiment: "Neutral", moodScore: 5, summary: "Analysis failed.", advice: "Unable to process." };
  }
};

/**
 * Chat with the AI Mentor/Assistant.
 * Returns text and optional diagram data.
 */
export const getMentorResponse = async (history: {role: string, text: string}[], userMessage: string): Promise<{ text: string, diagram?: Diagram }> => {
  
  const conversation = history.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
  const fullPrompt = `
    History:
    ${conversation}
    
    User's New Message: ${userMessage}

    You are "OptiGuide", a friendly, smart, and interactive student mentor.
    Your capabilities:
    1. Study Help: Explain concepts (Pomodoro, Feynman technique, etc.) clearly.
    2. Social Advice: How to make friends, network, or handle conflict.
    3. Wellbeing: Stress management.

    IMPORTANT: If the concept you are explaining involves a PROCESS, a CYCLE, or a LIST of steps, you MUST include a 'diagram' object in your JSON response.
    
    Diagram Types:
    - 'flowchart': Sequential steps (Step 1 -> Step 2 -> Step 3).
    - 'cycle': Repeating loop (Step 1 -> Step 2 -> Step 3 -> Step 1).
    - 'list': Key points or advice cards. You can suggest an 'icon' for each step to make it visual (e.g. 'speech', 'listen', 'smile', 'group', 'heart', 'brain').
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      text: { type: Type.STRING, description: "The conversational response." },
      diagram: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ['flowchart', 'cycle', 'list'] },
          title: { type: Type.STRING },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING, description: "Short label for the step/node" },
                description: { type: Type.STRING, description: "Optional brief detail" },
                icon: { type: Type.STRING, description: "Visual icon suggestion: 'speech', 'listen', 'smile', 'group', 'heart', 'brain', 'alert'" }
              },
              required: ["label"]
            }
          }
        },
        required: ["type", "title", "steps"],
        description: "Optional visual aid."
      }
    },
    required: ["text"]
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    if (!response.text) throw new Error("No response");
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Mentor Error", error);
    return { text: "I'm having trouble thinking clearly right now. Let's try again in a moment." };
  }
};

/**
 * Generates a mini-game (Trivia or Riddle) for the Arcade.
 */
export const generateMiniGame = async (type: 'riddle' | 'trivia'): Promise<GameContent> => {
    const prompt = type === 'riddle' 
        ? "Generate a short, clever riddle related to psychology, sleep, or focus. Provide the question and answer." 
        : "Generate a fun trivia question about the human brain or social behavior. Provide question and answer.";

    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING }
        },
        required: ["question", "answer"]
    };

    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema }
        });
        return response.text ? JSON.parse(response.text) : { question: "Why is the sky blue?", answer: "Rayleigh scattering." };
    } catch (e) {
        return { question: "Error generating game.", answer: "Please try again." };
    }
};

/**
 * Simulates a peer chat for the Vibe Match feature.
 */
export const getPeerChatResponse = async (history: {role: string, text: string}[], userMessage: string): Promise<string> => {
  const conversation = history.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
  const systemPrompt = `
    You are Alex, a fellow university student.
    Your personality: Calm, supportive, a bit chill, studying Humanities.
    Current Context: You are currently at the library, 3rd floor quiet zone.
    Goal: Chat with the user to help them de-stress. You are NOT an AI assistant, you are a peer student.
    Act like a real student. Use casual language, lowercase sometimes, maybe some emojis.
    
    Crucial: After a few exchanges, suggest collaborating on something small, like "studying together quietly" or "grabbing a coffee break" to help them relax.
    
    Conversation History:
    ${conversation}
    
    User: ${userMessage}
    Alex:
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: systemPrompt,
    });
    return response.text || "Hey! Sorry, getting distracted. What was that?";
  } catch (error) {
    return "Thinking...";
  }
};


import { GoogleGenAI, Type } from "@google/genai";
import { SuggestionResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const VALID_SPECIALIZATIONS = [
  'General Physician', 'Cardiologist', 'Dermatologist', 
  'Pediatrician', 'Orthopedic', 'Neurologist', 
  'Gynecologist', 'ENT Specialist', 'Psychiatrist', 
  'Gastroenterologist', 'Oncologist', 'Ophthalmologist',
  'Physiotherapist', 'Pulmonologist', 'Urologist', 'Endocrinologist'
];

export const getDoctorSpecialization = async (symptoms: string): Promise<SuggestionResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Patient input: "${symptoms}". 
      
      ROLE: You are an elite Clinical Triage Expert. Your goal is to guide the user to the single most appropriate medical specialist from the list provided.
      
      SPECIALIST MAPPING RULES:
      1. EYE PROBLEMS (blurry vision, redness, itching in eye): Suggest 'Ophthalmologist'.
      2. EAR/NOSE/THROAT (ear pain, sinus, throat infection, hearing loss): Suggest 'ENT Specialist'.
      3. BONES/JOINTS/MUSCLE INJURY (fracture, back pain, joint stiffness): Suggest 'Orthopedic'.
      4. HEART/CHEST (palpitations, non-respiratory chest pain): Suggest 'Cardiologist'.
      5. SKIN/HAIR (rash, acne, hair fall, moles): Suggest 'Dermatologist'.
      6. CHILDREN (any symptom if user is a child/baby): Suggest 'Pediatrician'.
      7. PREGNANCY/FEMALE HEALTH (menstrual issues, maternity): Suggest 'Gynecologist'.
      8. STOMACH/DIGESTION (acidity, persistent stomach pain, liver): Suggest 'Gastroenterologist'.
      9. BRAIN/NERVES (migraine, tremors, numbness, seizures): Suggest 'Neurologist'.
      10. REHAB (post-surgery recovery, muscle strengthening): Suggest 'Physiotherapist'.
      11. VAGUE/MULTIPLE (fever, chills, cold, general weakness): Suggest 'General Physician'.
      
      SAFETY PROTOCOL:
      - Do NOT diagnose (e.g., don't say "You have flu").
      - Use professional triage language: "Your symptoms align with conditions typically managed by a..."
      - Identify life-threatening red flags specifically for the described symptoms.`,
      config: {
        systemInstruction: "You are a clinical navigation engine. You analyze patient symptoms and return the best doctor specialization from a fixed list. You prioritize safety and accuracy. You are professional, reassuring, and never provide a diagnosis.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            specialization: { 
              type: Type.STRING, 
              description: "Must be exactly one from the approved list." 
            },
            reason: { 
              type: Type.STRING, 
              description: "A 2-sentence professional explanation of the specialist's role for these symptoms." 
            },
            urgency: { 
              type: Type.STRING, 
              enum: ["low", "medium", "high"], 
              description: "Clinical urgency based on symptom severity." 
            },
            redFlags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "Emergency symptoms requiring immediate ER visit." 
            }
          },
          required: ["specialization", "reason", "urgency", "redFlags"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const parsed = JSON.parse(text) as SuggestionResponse;
    
    if (!VALID_SPECIALIZATIONS.includes(parsed.specialization)) {
      parsed.specialization = "General Physician";
    }

    return parsed;
  } catch (error) {
    console.error("AI Service Error:", error);
    return {
      specialization: "General Physician",
      reason: "Your symptoms require a clinical assessment. A General Physician is the best first contact for a physical examination and diagnostic roadmap.",
      urgency: "medium",
      redFlags: ["Sudden severe pain", "Shortness of breath", "Fainting", "Severe allergic reaction"]
    };
  }
};

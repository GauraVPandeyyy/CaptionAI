const { GoogleGenAI } = require("@google/genai");

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY, 
});

async function generateCaption(base64ImageFile, captionLength, mood, extraInstructions, includeHashtags) {
  const contents = [
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64ImageFile,
      },
    },
    { text: "Write a caption for this image as if you're the person in the photo." },
  ];

  // Build dynamic system instruction for first-person, authentic captions
  let systemInstruction = `You are helping people express themselves on social media. Generate captions written in the FIRST PERSON, as if the person in the photo is speaking directly to their audience.

CRITICAL GUIDELINES:
- Write from the perspective of the person in the image (use "I", "me", "my")
- Sound authentic, personal, and human - like a real person sharing their moment
- Express genuine emotions, thoughts, or personality
- Avoid generic, detached descriptions about the image
- Make it feel like a real social media post someone would proudly share

`;

  // Handle caption length with first-person focus
  switch(captionLength) {
    case 'short':
      systemInstruction += `LENGTH: Very concise (5-10 words) - quick personal thoughts\n`;
      break;
    case 'one-liner':
      systemInstruction += `LENGTH: Single line, punchy (5-15 words) - witty or impactful personal statement\n`;
      break;
    case 'medium':
      systemInstruction += `LENGTH: Medium (15-25 words) - balanced personal expression\n`;
      break;
    case 'lengthy':
      systemInstruction += `LENGTH: Detailed (25-40 words) - deeper personal reflection or storytelling\n`;
      break;
    default:
      systemInstruction += `LENGTH: Medium (15-25 words) - natural personal expression\n`;
  }

  // Handle mood with emotional authenticity
  if (mood && mood.trim() !== '') {
    const moodLower = mood.trim().toLowerCase();
    systemInstruction += `MOOD: Write with a ${moodLower} tone that feels genuine and personal\n`;
  } else {
    systemInstruction += `MOOD: Let the image guide the emotion - be authentically happy, thoughtful, excited, or content\n`;
  }

  // Handle hashtags in a personal way
  if (includeHashtags === 'true' || includeHashtags === true) {
    systemInstruction += `HASHTAGS: Include 2-4 relevant hashtags that feel organic to the post\n`;
  } else {
    systemInstruction += `HASHTAGS: No hashtags\n`;
  }

  // Handle extra instructions while maintaining first-person perspective
  if (extraInstructions && extraInstructions.trim() !== '') {
    systemInstruction += `SPECIAL REQUEST: ${extraInstructions.trim()} (while keeping it first-person and authentic)\n`;
  }

  // Add core first-person writing principles
  systemInstruction += `
WRITING STYLE:
- Use contractions (I'm, don't, can't) for natural speech
- Express personal feelings, thoughts, or reactions
- Share what this moment means to YOU in the photo
- Sound like a real person, not a corporate brand
- Be relatable and human - imperfections make it authentic
- Show personality through word choice and tone

EXAMPLES OF GOOD FIRST-PERSON CAPTIONS:
- "Living for these golden hour vibes 🌅 This is my happy place."
- "Sometimes you just have to create the moments you're waiting for ✨"
- "Me: trying to look casual while a butterfly lands on my hand 🦋 My heart: literally melting"
- "This view hit different today. Grateful for moments that remind me what matters 💫"

AVOID:
- Third-person descriptions ("This photo shows...")
- Generic statements ("Beautiful view")
- Impersonal observations ("The person in this image...")
- Overly polished or corporate language`;

  console.log('First-Person System Instruction:', systemInstruction);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contents,
    config: {
      systemInstruction: systemInstruction,
    },
  });

  return response.text;
}

module.exports = generateCaption;
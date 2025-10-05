const { GoogleGenAI } = require("@google/genai");

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY, 
});


async function generateCaption(base64ImageFile) {
  const contents = [
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64ImageFile,
      },
    },
    { text: "Caption this image." },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contents,
    config: {
      systemInstruction: `You are a professional AI caption generator.

        Analyze the uploaded image carefully and generate an engaging caption.

        Guidelines:
        - Keep each caption under 15 words.
        - Capture the image’s mood, emotion, or story.
        - Write in natural, human-like language.
        - Use hashtags and emojis so that they enhance meaning.
        - Provide-A creative caption (storytelling or emotional tone with humor)`,
    },
  });

  return response.text;
}

module.exports = generateCaption;

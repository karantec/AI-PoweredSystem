import OpenAI from "openai";

const client = new OpenAI({
  apiKey:
    "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", // hardcoded (local only)
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000", // required by OpenRouter
    "X-Title": "customer-support-ai",
  },
});

async function test() {
  console.log("Testing OpenRouter API...");

  try {
    const completion = await client.chat.completions.create({
      model: "meta-llama/llama-3.1-8b-instruct",
      messages: [{ role: "user", content: "Say hello in one sentence" }],
    });

    console.log("✅ OpenRouter works!");
    console.log("Response:", completion.choices[0].message.content);
  } catch (error) {
    console.error("❌ OpenRouter error:", error.message);
  }
}

test();

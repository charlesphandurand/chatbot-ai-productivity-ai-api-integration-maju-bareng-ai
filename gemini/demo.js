const dotenv = require("dotenv");
dotenv.config();

const { generateGeminiText } = require("./client");

async function main() {
  const promptFromArgs = process.argv.slice(2).join(" ").trim();
  const prompt = promptFromArgs || "Buat jawaban singkat tentang cara belajar programming yang efektif.";

  const text = await generateGeminiText(prompt);
  console.log(text);
}

main().catch((err) => {
  console.error("Gemini demo error:", err?.message || err);
  process.exit(1);
});


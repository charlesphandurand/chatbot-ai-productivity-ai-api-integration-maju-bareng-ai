const { GoogleGenerativeAI } = require("@google/generative-ai");

function requireNonEmpty(value, name) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value.trim();
}

function getIntEnv(name, fallback) {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallback;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n)) return fallback;
  return n;
}

function getFloatEnv(name, fallback) {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallback;
  const n = Number.parseFloat(raw);
  if (Number.isNaN(n)) return fallback;
  return n;
}

function getCsvEnv(name) {
  const raw = process.env[name];
  if (raw == null || raw.trim() === "") return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildModelConfig({
  model = process.env.GEMINI_MODEL || "gemini-2.5-flash",
  temperature = getFloatEnv("GEMINI_TEMPERATURE", 0.7),
  maxOutputTokens = getIntEnv("GEMINI_MAX_OUTPUT_TOKENS", 256),
  systemInstruction = process.env.GEMINI_SYSTEM_INSTRUCTION || undefined,
} = {}) {
  const generationConfig = {
    temperature,
    maxOutputTokens,
  };

  const modelConfig = {
    model,
    generationConfig,
  };

  if (systemInstruction) modelConfig.systemInstruction = systemInstruction;
  return modelConfig;
}

function createGeminiClient(apiKey = process.env.GOOGLE_API_KEY) {
  const key = requireNonEmpty(apiKey, "GOOGLE_API_KEY");
  return new GoogleGenerativeAI(key);
}

function getRequestOptions() {
  // SDK default is v1beta; some models/methods aren't available there.
  return {
    apiVersion: process.env.GEMINI_API_VERSION || "v1",
  };
}

function shouldRetryModelError(err) {
  const msg = String(err?.message || err || "");
  // 404 models not found / not supported
  const has404 = msg.includes("404");
  const hasModelsPrefix = msg.includes("models/");
  if (process.env.GEMINI_DEBUG === "true") {
    console.log(
      `[Gemini] RetryCheck has404=${has404} hasModelsPrefix=${hasModelsPrefix}`
    );
  }
  return has404 && hasModelsPrefix;
}

async function generateWithFirstWorkingModel({
  generativeAI,
  prompt,
  requestOptions,
  modelCandidates,
  baseModelConfig,
}) {
  let lastErr;

  for (const candidate of modelCandidates) {
    if (process.env.GEMINI_DEBUG === "true") {
      // Jangan pernah log API key.
      console.log(
        `[Gemini] Try model="${candidate}" apiVersion="${requestOptions?.apiVersion || ""}"`
      );
    }
    const model = generativeAI.getGenerativeModel(
      { ...baseModelConfig, model: candidate },
      requestOptions
    );
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      lastErr = err;
      if (process.env.GEMINI_DEBUG === "true") {
        console.log(
          `[Gemini] Model failed: "${candidate}" err=${String(
            err?.message || err
          )}`
        );
      }
      if (!shouldRetryModelError(err)) throw err;
    }
  }

  throw lastErr;
}

async function generateGeminiText(prompt, options = {}) {
  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    throw new Error("prompt must be a non-empty string");
  }

  const generativeAI = createGeminiClient(options.apiKey);
  const requestOptions = options.requestOptions || getRequestOptions();

  const requestedModel =
    options.modelConfig?.model || process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const envFallbacks = getCsvEnv("GEMINI_MODEL_FALLBACKS");
  const fallbackModels =
    options.modelCandidates ||
    (envFallbacks.length > 0
      ? envFallbacks
      : [
          "gemini-2.5-pro",
          "gemini-2.5-flash",
          "gemini-2.0-flash-lite",
          "gemini-2.0-flash-lite-001",
          "gemini-2.0-flash",
          "gemini-2.0-flash-001",
          "gemini-2.5-flash-lite",
        ]);

  const modelCandidates = Array.from(
    new Set([requestedModel, ...fallbackModels].filter(Boolean))
  );

  const baseModelConfig = buildModelConfig(options.modelConfig);
  return generateWithFirstWorkingModel({
    generativeAI,
    prompt,
    requestOptions,
    modelCandidates,
    baseModelConfig,
  });
}

module.exports = {
  buildModelConfig,
  createGeminiClient,
  generateGeminiText,
};


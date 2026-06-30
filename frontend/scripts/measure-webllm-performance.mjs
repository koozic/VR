import { chromium } from "playwright";

const DEFAULT_URL = "http://127.0.0.1:5173";
const DEFAULT_ROUNDS = 3;
const DEFAULT_TIMEOUT_MS = 180_000;

function readOption(name, fallback) {
  const prefix = `--${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix));
  return value ? value.slice(prefix.length) : fallback;
}

const appUrl = readOption("url", process.env.WEBLLM_MEASURE_URL || DEFAULT_URL);
const rounds = Number(readOption("rounds", process.env.WEBLLM_MEASURE_ROUNDS || DEFAULT_ROUNDS));
const executablePath = readOption("chrome", process.env.PLAYWRIGHT_CHROME_PATH);
const headless = readOption("headless", process.env.PLAYWRIGHT_HEADLESS || "true") !== "false";

if (!Number.isInteger(rounds) || rounds < 1) {
  throw new Error("--rounds must be a positive integer");
}

const launchOptions = {
  headless,
  args: ["--enable-unsafe-webgpu", "--enable-features=Vulkan"],
};

if (executablePath) {
  launchOptions.executablePath = executablePath;
}

const browser = await chromium.launch(launchOptions);
const page = await browser.newPage();
page.setDefaultTimeout(DEFAULT_TIMEOUT_MS);

try {
  await page.goto(appUrl, { waitUntil: "domcontentloaded" });

  const results = await page.evaluate(
    async ({ rounds: runCount }) => {
      const { prepareWebLlmModel, generateWebLlmDocentResponse, getWebLlmModelId } =
        await import("/src/api/webLlmApi.js");

      const context = {
        title: "Creation of Adam",
        creator: "Michelangelo",
        description:
          "The fresco shows the moment before Adam receives life, with two hands reaching toward each other.",
        keywords: ["fresco", "Renaissance", "Sistine Chapel"],
        exampleText: "Explain verified exhibit information in a concise docent tone.",
        userQuestion: "이 작품을 짧게 설명해줘.",
      };

      const now = () => performance.now();
      const measurements = [];
      const progress = [];
      const prepareStartedAt = now();

      await prepareWebLlmModel((message) => {
        progress.push({ atMs: Math.round(now() - prepareStartedAt), message });
      });

      const prepareMs = now() - prepareStartedAt;

      for (let index = 0; index < runCount; index += 1) {
        let firstTokenMs = null;
        let tokenUpdates = 0;
        const startedAt = now();
        const message = await generateWebLlmDocentResponse(context, {
          onToken: () => {
            tokenUpdates += 1;
            if (firstTokenMs == null) {
              firstTokenMs = now() - startedAt;
            }
          },
        });

        measurements.push({
          round: index + 1,
          firstTokenMs,
          finalMs: now() - startedAt,
          tokenUpdates,
          chars: message.length,
          preview: message.slice(0, 80),
        });
      }

      return {
        modelId: getWebLlmModelId(),
        hasWebGpu: Boolean(navigator.gpu),
        prepareMs,
        progress,
        measurements,
      };
    },
    { rounds },
  );

  const formatMs = (value) => `${(value / 1000).toFixed(2)}s`;
  console.log(`WebLLM model: ${results.modelId}`);
  console.log(`WebGPU available: ${results.hasWebGpu}`);
  console.log(`Model prepare: ${formatMs(results.prepareMs)}`);
  console.log("Rounds:");
  for (const item of results.measurements) {
    console.log(
      `  #${item.round} first token ${formatMs(item.firstTokenMs)} | final ${formatMs(item.finalMs)} | token updates ${item.tokenUpdates} | chars ${item.chars}`,
    );
  }

  if (results.progress.length) {
    console.log("Progress samples:");
    for (const item of results.progress.slice(-5)) {
      console.log(`  +${formatMs(item.atMs)} ${item.message}`);
    }
  }
} finally {
  await browser.close();
}

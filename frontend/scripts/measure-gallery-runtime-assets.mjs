import { chromium } from "playwright";

const DEFAULT_URL = "http://127.0.0.1:5173";
const DEFAULT_SETTLE_MS = 7_000;
const DEFAULT_TIMEOUT_MS = 120_000;

function readOption(name, fallback) {
  const prefix = `--${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix));
  return value ? value.slice(prefix.length) : fallback;
}

const appUrl = readOption("url", process.env.GALLERY_RUNTIME_MEASURE_URL || DEFAULT_URL);
const settleMs = Number(readOption("settle-ms", process.env.GALLERY_RUNTIME_SETTLE_MS || DEFAULT_SETTLE_MS));
const executablePath = readOption("chrome", process.env.PLAYWRIGHT_CHROME_PATH);
const headless = readOption("headless", process.env.PLAYWRIGHT_HEADLESS || "true") !== "false";

if (!Number.isFinite(settleMs) || settleMs < 0) {
  throw new Error("--settle-ms must be a non-negative number");
}

const launchOptions = { headless };
if (executablePath) {
  launchOptions.executablePath = executablePath;
}

function isMeasuredAsset(url) {
  return /\.(glb|gltf|bin)(\?|$)/i.test(url) || /\/assets\/draco\//i.test(url);
}

const browser = await chromium.launch(launchOptions);
const page = await browser.newPage();
page.setDefaultTimeout(DEFAULT_TIMEOUT_MS);

const requests = [];
page.on("requestfinished", (request) => {
  const url = request.url();
  if (isMeasuredAsset(url)) {
    requests.push({ url, method: request.method() });
  }
});

try {
  await page.goto(appUrl, { waitUntil: "domcontentloaded" });

  const results = await page.evaluate(
    async ({ settleMs: waitMs }) => {
      const spaceRuntime = await import("/src/three/spaceGalleryRuntime.js");
      const greekRuntime = await import("/src/three/greekGalleryRuntime.js");

      const createSceneStub = () => ({
        objects: [],
        add(...items) {
          this.objects.push(...items);
        },
      });

      const measuredResources = () =>
        performance
          .getEntriesByType("resource")
          .filter((entry) => /\.(glb|gltf|bin)(\?|$)/i.test(entry.name) || /\/assets\/draco\//i.test(entry.name))
          .map((entry) => entry.name);

      const runOnce = async (label) => {
        const scene = createSceneStub();
        const startedAt = performance.now();
        const spaceContent = spaceRuntime.createSpaceGalleryContent(scene);
        const greekContent = greekRuntime.createGreekGalleryContent(scene);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        return {
          label,
          ms: performance.now() - startedAt,
          sceneObjectCount: scene.objects.length,
          spaceModels: spaceContent.models.length,
          greekModels: greekContent.models.length,
          resourceUrls: measuredResources(),
        };
      };

      performance.clearResourceTimings();
      const cold = await runOnce("cold");
      const warm = await runOnce("warm");

      return {
        settleMs: waitMs,
        cold,
        warm,
        warmOnlyResourceUrls: warm.resourceUrls.slice(cold.resourceUrls.length),
      };
    },
    { settleMs },
  );

  const uniqueRequests = [...new Set(requests.map((request) => request.url))];
  const formatMs = (value) => `${(value / 1000).toFixed(2)}s`;

  console.log("Gallery runtime asset cache measurement");
  console.log(`URL: ${appUrl}`);
  console.log(`Settle wait: ${formatMs(results.settleMs)}`);
  console.log(
    `Cold runtime: ${formatMs(results.cold.ms)} | resources: ${results.cold.resourceUrls.length} | scene objects: ${results.cold.sceneObjectCount}`,
  );
  console.log(
    `Warm runtime: ${formatMs(results.warm.ms)} | resources: ${results.warm.resourceUrls.length} | scene objects: ${results.warm.sceneObjectCount}`,
  );
  console.log(`Space models: ${results.cold.spaceModels}`);
  console.log(`Greek models: ${results.cold.greekModels}`);
  console.log(`Network asset requests observed: ${requests.length}`);
  console.log(`Unique network asset URLs observed: ${uniqueRequests.length}`);

  if (results.warmOnlyResourceUrls.length) {
    console.log("Warm-only resource timings:");
    results.warmOnlyResourceUrls.forEach((url) => console.log(`  ${url}`));
  } else {
    console.log("Warm-only resource timings: none");
  }

  console.log("Observed network asset URLs:");
  uniqueRequests.forEach((url) => console.log(`  ${url}`));
} finally {
  await browser.close();
}

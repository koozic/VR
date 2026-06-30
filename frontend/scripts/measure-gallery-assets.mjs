import { chromium } from "playwright";

const DEFAULT_URL = "http://127.0.0.1:5173";
const DEFAULT_TIMEOUT_MS = 120_000;

function readOption(name, fallback) {
  const prefix = `--${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix));
  return value ? value.slice(prefix.length) : fallback;
}

const appUrl = readOption("url", process.env.GALLERY_ASSET_MEASURE_URL || DEFAULT_URL);
const executablePath = readOption("chrome", process.env.PLAYWRIGHT_CHROME_PATH);
const headless = readOption("headless", process.env.PLAYWRIGHT_HEADLESS || "true") !== "false";

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

  const results = await page.evaluate(async () => {
    const { assetUrl } = await import("/src/three/assetUrl.js");
    const { loadGltfAsset } = await import("/src/three/assetLoader.js");

    const modelPaths = [
      "assets/space-shuttle/space-shuttle.glb",
      "assets/astronaut/astronaut.glb",
      "assets/gemini-spacesuit/gemini-spacesuit.glb",
      "assets/greek/venus-de-milo.glb",
      "assets/greek/winged-victory.glb",
      "assets/greek/laocoon.glb",
      "assets/greek/discobolus.glb",
      "assets/greek/thinker.glb",
      "assets/drone/scene.gltf",
      "assets/blocky-characters/character-a.glb",
    ];
    const urls = modelPaths.map(assetUrl);

    const loadAll = async (label) => {
      const startedAt = performance.now();
      await Promise.all(urls.map((url) => loadGltfAsset(url)));
      return {
        label,
        ms: performance.now() - startedAt,
        resourceCount: performance
          .getEntriesByType("resource")
          .filter((entry) => /\.(glb|gltf|bin)(\?|$)/i.test(entry.name) || /\/assets\/draco\//i.test(entry.name))
          .length,
      };
    };

    performance.clearResourceTimings();
    const cold = await loadAll("cold");
    const afterColdResources = performance.getEntriesByType("resource").map((entry) => entry.name);
    const warm = await loadAll("warm");
    const afterWarmResources = performance.getEntriesByType("resource").map((entry) => entry.name);

    return {
      urls,
      cold,
      warm,
      coldResourceUrls: afterColdResources,
      warmOnlyResourceUrls: afterWarmResources.slice(afterColdResources.length),
    };
  });

  const uniqueRequests = [...new Set(requests.map((request) => request.url))];
  const formatMs = (value) => `${(value / 1000).toFixed(2)}s`;

  console.log("Gallery asset cache measurement");
  console.log(`URL: ${appUrl}`);
  console.log(`Assets requested through loader: ${results.urls.length}`);
  console.log(`Cold load: ${formatMs(results.cold.ms)} | resource timings: ${results.cold.resourceCount}`);
  console.log(`Warm load: ${formatMs(results.warm.ms)} | resource timings: ${results.warm.resourceCount}`);
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

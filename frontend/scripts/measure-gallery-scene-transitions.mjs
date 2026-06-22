import { chromium } from "playwright";

const DEFAULT_URL = "http://127.0.0.1:5173";
const DEFAULT_SETTLE_MS = 7_000;
const DEFAULT_RESET_MS = 1_000;
const DEFAULT_TIMEOUT_MS = 120_000;

function readOption(name, fallback) {
  const prefix = `--${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix));
  return value ? value.slice(prefix.length) : fallback;
}

const appUrl = readOption("url", process.env.GALLERY_SCENE_MEASURE_URL || DEFAULT_URL);
const settleMs = Number(readOption("settle-ms", process.env.GALLERY_SCENE_SETTLE_MS || DEFAULT_SETTLE_MS));
const resetMs = Number(readOption("reset-ms", process.env.GALLERY_SCENE_RESET_MS || DEFAULT_RESET_MS));
const executablePath = readOption("chrome", process.env.PLAYWRIGHT_CHROME_PATH);
const headless = readOption("headless", process.env.PLAYWRIGHT_HEADLESS || "true") !== "false";

if (!Number.isFinite(settleMs) || settleMs < 0) {
  throw new Error("--settle-ms must be a non-negative number");
}

if (!Number.isFinite(resetMs) || resetMs < 0) {
  throw new Error("--reset-ms must be a non-negative number");
}

const launchOptions = { headless };
if (executablePath) {
  launchOptions.executablePath = executablePath;
}

function isMeasuredAsset(url) {
  return /\.(glb|gltf|bin)(\?|$)/i.test(url) || /\/assets\/draco\//i.test(url);
}

const browser = await chromium.launch(launchOptions);
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.setDefaultTimeout(DEFAULT_TIMEOUT_MS);

const requests = [];
const pageErrors = [];
page.on("requestfinished", (request) => {
  const url = request.url();
  if (isMeasuredAsset(url)) {
    requests.push({ url, method: request.method() });
  }
});
page.on("pageerror", (error) => {
  pageErrors.push(error.message);
});

try {
  await page.goto(appUrl, { waitUntil: "domcontentloaded" });

  const results = await page.evaluate(
    async ({ settleMs: waitMs, resetMs: resetWaitMs }) => {
      document.body.innerHTML = '<div id="measure-root"></div>';
      document.body.style.margin = "0";
      const rootElement = document.getElementById("measure-root");
      rootElement.style.width = "1280px";
      rootElement.style.height = "800px";

      const { mountGallerySceneMeasureHarness } = await import(
        "/src/three/GallerySceneMeasureHarness.jsx"
      );
      const harness = mountGallerySceneMeasureHarness(rootElement);
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const measuredResources = () =>
        performance
          .getEntriesByType("resource")
          .filter((entry) => /\.(glb|gltf|bin)(\?|$)/i.test(entry.name) || /\/assets\/draco\//i.test(entry.name))
          .map((entry) => entry.name);

      const measuredTransition = async (label, hallId, ms) => {
        const eventStart = harness.getEvents().length;
        performance.clearResourceTimings();
        const startedAt = performance.now();
        harness.setHallId(hallId);
        await wait(ms);
        const events = harness.getEvents().slice(eventStart);
        return {
          label,
          hallId,
          ms: performance.now() - startedAt,
          resourceUrls: measuredResources(),
          loadingEvents: events.filter((event) => event.type === "loading"),
          canvasCount: document.querySelectorAll("canvas").length,
          webglCanvasCount: document.querySelectorAll("canvas.scene-webgl").length,
        };
      };

      await wait(resetWaitMs);
      performance.clearResourceTimings();

      const phases = [];
      phases.push(await measuredTransition("space cold", 2, waitMs));
      await measuredTransition("main reset after space cold", 1, resetWaitMs);
      phases.push(await measuredTransition("space warm", 2, waitMs));
      await measuredTransition("main reset after space warm", 1, resetWaitMs);
      phases.push(await measuredTransition("greek cold", 3, waitMs));
      await measuredTransition("main reset after greek cold", 1, resetWaitMs);
      phases.push(await measuredTransition("greek warm", 3, waitMs));

      harness.unmount();
      return { settleMs: waitMs, resetMs: resetWaitMs, phases };
    },
    { settleMs, resetMs },
  );

  const uniqueRequests = [...new Set(requests.map((request) => request.url))];
  const formatMs = (value) => `${(value / 1000).toFixed(2)}s`;

  console.log("GalleryScene transition asset measurement");
  console.log(`URL: ${appUrl}`);
  console.log(`Settle wait: ${formatMs(results.settleMs)}`);
  console.log(`Reset wait: ${formatMs(results.resetMs)}`);
  results.phases.forEach((phase) => {
    console.log(
      `${phase.label}: ${formatMs(phase.ms)} | resources: ${phase.resourceUrls.length} | canvases: ${phase.canvasCount} | webgl: ${phase.webglCanvasCount}`,
    );
    const loadingText = phase.loadingEvents
      .map((event) => `${event.hallId}:${event.loading ? "start" : "end"}`)
      .join(", ");
    console.log(`  loading events: ${loadingText || "none"}`);
    if (phase.resourceUrls.length) {
      phase.resourceUrls.forEach((url) => console.log(`  ${url}`));
    }
  });
  console.log(`Network asset requests observed: ${requests.length}`);
  console.log(`Unique network asset URLs observed: ${uniqueRequests.length}`);
  console.log(`Page errors observed: ${pageErrors.length}`);
  pageErrors.forEach((message) => console.log(`  ${message}`));
} finally {
  await browser.close();
}

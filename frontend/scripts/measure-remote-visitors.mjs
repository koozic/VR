import { chromium } from "playwright";

const DEFAULT_URL = "http://127.0.0.1:5173";
const DEFAULT_COUNT = 18;
const DEFAULT_TIMEOUT_MS = 120_000;

function readOption(name, fallback) {
  const prefix = `--${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix));
  return value ? value.slice(prefix.length) : fallback;
}

const appUrl = readOption("url", process.env.REMOTE_VISITOR_MEASURE_URL || DEFAULT_URL);
const visitorCount = Number(readOption("count", process.env.REMOTE_VISITOR_COUNT || DEFAULT_COUNT));
const executablePath = readOption("chrome", process.env.PLAYWRIGHT_CHROME_PATH);
const headless = readOption("headless", process.env.PLAYWRIGHT_HEADLESS || "true") !== "false";

if (!Number.isInteger(visitorCount) || visitorCount < 1) {
  throw new Error("--count must be a positive integer");
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
  const appOrigin = new URL(appUrl).origin;
  await page.goto(`${appOrigin}/src/three/remoteVisitorMeasureHarness.js`, {
    waitUntil: "domcontentloaded",
  });

  const results = await page.evaluate(async ({ visitorCount: count, appOrigin: origin }) => {
    const { measureRemoteVisitorBatches } = await import(
      `${origin}/src/three/remoteVisitorMeasureHarness.js`
    );
    return measureRemoteVisitorBatches(count);
  }, { visitorCount, appOrigin });

  const uniqueRequests = [...new Set(requests.map((request) => request.url))];
  const formatMs = (value) => `${(value / 1000).toFixed(2)}s`;

  console.log("Remote visitor character cache measurement");
  console.log(`URL: ${appUrl}`);
  console.log(`Visitor count per batch: ${results.visitorCount}`);
  results.phases.forEach((phase) => {
    console.log(
      `${phase.label}: ${formatMs(phase.totalMs)} | loaded: ${phase.loaded}/${results.visitorCount} | mixers: ${phase.mixerCount} | resources: ${phase.resourceUrls.length}`,
    );
    console.log(
      `  scene children before/after cleanup: ${phase.sceneChildrenBeforeCleanup}/${phase.sceneChildrenAfterCleanup} | map after cleanup: ${phase.objectMapSizeAfterCleanup} | cleanup: ${formatMs(phase.cleanupMs)}`,
    );
    if (phase.timedOut) {
      console.log("  timed out waiting for all character models");
    }
    phase.resourceUrls.forEach((url) => console.log(`  ${url}`));
  });
  console.log(`Network asset requests observed: ${requests.length}`);
  console.log(`Unique network asset URLs observed: ${uniqueRequests.length}`);
  console.log("Observed network asset URLs:");
  uniqueRequests.forEach((url) => console.log(`  ${url}`));
  console.log(`Page errors observed: ${pageErrors.length}`);
  pageErrors.forEach((message) => console.log(`  ${message}`));
} finally {
  await browser.close();
}

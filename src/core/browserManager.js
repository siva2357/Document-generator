import puppeteer from 'puppeteer';

let browserInstance = null;
let launchPromise = null;
let shutdownHooksRegistered = false;

const DEFAULT_LAUNCH_OPTIONS = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--font-render-hinting=none',
  ],
};

function registerShutdownHooks() {
  if (shutdownHooksRegistered) return;
  shutdownHooksRegistered = true;

  const cleanup = async () => {
    await closeBrowser();
  };

  process.once('SIGINT', cleanup);
  process.once('SIGTERM', cleanup);
  process.once('beforeExit', cleanup);
}

/**
 * Lazily launches and returns a shared Puppeteer Browser instance.
 * Safe for concurrent callers and auto-recovers if the browser disconnects.
 */
export async function getBrowser(launchOptions = {}) {
  if (browserInstance && browserInstance.connected) {
    return browserInstance;
  }

  if (launchPromise) {
    return launchPromise;
  }

  const executablePath = launchOptions.executablePath || process.env.PUPPETEER_EXECUTABLE_PATH;
  const mergedOptions = {
    ...DEFAULT_LAUNCH_OPTIONS,
    ...launchOptions,
    args: [...DEFAULT_LAUNCH_OPTIONS.args, ...(launchOptions.args || [])],
    ...(executablePath ? { executablePath } : {}),
  };

  launchPromise = puppeteer
    .launch(mergedOptions)
    .then((browser) => {
      browserInstance = browser;
      browser.on('disconnected', () => {
        if (browserInstance === browser) {
          browserInstance = null;
        }
      });
      registerShutdownHooks();
      return browser;
    })
    .finally(() => {
      launchPromise = null;
    });

  return launchPromise;
}

/**
 * Gracefully closes the shared Puppeteer browser instance if running.
 */
export async function closeBrowser() {
  if (launchPromise) {
    try {
      await launchPromise;
    } catch {
      // Ignore launch errors during shutdown
    }
  }
  const browser = browserInstance;
  browserInstance = null;
  if (browser && browser.connected) {
    await browser.close();
  }
}

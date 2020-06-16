const puppeteer = require("puppeteer");
const execSync = require("child_process").execSync;
const CronJob = require("cron").CronJob;

const URL =
  "https://service.berlin.de/terminvereinbarung/termin/day/1590962400/";

const URLS = [
  "https://service.berlin.de/terminvereinbarung/termin/day/1590962400/",
  // "https://service.berlin.de/terminvereinbarung/termin/day/1593554400/",
  "https://service.berlin.de/terminvereinbarung/termin/day/1596232800/",
];
// const URL = 'https://service.berlin.de/terminvereinbarung/termin/day/';
const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/601.7.7 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7";

let browser;
let count = 0;

const setup = async () => {
  browser = await puppeteer.launch({
    ignoreDefaultArgs: ["--disable-extensions"],
    headless: true,
    handleSIGINT: false,
    args: ["--disable-gpu"],
  });
};

const tearDown = async () => {
  console.log("TORN DOWN");
  if (browser) {
    await browser.close();
  }
};

process.on("exit", tearDown);

const onTick = () => {
  (async () => {
    count += 1;
    for (const URL of URLS) {
      const page = await browser.newPage();
      page.setUserAgent(userAgent);
      await page.setCookie(
        {
          name: "Zmsappointment",
          value: "pgggoi6r16hp002atjool3i996",
          domain: "service.berlin.de",
        },
        {
          name: "BIGipServerpool_zms20.verwalt-berlin.de",
          value: "3340006410.47873.0000",
          httpOnly: true,
          secure: true,
          domain: "service.berlin.de",
        },
        {
          name: "TS01fa49ef",
          value:
            "01d33437f9ae3abf55027d3850422ce9cf813aa52698a98ae2d318a3124c6a099885f0f10f3e3e426032339cf20cf4ff502c7cab7d3e7cf037f79e352473f5f58fd344ef8e",
          domain: "service.berlin.de",
        },
        {
          name: "zmsappointment-session",
          value: "inProgress",
          path: "/terminvereinbarung/termin/",
          domain: "service.berlin.de",
        }
      );
      console.log("trying ", URL);
      await page.goto(URL, { waitUntil: "networkidle2" });
      const results = await page.evaluate(() =>
        document.querySelector("td.buchbar")
      );
      if (results) {
        execSync(
          'say -v Anna "hey - nah dummkopf...? zeit deinen termin zu buchen..."'
        );
        execSync(`open "${URL}"`);
        execSync(
          `osascript -e 'display notification "${URL}!" with title "GO FOR IT!" sound name "Basso"'`
        );
        console.log(`SUCCESS!! ${timestamp()}`);
        console.log(URL);
        await page.screenshot({
          path: pngPath("success", URL),
          fullPage: true,
        });
        await page.close();
        process.exit();
      }
      console.log(`${count}.. ${timestamp()}`);
      await page.screenshot({
        path: pngPath("no-luck", URL),
        fullPage: true,
      });
      await page.close();
    }
  })().catch((e) => console.log("ERROR", e));
};

const job = new CronJob({
  cronTime: "*/1 * * * *",
  onTick,
});

(async () => {
  await setup();
  onTick();
  job.start();
})();

function timestamp() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

function pngPath(pth, url) {
  return `${pth}-${url.replace(/\/$/, "").split("/").pop()}.png`;
}

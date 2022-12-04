import puppeteer, { Browser } from "puppeteer";
import fs from "fs";

let SEARCH_URL =
    "https://www.sahibinden.com/bilgisayar?query_text_mf=thinkpad&query_text=thinkpad";

const main = async () => {
    const browser: Browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(SEARCH_URL);

    const scrapedData = await page.evaluate((SEARCH_URL) => {
        const allAdsData = Array.from(
            document.querySelectorAll(".searchResultsItem")
        );

        const itemData = allAdsData.map((item: any) => ({
            title: item
                .querySelector(".searchResultsTitleValue img")
                .getAttribute("title"),
        }));

        return itemData;
    }, SEARCH_URL);

    await browser.close();

    fs.writeFile("data.json", JSON.stringify(scrapedData), (err: any) => {
        if (err) throw err;
        console.log("All good!");
    });
};

main();

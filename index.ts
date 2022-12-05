import puppeteer from "puppeteer-extra";
import { Browser } from "puppeteer";
import { updateSourceFile } from "typescript";
import read from "./checkData";
const fs = require("fs");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

//for executablepath error
const { executablePath } = require("puppeteer");

let SEARCH_URL = "https://www.letgo.com/items/q-thinkpad?isSearchCall=true";

// IS VIEW MORE BUTTON VISIBLE? -START
const isElementVisible = async (page, cssSelector) => {
    let visible = true;
    await page
        .waitForSelector(cssSelector, { visible: true, timeout: 4000 })
        .catch(() => {
            console.log("No more contents");
            visible = false;
        });
    return visible;
};
// IS VIEW MORE BUTTON VISIBLE? -END

export const main = async () => {
    const browser: Browser = await puppeteer.launch({
        headless: true,
        executablePath: executablePath(),
        args: ["--shm-size-1gb"],
    });
    const page = await browser.newPage();
    await page.goto(SEARCH_URL);

    // SCROLLING DOWN - START
    const selectorForLoadMoreButton = "li.TA_b7 div button";
    let loadMoreVisible = await isElementVisible(
        page,
        selectorForLoadMoreButton
    );
    while (loadMoreVisible) {
        console.log("Loading more contents to scrape");
        await page.click(selectorForLoadMoreButton).catch(() => {});
        await page.waitForTimeout(4000);

        loadMoreVisible = await isElementVisible(
            page,
            selectorForLoadMoreButton
        );
    } // SCROLL DOWN - END

    const scrapedData = await page.evaluate(() => {
        const allAdsData = Array.from(
            document.querySelectorAll("li[data-aut-id]")
        );

        const itemData = allAdsData.map((item: any) => ({
            title: item.querySelector("a div.fTZT3 span._2poNJ").innerText,
            price: item.querySelector("a div.fTZT3 span._2Ks63").innerText,
            location: item.querySelector("a div.fTZT3 div._3rmDx span._2VQu4")
                .innerText,
            date: item.querySelector("a div.fTZT3 div._3rmDx span._2jcGx span")
                .innerText,
            url:
                "https://www.letgo.com" +
                item.querySelector("a").getAttribute("href"),
        }));

        return itemData;
    });
    setTimeout(() => {
        console.log("Saving files...");

        browser.close();

        fs.writeFile(
            "newData.json",
            JSON.stringify(scrapedData),
            (err: any) => {
                if (err) throw err;
                console.log("All good!");
            }
        );
    }, 5000);
};

main();

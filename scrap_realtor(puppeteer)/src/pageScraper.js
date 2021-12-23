const scraperObject = {
    url: 'https://www.realtor.com/realestateandhomes-search/75202',
    async scraper(browser){
        let page = await browser.newPage();
        console.log(`Navigating to ${this.url}...`);
        await page.goto(this.url);

    }
}

module.exports = scraperObject;
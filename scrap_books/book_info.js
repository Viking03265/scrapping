const vo = require('vo');
const fs = require('fs');

let _glob_instance;
let _glob_data = [];

const evaluatePageInfo = () => { 
    let ret = [];
    document.querySelectorAll('div.book-item').forEach(element => {
        let url = element.querySelector('div.item-img a').getAttribute('href');
        let img_url = element.querySelector('img').getAttribute('src');
        let isbn = element.querySelector('meta[itemprop="isbn"]').getAttribute('content');
        let title = element.querySelector('meta[itemprop="name"]').getAttribute('content');
        url = 'https://www.bookdepository.com/' + url;
        ret.push ({'title': title, 'isbn': isbn, 'url': url, 'img_url': img_url});
    });
    return ret;
};

const printCrawlingError = error => { console.error (error) }
const returnCrawlingData = data => {
    return;
};

const grabBookInfo = function * (filename) {
    
    let categories = JSON.parse(fs.readFileSync(filename, 'utf8'));
    let count = 0;
    for (let cat of categories) {
        if (count++ < 3) continue;
        let curr_url = cat.url, prev_url = 'prev', page_data, page_count = 0, book_data = [];
        
        while (curr_url !== prev_url) {

            prev_url = curr_url; page_count++;
            yield _glob_instance.goto(curr_url);

            let doc_height = yield _glob_instance.evaluate(() => document.body.scrollHeight);
            let scr_height = 0;
            do {
                yield _glob_instance.scrollTo(scr_height, 0).wait(500);
                scr_height += 150;
            } while (scr_height < doc_height - 500);

            page_data = yield _glob_instance.evaluate(evaluatePageInfo);
            book_data = book_data.concat(page_data);
            console.log ('Page ' + page_count + ': ' + page_data.length + ' crawled.');

            yield _glob_instance.click('li#next-top a');      
            curr_url =  yield _glob_instance.url();        
            fs.writeFileSync(cat.category + '_data.json', JSON.stringify(book_data, null, 4)); 
        }
    }    

    // fs.writeFileSync('book_data.json', JSON.stringify(_glob_data, null, 4)); 
    console.log ('Crawling Book info finished.');  

    yield _glob_instance.end();

    return _glob_instance
    .then(returnCrawlingData)
    .catch(printCrawlingError);
}

module.exports = (filename, botInstance) => {
    
    _glob_instance = botInstance;

    return vo([grabBookInfo(filename)]);
}
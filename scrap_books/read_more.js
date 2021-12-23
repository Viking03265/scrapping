const fs = require('fs');
const vo = require('vo');
const parse = require('csv-parse/lib/sync');
const download = require('image-downloader');

let _glob_instance;

const evaluatePageInfo = () => {   
    let title, author_info, description;
    let imprint='', pub_address='', language='', for_ages='', pub_date='', isbn10='', isbn13='', publisher='', bs_rank='';

    if (document.querySelector('div.item-info h1') !== null) {
        title = document.querySelector('div.item-info h1').innerText || '';
    } else { title = ''; }
    if (document.querySelector('div.author-info') !== null) {
        author_info = document.querySelector('div.author-info').innerText || '';
    } else { author_info = ''; }
    if (document.querySelector('div.item-description > div[itemprop="description"]') !== null) {
        description = document.querySelector('div.item-description > div[itemprop="description"]').innerText || '';
    } else { description = ''; }

    document.querySelectorAll('ul.biblio-info>li').forEach(element => {
        if (element.innerText.indexOf('For ages') !== -1) for_ages = element.innerText.replace('For ages ', '');
        if (element.innerText.indexOf('Publication date') !== -1) pub_date = element.innerText.replace('Publication date ', '');
        if (element.innerText.indexOf('Publisher') !== -1) publisher = element.innerText.replace('Publisher ', '');
        if (element.innerText.indexOf('Imprint') !== -1) imprint = element.innerText.replace('Imprint ', '');
        if (element.innerText.indexOf('Language') !== -1) language = element.innerText.replace('Language ', '');;
        if (element.innerText.indexOf('ISBN10') !== -1) isbn10 = element.innerText.replace('ISBN10 ', '');
        if (element.innerText.indexOf('ISBN13') !== -1) isbn13 = element.innerText.replace('ISBN13 ', '');
        if (element.innerText.indexOf('Publication City/Country') !== -1) {
            pub_address = element.innerText.replace('Publication City/Country ', '');
        }
        if (element.innerText.indexOf('Bestsellers rank') !== -1) bs_rank = element.innerText.replace('Bestsellers rank ', '');
    });
    document.querySelectorAll('ul.biblio-info-wrap>li').forEach(element => {
        if (element.innerText.indexOf('For ages') !== -1) for_ages = element.innerText.replace('For ages ', '');
        if (element.innerText.indexOf('Publication date') !== -1) pub_date = element.innerText.replace('Publication date ', '');
        if (element.innerText.indexOf('Publisher') !== -1) publisher = element.innerText.replace('Publisher ', '');
        if (element.innerText.indexOf('Imprint') !== -1) imprint = element.innerText.replace('Imprint ', '');
        if (element.innerText.indexOf('Language') !== -1) language = element.innerText.replace('Language ', '');;
        if (element.innerText.indexOf('ISBN10') !== -1) isbn10 = element.innerText.replace('ISBN10 ', '');
        if (element.innerText.indexOf('ISBN13') !== -1) isbn13 = element.innerText.replace('ISBN13 ', '');
        if (element.innerText.indexOf('Publication City/Country') !== -1) {
            pub_address = element.innerText.replace('Publication City/Country ', '');
        }
        if (element.innerText.indexOf('Bestsellers rank') !== -1) bs_rank = element.innerText.replace('Bestsellers rank ', '');
    });

    let img_url = '';
    if (document.querySelector('div.item-img img') !== null) {
        img_url = document.querySelector('div.item-img img').getAttribute('src');
    } 
    
    return {
        'title':title,
        'auth_info': author_info, 
        'description': description, 
        'for_ages': for_ages, 
        'pub_date': pub_date, 
        'publisher': publisher, 
        'imprint': imprint, 
        'pub_address': pub_address, 
        'language': language, 
        'isbn10': isbn10, 
        'isbn13': isbn13, 
        'best_seller_rank': bs_rank,
        'img_url':img_url

    };
    // return [];
};

const hasResult = () => {
    let str_not_found;
    if (document.querySelector('div.content') !== null) {
        str_not_found = document.querySelector('div.content').innerText;
        // Your search did not return any results.
        if (str_not_found.indexOf('Your search did not return any results.') !== -1)
            return false;
        return false;
    } 
    return true;
}
const printCrawlingError = error => { console.error (error) }
const returnCrawlingData = data => {
    return;
};

const grabBookInfo = function * (filename) {
    
    let temp_data = fs.readFileSync(filename, 'utf8');
    temp_data = parse(temp_data, {
        columns: true,
        skip_empty_lines: true
    });

    let page_count = 0, book_data = JSON.parse(fs.readFileSync('book_data.json'));
    // let url = "https://www.bookdepository.com/Jaguars-Butterflies-Catherine-Russler/9781949791402";    
    // yield _glob_instance.goto(url);    

    for (let row of temp_data) {
        // if (book_data[page_count++].auth_info !== "") continue;
        if (page_count++ < book_data.length) continue;
        let url = "https://www.bookdepository.com/Jaguars-Butterflies-Catherine-Russler/9781949791402";    
        yield _glob_instance.goto(url);

        let bHasResult;
        yield _glob_instance.type("input[name='searchTerm']", row.isbn_10 || row.isbn_13.replace('-','') || row.title);
        // yield _glob_instance.type("input[name='searchTerm']", row.title);
        yield _glob_instance.click('button.header-search-btn');

        bHasResult = yield _glob_instance.evaluate(hasResult);
        if (!bHasResult) {
            // yield _glob_instance.type("input[name='searchTerm']", '\u002E');
            // yield _glob_instance.back();
            yield _glob_instance.goto(url);
            yield _glob_instance.type("input[name='searchTerm']", row.isbn_13.replace('-','') || row.title);
            yield _glob_instance.click('button.header-search-btn');
            bHasResult = yield _glob_instance.evaluate(hasResult);
            if (!bHasResult) {                
                // yield _glob_instance.back();
                yield _glob_instance.goto(url);
                yield _glob_instance.type("input[name='searchTerm']", row.title);
                yield _glob_instance.click('button.header-search-btn');
            }
        }

        if (!bHasResult) continue;
        
        // yield _glob_instance.click('div[data-component-type=s-search-result] a');
        yield _glob_instance.evaluate(() => {
            if (document.querySelector('div.search-page') !== null) {
                // document.querySelector('div.book-item:first-child>.item-img>a').click();
                document.querySelectorAll('div.book-item a').forEach(element => {
                    element.click();
                    return;
                });
            }
        });

        let page_data = yield _glob_instance.evaluate(evaluatePageInfo);
        page_data.title = page_data.title || row.title;
        page_data.auth_info = page_data.auth_info.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim();        
        // book_data = book_data.concat(page_data);
        book_data[page_count-1] = page_data;
        console.log (page_count + ': ' + page_data.title + ', ' + page_data.auth_info);
    
        let file = (page_data.isbn13 === '') ? '' : page_data.isbn13 + '.jpg';
        file = './imgs/' + file;
        const options = {
            url: page_data.img_url,
            // will be saved to /path/to/dest/image.jpg
            dest: file          
        };
        download.image(options).catch((err) => console.error(err));

        fs.writeFileSync('book_data.json', JSON.stringify(book_data, null, 4));

        // yield _glob_instance.back();
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
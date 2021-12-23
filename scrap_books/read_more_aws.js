const fs = require('fs');
const vo = require('vo');
const parse = require('csv-parse/lib/sync');
const download = require('image-downloader');

let _glob_instance;

const evaluatePageInfo = () => {   

    // let str_not_found;
    // if (document.querySelector('div.content') !== null) {
    //     str_not_found = document.querySelector('div.content').innerText;
    //     // Your search did not return any results.
    //     if (str_not_found.indexOf('Your search did not return any results.') !== -1)
    //         return {
    //             'title':'',
    //             'auth_info': '', 
    //             'description': '', 
    //             'for_ages': '', 
    //             'pub_date': '', 
    //             'publisher': '', 
    //             'imprint': '', 
    //             'pub_address': '', 
    //             'language': '', 
    //             'isbn10': '', 
    //             'isbn13': '',
    //             'best_seller_rank': '',
    //             'img_url':''
    //         };
    // }
    
    let title, author_info, description;
    let imprint='', pub_address='', language='', for_ages='', pub_date='', publisher='', bs_rank='', isbn10='', isbn13='';

    if (document.querySelector('span#productTitle') !== null) {
        title = document.querySelector('span#productTitle').innerText || '';
    } else { title = ''; }
    if (document.querySelector('div#bylineInfo') !== null) {
        author_info = document.querySelector('div#bylineInfo').innerText || '';
    } else { author_info = ''; }

    let iframe = document.getElementById('bookDesc_iframe');
    let innerDoc = iframe.contentDocument || iframe.contentWindow.document;
    if (innerDoc.querySelector('div#iframeContent') !== null) {
        description = innerDoc.querySelector('div#iframeContent').innerText || '';
    } else { description = ''; }

    document.querySelectorAll('div#detailBullets_feature_div li').forEach(element => {
        if (element.innerText.indexOf('For ages') !== -1) for_ages = element.innerText.replace('For ages ', '');
        if (element.innerText.indexOf('Publication date') !== -1) pub_date = element.innerText.replace('Publication date ', '');
        if (element.innerText.indexOf('Publisher') !== -1) publisher = element.innerText.replace('Publisher &rlm;:&lrm; ', '');
        if (element.innerText.indexOf('Imprint') !== -1) imprint = element.innerText.replace('Imprint ', '');
        if (element.innerText.indexOf('Language') !== -1) language = element.innerText.replace('Language &rlm;:&lrm; ', '');
        if (element.innerText.indexOf('ISBN-10') !== -1) isbn10 = element.innerText.replace('ISBN-10 &rlm;:&lrm; ', '');
        if (element.innerText.indexOf('ISBN-13') !== -1) isbn13 = element.innerText.trim().replace('ISBN-13:', '');
        if (element.innerText.indexOf('Publication City/Country') !== -1) {
            pub_address = element.innerText.replace('Publication City/Country ', '');
        }
        if (element.innerText.indexOf('Best Sellers Rank:') !== -1) bs_rank = element.innerText.replace('Best Sellers Rank: ', '');
    });

    let img_url = '';
    if (document.querySelector('img#imgBlkFront') !== null) {
        img_url = document.querySelector('img#imgBlkFront').getAttribute('src');
    }    
    if (document.querySelector('img#ebooksImgBlkFront') !== null) {
        img_url = document.querySelector('img#ebooksImgBlkFront').getAttribute('src');
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
    for (let row of temp_data) {
        if (book_data[page_count++].img_url !== "") continue;
        yield _glob_instance.goto("https://www.amazon.com/Childrens-Books")
        .wait('div.nav-search-field input');
        // yield _glob_instance.goto(row.amazon_url);

        let page_data;
        yield _glob_instance.type("div.nav-search-field input", row.isbn_10 || row.isbn_13.replace('-', '') || row.title);
        yield _glob_instance.click('input#nav-search-submit-button');
        yield _glob_instance.click('div[data-component-type=s-search-result] a');

        page_data = yield _glob_instance.evaluate(evaluatePageInfo);
        
        page_data.title = page_data.title || row.title;
        page_data.language = page_data.language.replace('Language ‏ : ‎ ', '').trim();
        page_data.publisher = page_data.publisher.replace('Publisher ‏ : ‎ ', '').trim();
        page_data.publisher = page_data.publisher.substring(0, page_data.publisher.indexOf('(') - 1);
        page_data.pub_date = page_data.publisher.substring(
            page_data.publisher.indexOf('(') + 1, page_data.publisher.indexOf(')'));
        page_data.best_seller_rank = page_data.best_seller_rank.substring(1, 
            page_data.best_seller_rank.indexOf(' in Books'));
        page_data.isbn10 = page_data.isbn10.replace('ISBN-10 ‏ : ‎ ', '').trim();
        page_data.isbn13 = page_data.isbn13.replace('ISBN-13 ‏ : ‎ ', '').trim().replace('-', '');
        // page_data.auth_info = page_data.auth_info.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim();     
        // book_data[page_count - 1] = page_data;
        Object.assign(book_data[page_count - 1], page_data);

        console.log (page_count + ': ' + page_data.title + ', ' + page_data.auth_info);

        let file = (page_data.isbn13 === '') ? page_count.toString() : page_data.isbn13;
        file += '.jpg';
        file = './imgs/' + file;
        const options = {
            url: page_data.img_url,
            // will be saved to /path/to/dest/image.jpg
            dest: file          
        };
        download.image(options).catch((err) => console.error(err));
    
        fs.writeFileSync('book_data.json', JSON.stringify(book_data, null, 4)); 
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
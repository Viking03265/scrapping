const vo = require('vo');
const fs = require('fs');
const zipcode = require('./zipcode');
const console = require('console');

let _glob_instance;
let _glob_urls = [];
let _glob_data = [];

const evaluateStateInfo = () => { 
    let ret = [];
    document.querySelectorAll('div#grid-search-results script').forEach(element => {
        let new_url = JSON.parse(element.innerHTML).url;
        if (new_url !== ret[ret.length - 1])
            ret.push(new_url);
    });
    return ret;
};

const printStateError = error => { console.error (error) }
const returnStateData = state_data => {
    // console.log(state_data);
    // console.log(_glob_instance.urls);
    // grabHomeDetailsUrl();
    return;
};

const grabStateInfo = function * (state) {

    // url_type: https://www.zillow.com/homes/ID-83537_rb/
    let zipcodes = JSON.parse(fs.readFileSync('zipcodes.json', 'utf8'))[state];

    for (let zipcode of zipcodes) {
        
        let url = "https://www.zillow.com/homes/" + state + "-" + zipcode + "_rb/";

        yield _glob_instance.goto(url).wait(2000);   
        // yield _glob_instance.wait('div#grid-search-results');
        
        let curr_url = url, prev_url = 'prev', urls;
        while (curr_url !== prev_url) {

            prev_url = curr_url;
            yield _glob_instance.goto(curr_url);

            let doc_height = yield _glob_instance.evaluate(() => document.body.scrollHeight);
            let scr_height = 0;
            do {
                yield _glob_instance.scrollTo(scr_height, 0).wait(300);
                scr_height += 150;
            } while (scr_height < doc_height - 2200);

            urls = yield _glob_instance.evaluate(evaluateStateInfo);
            _glob_urls = _glob_urls.concat(urls);

            yield _glob_instance.evaluate(() => {
                try {
                    document.querySelector('a[title]') && document.querySelector('a[title="Next page"]').click();
                } catch (e) { }
            });            
            curr_url =  yield _glob_instance.wait(1000).url();     
        }

        console.log (state + ' ' + zipcode + ': ' + _glob_urls.length);
    }    

    yield fs.writeFile(state + '_urls.json', JSON.stringify(_glob_urls, null, 2), (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });

    yield _glob_instance.end();

    return _glob_instance
    .then(returnStateData)
    .catch(printStateError);
}

module.exports = (state, botInstance) => {
    
    _glob_instance = botInstance;

    return vo([grabStateInfo(state)]);
}
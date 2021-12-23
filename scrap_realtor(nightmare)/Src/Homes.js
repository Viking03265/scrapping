const vo = require('vo');
const fs = require('fs');

let _glob_instance;
// let _glob_data = [];
const goto = url => _glob_instance.goto(url).wait('ul[data-testid="property-list-container"]')
const evalHomeInfo = () => {   
    let details = [];
    document.querySelectorAll('div[data-testid="property-detail"]').forEach(element => {
        let price = element.querySelector('span[data-label="pc-price"]').innerText;
        let beds = element.querySelector('li[data-label="pc-meta-beds"]>span[data-label="meta-value"]').innerText;
        let baths = element.querySelector('li[data-label="pc-meta-baths"]>span[data-label="meta-value"]').innerText;
        let sqft = element.querySelector('li[data-label="pc-meta-sqft"]>span[data-label="meta-value"]').innerText;
        let acrelot = element.querySelector('li[data-label="pc-meta-sqftlot"]>span[data-label="meta-value"]');
        acrelot = acrelot ? acrelot.innerText : '';
        let address = element.querySelector('div[data-label="pc-address"]').innerText.replace(/\n/i, '');
        // let address = element.querySelector('div[data-label="pc-address"]').innerText;
        details.push({price: price, beds: beds, baths: baths, sqft: sqft, acrelot: acrelot, address: address})
    }) 
    return details;  
}

const grabHomes = function * (zipcode) {

    let url = `https://www.realtor.com/realestateandhomes-search/${zipcode}`;    
    yield goto(url);       

    const home_data = yield _glob_instance.evaluate(evalHomeInfo);
    console.log (home_data);
        
    // write new data back to the file
    fs.writeFileSync(`./Data/${zipcode}.json`, JSON.stringify(home_data, null, 4));    
    

    return _glob_instance.end().then(data => {
        console.log(data);
        return data; // a value needed
    }).catch(error => {
        console.error('Search failed:', error)
    });
};

const getHomesByZipcode = (zipcode, botInstance) => {
    _glob_instance = botInstance;
    return vo([grabHomes(zipcode)]);  
}

module.exports = {
    getHomesByZipcode
}
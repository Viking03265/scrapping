const vo = require('vo');
const fs = require('fs');
const stringify = require('csv-stringify');

let _glob_instance;
let _glob_data = [];

const _data_form = { 
    'address':'',
    'streetAddress':'', 
    'city':'', 
    'county':'', 
    'state':'', 
    'zipcode':'',   
    'bathrooms':0,
    'bedrooms':0,
    'description':'',
    'homeType':'',  
    'latitude':0,
    'longitude':0,
    'livingArea':0, 
    'livingAreaValue':0, 
    'lotSize':0, 
    'parcelId':'',
    'price':0,
    'lastSoldPrice':0,
    'propertyTypeDimension':'',
    'rentZestimate':0,
    'zestimate':0,
    'taxAssessedValue':0,
    'yearBuilt':'',     
    'zpid':0,
};

const isUrlGrabbed = (arr, url) => {
    return arr.filter(el => el.url == url).length;
}
const goto = url => _glob_instance.goto(url).wait('script#hdpApolloPreloadedData')
const evalDetailInfo = () => {
    let allData = JSON.parse(document.querySelector('script#hdpApolloPreloadedData').innerHTML);
    let apiCache = JSON.parse(allData.apiCache);
    let details = apiCache[Object.keys(apiCache)[1]].property;
    return details;  
}
const printGrabError = error => { console.error (error) }
const grabDetailInfo = function * (state) {

    let urls = JSON.parse(fs.readFileSync(state + '_urls.json', 'utf8'));
    let zcode = '83537';
    for (let url of urls) {

        _glob_data = JSON.parse(fs.readFileSync(state + '_data.json', 'utf8'));
        if (isUrlGrabbed(_glob_data, url) !== 0) continue;

        yield goto(url); 
        
        home_data = yield _glob_instance.evaluate(evalDetailInfo);
        // console.log (home_data);

        let new_data = _data_form;
        new_data.streetAddress = home_data.streetAddress || 'Unknown';
        new_data.city = home_data.city || 'Unknown';
        new_data.county = home_data.county || 'Unknown';
        new_data.state = home_data.state || 'Unknown';
        new_data.zipcode = home_data.zipcode || 'Unknown';
        new_data.address = new_data.streetAddress + ', ' + new_data.city 
                    + ', ' + new_data.county + ', ' + new_data.state + ' ' + new_data.zipcode;
        new_data.bathrooms = home_data.bathrooms || 0;
        new_data.bedrooms = home_data.bedrooms || 0;
        new_data.description = home_data.description || 'Unknown';
        new_data.homeType = home_data.homeType || 'Unknown';
        new_data.latitude = home_data.latitude;
        new_data.longitude = home_data.longitude;
        new_data.livingArea = home_data.livingArea || 0;
        new_data.livingAreaValue = home_data.livingAreaValue || 0;
        new_data.lotSize = home_data.lotSize || 0;
        new_data.parcelId = home_data.parcelId || 'Unknown';
        new_data.price = home_data.price || 0;
        new_data.lastSoldPrice = home_data.lastSoldPrice || 0;
        new_data.propertyTypeDimension = home_data.propertyTypeDimension || 'Unknown';
        new_data.rentZestimate = home_data.rentZestimate || 0;
        new_data.zestimate = home_data.zestimate || 0;
        new_data.taxAssessedValue = home_data.taxAssessedValue || 0;
        new_data.yearBuilt = home_data.yearBuilt || 'Unknown';
        new_data.zpid = home_data.zpid || 0;

        zcode = home_data.zipcode;

        console.log(_glob_data.length + ': ' + new_data.streetAddress);
        _glob_data.push(new_data);
        // write new data back to the file
        fs.writeFileSync(state + '_data.json', JSON.stringify(_glob_data, null, 4));
    }
    
    // yield fs.writeFile(state + '_urls.json', JSON.stringify(_glob_urls, null, 2), (err) => {
    //     if (err) throw err;
    //     console.log('Data written to file');
    // });
    stringify(_glob_data, {
        header: true
    }, function (err, output) {
        fs.writeFile(state + '_data.csv', output, (err, data) => {
            if (err) {
              return console.log(err);
            }
            console.log(data);
        });
    })

    return _glob_instance.end().then(data => {
        console.log(data);
        return data; // a value needed
    }).catch(error => {
        console.error('Search failed:', error)
    });
};

module.exports = (state, botInstance) => {

    _glob_instance = botInstance;
    return vo([grabDetailInfo(state)]);    
}
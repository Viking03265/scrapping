const fs = require('fs');
const vo = require('vo');

let _glob_instance;
const evaluateRowInfo = () => JSON.parse(document.body.innerText);
const printCrawlingError = error => { console.error (error) }
const returnCrawlingData = data => {
    return;
};

const grabGeoInfo = function * (filename) {
    let temp_data = fs.readFileSync(filename, 'utf8');
    temp_data = JSON.parse(temp_data);

    let row_count = 0, geo_data = JSON.parse(fs.readFileSync('Geocode/geo_data.json'));
    for (row of temp_data) {
        let url = 'https://revgeocode.search.hereapi.com/v1/revgeocode?at='+row.lat+'%2C'+row.lon+
        '&lang=en-US&apiKey=eDAwbJ6_WjNsVMJfDq8YN5nIwCrH3Dyb0WakGNT6vwk';
        if (row_count++ < geo_data.length + 97728) continue;
        yield _glob_instance.goto(url);
        let row_data = yield _glob_instance.evaluate(evaluateRowInfo);
        let new_row = {
            'propId': row.propId,
            'lat': row.lat,
            'lon': row.lon,
            'address': (row_data.items[0] !== undefined) ? row_data.items[0].title : '',
            'county': (row_data.items[0] !== undefined) ? row_data.items[0].address.county : ''
        };
        geo_data.push(new_row);
        fs.writeFileSync('Geocode/geo_data.json', JSON.stringify(geo_data, null, 4)); 
        console.log (row_count + ': ' + new_row.address);
        yield _glob_instance.wait(1005);
    }

    console.log ('Crawling Book info finished.');  

    yield _glob_instance.end();

    return _glob_instance
    .then(returnCrawlingData)
    .catch(printCrawlingError);
};

module.exports = (filename, botInstance) => {
    
    _glob_instance = botInstance;

    return vo([grabGeoInfo(filename)]);
}
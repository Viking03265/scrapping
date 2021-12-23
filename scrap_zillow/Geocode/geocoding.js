const http = require('https');
const fs = require('fs');
const parse = require('csv-parse');
const console = require('console');

const readCSV = (filename) => {
    let entries = [];
    return fs.createReadStream(filename)
        .pipe(parse({ delimiter: ',', from_line: 2 }))
        .on('data', function (row) {
            entries.push({
                'propId': row[0],
                'lat': row[1],
                'lon': row[2],
                'address': '',               
            });
        })
        .on('end', function () {
            processEntries(entries);
        });
}

const getDataFromUrl = async (url, options, count, arr) => {            
    await http.get(url, options, response => {
        response.on('data', data => { 
            console.log(data.toString());
            let json = data.toString();
            arr[count].address = json.display_name || '';
            
            console.log (count + ': ' + arr[count].address);
        })
    });
}

const processEntries = async (entries) => {
    let count = 0;    
    for (let entry of entries) {

        // if (entry.state !== '') continue;
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        await delay(1000);

        // let url = 'https://api.bigdatacloud.net/data/reverse-geocode-client?latitude='+
        // entry.lat+'&longitude='+entry.lon+'&localityLanguage=en';
        // https://nominatim.openstreetmap.org/reverse?format=json&lat=54.9824031826&lon=9.2833114795&zoom=18&addressdetails=1
        // https://revgeocode.search.hereapi.com/v1/revgeocode?at=30.244165875378837%2C-88.09710963142271&lang=en-US&apiKey=S9qVvsIhvLcqUislqFc9Dz5BumGC8vnMn-A7gkj7lQE
        let url = 'revgeocode.search.hereapi.com/v1/revgeocode';
        let opt = {'at':entry.lat+'%2C'+entry.lon, 'lang':'en-US', 'apiKey':'S9qVvsIhvLcqUislqFc9Dz5BumGC8vnMn-A7gkj7lQE'};
        await getDataFromUrl (url, opt, count, entries);
        count++;
        
        // // write new data back to the file
        // fs.writeFileSync('./Geocode/coordinates.json', JSON.stringify(entries, null, 4));
    }

    // write new data back to the file
    fs.writeFileSync('./Geocode/coordinates.json', JSON.stringify(entries, null, 4));
}

module.exports = (filename) => {    
    return readCSV(filename);
}
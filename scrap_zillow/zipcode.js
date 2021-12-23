var fs = require('fs');
var parse = require('csv-parse');


function readCSV() {
    let entries = {};
    let count = 0;

    return fs.createReadStream('Zipcode2020.csv')
        .pipe(parse({ delimiter: ',', from_line: 2 }))
        .on('data', function (row) {
            count++;
            entries[row[2]] = entries[row[2]] || [];
            entries[row[2]].push(row[3])
        })
        .on('end', function () {
            processEntries(entries);
        });
}

const processEntries = async entries => {
    await fs.writeFile('zipcodes.json', JSON.stringify(entries, null, 2), (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });
}

class Entry {
    constructor(type, primary_city, state, zip, acceptable_cities, unacceptable_cities, county, timezone, area_codes, country) {
        this.type = type;
        this.primary_city = primary_city;
        this.state = state;
        this.zip = zip;
        this.acceptable_cities = acceptable_cities;
        this.unacceptable_cities = unacceptable_cities;
        this.county = county;
        this.timezone = timezone;
        this.area_codes = area_codes;
        this.country = country;
    }
}

module.exports = () => {    
    return readCSV();
}
const fs = require('fs');
const stringify = require('csv-stringify');

const convertJsonToCSV = (filename) => {
    let data = JSON.parse(fs.readFileSync(filename, 'utf8'));
    for (let i in data) {
        if (data[i].for_ages.indexOf('44') !== -1) {
            data[i].for_ages = '';
        }
        
        if (data[i].for_ages.indexOf('Hardback') !== -1) {
            data[i].for_ages = '';
        }
        
        if (data[i].for_ages.indexOf('Paperback') !== -1) {
            data[i].for_ages = '';
        }

        data[i].for_ages = ' ' + data[i].for_ages;
    }

    let new_name = filename.replace('json', 'csv');

    stringify(data, {
        header: true
    }, function (err, output) {
        fs.writeFile(new_name, output, (err, data) => {
            if (err) {
              return console.log(err);
            }
            console.log(new_name + ' has been created.');
        });
    });
};

module.exports = (filename) => {
    return convertJsonToCSV(filename);
};
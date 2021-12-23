const http = require('https');
const fs = require('fs');
// const vo = require('vo');
const download = require('image-downloader')
const parse = require('csv-parse');

const readCSV = (filename) => {
    let entries = [];
    let count = 0;

    return fs.createReadStream(filename)
        .pipe(parse({ delimiter: ',', from_line: 2 }))
        .on('data', function (row) {
            count++;            
            entries.push(row[0]);
        })
        .on('end', function () {
            processEntries(entries);
        });
}

const getFileNameFromUrl = url => {
    let arr = url.split('/');
    return arr[arr.length - 1];  
}

// const downloadFileFromUrl = async (url, count) => {
//     let filename = await getFileNameFromUrl (url);
//     const file = fs.createWriteStream('./imgs/' + filename);            
//     await http.get(url, response => {
//         response.pipe(file);
//         console.log (count + ': ' + filename);
//     });
// }

const processEntries = async (entries) => {
    let count = 0;
    for (let entry of entries) {     
        
        // while (fs.existsSync('./imgs/' + filename)) {
        //     //file exists
        //     filename += '_';
        // }
        
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        if (++count % 1000 > 999) {
            await delay(5000);
        } else {
            await delay(50);
        }

        // await downloadFileFromUrl (entry, count);
        const options = {
            url: entry,
            dest: './imgs'                // will be saved to /path/to/dest/image.jpg
        };

        download.image(options)
        .then(({ filename }) => {
            console.log('Saved to', filename)  // saved to /path/to/dest/image.jpg
        })
            .catch((err) => console.error(err))
        }
}

module.exports = (filename) => {    
    return readCSV(filename);
}
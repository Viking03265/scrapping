const NightMare = require("nightmare");
const BookInfo = require("./book_info");
const BookCSV = require("./book_csv");
const ReadMore = require("./read_more");
const DownloadImages = require('./down_img');

// const getDetailedInfo = async (filename, bot_inst) => {
//     let ret = await ReadMore(filename, bot_inst);
// };
// getDetailedInfo('okra_books_new.csv', NightMare({ show: true }));

const getBookInfo = async (filename, bot_inst) => {
    let ret = await BookInfo(filename, bot_inst);
};
getBookInfo('age_category.json', NightMare({ show: true }));

// const convJsonToCSV = async (filename) => {
//     await BookCSV (filename);
// };
// convJsonToCSV ('book_data.json');

// const downloadCoverArts = async (filename) => {
//     await DownloadImages (filename);
// }
// downloadCoverArts ('book_data.csv');
const NightMare = require("nightmare");
const { getNotepadOptions } = require('./src/notepad');

const getOptions = async (url, bot_inst) => {
    await getNotepadOptions (url, bot_inst);
}
getOptions ('https://www.newprint.ca/notepads', NightMare({ show: false }));
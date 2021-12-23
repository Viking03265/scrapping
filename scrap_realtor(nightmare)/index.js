const NightMare = require("nightmare");
const { getHomesByZipcode } = require('./Src/Homes');

const getHomes = async (zipcode, bot_inst) => {
    await getHomesByZipcode (zipcode, bot_inst);
}
getHomes ('75202', NightMare({ show: true }));

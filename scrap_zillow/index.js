const NightMare = require("nightmare");
const StateInfo = require("./state_info");
const HomeDetail = require("./home_detail");
const ZipCode = require('./zipcode');
const Geocoding = require('./Geocode/revgeo');

const getGeocoding = async (filename, bot_inst) => {
    await Geocoding (filename, bot_inst);
}
getGeocoding ('./Geocode/coordinates.json', NightMare({ show: false }));

// const getHomeDetailInfo = async (state, bot_inst) => {
//     let ret = await HomeDetail(state, bot_inst);
// };
// getHomeDetailInfo('ID', NightMare({ show: true }));


// const getStateInfo = async (state, bot_inst) => {
//     await StateInfo(state, bot_inst);
// };
// getStateInfo('ID', NightMare({ loadTimeout: 45 * 1000, waitTimeout: 5 * 1000, show: true }));


// generateZipcodeJson = async () => {
//     await ZipCode();
// }
// generateZipcodeJson();
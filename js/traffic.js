//TOOLS
const { crunchTraffic, prepMainObject } = require('./tools');

/**
* @param {object} lastYearJson Recieves JSON object with last year's numbers
* @param {object} thisYearJson Recieves JSON object representing the most recent week
* @param {object} cafes Recieves JSON object with cafes template
* @return {object} fixedCafes
*/
const start = async (lastYearJson, thisYearJson, cafes) => {
  // Prepare the cafe json for data
  const fixedCafes = await prepMainObject(cafes);
    // Run through all weeks to find net total sold in each cafe and update that data field
  crunchTraffic(fixedCafes, lastYearJson, 'trafficLY'); // Running the numbers for previous year
  crunchTraffic(fixedCafes, thisYearJson, 'trafficTY'); // Running the numbers for the most recent week and storing as thisYear
  return fixedCafes;
}


module.exports.startTraffic = start;

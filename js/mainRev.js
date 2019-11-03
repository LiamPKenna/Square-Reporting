//TOOLS
const tools = require('./tools');

/**
* @param {object} lastYearJson Recieves JSON object with last year's numbers
* @param {object} lastWeekJson Recieves JSON object with last week's numbers
* @param {object} thisYearJson Recieves JSON object representing the most recent week
* @param {object} fixedCafes Recieves JSON object with cafe template including traffic numbers
* @return {object} fixedCafes
*/
const start = async (lastYearJson, thisYearJson, fixedCafes) => {
    // Run through all weeks to find net total sold in each cafe and update that data field
  tools.crunch(fixedCafes, lastYearJson, 'lastYear'); // Running the numbers for previous year
  tools.crunch(fixedCafes, thisYearJson, 'thisYear'); // Running the numbers for the most recent week and storing as thisYear
  tools.getChange(fixedCafes, 'lastYear', 'change');  // Do math on the weeks to get change year over year and update that field for each cafe
  tools.sortByKey(fixedCafes, 'change');  // Sort by change year over year: highest on top
  tools.getMainTotals(fixedCafes);  // Do math on the weeks to get totals, then create a new object containing those values and push into cafe object
  tools.getTicket(fixedCafes);
  tools.getPercentChange(fixedCafes, 'lastYear', 'change', 'percentChange');  // Do math on the weeks to get change year over year and update that field for each cafe
  tools.getTrafTicPercentChange(fixedCafes, 'trafficTY', 'trafficLY', 'percentTrafficChange');  // Do math on the weeks to get change year over year and update that field for each cafe
  tools.getTrafTicPercentChange(fixedCafes, 'ticketTY', 'ticketLY', 'percentTicketChange');  // Do math on the weeks to get change year over year and update that field for each cafe
  return fixedCafes;
}


module.exports.startMainRev = start;

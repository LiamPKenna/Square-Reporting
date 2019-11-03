//TOOLS
const tools = require('./tools.js');

/**
* @param {object} lastYearJson Recieves JSON object with last year's numbers
* @param {object} lastWeekJson Recieves JSON object with last week's numbers
* @param {object} thisYearJson Recieves JSON object representing the most recent week
* @param {object} cafes Recieves JSON object with cafe template
* @param {string} searchString Recieves key text to be searched for in numbers
* @return {object} fixedCafes
*/
const start = async (lastYearJson, lastWeekJson, thisYearJson, cafes, searchString) => {
    // Prepare the cafe json for data
  const fixedCafes = await tools.prepCompObject(cafes);
    // Run through all weeks to find net total sold in each cafe and update that data field
  tools.crunchNumbers(fixedCafes, lastYearJson, 'lastYear', searchString); // Running the numbers for previous year
  tools.crunchNumbers(fixedCafes, lastWeekJson, 'lastWeek', searchString); // Running the numbers for last week
  tools.crunchNumbers(fixedCafes, thisYearJson, 'thisYear', searchString); // Running the numbers for the most recent week and storing as thisYear
  tools.crunchNumbers(fixedCafes, thisYearJson, 'thisWeek', searchString); // Running the numbers for the most recent week and storing as thisWeek

  tools.getTotalNet(fixedCafes, thisYearJson, 'totalNet', 'Gift');  // Find total sales less Gift cards for each cafe
  tools.getChange(fixedCafes, 'lastYear', 'change');  // Do math on the weeks to get change year over year and update that field for each cafe
  tools.getChange(fixedCafes, 'lastWeek', 'changeWeek');  // Do math on the weeks to get change week over week and update that field for each cafe
  tools.sortByKey(fixedCafes, 'changeWeek');  // Sort by change week over week: highest on top
  tools.getTotals(fixedCafes);  // Do math on the weeks to get totals, then create a new object containing those values and push into cafe object
  tools.getPercentChange(fixedCafes, 'lastYear', 'change', 'percentChange');  // Do math on the weeks to get change year over year and update that field for each cafe
  tools.getPercentChange(fixedCafes, 'lastWeek', 'changeWeek', 'percentChangeWeek');  // Do math on the weeks to get change week over week and update that field for each cafe
  tools.getPercentChange(fixedCafes, 'totalNet', 'thisWeek', 'percentTotalNet'); // Find the percentage of total sales represented by thisWeek
  return fixedCafes;
}


module.exports.startCatComp = start;

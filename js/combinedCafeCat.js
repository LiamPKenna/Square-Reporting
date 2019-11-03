//TOOLS
const tools = require('./tools.js');

/**
* @param {object} lastYearJson Recieves JSON object with last year's numbers
* @param {object} lastWeekJson Recieves JSON object with last week's numbers
* @param {object} thisYearJson Recieves JSON object representing the most recent week
* @param {object} categories Recieves JSON object with categories template
* @return {object} fixedCategories
*/
const start = async (lastYearJson, lastWeekJson, thisYearJson, categories) => {
    // Prepare the cafe json for data
  let fixedCategories = await tools.prepCompObject(categories);
    // Run through all weeks to find net total sold in each cafe and update that data field
  tools.crunchCategories(fixedCategories, lastYearJson, 'lastYear'); // Running the numbers for previous year
  tools.crunchCategories(fixedCategories, lastWeekJson, 'lastWeek'); // Running the numbers for last week
  tools.crunchCategories(fixedCategories, thisYearJson, 'thisYear'); // Running the numbers for the most recent week and storing as thisYear
  tools.crunchCategories(fixedCategories, thisYearJson, 'thisWeek'); // Running the numbers for the most recent week and storing as thisWeek

  tools.getChange(fixedCategories, 'lastYear', 'change');  // Do math on the weeks to get change year over year and update that field for each cafe
  tools.getChange(fixedCategories, 'lastWeek', 'changeWeek');  // Do math on the weeks to get change week over week and update that field for each cafe
  tools.sortByKey(fixedCategories, 'change');  // Sort by change week over week: highest on top
  tools.getTotals(fixedCategories);  // Do math on the weeks to get totals, then create a new object containing those values and push into cafe object
  tools.getPercentChange(fixedCategories, 'lastYear', 'change', 'percentChange');  // Do math on the weeks to get change year over year and update that field for each cafe
  tools.getPercentChange(fixedCategories, 'lastWeek', 'changeWeek', 'percentChangeWeek');  // Do math on the weeks to get change week over week and update that field for each cafe
  return fixedCategories;
}


module.exports.startCombinedCat = start;

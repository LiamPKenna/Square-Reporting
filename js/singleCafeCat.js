
//TOOLS
const tools = require('./tools.js');  // Requires tool that takes cafe template json and adds number fields for use in the main program

/**
* @param {object} lastYearJson Recieves JSON object with the earliest date
* @param {object} lastWeekJson Recieves JSON object with the second earliest date
* @param {object} thisYearJson Recieves JSON object with the latest date
* @param {object} categories Recieves JSON object with the template
* @param {string} cafe Recieves the cafe name to be used in finding relevant data
* @return {object} fixedCategories
*/
const start = async (lastYearJson, lastWeekJson, thisYearJson, categories, cafe) => {
    // Prepare the cafe json for data
  let fixedCategories = await tools.prepCompObject(categories);
    // Run through all weeks to find net total sold in each cafe and update that data field
  tools.crunchSingleCafeCategories(fixedCategories, lastYearJson, 'lastYear', cafe); // Running the numbers for previous year
  tools.crunchSingleCafeCategories(fixedCategories, lastWeekJson, 'lastWeek', cafe); // Running the numbers for last week
  tools.crunchSingleCafeCategories(fixedCategories, thisYearJson, 'thisYear', cafe); // Running the numbers for the most recent week and storing as thisYear
  //crunchSingleCafeCategories(fixedCategories, thisYearJson, 'thisWeek', cafe); // Running the numbers for the most recent week and storing as thisWeek

  tools.getChange(fixedCategories, 'lastYear', 'change');  // Do math on the weeks to get change year over year and update that field for each category
  tools.getChange(fixedCategories, 'lastWeek', 'changeWeek');  // Do math on the weeks to get change week over week and update that field for each category
  tools.sortByKey(fixedCategories, 'change');  // Sort by change week over week: highest on top
  const theTotals = tools.getTotals(fixedCategories);  // Do math on the weeks to get totals, then create a new object containing those values and push into cafe object
  tools.getPercentChange(fixedCategories, 'lastYear', 'change', 'percentChange');  // Do math on the weeks to get change year over year and update that field for each cafe
  tools.getPercentChange(fixedCategories, 'lastWeek', 'changeWeek', 'percentChangeWeek');  // Do math on the weeks to get change week over week and update that field for each cafe
  for (category in fixedCategories) {
    fixedCategories[category].totalNet = theTotals.thisYear;
    fixedCategories[category].totalLW = theTotals.lastWeek;
    fixedCategories[category].totalLY = theTotals.lastYear;
  };
  tools.getPercentChange(fixedCategories, 'totalNet', 'thisYear', 'percentTotalNet'); // Find the percentage of total sales represented by thisWeek
  tools.getPercentChange(fixedCategories, 'totalLY', 'lastYear', 'percentTotalNetLY'); // Find the percentage of total sales represented by thisWeek
  tools.getPercentChange(fixedCategories, 'totalLW', 'lastWeek', 'percentTotalNetLW'); // Find the percentage of total sales represented by thisWeek
  return fixedCategories;
}


module.exports.startSingleCafe = start;

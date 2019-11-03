// Connects tools used to convert csv=>jason and json=>csv
const getCsv = require('./js/csvHandler.js').getCsv;
const writeCsv = require('./js/csvHandler.js').writeCsv;
const appendToFile = require('./js/csvHandler.js').appendToFile;
const fs = require('fs');
const writeToSheet = require('./js/sheetsAPI.js').writeToSheet;

// Connects to main tool file
const tools = require('./js/tools.js');

// Connects tools used to locate file locations and return them as strings
const findFile = require('./js/findFile.js').findFile;
const findFileArray = require('./js/findFile.js').findFileArray;

// Connects cleanup tool and individual report tools
const cleanup = require('./js/cleanup.js');
const startSingleCafe = require('./js/singleCafeCat.js').startSingleCafe;
const startCombinedCat = require('./js/combinedCafeCat.js').startCombinedCat;
const startCatComp = require('./js/catComp.js').startCatComp;
const startSingleItemComp = require('./js/singleItemComp.js').startSingleItemComp;
const startTraffic = require('./js/traffic.js').startTraffic;
const startMainRev = require('./js/mainRev.js').startMainRev;

const globalVariables = require('./js/globalVariables.js');

// Array of current Cafe Names to use as Keys,
const cafes = globalVariables.cafes;
const oneYearCafes = globalVariables.oneYearCafes;
const SHEET = globalVariables.SHEET;

const results = './results/'  // string of results directory

// Wrapper function to allow for async await
const main = async () => {

  const counter = [];

  //start timer to see how long app takes to run
  const timeStart = process.hrtime.bigint();

  //checks to see if all segments of the program have completed executing and if so logs a message calulating total time taken by app
  const testDone = () => {
    if (counter.length >= 5) {
      const timeEnd = process.hrtime.bigint();
      console.log(`All functions complete in ${(Number(timeEnd - timeStart))/1000000000} seconds`);
    }
  }

  //find the three category sales files coresponding to last year last week and this week. Store them as JSON objects
  const categoryArray = await findFileArray('category-sales', 'csv_files');
  const categoryLY = await getCsv(categoryArray[0]);
  const categoryLW = await getCsv(categoryArray[1]);
  const categoryTY = await getCsv(categoryArray[2]);

  //find the two item sales files coresponding to last week and this week. Store them as JSON objects
  const itemArray = await findFileArray('item-sales-summary', 'csv_files');
  const itemLW = await getCsv(itemArray[0]);
  const itemTY = await getCsv(itemArray[1]);

  //find the two payment method (traffic) files coresponding to last year and this week. Store them as JSON objects
  const trafficArray = await findFileArray('payment-method', 'csv_files');
  const trafficLY = await getCsv(trafficArray[0]);
  const trafficTY = await getCsv(trafficArray[1]);

  //get category template, convert to JSON, calculate values, format for readability, write as csv, log completion, update counter, test for app completion
  const runCombinedCat = async () => {
    let categoryTemplate = await getCsv(await findFile('categoryMix', '2019', 'templates'));
    const combinationCat = await startCombinedCat(categoryLY, categoryLW, categoryTY, categoryTemplate);
    const cleanCombinationCat = cleanup.allCatCleanup(combinationCat);
    //writeCsv(cleanCombinationCat, `CombinedCategoryComp`, results);  // Write json data to csv format file named using the string passed in and today's date in the root folder
    console.log(`Combined Categories Done`);
    counter.push(cleanCombinationCat);
    testDone();
    return cleanCombinationCat;
  };

  //for each cafe get category template, convert to JSON, calculate values, format for readability, push name to array, write as csv
  //check if all cafes are done, if so log completion, update counter, test for app completion
  const runSingleCafes = async () => {
    const allCafeNames = [];
    const cafeResultsArray = [];
    for (let cafe in cafes) {
      const singleCategoryTemplate = await getCsv(await findFile('categoryMix', '2019', 'templates'));
      const thisCafe = await startSingleCafe(categoryLY, categoryLW, categoryTY, singleCategoryTemplate, cafes[cafe]);
      const cafeCleaner = async (cafeData) => {
        if (oneYearCafes.includes(cafes[cafe])) {
          return await cleanup.singleCafeCleanupOneYear(cafeData);
        } else {
          return await cleanup.singleCafeCleanup(cafeData);
        }
      }
      const thisCleanCafe = await cafeCleaner(thisCafe);
      allCafeNames.push(cafes[cafe]);
      cafeResultsArray.push([thisCleanCafe, cafes[cafe]]);
      //writeCsv(thisCleanCafe, cafes[cafe], `${results}byCafe/`);
      if (cafeResultsArray.length === cafes.length) {
        console.log(`Single cafe reports done for ${allCafeNames}`);
        counter.push(allCafeNames);
        testDone();
        return cafeResultsArray;
      }
    };
  };

  //get category template for each of three reports, convert to JSON, calculate values, format for readability, write as csv, log completion, update counter, test for app completion
  const runCatComp = async () => {
    const beanTemplate = await getCsv(await findFile('template', '2019', 'templates'));
    const beanComp = await startCatComp(categoryLY, categoryLW, categoryTY, beanTemplate, 'Bean');
    const cleanBeanCompWeek = cleanup.catCompCleanupWeek(beanComp);
    //writeCsv(cleanBeanCompWeek, `BeanCompWeek`, results);  // Write json data to csv format file named using the string passed in and today's date in the root folder
    const cleanBeanCompYear = cleanup.catCompCleanupYear(beanComp);
    //writeCsv(cleanBeanCompYear, `BeanCompYear`, results);  // Write json data to csv format file named using the string passed in and today's date in the root folder
    const merchTemplate = await getCsv(await findFile('template', '2019', 'templates'));
    const merchComp = await startCatComp(categoryLY, categoryLW, categoryTY, merchTemplate, 'Merch');
    const cleanMerchCompWeek = cleanup.catCompCleanupWeek(merchComp);
    //writeCsv(cleanMerchCompWeek, `MerchComp`, results);  // Write json data to csv format file named using the string passed in and today's date in the root folder
    console.log(`Got Week Over Week for "Merch" & "Bean" / Got Year Over Year for "Bean"`);
    counter.push(cleanMerchCompWeek);
    testDone();
    const resultingArray = [cleanBeanCompWeek, cleanBeanCompYear, cleanMerchCompWeek];
    return resultingArray;
  };

  //get main template, convert to JSON, calculate traffic values, calculate revenue & ticket values, format main for readability, write as csv,
  //format one year cafes for readability, write as csv, log completion, update counter, test for app completion
  const runMainYOY = async () => {
    const mainTemplate = await getCsv(await findFile('mainTemplate', '2019', 'templates'));
    const cafeTrafficUgly = await startTraffic(trafficLY, trafficTY, mainTemplate);
    const mainUgly = await startMainRev(categoryLY, categoryTY, cafeTrafficUgly);
    const cleanMain = cleanup.mainCleanup(mainUgly);
    //writeCsv(cleanMain, `WeeklyTotals`, results);  // Write json data to csv format file named using the string passed in and today's date in the root folder
    const cleanOneYear = cleanup.oneYearCleanup(mainUgly);
    //writeCsv(cleanOneYear, `OneYearTotals`, results);  // Write json data to csv format file named using the string passed in and today's date in the root folder
    console.log(`Main Totals Calculated`);
    counter.push(cleanOneYear);
    testDone();
    return [cleanMain, cleanOneYear];
  };

  //get category template for each of three reports, convert to JSON, calculate values, combine three reports & format for readability,
  //write as csv, log completion, update counter, test for app completion. (Replace {Square item name} with the name of the item you want data on)
  const runItemComp = async () => {
    const food1Template = await getCsv(await findFile('template', '2019', 'templates'));
    const food1Ugly = await startSingleItemComp(itemLW, itemLW, itemTY, food1Template, '{Square item name}');
    const food2Template = await getCsv(await findFile('template', '2019', 'templates'));
    const food2Ugly = await startSingleItemComp(itemLW, itemLW, itemTY, food2Template, '{Square item name}');
    const food3Template = await getCsv(await findFile('template', '2019', 'templates'));
    const food3Ugly = await startSingleItemComp(itemLW, itemLW, itemTY, food3Template, '{Square item name}');
    const cleanItemComp = cleanup.singleItemsCleanup(hotBreUgly, lalitoUgly, winsomeUgly);
    //writeCsv(cleanItemComp, 'HotFood', results);  // Write json data to csv format file named using the string passed in and today's date in the root folder
    console.log(`Hot Food Totals Done`);
    counter.push(cleanItemComp);
    testDone();
    return cleanItemComp;
  };

  const getSeasonal = () => {
    const crunchItemSeasonal = (data, keyWord, value, itemVariation) => {
      let thisTotal = 0;
      for (let lineItem in data) {
        let thisLine = data[lineItem];
        if (
          thisLine['Item Name'].includes(keyWord) &&
          thisLine['Item Variation'].includes(itemVariation)
        ) {
          thisTotal += Number(thisLine[value].replace(/[^0-9.-]+/g,""));
        }
      }
      return thisTotal;
    }
    const seasonal1 = [
      crunchItemSeasonal(itemTY, globalVariables.seasonalOneType,'Net Sales',globalVariables.seasonalOneName),
      crunchItemSeasonal(itemLW, globalVariables.seasonalOneType,'Net Sales',globalVariables.seasonalOneName),
      crunchItemSeasonal(itemTY, globalVariables.seasonalOneType,'Items Sold',globalVariables.seasonalOneName)
    ];
    const seasonal2 = [
      crunchItemSeasonal(itemTY, globalVariables.seasonalTwoType,'Net Sales',globalVariables.seasonalTwoName),
      crunchItemSeasonal(itemLW, globalVariables.seasonalTwoType,'Net Sales',globalVariables.seasonalTwoName),
      crunchItemSeasonal(itemTY, globalVariables.seasonalTwoType,'Items Sold',globalVariables.seasonalTwoName)
    ];
    return [seasonal1, seasonal2];
  }

  //runs each report and stores the resulting object or array in a named variables
  //returns array with each variable in a predictable index
  const runAllReports = async () => {
    const cafeArray = await runSingleCafes();
    const categories = await runCombinedCat();
    const catArray = await runCatComp();
    const items = await runItemComp();
    const main = await runMainYOY();
    const seasonal = await getSeasonal();
    return [main, categories, items, catArray, cafeArray, seasonal];
  }

  /**
  * runs runAllReports and stores resulting array as cafeReports
  * writes .csv file with main totals then adds additional reports by appending
  * writes empty .csv file for cafe reports and adds each report by appending
  * uses same object array
  *
  */
  const combineAndWrite = async () => {
    const reports = await runAllReports();
    const mainCsv = await writeCsv(reports[0][0], `WeeklyTotals`, results);
    appendToFile(mainCsv, reports[0][1], 'Week over Week');
    appendToFile(mainCsv, reports[1], 'Categories');
    appendToFile(mainCsv, reports[2], 'Hot Food');
    appendToFile(mainCsv, reports[3][1], 'Whole Bean YoY');
    appendToFile(mainCsv, reports[3][2], 'Merch WoW');
    appendToFile(mainCsv, reports[3][0], 'Whole Bean WoW');
    const cafeReports = await reports[4];
    const cafesCsv = await writeCsv([{},{},{},{},{},{},{},{},{},{},{}], `CafeCategories`, results);
    for (let cafe in cafeReports) {
      appendToFile(cafesCsv, cafeReports[cafe][0], cafeReports[cafe][1]);
    }
    const mainArray = tools.objectToArray(reports[0][0]);
    const oneYearArray = tools.objectToArray(reports[0][1]);
    const categoryArray = tools.objectToArray(reports[1]);
    categoryArray.pop();
    const hotFoodArray = tools.objectToArray(reports[2]);
    const wbyoyArray = tools.objectToArray(reports[3][1]);
    const merchwowArray = tools.objectToArray(reports[3][2]);
    const wbwowArray = tools.objectToArray(reports[3][0]);
    const seasonalArray = reports[5];
    writeToSheet(SHEET,'New!B3:J13', mainArray);
    writeToSheet(SHEET,'New!B16:F18', oneYearArray);
    writeToSheet(SHEET,'New!B21:F36', categoryArray);
    writeToSheet(SHEET,'New!F40:F40', [[seasonalArray[0][1]]]);
    writeToSheet(SHEET,'New!F41:F41', [[seasonalArray[1][1]]]);
    writeToSheet(SHEET,'New!H40:H40', [[seasonalArray[0][2]]]);
    writeToSheet(SHEET,'New!H41:H41', [[seasonalArray[1][2]]]);
    writeToSheet(SHEET,'New!I40:I40', [[seasonalArray[0][0]]]);
    writeToSheet(SHEET,'New!I41:I41', [[seasonalArray[1][0]]]);
    writeToSheet(SHEET,'New!B40:C40', [[hotFoodArray[0][1], hotFoodArray[0][2]]]);
    writeToSheet(SHEET,'New!B43:C43', [[hotFoodArray[1][1], hotFoodArray[1][2]]]);
    writeToSheet(SHEET,'New!B46:C46', [[hotFoodArray[2][1], hotFoodArray[2][2]]]);
    writeToSheet(SHEET,'New!B57:F67', wbyoyArray);
    writeToSheet(SHEET,'New!B72:F85', merchwowArray);
    writeToSheet(SHEET,'New!B90:F103', wbwowArray);
    for (let cafe in cafeReports) {
      const cafeSheet = '1K47F0rqaPmkUcrAbQ5ecWP70HXFsGSC6FjPRwoeaCyA';
      let range = ''
      switch (cafeReports[cafe][1]) {
        case '{Cafe 1}':
          range = 'NewCafes!B4:L20';
          break;
        case '{Cafe 2}':
          range = 'NewCafes!B24:L40';
          break;
        case '{Cafe 3}':
          range = 'NewCafes!B44:L60';
          break;
        case '{Cafe 4}':
          range = 'NewCafes!B64:L80';
          break;
        case '{Cafe 5}':
          range = 'NewCafes!B84:L100';
          break;
        case '{Cafe 6}':
          range = 'NewCafes!B104:L120';
          break;
        case '{Cafe 7}':
          range = 'NewCafes!B124:L140';
          break;
        case '{Cafe 8}':
          range = 'NewCafes!B144:L160';
          break;
        case '{Cafe 9}':
          range = 'NewCafes!B164:L180';
          break;
        case '{Cafe 10}':
          range = 'NewCafes!B184:L200';
          break;
        case '{Cafe 11}':
          range = 'NewCafes!B204:H220';
          break;
        case '{Cafe 12}':
          range = 'NewCafes!B224:H240';
          break;
        case '{Cafe 13}':
          range = 'NewCafes!B244:H260';
          break;
      }
      let thisCafeReport = tools.objectToArray(cafeReports[cafe][0]);
      writeToSheet(SHEET, range, thisCafeReport);
    }

  }

  combineAndWrite();
};

main();

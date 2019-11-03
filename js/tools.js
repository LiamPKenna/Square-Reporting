// Takes prepared cafes object and runs through line items in a single report to get desired data
const crunch = (cafes, data, dataString) => {
  for (let cafe in cafes) {
    let thisCafe = cafes[cafe];
    for (let lineItem in data) {
      let thisLine = data[lineItem];
      if (thisLine.Location.includes(`${thisCafe.Location}`) && thisLine.Category != 'Gift') {
        thisCafe[dataString] += Number(thisLine['Net Sales'].replace(/[^0-9.-]+/g,""));
      }
    }
  }
}

// Takes prepared cafes object and runs through line items in a single report to get desired data
const crunchNumbers = (cafes, data, dataString, searchString) => {
  for (let cafe in cafes) {
    let thisCafe = cafes[cafe];
    for (let lineItem in data) {
      let thisLine = data[lineItem];
      if (thisLine.Location.includes(`${thisCafe.Location}`) && thisLine.Category.includes(`${searchString}`)) {
        thisCafe[dataString] += Number(thisLine['Net Sales'].replace(/[^0-9.-]+/g,""));
      }
    }
  }
}

const crunchTraffic = (cafes, data, dataString, searchString) => {
  for (let cafe in cafes) {
    let thisCafe = cafes[cafe];
    for (let lineItem in data) {
      let thisLine = data[lineItem];
      if (thisLine.Location.includes(`${thisCafe.Location}`)) {
        thisCafe[dataString] += Number(thisLine['Payments'].replace(/[^0-9.-]+/g,""));
      }
    }
  }
}

const crunchItemNumbers = (cafes, data, dataString, keyWord) => {
  for (let cafe in cafes) {
    let thisCafe = cafes[cafe];
    for (let lineItem in data) {
      let thisLine = data[lineItem];
      if (thisLine.Location.includes(`${thisCafe.Location}`) && (thisLine['Item Name'].includes(keyWord))) {
        thisCafe[dataString] += Number(thisLine['Net Sales'].replace(/[^0-9.-]+/g,""));
      }
    }
  }
}

const crunchCategories = (categories, data, dataString) => {
  for (let category in categories) {
    let thisCategory = categories[category];
    for (let lineItem in data) {
      let thisLine = data[lineItem];
      if (thisLine.Category === 'Uncategorized') {
          thisLine.Category = 'Coffee Prepared Espresso';
      }
      if (thisLine.Category.includes(`${thisCategory.Category}`) && !thisLine.Location.includes(`Pacific`) && !thisLine.Location.includes('Warner') && !thisLine.Location.includes('E8th LAX')) {
        thisCategory[dataString] += Number(thisLine['Net Sales'].replace(/[^0-9.-]+/g,""));
      }
    }
  }
}

const crunchSingleCafeCategories = (categories, data, dataString, cafe) => {
  for (let category in categories) {
    let thisCategory = categories[category];
    for (let lineItem in data) {
      let thisLine = data[lineItem];
      if (thisLine.Category.includes(`${thisCategory.Category}`) && thisLine.Location.includes(cafe)) {
        thisCategory[dataString] += Number(thisLine['Net Sales'].replace(/[^0-9.-]+/g,""));
      }
    }
  }
}

// Takes prepared cafes object and runs through line items in a single report to get all categories except the excluded category
const getTotalNet = (cafes, data, dataString, excludeFromSearch) => {
  for (let cafe in cafes) {
    let thisCafe = cafes[cafe];
    for (let lineItem in data) {
      let thisLine = data[lineItem];
      if (thisLine.Location.includes(`${thisCafe.Location}`) && !(thisLine.Category == excludeFromSearch)) {
        thisCafe[dataString] += Number(thisLine['Net Sales'].replace(/[^0-9.-]+/g,""));
      }
    }
  }
}

// Takes cafe template json and adds number fields for use in the main program
const prepCompObject = (cafesObject) => {
  return new Promise((resolve, reject) => {
    for (let cafe in cafesObject) {
      cafesObject[cafe].thisYear = 0;
      cafesObject[cafe].lastYear = 0;
      cafesObject[cafe].thisWeek = 0;
      cafesObject[cafe].lastWeek = 0;
      cafesObject[cafe].change = 0;
      cafesObject[cafe].percentChange = 0;
      cafesObject[cafe].percentChangeWeek = 0;
      cafesObject[cafe].totalNet = 0;
    }
    resolve(cafesObject)
  })
}

// Takes cafe template json and adds number fields for use in the main program
const prepMainObject = (cafesObject) => {
  return new Promise((resolve, reject) => {
    for (let cafe in cafesObject) {
      cafesObject[cafe].thisYear = 0;
      cafesObject[cafe].lastYear = 0;
      cafesObject[cafe].change = 0;
      cafesObject[cafe].percentChange = 0;
      cafesObject[cafe].trafficTY = 0;
      cafesObject[cafe].trafficLY = 0;
      cafesObject[cafe].percentTrafficChange = 0;
      cafesObject[cafe].ticketTY = 0;
      cafesObject[cafe].ticketLY = 0;
      cafesObject[cafe].percentTicketChange = 0;
    }
    resolve(cafesObject)
  })
}

// Takes object and sorts by the key provided
const sortByKey = (obj, key) => {
  return obj.sort(function(a, b) {
      var x = a[key]; var y = b[key];
      return ((x > y) ? -1 : ((x < y) ? 1 : 0));
  });
}

// Finds the year over year or week over week change in sales
const getChange = (cafes, key, keyToEdit) => {
  for (let cafe in cafes) {
    cafes[cafe][keyToEdit] = cafes[cafe].thisYear - cafes[cafe][key];
  }
}

// Finds the average ticket
const getTicket = (cafes) => {
  for (let cafe in cafes) {
    cafes[cafe].ticketTY = cafes[cafe].thisYear/cafes[cafe].trafficTY;
  }
  for (let cafe in cafes) {
    cafes[cafe].ticketLY = cafes[cafe].lastYear/cafes[cafe].trafficLY;
  }
}

const getPercentChange = (cafes, keydata, keyChange, keyToEdit) => {
  for (let cafe in cafes) {
    if (cafes[cafe][keydata] != 0) {
      cafes[cafe][keyToEdit] = cafes[cafe][keyChange]/cafes[cafe][keydata];
    } else {
      cafes[cafe][keyToEdit] = 0;
    }
  }
}

const getTrafTicPercentChange = (cafes, thisYear, lastYear, keyToEdit) => {
  for (let cafe in cafes) {
    if (cafes[cafe][lastYear] != 0) {
      cafes[cafe][keyToEdit] = (cafes[cafe][thisYear]-cafes[cafe][lastYear])/cafes[cafe][lastYear];
    } else {
      cafes[cafe][keyToEdit] = 0;
    }
  }
}

const getCatPercentChange = (cafes, keydata, keyChange, keyToEdit) => {
  for (let cafe in cafes) {
    if (cafes[cafe][keydata] != 0) {
      cafes[cafe][keyToEdit] = cafes[cafe][keyChange]/cafes[cafe][keydata];
    } else if (cafes[cafe][keyChange] != 0) {
      cafes[cafe][keyToEdit] = "inf";
    } else if (cafes[cafe][keyChange] === 0) {
      cafes[cafe][keyToEdit] = 0;
    }
  }
}

/**
* @param {json} cafes Recieves json object to get totals on
* creates variables with number value of 0 then iterates through cafe object to get total for each category
* adds totals to cafe object
* @return {json} totals
*/
const getTotals = (cafes) => {
  let thisYearX = 0;
  let lastYearX = 0;
  let lastWeekX = 0;
  let thisWeekX = 0;
  let changeX = 0;
  let changeWeekX = 0;
  let totalNetX = 0;
  for (let cafe in cafes) {
    thisWeekX += cafes[cafe].thisWeek;
    totalNetX += cafes[cafe].totalNet;
    if (cafes[cafe].lastYear != 0) {
      thisYearX += cafes[cafe].thisYear;
      lastYearX += cafes[cafe].lastYear;
      changeX += cafes[cafe].change;
    }
    if (cafes[cafe].lastWeek != 0) {
      lastWeekX += cafes[cafe].lastWeek;
      changeWeekX += cafes[cafe].changeWeek;
    }
  }
  const totals = {
    'Location' : 'TOTAL',
    'thisYear' : thisYearX,
    'lastYear' : lastYearX,
    'thisWeek' : thisWeekX,
    'lastWeek' : lastWeekX,
    'change' : changeX,
    'changeWeek' : changeWeekX,
    'percentChange' : 0,
    'totalNet' : totalNetX,
    'Category' : 'TOTAL'
  }
  cafes.push(totals);
  return totals;
}

/**
* @param {json} cafes Recieves json object to get totals on
* creates variables with number value of 0 then iterates through cafe object to get total for each category
*/
const getMainTotals = (cafes) => {
  let thisYearX = 0;
  let lastYearX = 0;
  let trafficLYX = 0;
  let trafficTYX = 0;
  let changeX = 0;
  let ticketTYX = 0;
  let ticketLYX = 0;
  let sameStoreCount = 0;
  for (let cafe in cafes) {
    if (cafes[cafe].lastYear != 0) {
      thisYearX += cafes[cafe].thisYear;
      lastYearX += cafes[cafe].lastYear;
      changeX += cafes[cafe].change;
    }
    if (cafes[cafe].trafficLY != 0) {
      trafficTYX += cafes[cafe].trafficTY;
      trafficLYX += cafes[cafe].trafficLY;
      ticketTYX += cafes[cafe].ticketTY;
      ticketLYX += cafes[cafe].ticketLY;
      sameStoreCount += 1;
    }
  }
  const totals = {
    'Location' : 'TOTAL',
    'thisYear' : thisYearX,
    'lastYear' : lastYearX,
    'change' : changeX,
    'percentChange' : 0,
    'trafficTY' : trafficTYX,
    'trafficLY' : trafficLYX,
    'percentTrafficChange' : 0,
    'ticketTY' : (ticketTYX/(sameStoreCount)),
    'ticketLY' : (ticketLYX/(sameStoreCount)),
    'percentTicketChange' : 0
  }
  cafes.push(totals);
  return totals;
}

/**
* @param {json} cafes Recieves json object to get totals on
* creates variables with number value of 0 then iterates through cafe object to get total for each category
*/
const getCatTotals = (cafes) => {
  let thisYearX = 0;
  let lastYearX = 0;
  let lastWeekX = 0;
  let thisWeekX = 0;
  let changeX = 0;
  let changeWeekX = 0;
  let totalNetX = 0;
  for (let cafe in cafes) {
    thisWeekX += cafes[cafe].thisWeek;
    totalNetX += cafes[cafe].totalNet;
    thisYearX += cafes[cafe].thisYear;
    lastYearX += cafes[cafe].lastYear;
    if (cafes[cafe].change != "inf") {
      changeX += cafes[cafe].change;
    }
    lastWeekX += cafes[cafe].lastWeek;
    if (cafes[cafe].changeWeek != "inf") {
      changeWeekX += cafes[cafe].changeWeek;
    }
  }
  const totals = {
    'Location' : 'TOTAL',
    'thisYear' : thisYearX,
    'lastYear' : lastYearX,
    'thisWeek' : thisWeekX,
    'lastWeek' : lastWeekX,
    'change' : changeX,
    'changeWeek' : changeWeekX,
    'percentChange' : 0,
    'totalNet' : totalNetX,
    'Category' : 'TOTAL'
  }
  cafes.push(totals);
  return totals;
}

/**
* @param {json} obj Recieves json object to be converted to a keyless Array
* iterates on object converts to 2D array without keys
* @return {array} array
*/
const objectToArray = (obj) => {
  const array = [];
  for (let line in obj) {
    array.push(Object.values(obj[line]));
  }
  return array;
}

module.exports.crunch = crunch;
module.exports.crunchNumbers = crunchNumbers;
module.exports.crunchTraffic = crunchTraffic;
module.exports.crunchItemNumbers = crunchItemNumbers;
module.exports.crunchCategories = crunchCategories;
module.exports.crunchSingleCafeCategories = crunchSingleCafeCategories;
module.exports.getTotalNet = getTotalNet;
module.exports.prepCompObject = prepCompObject;
module.exports.prepMainObject = prepMainObject;
module.exports.sortByKey = sortByKey;
module.exports.getChange = getChange;
module.exports.getTicket = getTicket;
module.exports.getTotals = getTotals;
module.exports.getMainTotals = getMainTotals;
module.exports.getCatTotals = getCatTotals;
module.exports.getPercentChange = getPercentChange;
module.exports.getTrafTicPercentChange = getTrafTicPercentChange;
module.exports.getCatPercentChange = getCatPercentChange;
module.exports.objectToArray = objectToArray;

const sortByKey = require('./tools.js').sortByKey;  // Sorts the object by the requested field (Large=>Small)

const singleCafeCleanup = (cafeUgly) => {
  const cafeClean = [];
  for (i = 0; i < cafeUgly.length; i++) {
    cafeClean.push({
      'Category': cafeUgly[i].Category,
      'This Year': `$${cafeUgly[i].thisYear.toFixed(2).toString()}`,
      'Last Year': `$${cafeUgly[i].lastYear.toFixed(2).toString()}`,
      'Change YOY': `$${cafeUgly[i].change.toFixed(2).toString()}`,
      '% Change YOY': `${(cafeUgly[i].percentChange*100).toFixed(2).toString()}%`,
      'Last Week': `$${cafeUgly[i].lastWeek.toFixed(2).toString()}`,
      'Change WOW': `$${cafeUgly[i].changeWeek.toFixed(2).toString()}`,
      '% Change WOW': `${(cafeUgly[i].percentChangeWeek*100).toFixed(2).toString()}%`,
      '% Total TW': `${(cafeUgly[i].percentTotalNet*100).toFixed(2).toString()}%`,
      '% Total change YOY': `${((cafeUgly[i].percentTotalNet-cafeUgly[i].percentTotalNetLY)*100).toFixed(2).toString()}%`,
      '% Total change WOW': `${((cafeUgly[i].percentTotalNet-cafeUgly[i].percentTotalNetLW)*100).toFixed(2).toString()}%`
    });
  };
  return cafeClean;
}

const singleCafeCleanupOneYear = (cafeUgly) => {
  const cafeClean = [];
  const sortByKey = (array, key) => {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
  }
  const thisYearTotals = (array) => {
    let totalValue = 0;
    const totalsIndex = (array.length - 1);
    for (let line in array) {
      totalValue += array[line].thisYear;
    }
    array[totalsIndex].thisYear = totalValue;
  }
  const getPercentTotal = (array) => {
    const totalsIndex = (array.length - 1);
    const totalValue = array[totalsIndex].thisYear;
    for (let line in array) {
      array[line].percentTotalNet = array[line].thisYear/totalValue;
    }
  }
  const totals = cafeUgly.pop();
  sortByKey(cafeUgly, 'changeWeek');
  cafeUgly.push(totals);
  thisYearTotals(cafeUgly);
  getPercentTotal(cafeUgly);
  for (let i in cafeUgly) {
    cafeClean.push({
      'Category': cafeUgly[i].Category,
      'This Week': `$${cafeUgly[i].thisYear.toFixed(2).toString()}`,
      'Last Week': `$${cafeUgly[i].lastWeek.toFixed(2).toString()}`,
      'Change WOW': `$${cafeUgly[i].changeWeek.toFixed(2).toString()}`,
      '% Change WOW': `${(cafeUgly[i].percentChangeWeek*100).toFixed(2).toString()}%`,
      '% Total TW': `${(cafeUgly[i].percentTotalNet*100).toFixed(2).toString()}%`,
      '% Total change WOW': `${((cafeUgly[i].percentTotalNet-cafeUgly[i].percentTotalNetLW)*100).toFixed(2).toString()}%`
    });
  };
  return cafeClean;
}

const catCompCleanupWeek = (compUgly) => {
  const compClean = [];
  for (i = 0; i < compUgly.length; i++) {
    compClean.push({
      'Cafe': compUgly[i].Location,
      'This Week': compUgly[i].thisWeek,
      'Last Week': compUgly[i].lastWeek,
      'Change': compUgly[i].changeWeek,
      '% Change': compUgly[i].percentChangeWeek
    });
  };
  return compClean;
}

const catCompCleanupYear = (compUgly) => {
  const compClean = [];
  for (i = 0; i < compUgly.length; i++) {
    if (compUgly[i].lastYear != 0) {
      compClean.push({
        'Cafe': compUgly[i].Location,
        'This Year': compUgly[i].thisYear,
        'Last Year': compUgly[i].lastYear,
        'Change $': compUgly[i].change,
        'Change %': compUgly[i].percentChange
      });
    }
  };
  const totals = compClean.pop();
  sortByKey(compClean, 'Change $');
  compClean.push(totals);
  return compClean;
}

const allCatCleanup = (cafeUgly) => {
  const catClean = [];
  for (i = 0; i < cafeUgly.length; i++) {
    catClean.push({
      'Category': cafeUgly[i].Category,
      'TY': cafeUgly[i].thisYear,
      'LY': cafeUgly[i].lastYear,
      '$ Change': cafeUgly[i].change,
      '% Change': cafeUgly[i].percentChange
    });
  };
  return catClean;
}

const singleItemsCleanup = (hotB, lalito, winsome) => {
  const singleItemsClean = [];
  const hotBreTotals = hotB.pop();
  const lalitoTotals = lalito.pop();
  const winsomeTotals = winsome.pop();
  singleItemsClean.push({'Item': 'Hot Breakfast','This Week': hotBreTotals.thisWeek,'Last Week': hotBreTotals.lastWeek,});
  singleItemsClean.push({'Item': 'Lalito','This Week': lalitoTotals.thisWeek,'Last Week': lalitoTotals.lastWeek,});
  singleItemsClean.push({'Item': 'Winsome','This Week': winsomeTotals.thisWeek,'Last Week': winsomeTotals.lastWeek,});
  return singleItemsClean;
}

const mainCleanup = (mainUgly) => {
  const mainClean = [];
  for (i = 0; i < mainUgly.length; i++) {
    if (mainUgly[i].lastYear != 0) {
      mainClean.push({
        'Cafe': mainUgly[i].Location,
        'Revenue TY': mainUgly[i].thisYear,
        'Revenue LY': mainUgly[i].lastYear,
        'Revenue vs LY $': mainUgly[i].change,
        'Revenue vs LY %': mainUgly[i].percentChange,
        'TY Traffic': mainUgly[i].trafficTY,
        'Traffic vs LY' : mainUgly[i].percentTrafficChange,
        'TY Ticket' : mainUgly[i].ticketTY,
        'Ticket vs LY' : mainUgly[i].percentTicketChange
      });
    };
  };
  return mainClean;
}

const oneYearCleanup = (mainUgly) => {
  const mainClean = [];
  for (i = 0; i < mainUgly.length; i++) {
    if (mainUgly[i].lastYear === 0) {
      mainClean.push({
        'Cafe': mainUgly[i].Location,
        'Revenue': mainUgly[i].thisYear,
        'Revenue LW': 0,
        'Traffic': mainUgly[i].trafficTY,
        'Ticket' : mainUgly[i].ticketTY
      });
    };
  };
  return mainClean;
}

module.exports.singleCafeCleanup = singleCafeCleanup;
module.exports.singleCafeCleanupOneYear = singleCafeCleanupOneYear;
module.exports.catCompCleanupWeek = catCompCleanupWeek;
module.exports.catCompCleanupYear = catCompCleanupYear;
module.exports.allCatCleanup = allCatCleanup;
module.exports.singleItemsCleanup = singleItemsCleanup;
module.exports.mainCleanup = mainCleanup;
module.exports.oneYearCleanup = oneYearCleanup;

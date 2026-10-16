(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const euro = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  const euroPrecise = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const oneDecimal = new Intl.NumberFormat('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const num = id => Math.max(0, Number($(`#${id}`).value) || 0);
  const signed = id => Number($(`#${id}`).value) || 0;

  const LIMITS = {
    tax1: 38883,
    tax2: 78426,
    generalCreditStart: 29736,
    careAssetsSingle: 146011,
    careAssetsPartners: 184633,
    rentAssetsSingle: 38479,
    rentAssetsPartners: 76958,
    rentCap: 932.93,
    youngRentCap: 498.20,
    qualityRent: 498.20,
    lowRentCap: 713.02,
    highRentCap: 764.14
  };

  // CAO Rijk § 6.3: bruto maandbedragen bij 36 uur, geldig vanaf 1 juli 2026.
  const RIJK_SALARIES_JULY = {
    1: [2399.87,2440.96,2482.79,2525.34,2568.64,2612.69,2657.52,2703.13,2749.53,2796.75,2844.80],
    2: [2525.34,2568.64,2612.69,2657.52,2703.13,2749.53,2796.75,2844.80,2893.69,2943.42,2994.03],
    3: [2657.52,2703.13,2749.53,2796.75,2844.80,2893.69,2943.42,2994.03,3045.54,3097.95,3170.57],
    4: [2749.53,2796.75,2844.80,2893.69,2943.42,2994.03,3045.54,3097.95,3170.57,3251.84,3333.81],
    5: [2844.80,2893.69,2943.42,2994.03,3045.54,3097.95,3170.57,3251.84,3333.81,3415.06,3496.31],
    6: [2943.42,2994.03,3045.54,3097.95,3170.57,3251.84,3333.81,3415.06,3496.31,3579.02,3660.24],
    7: [3097.95,3170.57,3251.84,3333.81,3415.06,3496.31,3579.02,3660.24,3741.48,3854.80,3984.50],
    8: [3333.81,3415.06,3496.31,3579.02,3660.24,3741.48,3854.80,3984.50,4132.76,4293.80,4457.77],
    9: [3579.02,3660.24,3741.48,3854.80,3984.50,4132.76,4293.80,4457.77,4636.63,4818.39,4999.46],
    10: [3496.31,3660.24,3854.80,4132.76,4457.77,4636.63,4818.39,4999.46,5171.91,5353.68,5535.40],
    11: [4132.76,4457.77,4636.63,4818.39,4999.46,5171.91,5353.68,5535.40,5769.16,6022.89,6275.94],
    12: [4818.39,4999.46,5171.91,5353.68,5535.40,5769.16,6022.89,6275.94,6545.34,6819.72,7094.18],
    13: [5353.68,5535.40,5769.16,6022.89,6275.94,6545.34,6819.72,7094.18,7369.22,7659.07,7956.89],
    14: [6022.89,6275.94,6545.34,6819.72,7094.18,7369.22,7659.07,7956.89,8229.06,8505.47,8781.26],
    15: [6819.72,7094.18,7369.22,7659.07,7956.89,8229.06,8505.47,8781.26,9028.02,9286.47,9561.61],
    16: [7659.07,7956.89,8229.06,8505.47,8781.26,9028.02,9286.47,9561.61,9831.67,10106.79,10407.54],
    17: [8505.47,8781.26,9028.02,9286.47,9561.61,9831.67,10106.79,10407.54,10716.21,11025.76,11334.46],
    18: [9286.47,9561.61,9831.67,10106.79,10407.54,10716.21,11025.76,11334.46,11671.25,12008.02,12345.58],
    19: [10106.79,10407.54,10716.21,11025.76,11334.46,11671.25,12008.02,12345.58,12638.26,12930.17,13223.63]
  };

  const RIJK = {
    fulltimeHours: 36,
    julyIncrease: 1.027,
    ikbRate: .165,
    ikbFloorJanuary: 440,
    ikbFloorJuly: 452,
    opnpEmployeeRate: .0813,
    opnpFranchise: 19200,
    opnpMaximum: 137800,
    aopEmployeeRate: .0021,
    aopFranchise: 29700
  };

  // Bijlage I bij het Besluit kinderopvangtoeslag, tabel 2026.
  const kotTable = [
    [24149,96,96],[25756,96,96],[27363,96,96],[28973,96,96],[30579,96,96],[32189,96,96],
    [33795,96,96],[35400,96,96],[37129,96,96],[38855,96,96],[40586,96,96],[42313,96,96],
    [44046,96,96],[45776,96,96],[47546,96,96],[49318,96,96],[51092,96,96],[52864,96,96],
    [54641,96,96],[56412,96,96],[58184,95.5,95.6],[59957,94.8,95.6],[61895,93.9,95.6],
    [65695,92.4,95.6],[69492,91.6,95.2],[73292,90.5,94.6],[77094,88.2,94.2],
    [80891,85.9,93.9],[84693,83.7,93.2],[88491,81.2,92.7],[92291,78.9,92.2],
    [96091,76.7,91.5],[99889,74.3,90.9],[103694,72.1,90.5],[107492,69.6,90.2],
    [111290,67.3,89.5],[115090,65.1,89.1],[118963,62.7,88.6],[122857,60.6,87.9],
    [126747,58.5,87.4],[130638,56.4,87],[134527,54.2,86.7],[138420,52.3,86],
    [142312,50.4,85.4],[146205,48.5,85],[150092,46.5,84.4],[153982,44.5,84],
    [157877,42.5,83.3],[161766,40.5,82.7],[165657,38.5,81.7],[169547,36.5,81.4],
    [173440,36.5,80.6],[177335,36.5,79.7],[181223,36.5,79.1],[185114,36.5,78.2],
    [189002,36.5,77.7],[192896,36.5,76.9],[196789,36.5,76.2],[200681,36.5,75.5],
    [204571,36.5,74.5],[208458,36.5,74],[212353,36.5,73.3],[216242,36.5,72.5],
    [220134,36.5,71.8],[224026,36.5,71.2],[227915,36.5,70.4],[231807,36.5,69.6],
    [235697,36.5,69.1],[Infinity,36.5,68.2]
  ];

  const scenarios = {
    starter: { isRijkEmployee: true, rijkScale: 8, rijkStep: 2, rijkHours: 36, rijkAugustEmployed: true, rijkPensionExtras: 0, planExtraHours: false, annualBonus: 0, carePremium: 159, taxableAddition: 0, netReimbursements: 40, otherDeductions: 0, incomeAdjustment: 0, otherAggregateIncome: 0, hasPartner: false, isRenter: true, baseRent: 725, householdMembers: 1, coResidentIncome: 0, coResidentOverAsset: false, youngRenter: false, assets: 7000, kids05: 0, kids611: 0, kids1215: 0, kids1617: 0, hasChildcare: false },
    family: { isRijkEmployee: true, rijkScale: 10, rijkStep: 5, rijkHours: 32, rijkAugustEmployed: true, rijkPensionExtras: 0, planExtraHours: false, annualBonus: 0, carePremium: 159, taxableAddition: 0, netReimbursements: 80, otherDeductions: 15, incomeAdjustment: 0, otherAggregateIncome: 0, hasPartner: true, partnerGross: 2550, partnerPension: 90, isRenter: true, baseRent: 910, householdMembers: 4, coResidentIncome: 0, coResidentOverAsset: false, youngRenter: false, assets: 15000, kids05: 1, kids611: 1, kids1215: 0, kids1617: 0, iackEligible: true, hasChildcare: true, childcareType: 'daycare', childcareChildren: 1, childcareHours: 96, childcareRate: 11.65 },
    couple: { isRijkEmployee: true, rijkScale: 12, rijkStep: 8, rijkHours: 36, rijkAugustEmployed: true, rijkPensionExtras: 0, planExtraHours: false, annualBonus: 0, carePremium: 159, taxableAddition: 7200, netReimbursements: 50, otherDeductions: 60, incomeAdjustment: 0, otherAggregateIncome: 0, hasPartner: true, partnerGross: 3600, partnerPension: 140, isRenter: false, assets: 32000, kids05: 0, kids611: 0, kids1215: 0, kids1617: 0, hasChildcare: false }
  };

  function progressiveTax(income) {
    const a = Math.min(income, LIMITS.tax1) * .3575;
    const b = Math.min(Math.max(income - LIMITS.tax1, 0), LIMITS.tax2 - LIMITS.tax1) * .3756;
    const c = Math.max(income - LIMITS.tax2, 0) * .495;
    return a + b + c;
  }

  function generalCredit(income) {
    if (income <= LIMITS.generalCreditStart) return 3115;
    if (income >= LIMITS.tax2) return 0;
    return Math.max(0, 3115 - .06398 * (income - LIMITS.generalCreditStart));
  }

  function labourCredit(income) {
    if (income <= 11965) return .08324 * income;
    if (income <= 25845) return 996 + .31009 * (income - 11965);
    if (income <= 45592) return 5300 + .0195 * (income - 25845);
    if (income <= 132920) return Math.max(0, 5685 - .0651 * (income - 45592));
    return 0;
  }

  function iack(income) {
    if (income <= 6239) return 0;
    if (income <= 32719) return Math.min(3032, .1145 * (income - 6239));
    return 3032;
  }

  function employeeNet(monthly, holidayRate, bonus, pensionMonthly, iackApplies, options = {}) {
    const gross = options.annualGross ?? (monthly * 12 * (1 + holidayRate / 100) + bonus);
    const pension = options.annualPension ?? pensionMonthly * 12;
    const taxableAddition = options.taxableAddition || 0;
    const reimbursements = (options.netReimbursements || 0) * 12;
    const deductions = (options.otherDeductions || 0) * 12;
    const taxable = Math.max(0, gross + taxableAddition - pension);
    const taxBefore = progressiveTax(taxable);
    const creditIncome = taxable + (options.aggregateIncomeExtra || 0);
    const credits = Math.min(taxBefore, generalCredit(creditIncome) + labourCredit(taxable) + (iackApplies ? iack(taxable) : 0));
    const tax = Math.max(0, taxBefore - credits);
    return { gross, pension, taxableAddition, reimbursements, deductions, taxable, creditIncome, taxBefore, credits, tax, net: gross + reimbursements - pension - tax - deductions, iack: iackApplies ? iack(taxable) : 0 };
  }

  function rijkProfile(annualGrossExtra = 0) {
    const scale = Math.min(19, Math.max(1, Math.round(num('rijkScale'))));
    const step = Math.min(10, Math.max(0, Math.round(num('rijkStep'))));
    const hours = Math.min(RIJK.fulltimeHours, Math.max(1, num('rijkHours')));
    const factor = hours / RIJK.fulltimeHours;
    const salaryJulyFulltime = RIJK_SALARIES_JULY[scale][step];
    const salaryJanuaryFulltime = Math.round((salaryJulyFulltime / RIJK.julyIncrease) * 100) / 100;
    const ikbJanuaryFulltime = Math.max(salaryJanuaryFulltime * RIJK.ikbRate, RIJK.ikbFloorJanuary);
    const ikbJulyFulltime = Math.max(salaryJulyFulltime * RIJK.ikbRate, RIJK.ikbFloorJuly);
    const salaryAnnual = (salaryJanuaryFulltime * 6 + salaryJulyFulltime * 6) * factor;
    const ikbAnnual = (ikbJanuaryFulltime * 6 + ikbJulyFulltime * 6) * factor;
    const caoFulltime = scale <= 5 ? 1400 : scale <= 10 ? 1200 : 1000;
    const caoPayment = $('#rijkAugustEmployed').checked ? caoFulltime * factor : 0;
    const pensionableFulltime = 12 * (salaryJanuaryFulltime + ikbJanuaryFulltime) + num('rijkPensionExtras');
    const opnpBase = Math.max(0, Math.min(pensionableFulltime, RIJK.opnpMaximum) - RIJK.opnpFranchise) * factor;
    const aopBase = Math.max(0, pensionableFulltime - RIJK.aopFranchise) * factor;
    const opnpContribution = opnpBase * RIJK.opnpEmployeeRate;
    const aopContribution = aopBase * RIJK.aopEmployeeRate;
    const pensionAnnual = opnpContribution + aopContribution;
    const otherGross = num('annualBonus') + annualGrossExtra;

    return {
      scale, step, hours, factor,
      salaryJanuaryFulltime, salaryJulyFulltime,
      salaryJanuary: salaryJanuaryFulltime * factor,
      salaryJuly: salaryJulyFulltime * factor,
      salaryAnnual, ikbAnnual, caoPayment, otherGross,
      ikbJanuary: ikbJanuaryFulltime * factor,
      ikbJuly: ikbJulyFulltime * factor,
      ikbAverageMonthly: ikbAnnual / 12,
      pensionableFulltime, opnpContribution, aopContribution, pensionAnnual,
      grossAnnual: salaryAnnual + ikbAnnual + caoPayment + otherGross
    };
  }

  function isoWeek(date) {
    const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    utc.setUTCDate(utc.getUTCDate() + 4 - (utc.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
    return Math.ceil((((utc - yearStart) / 86400000) + 1) / 7);
  }

  const initialExtraWeek = Math.min(53, Math.max(1, isoWeek(new Date())));
  let extraHourRowCounter = 0;

  function addExtraHoursRow(week = initialExtraWeek, hours = 4, band = .25) {
    extraHourRowCounter += 1;
    const weekOptions = Array.from({ length: 53 }, (_, index) => {
      const value = index + 1;
      return `<option value="${value}"${value === Number(week) ? ' selected' : ''}>Week ${value}</option>`;
    }).join('');
    const row = document.createElement('div');
    row.className = 'extra-hours-row';
    row.dataset.rowId = String(extraHourRowCounter);
    row.innerHTML = `
      <label><span class="sr-only">Week</span><select class="extra-week" aria-label="Week">${weekOptions}</select></label>
      <label><span class="sr-only">Aantal extra uren</span><div class="suffix-input"><input class="extra-week-hours" type="number" min="0" max="40" step="0.25" value="${hours}" inputmode="decimal" aria-label="Aantal extra uren"><span>uur</span></div></label>
      <label class="overtime-only"><span class="sr-only">Moment van overwerk</span><select class="extra-week-band" aria-label="Moment van overwerk">
        <option value="0.25"${Number(band) === .25 ? ' selected' : ''}>Werkdag 06–22 · 25%</option>
        <option value="0.5"${Number(band) === .5 ? ' selected' : ''}>Nacht/weekend · 50%</option>
        <option value="1"${Number(band) === 1 ? ' selected' : ''}>Weekendnacht/feestdag · 100%</option>
      </select></label>
      <button class="remove-week-button" type="button" aria-label="Verwijder deze week">×</button>`;
    $('#extraHoursRows').append(row);
    syncExtraHoursRoute();
  }

  function readExtraHoursRows() {
    return $$('.extra-hours-row').map(row => ({
      week: Math.min(53, Math.max(1, Number($('.extra-week', row).value) || 1)),
      hours: Math.max(0, Number($('.extra-week-hours', row).value) || 0),
      rate: Number($('.extra-week-band', row).value) || .25
    })).filter(entry => entry.hours > 0);
  }

  function extraHoursProfile() {
    const enabled = $('#planExtraHours').checked;
    const route = $('#extraHoursRoute').value;
    const entries = readExtraHoursRows();
    const hours = entries.reduce((sum, entry) => sum + entry.hours, 0);
    const rijk = $('#isRijkEmployee').checked ? rijkProfile() : null;
    const salaryPeriod = $('#extraSalaryPeriod').value;
    const salaryFulltime = rijk ? (salaryPeriod === 'january' ? rijk.salaryJanuaryFulltime : rijk.salaryJulyFulltime) : 0;
    const hourlySalary = salaryFulltime / 156;
    const overtimeEligible = Boolean(rijk && rijk.scale <= 10);
    const timePaidOut = $('#overtimeTimePayout').value === 'cash';
    const paidMoreBase = hours * hourlySalary;
    const ikb = route === 'paid-more' ? paidMoreBase * RIJK.ikbRate : 0;
    const overtimePremium = route === 'overtime' && overtimeEligible
      ? entries.reduce((sum, entry) => sum + entry.hours * hourlySalary * entry.rate, 0)
      : 0;
    const overtimeBase = route === 'overtime' && overtimeEligible && timePaidOut ? hours * hourlySalary : 0;
    const grossCash = !enabled || !rijk ? 0 : route === 'paid-more'
      ? paidMoreBase + ikb
      : overtimeBase + overtimePremium;
    const leaveHours = enabled && route === 'overtime' && overtimeEligible && !timePaidOut ? hours : 0;
    const annualLimit = rijk ? 100 * rijk.factor : 0;
    const weekTotals = entries.reduce((totals, entry) => {
      totals[entry.week] = (totals[entry.week] || 0) + entry.hours;
      return totals;
    }, {});
    const weeksOverForty = rijk
      ? Object.entries(weekTotals).filter(([, weekHours]) => rijk.hours + weekHours > 40).map(([week]) => Number(week))
      : [];

    return {
      enabled, route, entries, hours, rijk, salaryPeriod, hourlySalary, paidMoreBase, ikb,
      overtimePremium, overtimeBase, overtimeEligible, timePaidOut, grossCash, leaveHours,
      annualLimit, weeksOverForty
    };
  }

  function careAllowance(income, partner, assets) {
    const assetLimit = partner ? LIMITS.careAssetsPartners : LIMITS.careAssetsSingle;
    if (assets > assetLimit) return 0;
    // Art. 2 Wzt, Regeling standaardpremie 2026 (€2.119) en het Besluit percentages
    // drempel- en toetsingsinkomen zorgtoeslag (1,912%/4,289% en 13,730%).
    const threshold = 29736;
    const standardPremium = 2119 * (partner ? 2 : 1);
    const basePercentage = partner ? .04289 : .01912;
    const normPremium = basePercentage * threshold + .13730 * Math.max(0, income - threshold);
    return Math.max(0, standardPremium - normPremium);
  }

  function childBudget(income, partner, assets, kids05, kids611, kids1215, kids1617) {
    const count = kids05 + kids611 + kids1215 + kids1617;
    if (!count) return 0;
    const assetLimit = partner ? LIMITS.careAssetsPartners : LIMITS.careAssetsSingle;
    if (assets > assetLimit) return 0;
    const base = count * 2580 + kids1215 * 724 + kids1617 * 964 + (!partner ? 3416 : 0);
    const threshold = partner ? 39141 : 29736;
    return Math.max(0, base - Math.max(0, income - threshold) * .076);
  }

  function childBenefit(kids05, kids611, kids1215, kids1617) {
    const avg05 = (295.07 * 2 + 298.40 * 2) / 4;
    const avg611 = (358.30 * 2 + 362.35 * 2) / 4;
    const avg1217 = (421.53 * 2 + 426.29 * 2) / 4;
    return 4 * (kids05 * avg05 + kids611 * avg611 + (kids1215 + kids1617) * avg1217);
  }

  function rentAllowance(income, partner, assets, rent, members, young, coResidentOverAsset) {
    if (!rent || coResidentOverAsset || assets > (partner ? LIMITS.rentAssetsPartners : LIMITS.rentAssetsSingle)) return 0;
    const multiPersonHousehold = members > 1;
    const incomeFloor = multiPersonHousehold ? 31500 : 23425;
    const minBase = multiPersonHousehold ? 200.71 : 202.52;
    const rentCap = young ? LIMITS.youngRentCap : LIMITS.rentCap;
    const eligibleRent = Math.min(rent, rentCap);
    const ownContribution = minBase;
    const aftopping = members >= 3 ? LIMITS.highRentCap : LIMITS.lowRentCap;
    const partA = Math.max(0, Math.min(eligibleRent, LIMITS.qualityRent) - ownContribution);
    const partB = Math.max(0, Math.min(eligibleRent, aftopping) - Math.max(LIMITS.qualityRent, ownContribution)) * .65;
    const partC = Math.max(0, eligibleRent - Math.max(aftopping, ownContribution)) * .40;
    const maximum = partA + partB + partC;
    const incomeReduction = Math.max(0, income - incomeFloor) * (multiPersonHousehold ? .22 : .27) / 12;
    return Math.max(0, (maximum - incomeReduction) * 12);
  }

  function kotPercent(income, nextChild) {
    const bracket = kotTable.find(row => income <= row[0]) || kotTable[kotTable.length - 1];
    return bracket[nextChild ? 2 : 1] / 100;
  }

  function childcare(income, enabled, type, children, hours, rate) {
    if (!enabled || !children || !hours) return { cost: 0, allowance: 0, own: 0 };
    const maxRates = { daycare: 11.23, bso: 9.98, host: 8.49 };
    const cappedHours = Math.min(230, hours);
    const actualCost = rate * cappedHours * children * 12;
    const eligiblePerChild = Math.min(rate, maxRates[type]) * cappedHours * 12;
    const allowance = eligiblePerChild * kotPercent(income, false) + eligiblePerChild * Math.max(0, children - 1) * kotPercent(income, true);
    return { cost: actualCost, allowance: Math.min(actualCost, allowance), own: Math.max(0, actualCost - allowance) };
  }

  function getData(annualGrossExtra = 0) {
    const partner = $('#hasPartner').checked;
    const isRijkEmployee = $('#isRijkEmployee').checked;
    const rijk = isRijkEmployee ? rijkProfile(annualGrossExtra) : null;
    const kids05 = num('kids05');
    const kids611 = num('kids611');
    const kids1215 = num('kids1215');
    const kids1617 = num('kids1617');
    const hasYoungChild = kids05 + kids611 > 0;
    const manualGrossAnnual = num('monthlyGross') * 12 * (1 + num('holidayRate') / 100) + num('annualBonus') + annualGrossExtra;
    const primaryTaxablePreview = (rijk ? rijk.grossAnnual : manualGrossAnnual) + num('taxableAddition') - (rijk ? rijk.pensionAnnual : num('pensionMonthly') * 12);
    const partnerTaxablePreview = partner ? num('partnerGross') * 12 * 1.08 - num('partnerPension') * 12 : 0;
    const iackEligible = $('#iackEligible').checked && hasYoungChild;
    const primaryGetsIack = iackEligible && (!partner || primaryTaxablePreview < partnerTaxablePreview);
    const partnerGetsIack = iackEligible && partner && partnerTaxablePreview <= primaryTaxablePreview;
    const primary = employeeNet(num('monthlyGross'), num('holidayRate'), num('annualBonus') + annualGrossExtra, num('pensionMonthly'), primaryGetsIack, {
      ...(rijk ? { annualGross: rijk.grossAnnual, annualPension: rijk.pensionAnnual } : {}),
      taxableAddition: num('taxableAddition'),
      netReimbursements: num('netReimbursements'),
      otherDeductions: num('otherDeductions'),
      aggregateIncomeExtra: num('otherAggregateIncome')
    });
    const partnerNet = partner ? employeeNet(num('partnerGross'), 8, 0, num('partnerPension'), partnerGetsIack) : { gross: 0, pension: 0, taxableAddition: 0, reimbursements: 0, deductions: 0, taxable: 0, tax: 0, credits: 0, net: 0, iack: 0 };
    const householdIncome = Math.max(0, primary.taxable + partnerNet.taxable + signed('incomeAdjustment'));
    const rentIncome = householdIncome + ($('#isRenter').checked ? num('coResidentIncome') : 0);
    const assets = num('assets');
    const care = careAllowance(householdIncome, partner, assets);
    const kgb = childBudget(householdIncome, partner, assets, kids05, kids611, kids1215, kids1617);
    const kb = childBenefit(kids05, kids611, kids1215, kids1617);
    const householdMembers = Math.max(num('householdMembers'), partner ? 2 : 1);
    const rent = $('#isRenter').checked ? rentAllowance(rentIncome, partner, assets, num('baseRent'), householdMembers, $('#youngRenter').checked, $('#coResidentOverAsset').checked) : 0;
    const childcareCalc = childcare(householdIncome, $('#hasChildcare').checked, $('#childcareType').value, num('childcareChildren'), num('childcareHours'), num('childcareRate'));
    const benefits = care + kgb + kb + rent + childcareCalc.allowance;
    const carePremium = num('carePremium') * 12 * (partner ? 2 : 1);
    const housingCost = $('#isRenter').checked ? num('baseRent') * 12 : 0;
    const netWage = primary.net + partnerNet.net;
    const selectedCosts = carePremium + housingCost + childcareCalc.cost;
    const netIncludingBenefits = netWage + benefits;
    const disposable = netIncludingBenefits - selectedCosts;
    return { partner, isRijkEmployee, rijk, primary, partnerNet, householdIncome, rentIncome, care, kgb, kb, rent, childcare: childcareCalc, benefits, carePremium, housingCost, selectedCosts, netWage, netIncludingBenefits, disposable, kids: kids05 + kids611 + kids1215 + kids1617 };
  }

  const MONTH_NAMES = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

  const roundTo = (value, decimals) => {
    const factor = 10 ** decimals;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  };
  const floorTo = (value, decimals) => {
    const factor = 10 ** decimals;
    return Math.floor((value + Number.EPSILON) * factor) / factor;
  };

  function payrollLabourCredit(annualWage) {
    if (annualWage >= 132920) return 0;
    const first = Math.min(roundTo(.08324 * annualWage, 5), 996);
    const throughSecond = Math.min(first + roundTo(.31009 * Math.max(0, annualWage - 11965), 5), 5300);
    const throughThird = Math.min(throughSecond + roundTo(.01950 * Math.max(0, annualWage - 25845), 5), 5685);
    const reduced = Math.max(0, throughThird - roundTo(.06510 * Math.max(0, annualWage - 45592), 5));
    return Math.ceil(reduced - 1e-9);
  }

  function payrollGeneralCredit(annualWage) {
    if (annualWage <= 29736) return 3115;
    if (annualWage > 78426) return 0;
    return Math.max(0, Math.ceil(3115 - (annualWage - 29736) * .06398 - 1e-9));
  }

  function payrollTaxBeforeCredits(annualWage) {
    let value;
    if (annualWage <= 38883) value = annualWage * .3575;
    else if (annualWage <= 78426) value = (annualWage - 38883) * .3756 + 13900;
    else value = (annualWage - 78426) * .495 + 28752;
    return Math.max(0, Math.floor(value + 1e-9));
  }

  function payrollAnnualTableAmount(annualWage, applyTaxCredit) {
    const before = payrollTaxBeforeCredits(annualWage);
    const credits = applyTaxCredit ? payrollGeneralCredit(annualWage) + payrollLabourCredit(annualWage) : 0;
    return Math.max(0, Math.floor(before - Math.min(before, credits) + 1e-9));
  }

  // Witte maandtabel Nederland, standaardsituatie, jonger dan de AOW-leeftijd.
  function monthlyPayrollWithholding(taxableMonthlyWage, applyTaxCredit) {
    if (taxableMonthlyWage <= 0) return 0;
    const annualized = roundTo(taxableMonthlyWage * 12, 5);
    if (annualized <= 133110) {
      const tableAnnualWage = Math.floor(annualized / 54) * 54;
      return roundTo(payrollAnnualTableAmount(tableAnnualWage, applyTaxCredit) / 12, 2);
    }
    const atMaximum = roundTo(payrollAnnualTableAmount(133110, applyTaxCredit) / 12, 2);
    const aboveMaximum = floorTo((taxableMonthlyWage - 133110 / 12) * .495, 2);
    return roundTo(atMaximum + aboveMaximum, 2);
  }

  // Officiële witte tabel bijzondere beloningen 2026, Nederland, standaardsituatie.
  function specialRewardRate(annualWage, applyTaxCredit) {
    const rows = [
      [0, .3575, 0],
      [11358, .3575, -.0832],
      [12923, .3575, -.3101],
      [23931, .3575, -.0195],
      [29737, .3575, .0445],
      [38884, .3756, .0445],
      [45593, .3756, .1291],
      [78427, .4950, .0651],
      [143555, .4950, 0]
    ];
    const row = [...rows].reverse().find(([lower]) => annualWage >= lower) || rows[0];
    if (!applyTaxCredit) return row[1];
    if (annualWage < 11358) return 0;
    return Math.max(0, row[1] + row[2]);
  }

  function payrollProfile(data, extra) {
    if (!data.rijk) return null;
    const rijk = data.rijk;
    const selectedMonth = Math.min(12, Math.max(1, Math.round(num('payrollMonth'))));
    const ikbMonthly = $('#ikbPayoutMode').value === 'monthly';
    const ikbPayoutMonth = Math.min(12, Math.max(1, Math.round(num('ikbPayoutMonth'))));
    const extraPayoutMonth = Math.min(12, Math.max(1, Math.round(num('extraPayoutMonth'))));
    const bonusPayoutMonth = Math.min(12, Math.max(1, Math.round(num('bonusPayoutMonth'))));
    const applyTaxCredit = $('#payrollTaxCredit').checked;
    const pensionMonthly = rijk.pensionAnnual / 12;
    const taxableAdditionMonthly = num('taxableAddition') / 12;
    const autoAnnualWage = Math.max(0, rijk.salaryAnnual + rijk.ikbAnnual - rijk.pensionAnnual + num('taxableAddition'));
    const annualWage = $('#autoSpecialAnnualWage').checked ? autoAnnualWage : num('specialAnnualWage');
    const rate = specialRewardRate(annualWage, applyTaxCredit);
    const specialByMonth = Array.from({ length: 12 }, () => []);

    if (!ikbMonthly) specialByMonth[ikbPayoutMonth - 1].push(['IKB-uitbetaling', rijk.ikbAnnual]);
    if (rijk.caoPayment) specialByMonth[7].push(['Eenmalige cao-uitkering', rijk.caoPayment]);
    if (num('annualBonus')) specialByMonth[bonusPayoutMonth - 1].push(['Overige bruto toelagen', num('annualBonus')]);
    if (extra.grossCash) specialByMonth[extraPayoutMonth - 1].push(['Uitbetaling extra uren', extra.grossCash]);

    const monthResult = month => {
      const firstHalf = month <= 6;
      const salary = firstHalf ? rijk.salaryJanuary : rijk.salaryJuly;
      const monthlyIkb = ikbMonthly ? (firstHalf ? rijk.ikbJanuary : rijk.ikbJuly) : 0;
      const regularGross = salary + monthlyIkb;
      const fiscalRegular = Math.max(0, regularGross + taxableAdditionMonthly - pensionMonthly);
      const regularWithholding = monthlyPayrollWithholding(fiscalRegular, applyTaxCredit);
      const specialItems = specialByMonth[month - 1];
      const specialGross = specialItems.reduce((sum, [, amount]) => sum + amount, 0);
      const specialWithholding = floorTo(specialGross * rate, 2);
      const bankNet = regularGross + specialGross + num('netReimbursements') - pensionMonthly - regularWithholding - specialWithholding - num('otherDeductions');
      return { month, salary, monthlyIkb, regularGross, fiscalRegular, regularWithholding, specialItems, specialGross, specialWithholding, bankNet };
    };

    const selected = monthResult(selectedMonth);
    const year = Array.from({ length: 12 }, (_, index) => monthResult(index + 1));
    const annualWithholding = year.reduce((sum, month) => sum + month.regularWithholding + month.specialWithholding, 0);
    const settlement = annualWithholding - data.primary.tax;
    return { selectedMonth, ikbMonthly, applyTaxCredit, pensionMonthly, taxableAdditionMonthly, autoAnnualWage, annualWage, rate, selected, year, annualWithholding, settlement };
  }

  function renderPayroll(data, extra) {
    const payroll = payrollProfile(data, extra);
    window.latestPayroll = payroll;
    $('#payrollResultCard').hidden = !payroll;
    if (!payroll) return;
    const month = payroll.selected;
    $('#payrollMonthLabel').textContent = `${MONTH_NAMES[payroll.selectedMonth - 1]} 2026`;
    $('#payrollBankNet').textContent = euroPrecise.format(month.bankNet);
    $('#payrollSpecialRate').textContent = `${(payroll.rate * 100).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
    $('#payrollRegularGross').textContent = euroPrecise.format(month.regularGross);
    $('#payrollSpecialGross').textContent = euroPrecise.format(month.specialGross);
    $('#payrollWithholding').textContent = euroPrecise.format(month.regularWithholding + month.specialWithholding);

    const specialRows = month.specialItems.length
      ? month.specialItems.map(([label, amount]) => breakdownRow(label, amount, 'incidenteel loon; tabel bijzondere beloningen', 'positive'))
      : [breakdownRow('Incidentele betalingen', 0, 'geen in deze gekozen maand')];
    $('#payrollBreakdown').innerHTML = [
      breakdownRow('Salaris', month.salary, 'bruto vast loon', 'positive'),
      ...(month.monthlyIkb ? [breakdownRow('Maandelijks IKB', month.monthlyIkb, 'via de witte maandtabel', 'positive')] : []),
      ...specialRows,
      breakdownRow('ABP OP/NP en AOP', -payroll.pensionMonthly, 'werknemersdeel; verlaagt het fiscale loon', 'negative'),
      ...(payroll.taxableAdditionMonthly ? [breakdownRow('Fiscale bijtelling', payroll.taxableAdditionMonthly, 'wel fiscaal loon, geen bankbetaling')] : []),
      breakdownRow('Fiscaal tijdvakloon', month.fiscalRegular, 'grondslag witte maandtabel'),
      breakdownRow('Loonheffing maandtabel', -month.regularWithholding, `${payroll.applyTaxCredit ? 'met' : 'zonder'} loonheffingskorting; 1e schijf incl. AOW/Anw/Wlz`, 'negative'),
      ...(month.specialGross ? [breakdownRow('Loonheffing bijzonder tarief', -month.specialWithholding, `${(payroll.rate * 100).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% bij jaarloon ${euro.format(payroll.annualWage)}`, 'negative')] : []),
      breakdownRow('WW, WIA, ZW en werkgeversheffing Zvw', 0, 'werkgeverslasten; niet van jouw nettoloon'),
      ...(num('netReimbursements') ? [breakdownRow('Netto vergoedingen', num('netReimbursements'), 'onbelast uitbetaald', 'positive')] : []),
      ...(num('otherDeductions') ? [breakdownRow('Overige inhoudingen', -num('otherDeductions'), 'door jou ingevoerd', 'negative')] : []),
      breakdownRow('Verwacht op je rekening', month.bankNet, 'bruto cash minus werknemersinhoudingen', 'total')
    ].join('');

    const settlement = payroll.settlement;
    $('#annualSettlement').textContent = settlement >= 0 ? `terug ${euroPrecise.format(settlement)}` : `bijbetalen ${euroPrecise.format(Math.abs(settlement))}`;
    $('#annualSettlement').className = settlement >= 0 ? 'refund' : 'payment';
    $('#annualSettlementText').textContent = `Ingehouden in 2026: ${euroPrecise.format(payroll.annualWithholding)} · berekende definitieve jaarheffing: ${euroPrecise.format(data.primary.tax)}. ${$('#autoSpecialAnnualWage').checked ? 'Het bijzondere jaarloon is geschat; neem voor de beste loonstrookmatch het bedrag van P-Direkt over.' : 'Het door jou ingevoerde bijzondere jaarloon is gebruikt.'}`;
  }

  function row(label, amount, max, type = '') {
    const width = Math.max(2, Math.min(100, Math.abs(amount) / max * 100));
    const sign = amount > 0 && type === 'positive' ? '+' : amount < 0 ? '−' : '';
    return `<div class="flow-row ${type}"><span>${label}</span><span class="flow-track"><i style="width:${width}%"></i></span><strong>${sign}${euro.format(Math.abs(amount))}</strong></div>`;
  }

  function breakdownRow(label, amount, note = '', type = '') {
    const sign = amount > 0 && type === 'positive' ? '+' : amount < 0 ? '−' : '';
    return `<div class="breakdown-row ${type}"><div><span>${label}</span>${note ? `<small>${note}</small>` : ''}</div><strong>${sign}${euroPrecise.format(Math.abs(amount))}</strong></div>`;
  }

  function renderExtraHours(baseline, withExtra, extra) {
    const active = extra.enabled && extra.hours > 0;
    $('#extraHoursTotal').textContent = oneDecimal.format(extra.hours);
    $('#extraHoursEmpty').hidden = active;
    $('#extraHoursResult').hidden = !active;
    $('#extraHoursResultBadge').textContent = active
      ? `${oneDecimal.format(extra.hours)} uur · ${extra.route === 'paid-more' ? '§ 9.2' : '§ 7.7'}`
      : 'nog niet gepland';

    const validation = [];
    if (extra.enabled && !extra.rijk) validation.push('De planner gebruikt de CAO Rijk en is alleen beschikbaar als “Belastingdienst / CAO Rijk” aanstaat.');
    if (extra.enabled && extra.rijk && extra.route === 'paid-more' && extra.hours > extra.annualLimit) {
      validation.push(`Je plant ${oneDecimal.format(extra.hours)} uur. De cao-uitleg noemt voor jouw arbeidsduur een jaarmaximum van ${oneDecimal.format(extra.annualLimit)} uur.`);
    }
    if (extra.enabled && extra.route === 'paid-more' && extra.weeksOverForty.length) {
      validation.push(`In week ${extra.weeksOverForty.join(', ')} komt contracttijd plus planning boven 40 uur. De cao begrenst betaald meerwerk op gemiddeld 40 uur; controleer dit met je leidinggevende.`);
    }
    if (extra.enabled && extra.route === 'overtime' && !extra.overtimeEligible) {
      validation.push(`Schaal ${extra.rijk ? extra.rijk.scale : '—'} valt niet onder het standaardrecht op overwerkvergoeding van CAO Rijk § 7.7 (maximaal schaal 10). Een lokale afspraak kan afwijken.`);
    }
    $('#extraHoursValidation').innerHTML = validation.map(message => `<p>${message}</p>`).join('');
    $('#extraHoursValidation').classList.toggle('has-warning', validation.length > 0);
    if (!active) return;

    const taxBeforeDelta = withExtra.primary.taxBefore - baseline.primary.taxBefore;
    const creditsDelta = withExtra.primary.credits - baseline.primary.credits;
    const benefitDelta = withExtra.benefits - baseline.benefits;
    const netWageDelta = withExtra.netWage - baseline.netWage;
    const netEffect = withExtra.disposable - baseline.disposable;
    const perHour = extra.hours ? netEffect / extra.hours : 0;
    const retention = extra.grossCash ? netEffect / extra.grossCash * 100 : 0;
    const ringPercent = Math.max(0, Math.min(100, retention));

    $('#extraHoursNet').textContent = euroPrecise.format(netEffect);
    $('#extraHoursPerHour').textContent = `${euroPrecise.format(perHour)} per gewerkt uur`;
    $('#extraRetentionPercent').textContent = `${oneDecimal.format(retention)}%`;
    $('#extraRetentionRing').style.setProperty('--retention', `${ringPercent * 3.6}deg`);
    $('#extraResultHours').textContent = `${oneDecimal.format(extra.hours)} uur`;
    $('#extraResultGross').textContent = euroPrecise.format(extra.grossCash);
    $('#extraResultAnnualIncome').textContent = euro.format(withExtra.primary.taxable);
    $('#extraTimeLabel').textContent = extra.route === 'overtime' && !extra.timePaidOut ? 'Compensatieverlof' : 'Uurwaarde bruto';
    $('#extraTimeValue').textContent = extra.route === 'overtime' && !extra.timePaidOut
      ? `${oneDecimal.format(extra.leaveHours)} uur`
      : euroPrecise.format(extra.hourlySalary);

    $('#extraResultNote').innerHTML = extra.grossCash > 0
      ? `<strong>Onder aan de streep:</strong> je gecorrigeerde jaarbeeld stijgt met ${euroPrecise.format(netEffect)}. ${benefitDelta < -.01 ? `Daarin zit ${euroPrecise.format(Math.abs(benefitDelta))} minder aan regelingen.` : 'In dit scenario dalen je regelingen niet.'}`
      : '<strong>Geen standaard geldvergoeding berekend.</strong> Controleer of voor jou een afwijkende afspraak in het personeelsreglement geldt.';

    const grossRows = extra.route === 'paid-more'
      ? [
          breakdownRow('Salaris voor extra uren', extra.paidMoreBase, `${oneDecimal.format(extra.hours)} × ${euroPrecise.format(extra.hourlySalary)}`, 'positive'),
          breakdownRow('IKB over extra uren', extra.ikb, '16,50% volgens CAO Rijk § 9.2', 'positive')
        ]
      : [
          ...(extra.timePaidOut ? [breakdownRow('Uitbetaling compensatie-uren', extra.overtimeBase, '100% salaris per uur', 'positive')] : []),
          breakdownRow('Overwerkvergoeding in geld', extra.overtimePremium, '25%, 50% of 100% per gepland moment', 'positive'),
          ...(!extra.timePaidOut ? [breakdownRow('Waarde verlofuren', 0, `${oneDecimal.format(extra.leaveHours)} uur tijd; niet als geld opgeteld`)] : [])
        ];
    $('#extraBreakdown').innerHTML = [
      ...grossRows,
      breakdownRow('Belasting vóór kortingen', -taxBeforeDelta, 'marginale box-1-heffing', 'negative'),
      breakdownRow('Verandering heffingskortingen', creditsDelta, creditsDelta < 0 ? 'minder korting door hoger jaarinkomen' : 'extra korting', creditsDelta >= 0 ? 'positive' : 'negative'),
      breakdownRow('Netto loon na jaarbelasting', netWageDelta, 'na belasting; geen extra ABP-inhouding in 2026', 'positive'),
      breakdownRow('Verandering toeslagen en regelingen', benefitDelta, 'zorg, huur, kindgebonden budget en opvang samen', benefitDelta >= 0 ? 'positive' : 'negative'),
      breakdownRow('Netto over van extra uren', netEffect, `effectief ${euroPrecise.format(perHour)} per uur`, 'total')
    ].join('');

    $('#extraPensionExplanation').innerHTML = extra.route === 'overtime'
      ? `<p><strong>Extra ABP-inhouding in deze 2026-berekening: ${euroPrecise.format(0)}.</strong> Het ABP-pensioengevend inkomen voor 2026 is in beginsel op 1 januari vastgesteld. Het ABP-reglement sluit een vergoeding voor variabel overwerk bovendien uit, tenzij in jouw arbeidsrelatie uitdrukkelijk is vastgelegd dat deze wel meetelt.</p><p>De geldvergoeding verhoogt dus wel je fiscale jaarloon en kan toeslagen verlagen, maar levert in het standaardgeval geen extra pensioenopbouw op. Compensatieverlof is tijd en geen extra uitbetaling.</p>`
      : `<p><strong>Extra ABP-inhouding in deze 2026-berekening: ${euroPrecise.format(0)}.</strong> Je contractomvang blijft bij betaald meer uren werken gelijk. Onder de ABP-peildatumsystematiek is het pensioengevend inkomen voor 2026 in beginsel op 1 januari vastgesteld.</p><p>De openbare CAO-tekst van § 9.2 noemt salaris per uur plus 16,50% IKB, maar kwalificeert deze betaling niet afzonderlijk als pensioengevend. Controleer daarom op je loonstrook of werkgever of dit als pensioengevend variabel inkomen wordt aangeleverd; een eventuele werking ligt niet als extra premie in deze 2026-afrekening.</p>`;

    $('#extraWeekSummary').innerHTML = extra.entries.map(entry => {
      const rate = extra.route === 'paid-more' ? 1 + RIJK.ikbRate : extra.overtimeEligible ? (extra.timePaidOut ? 1 : 0) + entry.rate : 0;
      const gross = entry.hours * extra.hourlySalary * rate;
      const moment = extra.route === 'paid-more' ? 'salaris + 16,50% IKB' : `${Math.round(entry.rate * 100)}% geldvergoeding${extra.timePaidOut ? ' + uur uitbetaald' : ' + uur verlof'}`;
      return `<div><span>Week ${entry.week}<small>${oneDecimal.format(entry.hours)} uur · ${moment}</small></span><strong>${euroPrecise.format(gross)}</strong></div>`;
    }).join('');
  }

  function render() {
    const extraHours = extraHoursProfile();
    const baseline = getData();
    const d = getData(extraHours.grossCash);
    const month = value => value / 12;
    if (d.rijk) {
      $('#rijkSalaryPreview').textContent = `${euroPrecise.format(d.rijk.salaryJuly)}/mnd`;
      $('#rijkIkbPreview').textContent = `${euroPrecise.format(d.rijk.ikbAverageMonthly)}/mnd`;
      $('#rijkPensionPreview').textContent = `${euroPrecise.format(month(d.rijk.pensionAnnual))}/mnd`;
      $('#rijkCaoPreview').textContent = euro.format(d.rijk.caoPayment);
    }
    $('#disposableMonthly').textContent = euro.format(month(d.disposable));
    $('#netWageMonthly').textContent = euro.format(month(d.netWage));
    $('#benefitsMonthly').textContent = euro.format(month(d.care + d.kgb + d.kb + d.rent + d.childcare.allowance));
    $('#selectedCostsMonthly').textContent = d.selectedCosts ? `−${euro.format(month(d.selectedCosts))}` : euro.format(0);
    $('#annualDisposable').textContent = `${euro.format(d.disposable)} per jaar`;
    $('#resultSummary').textContent = `${d.rijk ? `schaal ${d.rijk.scale}, trede ${d.rijk.step}, ${d.rijk.hours} uur — ` : ''}na belasting, pensioen, ${d.partner ? '2 zorgpremies' : 'zorgpremie'}${d.housingCost ? ', huur' : ''}${d.childcare.cost ? ' en opvang' : ''}`;

    renderPayroll(d, extraHours);

    const grossMonth = month(d.primary.gross + d.partnerNet.gross);
    const max = Math.max(grossMonth, 1);
    const otherGrossWithoutExtraHours = d.rijk ? Math.max(0, d.rijk.otherGross - extraHours.grossCash) : 0;
    const grossRows = d.rijk ? [
      row(d.partner ? 'Salaris huishouden' : 'CAO-salaris', month(d.rijk.salaryAnnual + d.partnerNet.gross), max),
      row('IKB', month(d.rijk.ikbAnnual), max, 'positive'),
      ...(d.rijk.caoPayment ? [row('CAO-uitkering 2026', month(d.rijk.caoPayment), max, 'positive')] : []),
      ...(otherGrossWithoutExtraHours ? [row('Overige toelagen', month(otherGrossWithoutExtraHours), max, 'positive')] : []),
      ...(extraHours.grossCash ? [row('Uitbetaling extra uren', month(extraHours.grossCash), max, 'positive')] : [])
    ] : [row('Bruto loon', grossMonth, max)];
    $('#flowRows').innerHTML = [
      ...grossRows,
      ...(d.primary.reimbursements ? [row('Netto vergoedingen', month(d.primary.reimbursements), max, 'positive')] : []),
      row('Belasting', -month(d.primary.tax + d.partnerNet.tax), max, 'negative'),
      row('Pensioen', -month(d.primary.pension + d.partnerNet.pension), max, 'negative'),
      ...(d.primary.deductions ? [row('Overige inhoudingen', -month(d.primary.deductions), max, 'negative')] : []),
      row('Zorgpremie', -month(d.carePremium), max, 'negative'),
      row('Regelingen', month(d.care + d.kgb + d.kb + d.rent), max, 'positive'),
      ...(d.housingCost ? [row('Kale huur', -month(d.housingCost), max, 'negative')] : []),
      ...(d.childcare.cost ? [row('Opvangkosten', -month(d.childcare.cost), max, 'negative')] : []),
      ...(d.childcare.allowance ? [row('Opvangtoeslag', month(d.childcare.allowance), max, 'positive')] : [])
    ].join('');

    renderExtraHours(baseline, d, extraHours);

    const extra = getData(extraHours.grossCash + 100);
    const kept = Math.max(-50, Math.min(100, extra.disposable - d.disposable));
    $('#extraKeeps').textContent = euroPrecise.format(kept);
    $('#pressureMeter').style.width = `${Math.max(0, Math.min(100, kept))}%`;
    $('#pressureText').textContent = kept >= 0
      ? `${euroPrecise.format(100 - kept)} gaat naar belasting, premies of lagere toeslagen.`
      : `Let op: door afbouw of een grens daalt het besteedbaar inkomen in deze schatting.`;

    const allowances = [
      ['Zorgtoeslag', d.care], ['Huurtoeslag', d.rent], ['Kindgebonden budget', d.kgb],
      ['Kinderbijslag', d.kb], ['Kinderopvangtoeslag', d.childcare.allowance],
      ['Combinatiekorting', d.primary.iack + d.partnerNet.iack]
    ];
    $('#allowanceList').innerHTML = allowances.map(([label, value]) =>
      `<li class="${value ? '' : 'off'}"><span>${label}</span><span>${value ? euro.format(month(value)) + '/mnd' : 'niet van toepassing'}</span></li>`
    ).join('');
    window.latestCalculation = d;
  }

  function syncConditional() {
    const isRijkEmployee = $('#isRijkEmployee').checked;
    $('#rijkFields').hidden = !isRijkEmployee;
    $('#manualIncomeFields').hidden = isRijkEmployee;
    $('#extraHoursFields').hidden = !$('#planExtraHours').checked;
    $('#partnerFields').hidden = !$('#hasPartner').checked;
    $('#rentFields').hidden = !$('#isRenter').checked;
    $('#childcareFields').hidden = !$('#hasChildcare').checked;
    $('#ikbPayoutMonthField').hidden = $('#ikbPayoutMode').value !== 'lump';
    $('#specialAnnualWageField').hidden = $('#autoSpecialAnnualWage').checked;
    syncExtraHoursRoute();
  }

  function syncExtraHoursRoute() {
    const overtime = $('#extraHoursRoute').value === 'overtime';
    $$('.overtime-only').forEach(element => { element.hidden = !overtime; });
    $('#extraRouteExplainer').innerHTML = overtime
      ? '<strong>Overwerk op verzoek</strong><p>Je krijgt normaal hetzelfde aantal uren als verlof én 25%, 50% of 100% van je salaris per uur in geld. Alleen als je werkgever de verlofuren laat uitbetalen, komt daar 100% uurloon bij. Het standaardrecht geldt tot en met schaal 10.</p>'
      : '<strong>Vooraf betaald meer werken</strong><p>Je vraagt vooraf toestemming. Ieder uur wordt uitbetaald tegen je salaris per uur plus 16,50% IKB. Je contracturen veranderen niet.</p>';
  }

  function applyScenario(name) {
    const values = scenarios[name];
    Object.entries(values).forEach(([key, value]) => {
      const el = $(`#${key}`);
      if (!el) return;
      if (el.type === 'checkbox') el.checked = Boolean(value);
      else el.value = value;
    });
    syncConditional();
    render();
  }

  $$('.section-toggle').forEach(button => button.addEventListener('click', () => {
    const body = button.closest('.form-section').querySelector('.section-body');
    const willOpen = body.hidden;
    body.hidden = !willOpen;
    button.setAttribute('aria-expanded', String(willOpen));
    button.lastElementChild.textContent = willOpen ? '−' : '+';
  }));

  $('#incomeForm').addEventListener('input', () => { syncConditional(); render(); });
  $('#incomeForm').addEventListener('change', () => { syncConditional(); render(); });
  $('#addExtraWeek').addEventListener('click', () => {
    const entries = readExtraHoursRows();
    const nextWeek = entries.length ? Math.min(53, entries[entries.length - 1].week + 1) : initialExtraWeek;
    addExtraHoursRow(nextWeek, 4, .25);
    render();
  });
  $('#extraHoursRows').addEventListener('click', event => {
    const button = event.target.closest('.remove-week-button');
    if (!button) return;
    button.closest('.extra-hours-row').remove();
    if (!$('.extra-hours-row')) addExtraHoursRow(initialExtraWeek, 4, .25);
    render();
  });
  $$('.scenario-row button').forEach(button => button.addEventListener('click', () => applyScenario(button.dataset.scenario)));
  $('#resetButton').addEventListener('click', () => {
    $('#incomeForm').reset();
    $('#extraHoursRows').replaceChildren();
    addExtraHoursRow(initialExtraWeek, 4, .25);
    syncConditional();
    render();
  });

  const methodHtml = `
    <h2>Zo rekenen we</h2>
    <p>De tool toont twee verschillende uitkomsten: de verwachte bankbetaling op één P-Direkt-loonstrook en de definitieve jaaruitkomst. Het moment waarop je IKB of extra uren laat uitbetalen verandert de inhouding op de loonstrook, maar niet vanzelf de uiteindelijke jaarheffing.</p>
    <h3>CAO Rijk, IKB en cao-uitkering</h3>
    <p>Het salaris volgt schaal en salarisnummer uit § 6.3 CAO Rijk. Voor januari tot en met juni geldt de oude tabel; vanaf juli geldt de 2,7% hogere tabel. Het IKB is 16,50% met het naar arbeidsduur herleide minimum van €440 respectievelijk €452 per maand. Wie op 1 augustus in dienst is krijgt de eenmalige cao-uitkering naar schaal en arbeidsduur; die uitkering is niet pensioengevend.</p>
    <h3>ABP-werknemerspremie</h3>
    <p>De reguliere eigen bijdrage bestaat uit 8,13% OP/NP over het pensioengevend inkomen minus €19.200 en 0,21% AOP voor sector Rijk boven €29.700. De deeltijdfactor is uren gedeeld door 36. Voor OP/NP geldt het fiscale maximum van €137.800. De berekening gebruikt het pensioengevend inkomen op 1 januari 2026.</p>
    <h3>Betaald meer werken en overwerk</h3>
    <p>De planner houdt twee CAO-routes uit elkaar. Bij betaald meer uren werken volgens § 9.2 is ieder vooraf afgesproken uur de waarde van het salaris per uur plus 16,50% IKB. Bij overwerk volgens § 7.7 krijgt een werknemer tot en met schaal 10 normaal hetzelfde aantal uren als verlof en daarnaast een geldvergoeding van 25%, 50% of 100% van het salaris per uur. Alleen als de werkgever het verlof wegens de bedrijfsvoering uitbetaalt, telt de calculator ook 100% salaris per uur als geld mee.</p>
    <p>Het salaris per uur is 1/156 van het voltijdmaandsalaris. Voor betaald meer werken signaleert de planner het naar arbeidsduur herleide maximum van 100 uur en weken waarin contracttijd plus planning boven 40 uur komt. Dit zijn signalen; toestemming en de beoordeling van de gemiddelde werktijd blijven bij werkgever en werknemer.</p>
    <h3>P-Direkt-loonstrook en loonheffing</h3>
    <p>Het vaste fiscale maandloon gaat door de witte maandtabel 2026 voor een werknemer jonger dan de AOW-leeftijd die in Nederland woont en volledig verzekerd is. De officiële rekenregels ronden het omgerekende jaarloon tot en met €133.110 naar beneden af in stappen van €54; dat zijn stappen van €4,50 in de maandtabel. De loonheffingskorting is optioneel.</p>
    <p>Een jaarlijkse IKB-uitbetaling, de cao-uitkering, overige incidentele toelagen en uitbetaalde extra uren lopen via de witte tabel bijzondere beloningen. Het tarief volgt het fiscale jaarloon van het vorige jaar. Bij maandelijkse IKB-uitbetaling gebruikt P-Direkt juist de maandtabel. De getoonde jaarcorrectie vergelijkt alle berekende inhoudingen met de box-1-heffing na heffingskortingen.</p>
    <h3>Welke premies gaan van jouw netto af?</h3>
    <p>De premies AOW, Anw en Wlz zitten al in het tarief van de eerste schijf. Het werknemersdeel ABP OP/NP en AOP staat apart als inhouding en verlaagt het fiscale loon. Premies werknemersverzekeringen (WW, WIA en ZW) en de werkgeversheffing Zvw zijn in de standaardsituatie werkgeverslasten en worden daarom niet nogmaals van jouw nettoloon afgetrokken. Een individuele Whk-verhaalsbijdrage of andere loonstrookinhouding kun je onder ‘overige looninhoudingen’ invoeren.</p>
    <h3>Definitieve belasting en netto loon</h3>
    <p>Het belastbare loon wordt verminderd met de werknemerspremie voor pensioen en verhoogd met een eventuele fiscale bijtelling. Daarna passen we de box-1-tarieven 2026, algemene heffingskorting, arbeidskorting en — indien van toepassing — inkomensafhankelijke combinatiekorting toe. Overig verzamelinkomen verlaagt de algemene heffingskorting, maar de belasting over box 2 of box 3 zelf wordt niet berekend.</p>
    <h3>Pensioen over extra uren</h3>
    <p>De planner rekent in 2026 geen extra ABP-premie over de ingeplande betaling. Het pensioengevend inkomen voor 2026 is in beginsel op 1 januari vastgesteld. Bovendien sluit het ABP-reglement een vergoeding voor variabel overwerk uit, tenzij in de arbeidsrelatie is vastgelegd dat die wel meetelt. Voor betaald meer uren werken is de openbare CAO-tekst niet voldoende om voor iedere loonadministratie zelfstandig pensioengevendheid vast te stellen; controle van de loonstrook of werkgever blijft daarom nodig.</p>
    <h3>Huishoudregelingen</h3>
    <p>Voor zorgtoeslag, huurtoeslag, kindgebonden budget en kinderopvangtoeslag telt het gezamenlijke toetsingsinkomen. De afzonderlijke correctie maakt het mogelijk verschillen met het fiscale loon te verwerken. Alleen bij de huurtoeslag wordt daarnaast het ingevulde meetellende inkomen van medebewoners toegevoegd.</p>
    <h3>Bewuste grenzen</h3>
    <p>De huurtoeslag volgt de lineaire formule uit artikel 21 Wht: maximaal recht minus 27% (eenpersoon) of 22% (meerpersoon) van het inkomen boven het minimum-inkomensijkpunt. De kinderopvangtoeslag volgt per inkomensklasse de tabel in bijlage I bij het Besluit kinderopvangtoeslag. Bijzondere rechtsregels en uitzonderingen blijven buiten deze publieksroute.</p>`;

  const sourcesHtml = `
    <h2>Juridische grondslag 2026</h2>
    <p>Primaire wetgeving is het uitgangspunt. Gedelegeerde regelgeving en officiële bekendmakingen leveren de voor 2026 geldende bedragen en tabellen. Laatst inhoudelijk gecontroleerd: 16 oktober 2026.</p>
    <h3>Wetten</h3>
    <ul>
      <li><a href="https://wetten.overheid.nl/BWBR0011353/2026-01-01" target="_blank" rel="noreferrer">Wet inkomstenbelasting 2001</a> — box 1 en heffingskortingen</li>
      <li><a href="https://wetten.overheid.nl/BWBR0002471/2026-01-01" target="_blank" rel="noreferrer">Wet op de loonbelasting 1964</a> — loonheffing en tabellen</li>
      <li><a href="https://wetten.overheid.nl/BWBR0018472/2026-01-01" target="_blank" rel="noreferrer">Algemene wet inkomensafhankelijke regelingen</a> — partner, toetsingsinkomen en vermogen</li>
      <li><a href="https://wetten.overheid.nl/BWBR0018451/2026-01-01" target="_blank" rel="noreferrer">Wet op de zorgtoeslag</a></li>
      <li><a href="https://wetten.overheid.nl/BWBR0008659/2026-01-01" target="_blank" rel="noreferrer">Wet op de huurtoeslag</a></li>
      <li><a href="https://wetten.overheid.nl/BWBR0017017/2026-01-01" target="_blank" rel="noreferrer">Wet kinderopvang</a></li>
      <li><a href="https://wetten.overheid.nl/BWBR0022751/2026-01-01" target="_blank" rel="noreferrer">Wet op het kindgebonden budget</a></li>
      <li><a href="https://wetten.overheid.nl/BWBR0002368/2026-01-01" target="_blank" rel="noreferrer">Algemene Kinderbijslagwet</a></li>
    </ul>
    <h3>Uitwerking en 2026-bedragen</h3>
    <ul>
      <li><a href="https://www.caorijk.nl/cao-rijk/1.-algemeen/hoofdstuk-6/6-3-de-salarisschalen-en-maandbedragen-per-1-juli-2026" target="_blank" rel="noreferrer">CAO Rijk § 6.3 — salarisschalen per 1 juli 2026</a></li>
      <li><a href="https://www.caorijk.nl/cao-rijk/1.-algemeen/hoofdstuk-9/individueel-keuzebudget" target="_blank" rel="noreferrer">CAO Rijk § 9.1 — Individueel Keuzebudget</a></li>
      <li><a href="https://www.caorijk.nl/cao-rijk/1.-algemeen/hoofdstuk-9/betaald-meer-uren-werken-met-gelijkblijvende-arbeidsduur" target="_blank" rel="noreferrer">CAO Rijk § 9.2 — Betaald meer uren werken</a></li>
      <li><a href="https://www.caorijk.nl/cao-rijk/1.-algemeen/hoofdstuk-7/overwerkvergoeding" target="_blank" rel="noreferrer">CAO Rijk § 7.7 — Overwerkvergoeding</a></li>
      <li><a href="https://www.caorijk.nl/site/binaries/site-content/collections/documents/2026/04/30/onderhandelingsresultaat-cao-rijk-2026/onderhandelingsresultaat-cao-rijk-2026-van-30-april-2026.pdf" target="_blank" rel="noreferrer">CAO Rijk 2026 — loonstijging en eenmalige uitkering</a></li>
      <li><a href="https://www.abp.nl/content/dam/abp/documenten/formulieren-tabellen/premietabel-2026.pdf" target="_blank" rel="noreferrer">ABP Premietabel 2026 — percentages en franchises</a></li>
      <li><a href="https://www.abp.nl/content/dam/abp/documenten/juridisch/pensioenreglement-burgers-2026.pdf" target="_blank" rel="noreferrer">Pensioenreglement ABP voor burgers 2026</a></li>
      <li><a href="https://download.belastingdienst.nl/belastingdienst/docs/rekenvoorschriften_voor_geautomatiseerde_loonadministratie_lh991z62fd.pdf" target="_blank" rel="noreferrer">Belastingdienst — rekenvoorschriften geautomatiseerde loonadministratie 2026, versie 2</a></li>
      <li><a href="https://download.belastingdienst.nl/belastingdienst/dl/rekenhulpen/loonheffing/2026/v01/pdf/wit_bb_nl_std_20260101.pdf" target="_blank" rel="noreferrer">Belastingdienst — witte tabel bijzondere beloningen 2026</a></li>
      <li><a href="https://www.p-direkt.nl/informatie-rijkspersoneel-2020/financien/salaris/salarisstrook-en-jaaropgave/wat-staat-er-op-mijn-salarisstrook" target="_blank" rel="noreferrer">P-Direkt — opbouw van de salarisstrook</a></li>
      <li><a href="https://wetten.overheid.nl/BWBR0030989/2026-01-01" target="_blank" rel="noreferrer">Besluit percentages drempel- en toetsingsinkomen zorgtoeslag</a></li>
      <li><a href="https://wetten.overheid.nl/BWBR0051838/2026-01-01" target="_blank" rel="noreferrer">Regeling standaardpremie 2026</a></li>
      <li><a href="https://wetten.overheid.nl/BWBR0051841/2026-01-01" target="_blank" rel="noreferrer">Regeling huurtoeslaggrenzen 2026</a></li>
      <li><a href="https://wetten.overheid.nl/BWBR0017321/2026-01-01" target="_blank" rel="noreferrer">Besluit kinderopvangtoeslag, inclusief tabel 2026</a></li>
      <li><a href="https://zoek.officielebekendmakingen.nl/stcrt-2025-43553.html" target="_blank" rel="noreferrer">Staatscourant 2025, 43553 — geïndexeerde Wkb-bedragen</a></li>
      <li><a href="https://zoek.officielebekendmakingen.nl/stcrt-2025-44508.html" target="_blank" rel="noreferrer">Staatscourant 2025, 44508 — AKW-bedragen per 1 januari 2026</a></li>
      <li><a href="https://www.belastingdienst.nl/wps/wcm/connect/nl/toeslagen/content/hulpmiddel-proefberekening-toeslagen" target="_blank" rel="noreferrer">Officiële proefberekening toeslagen</a></li>
    </ul>
    <p><strong>Niet meegenomen:</strong> AOW-leeftijd of emigratie in 2026, een schaal-, trede- of contracturenwijziging tijdens het jaar, roosterdienst volgens hoofdstuk 22, TOD, PAS, verlof met afwijkende premieverdeling, pensioenovergangsrecht, verkoop van IKB-uren, eigen woning, de belasting over box 2/3, alimentatie en gemeentelijke regelingen. Pensioengevende toelagen op de peildatum kun je wel invoeren.</p>`;

  const modal = $('#infoModal');
  $$('[data-open-modal]').forEach(button => button.addEventListener('click', () => {
    const sources = button.dataset.openModal === 'sources';
    $('#modalKicker').textContent = sources ? 'Bronnen & actualiteit' : 'Berekeningswijze';
    $('#modalContent').innerHTML = sources ? sourcesHtml : methodHtml;
    modal.showModal();
  }));
  $('#closeModal').addEventListener('click', () => modal.close());
  modal.addEventListener('click', event => { if (event.target === modal) modal.close(); });

  $('#copyResult').addEventListener('click', async () => {
    const d = window.latestCalculation;
    const planned = extraHoursProfile();
    const plannedNet = planned.enabled ? d.disposable - getData().disposable : 0;
    const payroll = window.latestPayroll;
    const rijkLines = d.rijk ? `\nCAO Rijk: schaal ${d.rijk.scale}, trede ${d.rijk.step}, ${d.rijk.hours} uur\nIKB gemiddeld: ${euroPrecise.format(d.rijk.ikbAverageMonthly)} per maand\nABP eigen bijdrage: ${euroPrecise.format(d.rijk.pensionAnnual / 12)} per maand` : '';
    const extraLines = planned.enabled && planned.hours ? `\nExtra uren: ${oneDecimal.format(planned.hours)} uur\nBruto uitbetaling extra uren: ${euroPrecise.format(planned.grossCash)}\nNetto over van extra uren: ${euroPrecise.format(plannedNet)} (${euroPrecise.format(plannedNet / planned.hours)} per uur)${planned.leaveHours ? `\nCompensatieverlof: ${oneDecimal.format(planned.leaveHours)} uur` : ''}` : '';
    const payrollLines = payroll ? `\nVerwachte P-Direkt-uitbetaling ${MONTH_NAMES[payroll.selectedMonth - 1]}: ${euroPrecise.format(payroll.selected.bankNet)}\nBijzonder tarief: ${(payroll.rate * 100).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%\nVerwachte jaarcorrectie: ${payroll.settlement >= 0 ? 'terug ' : 'bijbetalen '}${euroPrecise.format(Math.abs(payroll.settlement))}` : '';
    const text = `NettoInzicht 2026${rijkLines}${extraLines}${payrollLines}\nOver na gekozen vaste posten: ${euro.format(d.disposable / 12)} per maand\nNetto loon huishouden: ${euro.format(d.netWage / 12)} per maand\nRegelingen en kinderbijslag: ${euro.format(d.benefits / 12)} per maand\nZorg, huur en opvang: ${euro.format(d.selectedCosts / 12)} per maand\nIndicatieve uitkomst; controleer je loonstrook en officiële beschikkingen.`;
    try { await navigator.clipboard.writeText(text); }
    catch { /* Clipboard kan in sommige previews geblokkeerd zijn. */ }
    const toast = $('#toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1800);
  });

  addExtraHoursRow(initialExtraWeek, 4, .25);
  syncConditional();
  render();
})();

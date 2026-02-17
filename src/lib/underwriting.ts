// ============================================================
// Propwell AM — Underwriting Engine
// Pure calculation functions for real estate deal analysis
// Supports: Long Term Hold, Fix and Flip, Short Term Rental
// Ported from Covey_V2
// ============================================================

export type InvestmentType = 'Long Term Hold' | 'Fix and Flip' | 'Short Term Rental';

// ---- Input Types ----

export interface PropertyInputs {
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  type: InvestmentType;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  units: number;
  imageUrl?: string;

  purchasePrice: number;
  closingCosts: number;
  renovations: number;
  reserves: number;

  loanAmount: number;
  interestRate: number;
  loanTermYears: number;
  amortizationYears: number;
  interestOnly: boolean;

  grossMonthlyRent: number;
  otherMonthlyIncome: number;
  vacancyRate: number;

  propertyTaxes: number;
  insurance: number;
  maintenance: number;
  management: number;
  utilities: number;
  otherExpenses: number;

  holdPeriodYears: number;
  annualAppreciation: number;
  annualRentGrowth: number;
  sellingCosts: number;
  exitCapRate: number;

  afterRepairValue: number;
  monthsToComplete: number;
  holdingCostsMonthly: number;

  avgNightlyRate: number;
  occupancyRate: number;
  cleaningFeePerStay: number;
  avgStayDuration: number;
  strPlatformFee: number;
  strManagement: number;
}

// ---- Output Types ----

export interface UnderwritingResults {
  totalProjectCost: number;
  totalEquityRequired: number;
  loanToValue: number;
  loanToCost: number;

  grossScheduledIncome: number;
  vacancyLoss: number;
  effectiveGrossIncome: number;

  totalOperatingExpenses: number;
  expenseRatio: number;

  noi: number;
  noiMargin: number;

  annualDebtService: number;
  monthlyDebtService: number;

  cashFlowBeforeDebt: number;
  cashFlowAfterDebt: number;
  monthlyCashFlow: number;

  capRate: number;
  cashOnCash: number;
  dscr: number;
  equityMultiple: number;
  irr: number;
  totalProfit: number;
  annualizedReturn: number;

  projectedSalePrice: number;
  netSaleProceeds: number;
  loanBalance: number;

  pricePerUnit: number;
  rentPerUnit: number;
  noiPerUnit: number;

  yearlyProjections: YearProjection[];

  flipProfit?: number;
  flipROI?: number;
  flipAnnualizedROI?: number;

  revenuePerAvailableNight?: number;
  averageDailyRate?: number;
}

export interface YearProjection {
  year: number;
  grossIncome: number;
  operatingExpenses: number;
  noi: number;
  debtService: number;
  cashFlow: number;
  propertyValue: number;
  loanBalance: number;
  equity: number;
  cumulativeCashFlow: number;
}

// ============================================================
// Core Calculation Functions
// ============================================================

export function calcMonthlyPayment(
  principal: number,
  annualRate: number,
  amortYears: number,
  interestOnly: boolean
): number {
  if (principal <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;

  if (interestOnly) {
    return principal * monthlyRate;
  }

  if (monthlyRate === 0) return principal / (amortYears * 12);

  const n = amortYears * 12;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) /
    (Math.pow(1 + monthlyRate, n) - 1);
}

export function calcLoanBalance(
  principal: number,
  annualRate: number,
  amortYears: number,
  yearsElapsed: number,
  interestOnly: boolean
): number {
  if (principal <= 0) return 0;
  if (interestOnly) return principal;

  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) {
    return principal - (principal / (amortYears * 12)) * (yearsElapsed * 12);
  }

  const p = yearsElapsed * 12;
  const payment = calcMonthlyPayment(principal, annualRate, amortYears, false);

  return principal * Math.pow(1 + monthlyRate, p) -
    payment * ((Math.pow(1 + monthlyRate, p) - 1) / monthlyRate);
}

export function calcIRR(cashFlows: number[], maxIterations = 1000, tolerance = 0.00001): number {
  if (cashFlows.length < 2) return 0;

  let rate = 0.1;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;

    for (let t = 0; t < cashFlows.length; t++) {
      const denom = Math.pow(1 + rate, t);
      npv += cashFlows[t] / denom;
      dnpv -= t * cashFlows[t] / Math.pow(1 + rate, t + 1);
    }

    if (Math.abs(dnpv) < 1e-10) break;

    const newRate = rate - npv / dnpv;

    if (Math.abs(newRate - rate) < tolerance) {
      return newRate;
    }

    rate = newRate;

    if (rate < -0.99 || rate > 10) {
      return 0;
    }
  }

  return rate;
}

// ============================================================
// Main Underwriting Function
// ============================================================

export function runUnderwriting(inputs: PropertyInputs): UnderwritingResults {
  const {
    type, units, purchasePrice, closingCosts, renovations, reserves,
    loanAmount, interestRate, loanTermYears, amortizationYears, interestOnly,
    grossMonthlyRent, otherMonthlyIncome, vacancyRate,
    propertyTaxes, insurance, maintenance, management, utilities, otherExpenses,
    holdPeriodYears, annualAppreciation, annualRentGrowth, sellingCosts, exitCapRate,
    afterRepairValue, monthsToComplete, holdingCostsMonthly,
    avgNightlyRate, occupancyRate, cleaningFeePerStay, avgStayDuration,
    strPlatformFee, strManagement,
  } = inputs;

  const unitCount = Math.max(units, 1);

  // ---- Sources & Uses ----
  const totalProjectCost = purchasePrice + closingCosts + renovations + reserves;
  const totalEquityRequired = totalProjectCost - loanAmount;
  const loanToValue = purchasePrice > 0 ? (loanAmount / purchasePrice) * 100 : 0;
  const loanToCost = totalProjectCost > 0 ? (loanAmount / totalProjectCost) * 100 : 0;

  // ---- Income Calculation ----
  let grossScheduledIncome: number;

  if (type === 'Short Term Rental') {
    const totalNightsPerYear = 365;
    const occupiedNights = totalNightsPerYear * (occupancyRate / 100);
    const numberOfStays = avgStayDuration > 0 ? occupiedNights / avgStayDuration : 0;
    const nightlyRevenue = occupiedNights * avgNightlyRate;
    const cleaningRevenue = numberOfStays * cleaningFeePerStay;
    grossScheduledIncome = nightlyRevenue + cleaningRevenue;
  } else {
    grossScheduledIncome = (grossMonthlyRent + otherMonthlyIncome) * 12;
  }

  const vacancyLoss = type === 'Short Term Rental'
    ? 0
    : grossScheduledIncome * (vacancyRate / 100);
  const effectiveGrossIncome = grossScheduledIncome - vacancyLoss;

  // ---- Expenses ----
  let totalOperatingExpenses: number;

  if (type === 'Short Term Rental') {
    const platformFees = grossScheduledIncome * (strPlatformFee / 100);
    const strMgmt = grossScheduledIncome * (strManagement / 100);
    totalOperatingExpenses = propertyTaxes + insurance + maintenance + utilities + otherExpenses + platformFees + strMgmt;
  } else {
    totalOperatingExpenses = propertyTaxes + insurance + maintenance + management + utilities + otherExpenses;
  }

  const expenseRatio = effectiveGrossIncome > 0
    ? (totalOperatingExpenses / effectiveGrossIncome) * 100
    : 0;

  // ---- NOI ----
  const noi = effectiveGrossIncome - totalOperatingExpenses;
  const noiMargin = effectiveGrossIncome > 0 ? (noi / effectiveGrossIncome) * 100 : 0;

  // ---- Debt Service ----
  const monthlyDebtService = calcMonthlyPayment(loanAmount, interestRate, amortizationYears, interestOnly);
  const annualDebtService = monthlyDebtService * 12;

  // ---- Cash Flow ----
  const cashFlowBeforeDebt = noi;
  const cashFlowAfterDebt = noi - annualDebtService;
  const monthlyCashFlow = cashFlowAfterDebt / 12;

  // ---- Return Metrics ----
  const capRate = purchasePrice > 0 ? (noi / purchasePrice) * 100 : 0;
  const cashOnCash = totalEquityRequired > 0 ? (cashFlowAfterDebt / totalEquityRequired) * 100 : 0;
  const dscr = annualDebtService > 0 ? noi / annualDebtService : 0;

  // ---- Per Unit ----
  const pricePerUnit = purchasePrice / unitCount;
  const rentPerUnit = grossMonthlyRent / unitCount;
  const noiPerUnit = noi / unitCount;

  // ---- Fix and Flip Specific ----
  let flipProfit: number | undefined;
  let flipROI: number | undefined;
  let flipAnnualizedROI: number | undefined;

  if (type === 'Fix and Flip') {
    const totalFlipCost = purchasePrice + closingCosts + renovations +
      (holdingCostsMonthly * monthsToComplete) +
      (annualDebtService / 12 * monthsToComplete);
    const sellCosts = afterRepairValue * (sellingCosts / 100);
    flipProfit = afterRepairValue - sellCosts - totalFlipCost;
    flipROI = totalEquityRequired > 0 ? (flipProfit / totalEquityRequired) * 100 : 0;
    const yearsToComplete = monthsToComplete / 12;
    flipAnnualizedROI = yearsToComplete > 0
      ? (Math.pow(1 + flipROI / 100, 1 / yearsToComplete) - 1) * 100
      : 0;
  }

  // ---- STR Specific ----
  const revenuePerAvailableNight = type === 'Short Term Rental'
    ? grossScheduledIncome / 365
    : undefined;
  const averageDailyRate = type === 'Short Term Rental'
    ? avgNightlyRate
    : undefined;

  // ---- Year-by-Year Projections ----
  const holdYears = type === 'Fix and Flip'
    ? Math.max(1, Math.ceil(monthsToComplete / 12))
    : holdPeriodYears;

  const yearlyProjections: YearProjection[] = [];
  let cumulativeCashFlow = 0;

  for (let year = 1; year <= holdYears; year++) {
    const rentGrowthFactor = Math.pow(1 + annualRentGrowth / 100, year - 1);
    const appreciationFactor = Math.pow(1 + annualAppreciation / 100, year);

    let yearIncome: number;
    if (type === 'Fix and Flip') {
      yearIncome = 0;
    } else {
      yearIncome = grossScheduledIncome * rentGrowthFactor;
    }

    const yearVacancy = type === 'Short Term Rental' ? 0 : yearIncome * (vacancyRate / 100);
    const yearEGI = yearIncome - yearVacancy;

    const expenseGrowth = Math.pow(1.02, year - 1);
    const yearExpenses = totalOperatingExpenses * expenseGrowth;

    const yearNOI = yearEGI - yearExpenses;
    const yearDebtService = annualDebtService;
    const yearCashFlow = type === 'Fix and Flip' ? -holdingCostsMonthly * 12 : yearNOI - yearDebtService;
    cumulativeCashFlow += yearCashFlow;

    const propertyValue = type === 'Fix and Flip'
      ? afterRepairValue
      : purchasePrice * appreciationFactor;

    const yearLoanBalance = calcLoanBalance(loanAmount, interestRate, amortizationYears, year, interestOnly);
    const yearEquity = propertyValue - yearLoanBalance;

    yearlyProjections.push({
      year,
      grossIncome: yearIncome,
      operatingExpenses: yearExpenses,
      noi: yearNOI,
      debtService: yearDebtService,
      cashFlow: yearCashFlow,
      propertyValue,
      loanBalance: yearLoanBalance,
      equity: yearEquity,
      cumulativeCashFlow,
    });
  }

  // ---- Disposition ----
  let projectedSalePrice: number;

  if (type === 'Fix and Flip') {
    projectedSalePrice = afterRepairValue;
  } else if (exitCapRate > 0 && holdYears > 0) {
    const terminalNOI = yearlyProjections[holdYears - 1]?.noi || noi;
    const terminalNOIForward = terminalNOI * (1 + annualRentGrowth / 100);
    projectedSalePrice = terminalNOIForward / (exitCapRate / 100);
  } else {
    projectedSalePrice = purchasePrice * Math.pow(1 + annualAppreciation / 100, holdYears);
  }

  const sellCostsAmount = projectedSalePrice * (sellingCosts / 100);
  const loanBalance = holdYears > 0
    ? calcLoanBalance(loanAmount, interestRate, amortizationYears, holdYears, interestOnly)
    : loanAmount;
  const netSaleProceeds = projectedSalePrice - sellCostsAmount - loanBalance;

  // ---- IRR Calculation ----
  const irrCashFlows: number[] = [-totalEquityRequired];

  if (type === 'Fix and Flip') {
    for (let i = 0; i < holdYears - 1; i++) {
      irrCashFlows.push(yearlyProjections[i]?.cashFlow || 0);
    }
    irrCashFlows.push((yearlyProjections[holdYears - 1]?.cashFlow || 0) + netSaleProceeds);
  } else {
    for (let i = 0; i < holdYears; i++) {
      if (i === holdYears - 1) {
        irrCashFlows.push((yearlyProjections[i]?.cashFlow || 0) + netSaleProceeds);
      } else {
        irrCashFlows.push(yearlyProjections[i]?.cashFlow || 0);
      }
    }
  }

  const irr = calcIRR(irrCashFlows) * 100;

  // ---- Equity Multiple ----
  const totalCashReceived = cumulativeCashFlow + netSaleProceeds;
  const equityMultiple = totalEquityRequired > 0
    ? totalCashReceived / totalEquityRequired
    : 0;

  const totalProfit = totalCashReceived - totalEquityRequired;
  const annualizedReturn = holdYears > 0
    ? (Math.pow(equityMultiple, 1 / holdYears) - 1) * 100
    : 0;

  return {
    totalProjectCost, totalEquityRequired, loanToValue, loanToCost,
    grossScheduledIncome, vacancyLoss, effectiveGrossIncome,
    totalOperatingExpenses, expenseRatio,
    noi, noiMargin,
    annualDebtService, monthlyDebtService,
    cashFlowBeforeDebt, cashFlowAfterDebt, monthlyCashFlow,
    capRate, cashOnCash, dscr, equityMultiple, irr, totalProfit, annualizedReturn,
    projectedSalePrice, netSaleProceeds, loanBalance,
    pricePerUnit, rentPerUnit, noiPerUnit,
    yearlyProjections,
    flipProfit, flipROI, flipAnnualizedROI,
    revenuePerAvailableNight, averageDailyRate,
  };
}

// ============================================================
// Default Inputs by Type
// ============================================================

export function getDefaultInputs(type: InvestmentType): PropertyInputs {
  const base: PropertyInputs = {
    streetAddress: '', city: '', state: '', zip: '', type,
    bedrooms: 3, bathrooms: 2, squareFeet: 1500, units: 1, imageUrl: '',
    purchasePrice: 0, closingCosts: 0, renovations: 0, reserves: 0,
    loanAmount: 0, interestRate: 7.0, loanTermYears: 30, amortizationYears: 30, interestOnly: false,
    grossMonthlyRent: 0, otherMonthlyIncome: 0, vacancyRate: 5,
    propertyTaxes: 0, insurance: 0, maintenance: 0, management: 0, utilities: 0, otherExpenses: 0,
    holdPeriodYears: 5, annualAppreciation: 3, annualRentGrowth: 2, sellingCosts: 6, exitCapRate: 7,
    afterRepairValue: 0, monthsToComplete: 6, holdingCostsMonthly: 0,
    avgNightlyRate: 0, occupancyRate: 70, cleaningFeePerStay: 0, avgStayDuration: 3, strPlatformFee: 3, strManagement: 20,
  };

  if (type === 'Fix and Flip') {
    base.interestRate = 10;
    base.loanTermYears = 1;
    base.amortizationYears = 30;
    base.interestOnly = true;
    base.holdPeriodYears = 1;
  }

  if (type === 'Short Term Rental') {
    base.holdPeriodYears = 5;
    base.vacancyRate = 0;
  }

  return base;
}

// ============================================================
// Formatting Helpers
// ============================================================

export function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatMultiple(value: number): string {
  return `${value.toFixed(2)}x`;
}

// ============================================================
// Recommendation Logic
// ============================================================

export interface UWRecommendation {
  action: 'Buy' | 'Hold' | 'Sell' | 'Pass';
  confidence: 'High' | 'Medium' | 'Low';
  summary: string;
  factors: string[];
}

export function getRecommendation(inputs: PropertyInputs, results: UnderwritingResults): UWRecommendation {
  const factors: string[] = [];
  let score = 0;

  if (inputs.type === 'Fix and Flip') {
    if ((results.flipROI ?? 0) > 20) { score += 2; factors.push(`Strong flip ROI: ${formatPercent(results.flipROI ?? 0)}`); }
    else if ((results.flipROI ?? 0) > 10) { score += 1; factors.push(`Moderate flip ROI: ${formatPercent(results.flipROI ?? 0)}`); }
    else { score -= 1; factors.push(`Weak flip ROI: ${formatPercent(results.flipROI ?? 0)}`); }

    if ((results.flipProfit ?? 0) > 50000) { score += 1; factors.push(`Profit > $50K: ${formatCurrency(results.flipProfit ?? 0)}`); }
    if ((results.flipProfit ?? 0) < 0) { score -= 2; factors.push(`Negative profit: ${formatCurrency(results.flipProfit ?? 0)}`); }
  } else {
    // Cash-on-cash
    if (results.cashOnCash > 8) { score += 2; factors.push(`Strong cash-on-cash: ${formatPercent(results.cashOnCash)}`); }
    else if (results.cashOnCash > 4) { score += 1; factors.push(`Moderate cash-on-cash: ${formatPercent(results.cashOnCash)}`); }
    else if (results.cashOnCash < 0) { score -= 2; factors.push(`Negative cash-on-cash: ${formatPercent(results.cashOnCash)}`); }
    else { factors.push(`Low cash-on-cash: ${formatPercent(results.cashOnCash)}`); }

    // Cap rate
    if (results.capRate > 7) { score += 1; factors.push(`Strong cap rate: ${formatPercent(results.capRate)}`); }
    else if (results.capRate > 5) { factors.push(`Moderate cap rate: ${formatPercent(results.capRate)}`); }
    else { score -= 1; factors.push(`Low cap rate: ${formatPercent(results.capRate)}`); }

    // DSCR
    if (results.dscr > 1.25) { score += 1; factors.push(`Healthy DSCR: ${results.dscr.toFixed(2)}x`); }
    else if (results.dscr < 1.0) { score -= 2; factors.push(`DSCR below 1.0: ${results.dscr.toFixed(2)}x — negative cash flow`); }
    else { factors.push(`Tight DSCR: ${results.dscr.toFixed(2)}x`); }

    // IRR
    if (results.irr > 15) { score += 2; factors.push(`Excellent IRR: ${formatPercent(results.irr)}`); }
    else if (results.irr > 10) { score += 1; factors.push(`Good IRR: ${formatPercent(results.irr)}`); }
    else if (results.irr < 5) { score -= 1; factors.push(`Low IRR: ${formatPercent(results.irr)}`); }

    // Equity multiple
    if (results.equityMultiple > 2.0) { score += 1; factors.push(`Strong equity multiple: ${formatMultiple(results.equityMultiple)}`); }
  }

  let action: 'Buy' | 'Hold' | 'Sell' | 'Pass';
  let confidence: 'High' | 'Medium' | 'Low';
  let summary: string;

  if (score >= 4) {
    action = 'Buy';
    confidence = 'High';
    summary = 'Strong investment fundamentals across all metrics. Recommend acquisition.';
  } else if (score >= 2) {
    action = 'Buy';
    confidence = 'Medium';
    summary = 'Solid investment with some areas to monitor. Recommend acquisition with noted considerations.';
  } else if (score >= 0) {
    action = 'Hold';
    confidence = 'Low';
    summary = 'Marginal returns. Consider negotiating better terms or monitoring for market improvements.';
  } else {
    action = 'Pass';
    confidence = 'High';
    summary = 'Returns do not meet investment thresholds. Recommend passing on this opportunity.';
  }

  return { action, confidence, summary, factors };
}

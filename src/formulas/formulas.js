const { irr } = require('node-irr');

const roundToTwo = (num) => Math.round(num * 100) / 100;

export const getOsfNpv = (obj) => {
  const result = {};

  const OCIF = obj.dailySalesVolume * 365 * obj.pricePerUnit;
  const OCOF =
    obj.dailySalesVolume * 365 * obj.variableCostPerUnit +
    (obj.monthlySalary + obj.monthlyRent) * 12;
  const Dept = obj.initialInvestment / obj.projectDuration;

  const OCF = OCIF - OCOF - (obj.tax / 100) * (OCIF - OCOF - Dept);
  result.OCF = roundToTwo(OCF);

  const PV = (obj, i) => OCF / Math.pow(1 + obj.discountRate / 100, i);

  const array = [];

  for (let i = 1; i <= obj.projectDuration; i += 1) {
    array.push(PV(obj, i));
  }

  let sum = 0;

  for (let i = 0; i < array.length; i += 1) {
    sum += array[i];
  }

  const NPV = roundToTwo(sum - obj.initialInvestment);
  result.NPV = NPV;

  return result;
};

const getPaybackPeriod = (
  array,
  cumDiscCashFlow,
  year,
  prevCumDiscCashFlow,
  discCashFlow
) => {
  if (cumDiscCashFlow < 0) {
    return '';
  } else if (array.filter(({ paybackPeriod }) => paybackPeriod).length > 0) {
    return '';
  } else {
    return roundToTwo(year - 1 + Math.abs(prevCumDiscCashFlow) / discCashFlow);
  }
};

export const getDppPiIrr = (obj, OCF) => {
  const result = {
    DPP: [
      {
        cashFlow: obj.initialInvestment * -1,
        discountedCashFlow: obj.initialInvestment * -1,
        cumulativeDiscountedCashFlow: obj.initialInvestment * -1,
        paybackPeriod: '',
      },
    ],
  };

  for (let i = 1; i <= obj.projectDuration; i += 1) {
    const prev = result.DPP[i - 1];

    const discountedCashFlow = roundToTwo(
      OCF / Math.pow(1 + obj.discountRate / 100, i)
    );

    const cumulativeDiscountedCashFlow = roundToTwo(
      discountedCashFlow + prev.cumulativeDiscountedCashFlow
    );

    const paybackPeriod = getPaybackPeriod(
      result.DPP,
      cumulativeDiscountedCashFlow,
      i,
      prev.cumulativeDiscountedCashFlow,
      discountedCashFlow
    );

    const newYearResults = {
      cashFlow: OCF,
      discountedCashFlow,
      cumulativeDiscountedCashFlow,
      paybackPeriod: paybackPeriod,
    };

    result.DPP.push(newYearResults);
  }

  const cashFlows = result.DPP.map(({ cashFlow }) => cashFlow);
  const IRR = irr(cashFlows);
  result.IRR = roundToTwo(IRR);

  const sumOfDiscountedCashFlow = result.DPP.map(
    ({ discountedCashFlow }) => discountedCashFlow
  )
    .filter((value) => value > 0)
    .reduce((acc, value) => acc + value, 0);

  const PI = sumOfDiscountedCashFlow / Math.abs(obj.initialInvestment);
  const isProjectRentable = PI > 1;

  result.PI = roundToTwo(PI);
  result.isProjectRentable = isProjectRentable;

  return result;
};

const getElasticityConclusion = (elasticity) => {
  if (Math.abs(elasticity) >= 1) {
    return 'high';
  } else if (Math.abs(elasticity) >= 0.5 && Math.abs(elasticity) < 1) {
    return 'mid';
  } else {
    return 'low';
  }
};

const rankFactors = (factors) => {
  const factorsArray = Object.entries(factors);
  factorsArray.sort(
    ([, a], [, b]) => Math.abs(b.elasticity) - Math.abs(a.elasticity)
  );
  factorsArray.forEach(([key, value], index) => {
    value.rank = index + 1;
  });

  return Object.fromEntries(factorsArray);
};

export const calculateNPVElasticity = (obj, basicNpv, percent) => {
  const percentDecimal = percent / 100;

  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    const newValue = roundToTwo(value + value * percentDecimal);
    const newData = { ...obj };
    newData[key] = newValue;

    const newNPV = getOsfNpv(newData).NPV;
    const elasticity = roundToTwo(
      (((newNPV - basicNpv) / basicNpv) * 100) / percent
    );
    const elasticityConclusion = getElasticityConclusion(elasticity);

    result[key] = {
      newValue,
      newNPV,
      elasticity,
      elasticityConclusion,
    };
  }
  return rankFactors(result);
};

export const getNPVElasticityByParameter = (
  obj,
  param,
  minPercent,
  maxPercent,
  basicNpv
) => {
  const basicValue = obj[param];

  const result = [];

  for (let i = minPercent; i <= maxPercent; i += 1) {
    if (i === 0) {
      console.log('here');
      const zeroProcObj = {
        newValue: '-',
        newNPV: '-',
        elasticity: '-',
        elasticityConclusion: '-',
        basicValue,
        basicNpv,
      };
      result.push([i, zeroProcObj]);
    } else {
      const newValue = roundToTwo(basicValue + (basicValue * i) / 100);
      const newData = { ...obj };
      newData[param] = newValue;

      const newNPV = getOsfNpv(newData).NPV;
      const elasticity = roundToTwo(
        (((newNPV - basicNpv) / basicNpv) * 100) / i
      );
      const elasticityConclusion = getElasticityConclusion(elasticity);

      result.push([
        i,
        {
          basicValue,
          newValue,
          newNPV,
          basicNpv,
          elasticity,
          elasticityConclusion,
        },
      ]);
    }
  }

  return result;
};

import React, { useState } from 'react';
import { BsCaretDownFill, BsCaretUpFill } from 'react-icons/bs';

import { calculateNPVElasticity } from '../formulas/formulas';

const percentsValue = (value) => {
  const operator = value > 0 ? '+' : '';
  return operator + value + '%';
};

const ukrStatus = {
  low: 'Малий ризик',
  mid: 'Середній ризик',
  high: 'Високий ризик',
};

const PercentageInput = ({
  handleDecrease,
  value,
  handleChange,
  handleIncrease,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="percentage-input-container">
      <div className="percentage-input-group">
        <button onClick={handleDecrease} className="percentage-input-button">
          -
        </button>
        <input
          value={isFocused ? value : percentsValue(value)}
          onChange={handleChange}
          className="percentage-input-field"
          min="-100"
          max="100"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        <button onClick={handleIncrease} className="percentage-input-button">
          +
        </button>
      </div>
    </div>
  );
};

const sorts = ['', 'down', 'up'];

const sortingClassname = (value) => `rating_icon ${value}`;

const normalSort = [
  'initialInvestment',
  'projectDuration',
  'variableCostPerUnit',
  'pricePerUnit',
  'monthlySalary',
  'monthlyRent',
  'dailySalesVolume',
  'discountRate',
  'tax',
];

const sortResults = (entries, filter) => {
  if (filter === '') {
    return entries.sort((a, b) => {
      return normalSort.indexOf(a[0]) - normalSort.indexOf(b[0]);
    });
  } else if (filter === 'up') {
    return entries.sort((a, b) => b[1].rank - a[1].rank);
  } else if (filter === 'down') {
    return entries.sort((a, b) => a[1].rank - b[1].rank);
  }
  return entries;
};

const NPVElasticityTable = ({ basicData, basicNpv, ukrNames }) => {
  const [percent, setPercent] = useState(1);
  const [sortBy, setSortBy] = useState('');

  const results = calculateNPVElasticity(basicData, basicNpv, percent);
  const sortedResults = sortResults(Object.entries(results), sortBy);

  const handleIncrease = () => {
    setPercent((prevValue) => Math.min(prevValue + 1, 100));
  };

  const handleDecrease = () => {
    setPercent((prevValue) => Math.max(prevValue - 1, -100));
  };

  const handleChange = (e) => {
    let newValue = parseInt(e.target.value);
    if (isNaN(newValue)) return;

    if (newValue >= -100 && newValue <= 100) {
      setPercent(newValue);
    }
  };

  const handleChangeSorting = () => {
    const currentIndex = sorts.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % sorts.length; // Зациклює масив
    setSortBy(sorts[nextIndex]);
  };

  return (
    <div className="table-container">
      <div className="elastivity-header">
        <h2>
          Розрахунок пофакторної еластичності чистої теперішньої вартості
          проєкту
        </h2>
        <PercentageInput
          handleChange={handleChange}
          handleDecrease={handleDecrease}
          handleIncrease={handleIncrease}
          value={percent}
        />
      </div>
      {percent === 0 ? (
        <></>
      ) : (
        <div className="table">
          <table className="table dpp">
            <tbody>
              <tr className="dpp-headers">
                <td>Фактори</td>
                <td>Базове значення</td>
                <td>Нове значення (зміна на {percentsValue(percent)})</td>
                <td>Базове значення NPV</td>
                <td>Нова зміна NPV (зміна на {percentsValue(percent)})</td>
                <td>Еластичність NPV</td>
                <td>
                  <div className="rating_block">
                    <div>Висновок (рейтинг)</div>
                    <div
                      className={sortingClassname(sortBy)}
                      onClick={handleChangeSorting}
                    >
                      {sortBy === 'up' ? (
                        <BsCaretUpFill />
                      ) : (
                        <BsCaretDownFill />
                      )}
                    </div>
                  </div>
                </td>
              </tr>
              {sortedResults.map(([key, item]) => {
                return (
                  <tr key={key}>
                    <td className="factor_name">{ukrNames[key]}</td>
                    <td>{basicData[key]}</td>
                    <td>{item.newValue}</td>
                    <td>{basicNpv}</td>
                    <td>{item.newNPV}</td>
                    <td>{item.elasticity}</td>
                    <td>{`${ukrStatus[item.elasticityConclusion]} (${
                      item.rank
                    })`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NPVElasticityTable;

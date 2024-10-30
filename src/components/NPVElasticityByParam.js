import React, { useState } from 'react';
import './NPVElacticityByParam.css';

import Slider from '@mui/material/Slider';

import { getNPVElasticityByParameter } from '../formulas/formulas';

const minDistance = 1;

const NPVElasticityByParam = ({ ukrNames, basicData, basicNpv }) => {
  const [selectedParam, setSelectedParam] = useState(Object.keys(ukrNames)[0]);
  const [range, setRange] = useState([1, 5]);

  const [result, setResult] = useState(null);

  const handleParamChange = (e) => {
    setSelectedParam(e.target.value);
  };

  const handleChange = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    if (activeThumb === 0) {
      setRange([Math.min(newValue[0], range[1] - minDistance), range[1]]);
    } else {
      setRange([range[0], Math.max(newValue[1], range[0] + minDistance)]);
    }
  };

  const handleCount = () => {
    setResult(
      getNPVElasticityByParameter(
        basicData,
        selectedParam,
        range[0],
        range[1],
        basicNpv
      )
    );
  };

  return (
    <div className="table-container">
      <div>
        <h2>
          Аналіз еластичності NPV по фактору в межах відсоткового діапазону
        </h2>
      </div>
      <div className="by-param-table-input-block-wrapper">
        <div className="by-param-table-input-block">
          <div className="dropdown-select">
            <div className="by-param-table-input-block-label">
              Виберіть параметр:
            </div>
            <select
              id="paramSelect"
              value={selectedParam}
              onChange={handleParamChange}
            >
              {Object.entries(ukrNames).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="range-input">
            <div className="by-param-table-input-block-label">
              Діапазон: {range[0]}% до {range[1]}%
            </div>

            <Slider
              value={range}
              onChange={handleChange}
              valueLabelDisplay="auto"
              min={-100}
              max={100}
              disableSwap
            />
            <div className="values">
              <div>-100</div>
              <div>0</div>
              <div>100</div>
            </div>
          </div>
        </div>
        <div className="data-input-submit">
          <button
            type="submit"
            className="submit-button-primary"
            onClick={handleCount}
          >
            РОЗРАХУВАТИ
          </button>
        </div>
      </div>

      {result && (
        <div className="table">
          <table className="table dpp">
            <tbody>
              <tr className="dpp-headers">
                <td>Відсоток</td>
                <td>Базове значення</td>
                <td>Нове значення</td>
                <td>Базове значення NPV</td>
                <td>Нова зміна NPV</td>
                <td>Еластичність NPV</td>
              </tr>
              {result.map(([percent, data]) => (
                <tr key={`by_param_table_item_${percent}`}>
                  <td>{percent}</td>
                  <td>{data.basicValue}</td>
                  <td>{data.newValue}</td>
                  <td>{data.basicNpv}</td>
                  <td>{data.newNPV}</td>
                  <td>{data.elasticity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NPVElasticityByParam;

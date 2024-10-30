import React, { useState, Fragment, useRef } from 'react';
import Media from 'react-media';

import NotResponsivePage from './components/NotResponsive';
import Header from './components/Header';
import DataInput from './components/DataInput';
import FinanceTable from './components/FinanceTableComponent';
import Divider from './components/Divider';
import NPVElasticityTable from './components/NPVElasticityTable';
import NPVElasticityByParam from './components/NPVElasticityByParam';

import { getOsfNpv, getDppPiIrr } from './formulas/formulas';

const fieldsNamesInUkr = {
  initialInvestment: 'Початкові інвестиції (ум. од.)',
  projectDuration: 'Термін реалізації проєкту (р)',
  variableCostPerUnit: 'Змінні витрати на одиницю продукції (ум. од.)',
  pricePerUnit: 'Ціна одиниці продукції (ум. од.)',
  monthlySalary: 'Щомісячна заробітна плата персоналу (ум. од)',
  monthlyRent: 'Щомісячна оренда приміщення (ум. од.)',
  dailySalesVolume: 'Щоденний обсяг реалізації продукції (од.)',
  discountRate: 'Ставка дисконтування (%)',
  tax: 'Ставка податку на прибуток (%)',
};

const App = () => {
  const [formData, setFormData] = useState({
    initialInvestment: '',
    projectDuration: '',
    variableCostPerUnit: '',
    pricePerUnit: '',
    monthlySalary: '',
    monthlyRent: '',
    dailySalesVolume: '',
    discountRate: '',
    tax: '',
  });

  const [basicResults, setBasicResults] = useState(null);

  const fieldsRefs = {
    initialInvestment: useRef(null),
    projectDuration: useRef(null),
    variableCostPerUnit: useRef(null),
    pricePerUnit: useRef(null),
    monthlySalary: useRef(null),
    monthlyRent: useRef(null),
    dailySalesVolume: useRef(null),
    discountRate: useRef(null),
    tax: useRef(null),
  };

  const [dataInputError, setDataInputErrors] = useState('');

  const [isThisFirstCalculate, setIsThisFirstCalculate] = useState(true);

  const handleChangeisThisFirstCalculate = () => setIsThisFirstCalculate(false);

  const handleChangeData = (e) => {
    const { name, value } = e.target;
    if (/^\d*$/.test(value) || value === '') {
      setFormData({
        ...formData,
        [name]: Number(value),
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    for (const key in formData) {
      if (formData[key] === '') {
        setDataInputErrors(key);
        fieldsRefs[key].current.focus();
        return;
      }
    }
    setDataInputErrors('');

    const OsfNpf = getOsfNpv(formData);
    const DppPiIrr = getDppPiIrr(formData, OsfNpf.OCF);

    setBasicResults({ ...OsfNpf, ...DppPiIrr });

    handleChangeisThisFirstCalculate();
  };

  return (
    <>
      <Media
        queries={{
          small: '(max-width: 999px)',
          large: '(min-width: 1000px)',
        }}
      >
        {(matches) => (
          <Fragment>
            {matches.small && <NotResponsivePage />}
            {matches.large && (
              <>
                <Header />
                <DataInput
                  handleChange={handleChangeData}
                  handleSubmit={handleSubmit}
                  formData={formData}
                  isFirst={isThisFirstCalculate}
                  fieldsNamesInUkr={fieldsNamesInUkr}
                  error={dataInputError}
                  refs={fieldsRefs}
                />
                {basicResults && (
                  <>
                    <FinanceTable results={basicResults} />
                    <Divider />
                    <NPVElasticityTable
                      basicData={formData}
                      basicNpv={basicResults.NPV}
                      ukrNames={fieldsNamesInUkr}
                    />
                    <Divider />
                    <NPVElasticityByParam
                      ukrNames={fieldsNamesInUkr}
                      basicData={formData}
                      basicNpv={basicResults.NPV}
                    />
                  </>
                )}
              </>
            )}
          </Fragment>
        )}
      </Media>
    </>
  );
};

export default App;

import React from 'react';
import './TableStyles.css';

const FinanceTable = ({ results }) => {
  return (
    <div className="table-container">
      <h2>Основні розрахунки</h2>
      <table className="table">
        <tbody>
          <tr>
            <td>Pічний грошовий потік (OCF) =</td>
            <td>{results.OCF}</td>
          </tr>
          <tr>
            <td>Чиста теперішня вартість (NPV) =</td>
            <td>{results.NPV}</td>
          </tr>
          <tr>
            <td>Внутрішня норма дохідності (IRR)</td>
            <td>{Math.round(results.IRR * 100) + '%'}</td>
          </tr>
        </tbody>
      </table>
      <h2>Дисконтований термін окупності (DPP)</h2>
      <table className="table dpp">
        <tbody>
          <tr className="dpp-headers">
            <td>Рік</td>
            <td>Грошові потоки</td>
            <td>Дисконтовані грошові потоки</td>
            <td>Кумулятивний дисконтований потік</td>
            <td>Термін окупності</td>
          </tr>
          {results.DPP.map((item, i) => (
            <tr
              key={'DPP_item' + i}
              className={item.paybackPeriod !== '' ? 'dpp-result' : ''}
            >
              <td>{i}</td>
              <td>{item.cashFlow}</td>
              <td>{i === 0 ? '' : item.discountedCashFlow}</td>
              <td>{i === 0 ? '' : item.cumulativeDiscountedCashFlow}</td>
              <td>{item.paybackPeriod}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <table className="table">
        <tbody>
          <tr>
            <td>Індекс рентабельності інвестицій (PI) =</td>
            <td>{results.PI}</td>
          </tr>
          <tr>
            <td>Чи є проєкт рентабельним?</td>
            <td>{results.isProjectRentable ? 'Так' : 'Ні'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default FinanceTable;

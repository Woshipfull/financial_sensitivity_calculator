import React from 'react';

const DataInput = ({
  handleChange,
  handleSubmit,
  formData,
  isFirst,
  fieldsNamesInUkr,
  error,
  refs,
}) => (
  <div className="data-input-block">
    <form className="input-table" onSubmit={handleSubmit}>
      {Object.entries(formData).map(([key, value]) => (
        <div className="input-group" key={key}>
          <label htmlFor={key} className="input-label">
            {fieldsNamesInUkr[key]}
          </label>
          <input
            type="number"
            id={key}
            name={key}
            value={value}
            onChange={handleChange}
            className={key === error ? 'input-field invalid' : 'input-field'}
            required
            autoComplete="off"
            ref={refs[key]}
          />
        </div>
      ))}
    </form>

    {error === '' ? (
      <></>
    ) : (
      <div className="data-input-error-message">
        Поле <strong>"{fieldsNamesInUkr[error]}"</strong> не може бути пустим!
      </div>
    )}

    <div className="data-input-submit">
      {isFirst ? (
        <button
          type="submit"
          className="submit-button-primary"
          onClick={handleSubmit}
        >
          РОЗРАХУВАТИ
        </button>
      ) : (
        <button
          type="submit"
          className="submit-button-primary"
          onClick={handleSubmit}
        >
          ПЕРЕРАХУВАТИ
        </button>
      )}
    </div>
  </div>
);

export default DataInput;

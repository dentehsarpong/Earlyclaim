import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('earlyclaim_currency') || 'GHS';
  });
  const [rate, setRate] = useState(15.50);

  useEffect(() => {
    localStorage.setItem('earlyclaim_currency', currency);
  }, [currency]);

  // Fetch live or configured rates from backend
  useEffect(() => {
    fetch('/api/rates')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.USD_TO_GHS) {
          setRate(data.USD_TO_GHS);
        }
      })
      .catch(() => {});
  }, []);

  const formatPrice = (priceGHS, priceUSD) => {
    if (currency === 'USD') {
      const usdVal = priceUSD !== undefined ? priceUSD : Math.round(priceGHS / rate);
      return `$${Number(usdVal).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    // GHS
    const ghsVal = priceGHS !== undefined ? priceGHS : Math.round(priceUSD * rate);
    return `GH₵ ${Number(ghsVal).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const convertPrice = (priceGHS) => {
    if (currency === 'USD') {
      return Math.round((priceGHS / rate) * 100) / 100;
    }
    return priceGHS;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertPrice, rate }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);

import React, { useState, useEffect } from "react";

const Summation = ({ tradeData }) => {
  const [sumData, setSumData] = useState({});

  useEffect(() => {
    const calculateSumData = () => {
      const newSumData = {};
      for (let i = 0; i < tradeData.length; i++) {
        const trade = tradeData[i];
        const solAmount = trade.sol_amount;
        const symbol = trade.symbol;
        const imageUri = trade.image_uri;
        const isBuy = trade.is_buy;
        const mint = trade.mint; // New: Capture the mint URL

        if (symbol in newSumData) {
          if (isBuy) {
            newSumData[symbol].buyAmount += solAmount;
          } else {
            newSumData[symbol].sellAmount += solAmount;
          }
        } else {
          newSumData[symbol] = {
            buyAmount: isBuy ? solAmount : 0,
            sellAmount: isBuy ? 0 : solAmount,
            image_uri: imageUri,
            mint: mint, // New: Store the mint URL
          };
        }
      }
      setSumData(newSumData);
    };

    calculateSumData();
  }, [tradeData]);

  const sortedSymbols = Object.entries(sumData).sort(
    ([, a], [, b]) => b.buyAmount + b.sellAmount - (a.buyAmount + a.sellAmount)
  );

  return (
    <div className='relative w-full mt-12 mx-auto pr-2'>
     
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {sortedSymbols.map(([symbol, data]) => {
          const totalVolume = data.buyAmount + data.sellAmount;
          return (
            <div key={symbol} className='bg-[#2c2e42] shadow-md rounded-lg p-4'>
              <img
                src={data.image_uri}
                alt={symbol}
                className='w-16 h-16 mx-auto mb-2 rounded-full'
              />
              <a
                href={`https://pump.fun/${data.mint}`}
                target='_blank'
                rel='noopener noreferrer'
                className='block text-base font-semibold text-center text-blue-600 hover:underline'>
                {symbol}
              </a>

              <p className='text-center text-green-600 text-sm'>
                Total Buys: {Math.round((data.buyAmount / 1e9) * 100) / 100} SOL
              </p>
              <p className='text-center text-red-600 text-sm'>
                Total Sales: {Math.round((data.sellAmount / 1e9) * 100) / 100}{" "}
                SOL
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Summation;

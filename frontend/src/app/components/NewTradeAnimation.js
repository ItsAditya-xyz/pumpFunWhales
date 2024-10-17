import React, { useState, useEffect } from "react";
import Image from "next/image";

const NewTradeAnimation = ({ tradeData }) => {
  const [animating, setAnimating] = useState(false);
  const randomPfpList = [
    "https://pump.mypinata.cloud/ipfs/QmeSzchzEPqCU1jwTnsipwcBAeH7S4bmVvFGfF65iA1BY1?img-width=128&img-dpr=2&img-onerror=redirect",
    "https://pump.mypinata.cloud/ipfs/QmardKHriuppW2WTFPzYCTSihfsHUbXnqwzyMspAEsVho9?img-width=128&img-dpr=2&img-onerror=redirect",
    "https://pump.mypinata.cloud/ipfs/QmYntTWFXsRXXgNJSY1eBSaKEDS1mykPsPKrYfNRt6ajvC?img-width=128&img-dpr=2&img-onerror=redirect",
  ];

  return (
    <div className='relative w-full  mt-10 mx-auto '>
      {tradeData.map((trade, index) => (
        <div
          key={index}
          className={` left-0 w-full mt-2 bg-gradient-to-r ${trade.is_buy?"bg-green-600": "bg-red-500"} rounded-lg shadow-lg transition-all duration-500 ease-in-out `}>
          <div className='flex items-center justify-between p-4 text-white'>
            <div className='flex items-center space-x-4'>
              <img
                src={
                  randomPfpList[
                    Math.floor(Math.random() * randomPfpList.length)
                  ]
                }
                alt={trade.creator_username}
                className='rounded-full w-5 h-5 sm:w-12 sm:h-12'></img>

              <div className="flex flex-col">
                <a
                  className='font-semibold bg-purple-500 rounded-md px-1 sm:px-3 py-1 hover:bg-purple-600 text-xs sm:text-sm '
                  href={`https://pump.fun/profile/${trade.user}`}
                  target='_blank'>
                  {trade.user.length > 8
                    ? `${trade.user.slice(0, 7)}....${trade.user.slice(-7)}`
                    : trade.user}
                </a>
                <a
                  className='text-sm text-purple-200 underline'
                  href={`https://explorer.solana.com/tx/${trade.signature}`}
                  target='_blank'
                  >
                  {trade.is_buy ? "Bought" : "Sold"} 
                </a>
              </div>
            </div>
            <div className='text-center'>
              <p className='text-sm font-semibold'>
                {Math.round((trade.sol_amount / 1e9) * 100) / 100} SOL
              </p>
              <p className='text-sm text-purple-200'>worth of</p>
            </div>
            <a
              className='flex items-center space-x-4'
              href={`https://pump.fun/${trade.mint}`}
              target='_blank'>
              <div className='text-right'>
                <p className='font-bold text-sm'>${trade.symbol}</p>
                <p className='text-sm text-purple-200'>coin</p>
              </div>
              <img
                src={trade.image_uri}
                alt={trade.symbol}
                className='rounded-full w-6 h-6 sm:w-12 sm:h-12'></img>
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NewTradeAnimation;

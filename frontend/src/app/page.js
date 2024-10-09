"use client";

import React, { useState, useEffect } from "react";
import { subscribe, createAppJwt } from "pubsub-ws";

import NewTradeAnimation from "./components/NewTradeAnimation";
import Loader from "./components/Loader";

const natsWsUrl =
  "wss://europe-west3-gcp-dl-testnet-brokernode-frankfurt01.synternet.com";
const accessToken =
  "SAAJMAXGQHQOSNSFRZ5U3F23NKS2F5VXALMMCQW745JWWTIMQTZGF7YT64";
const pumpfunwhales = "uniswapwhales.pumpfunwhales.track";

export default function Home() {
  const [pumpFunTrades, setPumpFunTrades] = useState([]);

  useEffect(() => {
    initNats();
  }, []);

  const initNats = async () => {
    const config = { url: natsWsUrl };
    const { userSeed: seed, jwt } = createAppJwt(accessToken);

    const onMessages = async (messages) => {
      messages.forEach((message) => {
        const tradeData = JSON.parse(message.data);
        const actualTradeData = tradeData.data;
        console.log(actualTradeData);
        if (message.subject === pumpfunwhales) {
          setPumpFunTrades((prev) => [actualTradeData, ...prev]);
        }
      });
    };

    const onError = (text, error) => {
      console.error(text, error);
    };

    try {
      await subscribe({
        onMessages,
        onError,
        jwt: jwt,
        nkey: seed,
        config: config,
        subject: pumpfunwhales,
      });

      console.log("Connected to NATS server.");
    } catch (error) {
      console.error("Failed to connect to NATS server:", error);
    }
  };

  return (
    <div className=' w-full  bg-[#1B1C29] '>
      <main
        className='flex min-h-screen flex-col items-center justify-start   text-gray-200'
        style={{}}>
        <h1 className='text-4xl font-bold mb-8 mt-10 leading-relaxed'>
          PumpFunWhales 🐳
        </h1>
        <div>
          <p className='text-lg font-thin text-gray-100 mb-10 text-center'>
            Monitor whale inflows and track their pumpfun activity in real time!{" "}
            <br></br> Powered by
            <a
              href='https://synternet.com'
              target='_blank'
              className='text-blue-500 ml-1 hover:underline'>
              Synternet
            </a>
          </p>
        </div>
        <p className='text-sm font-thin '>
          Note: This only shows trades over 1 SOL
        </p>
        <div className=' w-full '>
          {pumpFunTrades.length === 0 && (
            <div className='flex justify-center mt-36'>
              <Loader />
            </div>
          )}
          <div className='flex w-full pl-14 flex-row justify-center items-center  '>
            <div className='w-full max-w-4xl mb-8'>
              <div className='flex items-center mb-3'></div>

            

              <NewTradeAnimation tradeData={pumpFunTrades} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

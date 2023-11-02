import React, { useEffect, useState } from 'react';

import './App.css';

import { ethers } from "ethers";

import abi from "./utils/WavePortal.json"

const App = () => {
  // ユーザのパブリックウォレットを保存する状態変数を定義
  const [currentAccount, setCurrentAccount] = useState("");
  console.log("currentAccount: ", currentAccount);

  const contractAddress = "0x455cF84D54FA0DfCdf8b67E4A83FF86056680fe6";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have Metamask!");
        return;
      }
      console.log("We have the ethereum object", ethereum);
  
      // ユーザのウォレットへのアクセスが許可されているか確認
      const accounts = await ethereum.request({method: "eth_accounts"});
      if (accounts.length !== 0) {
        console.log("Found an authorized account: ", accounts[0]);
        setCurrentAccount(accounts[0]);
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Ethereum object doesn't exist!");
        return;
      }
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      let count = await wavePortalContract.getTotalWaves();
      console.log("Retrieved total wave count...", count.toNumber());
      const waveTxn = await wavePortalContract.wave();
      console.log("Mining...", waveTxn.hash);
      await waveTxn.wait();
      console.log("Mined --", waveTxn.hash);
      count = await wavePortalContract.getTotalWaves();
      console.log("Retrieved total wave count...", count.toNumber());      
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          <span role="img" aria-label="hand-wave">
            👋
          </span>{" "}
          WELCOME!
        </div>
        <div className="bio">
          イーサリアムウォレットを接続して、メッセージを作成したら、
          <span role="img" aria-label="hand-wave">
            👋
          </span>
          を送ってください
          <span role="img" aria-label="shine">
            ✨
          </span>
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
        {/* Wallet Connect Button */}
        {currentAccount?
          (<button className="waveButton" onClick={connectWallet}>
            Wallet Connected
          </button>):
          (<button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>)}
      </div>
    </div>
  );
};

export default App;

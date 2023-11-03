import React, { useEffect, useState } from 'react';

import './App.css';

import { getWavePortalContract } from './utils/getWaveContract';

const App = () => {
  // ユーザのパブリックウォレットを保存する状態変数を定義
  const [currentAccount, setCurrentAccount] = useState("");
  const [messageValue, setMessageValue] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  console.log('currentAccount: ', currentAccount);

  const getAllWaves = async () => {
    const { ethereum } = window;
    try {
      if (!ethereum) {
        console.log("Ethereum object doesn't exist!");
        return;
      }
      const wavePortalContract = getWavePortalContract(false);
      const waves = await wavePortalContract.getAllWaves();
      const wavesCleaned = waves.map(wave => {
        return {
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message,
        };
      });
      setAllWaves(wavesCleaned);
    } catch (error) {
      console.error(error)
    }
  };

  useEffect(() => {
    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      const newWave = {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message
      };
      setAllWaves(prevWaves => [...prevWaves, newWave]);
    };

    if (!window.ethereum)
      return;

    const wavePortalContract = getWavePortalContract();
    wavePortalContract.on("NewWave", onNewWave);
    return () => {
      if (wavePortalContract)
        wavePortalContract.off("NewWave", onNewWave);
    };
  
  },[]);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    try {
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
        getAllWaves();
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
      const wavePortalContract = getWavePortalContract(false);
      let count = await wavePortalContract.getTotalWaves();
      console.log("Retrieved total wave count...", count.toNumber());
      const waveTxn = await wavePortalContract.wave(messageValue, {gasLimit: 300000});
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

        {/* Wallet Connect Button */}
        {currentAccount?
          (<button className="waveButton" onClick={connectWallet}>
            Wallet Connected
          </button>):
          (<button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>)}
        
        {currentAccount && (<button className="waveButton" onClick={wave}>
          Wave at Me
        </button>)}
        {currentAccount && (
          <textarea
            name="messageArea"
            placeholder="Message here!"
            type="text"
            id="message"
            value={messageValue}
            onChange={(e) => setMessageValue(e.target.value)}
          />
        )}
        {currentAccount && (
          allWaves
            .slice(0)
            .reverse()
            .map((wave, index) => {
              return (
                <div 
                  key={index} 
                  style={{
                    backgroundColor: "#F8F8FF",
                    marginTop: "16px",
                    padding: "8px",
                  }}>
                  <div>Address: {wave.address}</div>
                  <div>Time: {wave.timestamp.toString()}</div>
                  <div>Message: {wave.message}</div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
};

export default App;

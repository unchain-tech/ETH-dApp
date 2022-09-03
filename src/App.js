import React, {useEffect, useState} from "react";
// eslint-disable-next-line
import {ethers} from "ethers";
import abi from "./utils/WavePortal.json";
import './App.css';

const App = () => {
  // ユーザーのパブリックウォレットを保存するために使用する状態変数を定義
  const [currentAccount, setCurrentAccount] = useState("");
  console.log("currentAccount", currentAccount);
  // ユーザーのメッセージを保存するステート
  const [messageValue, setMessageValue] = useState("");
  // すべてのwaveを保存するステート
  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = "0x842D1097A88CD9481E58CC0e3cb8A2dfDf1cE3FB";
  const contractABI = abi.abi;

  // eslint-disable-next-line
  const getAllWaves = async () => {
    const {ethereum} = window;
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        // コントラクトからgetAllWavesメソッドを呼び出す
        const waves = await wavePortalContract.getAllWaves();
        const wavesCleaned = waves.map((wave) => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          }
        });

        // stateにデータを格納する
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves((prevState) => [
        ...prevState, {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ])
    }

    // コントラクトからNewWaveイベントが発火されたときに情報を受け取る
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      wavePortalContract.on("NewWave", onNewWave);
    }
    // メモリーリークを防ぐために、イベント解除
    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    }
  }, [contractABI]);


  // window.ethereumにアクセスできることを確認
  const checkIfWalletIsConnected = async () => {
    try {
      const {ethereum} = window;
      if (!ethereum) {
        console.log("Make sure you have Metamask.");
      } else {
        console.log("We have hte ethereum object", ethereum);
      }
      // ユーザーのウォレットへのアクセスが許可されているかどうかを確認
      const accounts = await ethereum.request({method: 'eth_accounts'});
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("found an authorized account", account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log("No Authorized account found.");
      }

    } catch (error) {
      console.error(error);
    }
  }

  const connectWallet = async () => {
    try {
      const {ethereum} = window;
      if (!ethereum) {
        alert("Get Metamask!");

      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  }

  const wave = async () => {
    try {
      const {ethereum} = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        console.log("signer", signer);
        // コントラクトにwaveを書き込む
        const waveTxn = await wavePortalContract.wave(messageValue, {
          gasLimit: 300000, // ガス代上限（これ以上になったら処理を中断して、さらに送金手数料が発生するのを防ぐ
        });
        console.log("Mining...", waveTxn.hash);
        await waveTxn.wait();
        console.log("Mining -- ", waveTxn.hash);
        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        // wave書き込み終了
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Webページがロードされたときに下記の関数を実行する
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          <span role="img" aria-label="hand-wave">👋</span> WELCOME!
        </div>

        <div className="bio">
          イーサリアムウォレットを接続して、メッセージを作成したら、
          <span role="img" aria-label="hand-wave">👋</span>
          を送ってください
          <span role="img" aria-label="shine">✨</span>
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        {currentAccount && (
          <textarea
            name="messageArea"
            placeholder="メッセージはこちら"
            type="text"
            id="message"
            value={messageValue}
            onChange={(e) => setMessageValue(e.target.value)}
          />
        )}
        {currentAccount &&
          allWaves
            .slice(0)
            .reverse()
            .map((wave, i) => {
              return (
                <div key={i}
                     style={{
                       backgroundColor: "#F8F8Ff",
                       marginTop: "16px",
                       padding: "8px",
                     }}
                >
                  <div>Address: {wave.address}</div>
                  <div>Time: {wave.timestamp.toString()}</div>
                  <div>Message: {wave.message}</div>
                </div>
              )
            })
        }
      </div>
    </div>
  );
};

export default App;

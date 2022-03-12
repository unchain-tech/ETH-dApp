import React, { useEffect, useState } from "react";
import "./App.css";
/* ethers 変数を使えるようにする*/
import { ethers } from "ethers";
/* ABIファイルを含むWavePortal.jsonファイルをインポートする*/
import abi from "./utils/WavePortal.json";
const App = () => {
  /*
  * ユーザーのパブリックウォレットを保存するために使用する状態変数を定義します。
  */
  const [currentAccount, setCurrentAccount] = useState("");
  console.log("currentAccount: ", currentAccount);
  /**
  * デプロイされたコントラクトのアドレスを保持する変数を作成
  */
  const contractAddress = "0x384B51056d43Cfa004aa3Bf39d09FeE44f47674F";
   /**
  * ABIの内容を参照する変数を作成
  */
  const contractABI = abi.abi;

  const getAllWaves = async () => {
    const { ethereum } = window;
  
    try {
      if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      /* コントラクトからgetAllWavesメソッドを呼び出す */
      const waves = await wavePortalContract.getAllWaves();
      /* UIに必要なのは、アドレス、タイムスタンプ、メッセージだけなので、以下のように設定 */
      const wavesCleaned = waves.map(wave => {
        return {
        address: wave.waver,
        timestamp: new Date(wave.timestamp * 1000),
        message: wave.message,
        };
      });
  
      /* React Stateにデータを格納する */
      setAllWaves(wavesCleaned);
      } else {
      console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  /**
   * `emit`されたイベントに反応する
   */
  useEffect(() => {
    let wavePortalContract;
  
    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
      ]);
    };
  
    /* NewWaveイベントがコントラクトから発信されたときに、情報をを受け取ります */
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave);
    }
    /*メモリリークを防ぐために、NewWaveのイベントを解除します*/
    return () => {
      if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);

  /*
  * window.ethereumにアクセスできることを確認します。
  */
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      /*
      * ユーザーのウォレットへのアクセスが許可されているかどうかを確認します。
      */
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }
  /*
  * connectWalletメソッドを実装
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }
  /*
  * waveの回数をカウントする関数を実装
  */
  const wave = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        /*
        * ABIを参照
        */
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        /*
        * コントラクトに👋（wave）を書き込む。
        */
        const waveTxn = await wavePortalContract.wave();
        console.log("Mining...", waveTxn.hash);
        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);
        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  /*
  * WEBページがロードされたときに下記の関数を実行します。
  */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        <span role="img" aria-label="hand-wave">👋</span> WELCOME!
        </div>
        <div className="bio">
          イーサリアムウォレットを接続して、「<span role="img" aria-label="hand-wave">👋</span>(wave)」を送ってください<span role="img" aria-label="shine">✨</span>
        </div>
        {/*
        * waveボタンにwave関数を連動させる。
        */}
        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
        {/*
        * ウォレットコネクトのボタンを実装
        */}
        {!currentAccount && (
        <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
        </button>
        )}
        {currentAccount && (
        <button className="waveButton" onClick={connectWallet}>
            Wallet Connected
        </button>
        )}
      </div>
    </div>
  );
}
export default App
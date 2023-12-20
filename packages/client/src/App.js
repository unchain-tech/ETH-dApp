/* ethers 変数を使えるようにする*/
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';

import './App.css';

/* ABIファイルを含むWavePortal.jsonファイルをインポートする*/
import abi from './utils/WavePortal.json';

const App = () => {
  /* ユーザーのパブリックウォレットを保存するために使用する状態変数を定義 */
  const [currentAccount, setCurrentAccount] = useState('');
  /* ユーザーのメッセージを保存するために使用する状態変数を定義 */
  const [messageValue, setMessageValue] = useState('');
  /* すべてのwavesを保存する状態変数を定義 */
  const [allWaves, setAllWaves] = useState([]);
  console.log('currentAccount: ', currentAccount);
  /* デプロイされたコントラクトのアドレスを保持する変数を作成 */
  const contractAddress = '0x96ceBe089e65c243C150D6086c3BD91C8fF5606D';
  /* コントラクトからすべてのwavesを取得するメソッドを作成 */
  /* ABIの内容を参照する変数を作成 */
  const contractABI = abi.abi;

  const getAllWaves = async () => {
    const { ethereum } = window;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        /* コントラクトからgetAllWavesメソッドを呼び出す */
        const waves = await wavePortalContract.getAllWaves();

        const wavesCleaned = waves.map((wave) => {
          return {
            waver: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
            won: wave.seed <= 50,
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
   * `emit`されたイベントをフロントエンドに反映させる
   */
  useEffect(() => {
    let wavePortalContract;

    const onNewWave = async (from, timestamp, message) => {
      console.log('NewWave', from, timestamp, message);
      await getAllWaves();
    };

    /* NewWaveイベントがコントラクトから発信されたときに、情報をを受け取ります */
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      wavePortalContract.on('NewWave', onNewWave);
    }
    /*メモリリークを防ぐために、NewWaveのイベントを解除します*/
    return () => {
      if (wavePortalContract) {
        wavePortalContract.off('NewWave', onNewWave);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* window.ethereumにアクセスできることを確認する関数を実装 */
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log('Make sure you have MetaMask!');
        return;
      } else {
        console.log('We have the ethereum object', ethereum);
      }
      /* ユーザーのウォレットへのアクセスが許可されているかどうかを確認 */
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account:', account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log('No authorized account found');
      }
    } catch (error) {
      console.log(error);
    }
  };

  /* connectWalletメソッドを実装 */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      console.log('Connected: ', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  /* waveの回数をカウントする関数を実装 */
  const wave = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        /* ABIを参照 */
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        let count = await wavePortalContract.getTotalWaves();
        console.log('Retrieved total wave count...', count.toNumber());
        const contractBalance = await provider.getBalance(wavePortalContract.address);
        console.log('Contract balance:', ethers.utils.formatEther(contractBalance));
        /* コントラクトに👋（wave）を書き込む */
        const waveTxn = await wavePortalContract.wave(messageValue, {
          gasLimit: 300000,
        });
        console.log('Mining...', waveTxn.hash);
        await waveTxn.wait();
        console.log('Mined -- ', waveTxn.hash);
        count = await wavePortalContract.getTotalWaves();
        console.log('Retrieved total wave count...', count.toNumber());
        const contractBalancePost = await provider.getBalance(
          wavePortalContract.address
        );
        /* コントラクトの残高が減っていることを確認 */
        if (contractBalancePost.lt(contractBalance)) {
          /* 減っていたら下記を出力 */
          console.log('User won ETH!');
        } else {
          console.log("User didn't win ETH.");
        }
        console.log(
          'Contract balance after wave:',
          ethers.utils.formatEther(contractBalancePost)
        );        
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /* WEBページがロードされたときにcheckIfWalletIsConnected()を実行 */
  useEffect(() => {
    checkIfWalletIsConnected();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          <span role="img" aria-label="hand-wave">
            👋
          </span>{' '}
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
        <div className='total'>totalWaves={allWaves.length}</div>
        <br />
        {/* ウォレットコネクトのボタンを実装 */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        {currentAccount && (
          <button className="waveButton">Wallet Connected</button>
        )}
        {/* waveボタンにwave関数を連動 */}
        {currentAccount && (
          <button className="waveButton" onClick={wave}>
            Wave at Me
          </button>
        )}
        {/* メッセージボックスを実装*/}
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
        {/* 履歴を表示する */}
        {currentAccount &&
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
                  }}
                >
                  <div>Address: <a href={`https://sepolia.etherscan.io/address/${wave.waver}`}>{wave.waver}</a></div>
                  <div>Time: {wave.timestamp.toString()}</div>
                  <div>Message: {wave.message}</div>
                  {wave.won && <div>won!!!</div>}
                </div>
              );
            })}
      </div>
    </div>
  );
};

export default App;
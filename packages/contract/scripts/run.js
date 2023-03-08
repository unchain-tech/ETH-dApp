const hre = require('hardhat');
const main = async () => {
  const waveContractFactory = await hre.ethers.getContractFactory('WavePortal');
  /*
   * デプロイする際0.1ETHをコントラクトに提供する
   */
  const waveContract = await waveContractFactory.deploy({
    value: hre.ethers.utils.parseEther('0.1'),
  });
  await waveContract.deployed();
  console.log('Contract deployed to: ', waveContract.address);

  /*
   * コントラクトの残高を取得（0.1ETH）であることを確認
   */
  let contractBalance = await hre.ethers.provider.getBalance(
    waveContract.address,
  );
  console.log(
    'Contract balance:',
    hre.ethers.utils.formatEther(contractBalance),
  );

  /*
   * 2回 waves を送るシミュレーションを行う
   */
  const waveTxn = await waveContract.wave('This is wave #1');
  await waveTxn.wait();

  const waveTxn2 = await waveContract.wave('This is wave #2');
  await waveTxn2.wait();

  /*
   * コントラクトの残高を取得し、Waveを取得した後の結果を出力
   */
  contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
  /*
   *コントラクトの残高から0.0001ETH引かれていることを確認
   */
  console.log(
    'Contract balance:',
    hre.ethers.utils.formatEther(contractBalance),
  );

  const allWaves = await waveContract.getAllWaves();
  console.log(allWaves);
};

const runMain = async () => {
  try {
    await main();
  } catch (error) {
    console.log(error);
    throw new Error('there is error!');
  }
};

runMain();

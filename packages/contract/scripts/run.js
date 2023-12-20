const main = async () => {
  const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
  /*
   * 0.1ETHをコントラクトに提供してデプロイする
   */
  const waveContract = await waveContractFactory.deploy({
    value: hre.ethers.utils.parseEther("0.1"),
  });
  await waveContract.deployed();
  console.log("Contract deployed to:", waveContract.address);

  /*
   * コントラクトの残高を取得し、結果を出力（0.1ETHであることを確認）
   */
  let contractBalance = await hre.ethers.provider.getBalance(
    waveContract.address
  );
  console.log(
    "Contract balance:",
    hre.ethers.utils.formatEther(contractBalance)
  );

  /*
   * Waveし、トランザクションが完了するまで待機
   */
  let waveTxn = await waveContract.wave("A message!");
  await waveTxn.wait();

  /*
   * Waveした後のコントラクトの残高を取得し、結果を出力（0.0001ETH引かれていることを確認）
   */
  contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
  console.log(
    "Contract balance:",
    hre.ethers.utils.formatEther(contractBalance)
  );

  let allWaves = await waveContract.getAllWaves();
  console.log(allWaves);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
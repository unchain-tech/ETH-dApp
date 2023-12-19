const main = async () => {
  const [deployer] = await hre.ethers.getSigners();
  const accountBalance = await deployer.getBalance();
  const waveContractFactory = await hre.ethers.getContractFactory('WavePortal');
  /* コントラクトに資金を提供できるようにする */
  const waveContract = await waveContractFactory.deploy({
    value: hre.ethers.utils.parseEther("0.001"),
  });
  const wavePortal = await waveContract.deployed()

  console.log('Deploying contracts with account: ', deployer.address);
  console.log('Account balance: ', accountBalance.toString());
  console.log('Contract deployed to: ', wavePortal.address);
  console.log('Contract deployed by: ', deployer.address);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();
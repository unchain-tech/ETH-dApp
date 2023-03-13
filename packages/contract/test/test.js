const hre = require('hardhat');
const { expect } = require('chai');

describe('Wave Contract', function () {
  it('test if wave and token are sent', async function () {
    const waveContractFactory = await hre.ethers.getContractFactory(
      'WavePortal',
    );
    /*
     * デプロイする際0.1ETHをコントラクトに提供する
     */
    const waveContract = await waveContractFactory.deploy({
      value: hre.ethers.utils.parseEther('0.1'),
    });
    await waveContract.deployed();
    /*
     * コントラクトの残高を取得（0.1ETH）
     */
    const contractBalanceBefore = hre.ethers.utils.formatEther(
      await hre.ethers.provider.getBalance(waveContract.address),
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
    const contractBalanceAfter = hre.ethers.utils.formatEther(
      await hre.ethers.provider.getBalance(waveContract.address),
    );

    /*
     *勝利した回数に応じてコントラクトから出ていくトークンを計算
     */
    const allWaves = await waveContract.getAllWaves();
    let cost = 0;
    for (let i = 0; i < allWaves.length; i++) {
      if (allWaves[i].seed <= 50) {
        cost += 0.0001;
      }
    }

    /*
     *メッセージの送信をテスト
     */
    expect(allWaves[0].message).to.equal('This is wave #1');
    expect(allWaves[1].message).to.equal('This is wave #2');

    /*
     *コントラクトのトークン残高がwave時の勝負による減少に連動しているかテスト
     */
    expect(parseFloat(contractBalanceAfter)).to.equal(
      contractBalanceBefore - cost,
    );
  });
});

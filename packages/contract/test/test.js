const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const hre = require('hardhat');
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('WavePortal', function () {
  // すべてのテストで同じセットアップを再利用するためにフィクスチャーを定義します。
  async function deployProjectFixture() {
    const wavePortalFactory = await ethers.getContractFactory('WavePortal');

    // コントラクトは、デフォルトで最初の署名者/アカウント（ここではuser1）を使用してデプロイされます。
    const [user1, user2] = await ethers.getSigners();

    const wavePortal = await wavePortalFactory.deploy({
      value: hre.ethers.utils.parseEther('0.1'),
    });

    await wavePortal.deployed();

    // 現在のコントラクトの残高を取得します。
    const wavePortalBalance = hre.ethers.utils.formatEther(
      await hre.ethers.provider.getBalance(wavePortal.address),
    );

    // waveを2回実行する関数を定義します。
    const sendTwoWaves = async () => {
      // user1, user2がそれぞれwaveを送ります。
      await wavePortal.connect(user1).wave('This is wave #1');
      await wavePortal.connect(user2).wave('This is wave #2');
    };

    return { wavePortal, wavePortalBalance, sendTwoWaves, user1, user2 };
  }

  // テストケース
  describe('getTotalWaves', function () {
    it('should return total waves', async function () {
      /** 準備 */
      const { wavePortal, sendTwoWaves } = await loadFixture(
        deployProjectFixture,
      );
      await sendTwoWaves();

      /** 実行 */
      const totalWaves = await wavePortal.getTotalWaves();

      /** 検証 */
      expect(totalWaves).to.equal(2);
    });
  });

  describe('getAllWaves', function () {
    it('should return all waves', async function () {
      /** 準備 */
      const { wavePortal, sendTwoWaves, user1, user2 } = await loadFixture(
        deployProjectFixture,
      );
      await sendTwoWaves();

      /** 実行 */
      const allWaves = await wavePortal.getAllWaves();

      /** 検証 */
      expect(allWaves[0].waver).to.equal(user1.address);
      expect(allWaves[0].message).to.equal('This is wave #1');
      expect(allWaves[1].waver).to.equal(user2.address);
      expect(allWaves[1].message).to.equal('This is wave #2');
    });
  });

  describe('wave', function () {
    context('when user waved', function () {
      it('should send tokens at random.', async function () {
        /** 準備 */
        const { wavePortal, wavePortalBalance, sendTwoWaves } =
          await loadFixture(deployProjectFixture);

        /** 実行 */
        await sendTwoWaves();

        /** 検証 */
        // wave後のコントラクトの残高を取得します。
        const wavePortalBalanceAfter = hre.ethers.utils.formatEther(
          await hre.ethers.provider.getBalance(wavePortal.address),
        );

        // 勝利した回数に応じてコントラクトから出ていくトークンを計算します。
        const allWaves = await wavePortal.getAllWaves();
        let cost = 0;
        for (let i = 0; i < allWaves.length; i++) {
          if (allWaves[i].seed <= 50) {
            cost += 0.0001;
          }
        }

        // コントラクトのトークン残高がwave時の勝負による減少に連動しているかテストします。
        expect(parseFloat(wavePortalBalanceAfter)).to.equal(
          wavePortalBalance - cost,
        );
      });
    });
    context(
      'when user1 tried to resubmit without waiting 15 mitutes',
      function () {
        it('reverts', async function () {
          /** 準備 */
          const { wavePortal, user1 } = await loadFixture(deployProjectFixture);

          /** 実行 */
          await wavePortal.connect(user1).wave('This is wave #1');

          /** 検証 */
          await expect(
            wavePortal.connect(user1).wave('This is wave #2'),
          ).to.be.revertedWith('Wait 15m');
        });
      },
    );
  });
});
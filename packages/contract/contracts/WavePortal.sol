// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import 'hardhat/console.sol';

contract WavePortal {
  uint256 private _totalWaves;
  uint256 private _seed;

  event NewWave(address indexed from, uint256 timestamp, string message);

  struct Wave {
    address waver;
    string message;
    uint256 timestamp;
  }

  Wave[] private _waves;

  /*
   * "address => uint mapping"は、アドレスと数値を関連付ける
   */
  mapping(address => uint256) public lastWavedAt;

  constructor() payable {
    console.log('We have been constructed!');
    /*
     * 初期シードの設定
     */
    _seed = (block.timestamp + block.difficulty) % 100;
  }

  function wave(string memory _message) public {
    /*
     * 現在ユーザーがwaveを送信している時刻と、前回waveを送信した時刻が15分以上離れていることを確認。
     */
    require(lastWavedAt[msg.sender] + 0 minutes < block.timestamp, 'Wait 15m');

    /*
     * ユーザーの現在のタイムスタンプを更新する
     */
    lastWavedAt[msg.sender] = block.timestamp;

    _totalWaves += 1;
    console.log('%s has waved!', msg.sender);

    _waves.push(Wave(msg.sender, _message, block.timestamp));

    /*
     *  ユーザーのために乱数を設定
     */
    _seed = (block.difficulty + block.timestamp + _seed) % 100;

    if (_seed <= 50) {
      console.log('%s won!', msg.sender);

      uint256 prizeAmount = 0.0001 ether;
      require(
        prizeAmount <= address(this).balance,
        'Trying to withdraw more money than they contract has.'
      );
      (bool success, ) = (msg.sender).call{value: prizeAmount}('');
      require(success, 'Failed to withdraw money from contract.');
    }

    emit NewWave(msg.sender, block.timestamp, _message);
  }

  function getAllWaves() public view returns (Wave[] memory) {
    return _waves;
  }

  function get_TotalWaves() public view returns (uint256) {
    return _totalWaves;
  }
}

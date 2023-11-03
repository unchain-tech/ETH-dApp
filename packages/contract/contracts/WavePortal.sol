// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "hardhat/console.sol";

contract WavePortal {

    uint256 private _totalWaves;

    event NewWave(address indexed from, uint256 timestamp, string message);
    
    struct Wave {
        address waver;
        string message;
        uint256 timestamp;
    }
    
    Wave[] private _waves;

    constructor() payable {
        console.log("WavePortal - Smart Contract!");
    }

    function wave(string memory _message) public {
        _totalWaves += 1;
        console.log("%s waved w/ message %s", msg.sender, _message);
        _waves.push(Wave(msg.sender, _message, block.timestamp));
        // コントラクト側でemitされたイベントに関する通知をフロントエンドで取得できるようにする
        emit NewWave(msg.sender, block.timestamp, _message);
        // waveを実行したユーザに0.0001ETH送る
        uint256 prizeAmount = 0.0001 ether;
        require(
            prizeAmount <= address(this).balance,
            "Trying to withdraw mone money than the contract has."
        );

        (bool success, ) = (msg.sender).call{value: prizeAmount}("");
        require(success, "Failed to withdraw money from contract.");
    }

    function getAllWaves() public view returns (Wave[] memory) {
        return _waves;
    }

    function getTotalWaves() public view returns (uint256) {
        console.log("we have %d total waves!", _totalWaves);
        return _totalWaves;
    }
}

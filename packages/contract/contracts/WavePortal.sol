// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "hardhat/console.sol";

contract WavePortal {

    uint256 private _totalWaves;

    constructor() {
        console.log("Here is my first smart contract!");
    }

    function wave() public {
        _totalWaves += 1;
        console.log("%s has waved!", msg.sender);
    }

    function getTotalWaves() public view returns (uint256) {
        console.log("we have %d total waves!", _totalWaves);
        return _totalWaves;
    }
}

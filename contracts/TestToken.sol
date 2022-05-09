// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestToken is ERC20, Ownable {
    constructor() ERC20("TestToken", "TT") {
      _mint(msg.sender, 1_000_000);
    }

    function mint(address to, uint amount) external onlyOwner {
      _mint(to, amount);
    }
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// The token (test version)
contract TestToken is ERC20, Ownable {
    uint8 private immutable decimals_;

    constructor(string memory name, string memory symbol, uint8 _decimals) ERC20(name, symbol) {
        decimals_ = _decimals;
        _mint(msg.sender, 1_000_000);
    }

    function mint(address to, uint256 amount) external onlyOwner returns (bool) {
        _mint(to, amount);
        return true;
    }

    function decimals() public view override returns (uint8) {
        return decimals_;
    }
}

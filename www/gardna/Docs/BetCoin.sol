// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BetCoin is ERC20 {

    address private _owner;
    address private _pool;
    uint256 private _minHold;

    constructor(address pool) 
        ERC20(
            "BetCoin", 
            "BET"
        ) {
        
        require( msg.sender != pool , "The pool and the owner must be separate wallets.");
        uint256 initialSupply = addDecimals(100000000); //100 Milions
        _minHold = addDecimals(1); //Min 1 Token
        _owner = msg.sender;
        _pool = pool;
        _mint(_owner, initialSupply);
                                                                                                                                                                                                        
    }

    /**
     * Buy tokens
     */
    function buyCredit(uint256 amount) public payable {
        amount = addDecimals(amount);
        require( amount > 0 , "Amount Invalid!" );
        require( balanceOf(msg.sender) >= amount, "Insufficient Hold Balance");
        _transfer(msg.sender, _pool ,amount);
    }

    /**
     * Sell tokens
     */
    function sellCredit(address player, uint256 amount) public payable {
        amount = addDecimals(amount);
        require( _pool == msg.sender , "Account Invalid!");
        require( (amount > 0 && amount <= ( (balanceOf(_pool) * 90) /100 )) , "Amount Invalid!");
        require( balanceOf(player) >= _minHold, "Insufficient Hold Balance");
        _transfer(_pool,player,amount);
    }

    /**
     * Return Address of Owner
     */
    function getAddressOwner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * Return Address of pool
     */
    function getAddressPool() public view virtual returns (address) {
        return _pool;
    }

    /**
     * Return min hold tokens
     */
    function getMinHoldTokens() public view virtual returns (uint256) {
        return _minHold;
    }

    /**
     * Set min hold tokens, Max 100
     */
    function setMinHoldTokens(uint256 minHold) public {
        require( msg.sender == _owner , "Only Owner!");
        require( (minHold > 0 && minHold < 100) , "Hold invalid!");
        _minHold = addDecimals(minHold);
    }

    /**
     * Add 18 Zeros
     */
    function addDecimals(uint256 number) private view returns (uint256) {
        return number * 10**uint256(decimals());
    }

}
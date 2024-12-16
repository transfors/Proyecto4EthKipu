// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleDEX is Ownable {
    /// Token A in the liquidity pool
    IERC20 public tokenA;

    /// Token B in the liquidity pool
    IERC20 public tokenB;

    /// Emitted when liquidity is added
    /// amountA The amount of token A added
    /// amountB The amount of token B added
    event LiquidityAdded(uint256 amountA, uint256 amountB);

    /// Emitted when liquidity is removed
    /// amountA The amount of token A removed
    /// amountB The amount of token B removed
    event LiquidityRemoved(uint256 amountA, uint256 amountB);

    /// Emitted when a token swap occurs
    /// user The address of the user performing the swap
    /// amountIn The input token amount
    /// amountOut The output token amount
    event TokenSwapped(address indexed user, uint256 amountIn, uint256 amountOut);

    /// Initializes the DEX with two tokens
    /// _tokenA Address of token A
    /// _tokenB Address of token B
    constructor(address _tokenA, address _tokenB) Ownable(msg.sender) {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    /// Adds liquidity to the pool
    /// Only callable by the owner
    /// amountA The amount of token A to add
    /// amountB The amount of token B to add
    function addLiquidity(uint256 amountA, uint256 amountB) external onlyOwner {
        require(amountA > 0 && amountB > 0, "Amounts must be > 0");
        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);

        emit LiquidityAdded(amountA, amountB);
    }

    /// Removes liquidity from the pool
    /// Only callable by the owner
    /// amountA The amount of token A to remove
    /// amountB The amount of token B to remove
    function removeLiquidity(uint256 amountA, uint256 amountB) external onlyOwner {
        require(amountA <= tokenA.balanceOf(address(this)) && amountB <= tokenB.balanceOf(address(this)), "Low liquidity");

        tokenA.transfer(msg.sender, amountA);
        tokenB.transfer(msg.sender, amountB);

        emit LiquidityRemoved(amountA, amountB);
    }

    /// Swaps token A for token B
    /// amountAIn The amount of token A to swap
    function swapAforB(uint256 amountAIn) external {
        require(amountAIn > 0, "Amount must be > 0");

        uint256 amountBOut = getAmountOut(amountAIn, tokenA.balanceOf(address(this)), tokenB.balanceOf(address(this)));

        tokenA.transferFrom(msg.sender, address(this), amountAIn);
        tokenB.transfer(msg.sender, amountBOut);

        emit TokenSwapped(msg.sender, amountAIn, amountBOut);
    }

    /// Swaps token B for token A
    /// amountBIn The amount of token B to swap
    function swapBforA(uint256 amountBIn) external {
        require(amountBIn > 0, "Amount must be > 0");

        uint256 amountAOut = getAmountOut(amountBIn, tokenB.balanceOf(address(this)), tokenA.balanceOf(address(this)));

        tokenB.transferFrom(msg.sender, address(this), amountBIn);
        tokenA.transfer(msg.sender, amountAOut);

        emit TokenSwapped(msg.sender, amountBIn, amountAOut);
    }

    /// Gets the price of a token relative to the other
    /// _token Address of the token to price
    /// The price in terms of the other token
    function getPrice(address _token) external view returns (uint256) {
        require(_token == address(tokenA) || _token == address(tokenB), "Invalid token");

        return _token == address(tokenA)
            ? (tokenB.balanceOf(address(this)) * 1e18) / tokenA.balanceOf(address(this))
            : (tokenA.balanceOf(address(this)) * 1e18) / tokenB.balanceOf(address(this));
    }

    /// Calculates the output amount of a swap
    /// Implements constant product formula
    /// amountIn The input token amount
    /// reserveIn The reserve of the input token
    /// reserveOut The reserve of the output token
    /// The amount of output tokens
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) private pure returns (uint256) {
        return (amountIn * reserveOut) / (reserveIn + amountIn);
    }
}
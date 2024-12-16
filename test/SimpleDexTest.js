const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleDEX Tests", function () {
  let tokenA, tokenB, simpleDex;
  let owner, addr1, addr2;

  const amountToAddLiquidity = ethers.parseUnits("0.05", 18);  
  const amountToRemoveLiquidityA = ethers.parseUnits("0.02", 18);
  const amountToRemoveLiquidityB = ethers.parseUnits("0.02", 18);
  const amountToSwapAforB = ethers.parseUnits("0.01", 18);
  const amountToSwapBforA = ethers.parseUnits("0.02", 18);

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Desplegar los contratos TokenA y TokenB
    const TokenA = await ethers.getContractFactory("TokenA");
    tokenA = await TokenA.deploy();
    console.log("TokenA deployed at:", tokenA.address);

    const TokenB = await ethers.getContractFactory("TokenB");
    tokenB = await TokenB.deploy();
    console.log("TokenB deployed at:", tokenB.address);

    // Desplegar el contrato SimpleDEX
    const SimpleDex = await ethers.getContractFactory("SimpleDEX");
    simpleDex = await SimpleDex.deploy(tokenA.address, tokenB.address);
    console.log("SimpleDEX deployed at:", simpleDex.address);

    // Minter para cada token
    await tokenA.mint(owner.address, ethers.parseUnits("100", 18));
    await tokenB.mint(owner.address, ethers.parseUnits("100", 18));

    await tokenA.mint(addr1.address, ethers.parseUnits("100", 18));
    await tokenB.mint(addr1.address, ethers.parseUnits("100", 18));

    await tokenA.mint(addr2.address, ethers.parseUnits("100", 18));
    await tokenB.mint(addr2.address, ethers.parseUnits("100", 18));
  });

  it("Should add liquidity to the pool", async function () {
    // Aprobamos los tokens para que el DEX pueda transferir
    await tokenA.connect(owner).approve(simpleDex.address, amountToAddLiquidity);
    await tokenB.connect(owner).approve(simpleDex.address, amountToAddLiquidity);

    // Agregamos liquidez
    await simpleDex.connect(owner).addLiquidity(amountToAddLiquidity, amountToAddLiquidity);

    // Verificamos los balances del DEX
    const tokenABalance = await tokenA.balanceOf(simpleDex.address);
    const tokenBBalance = await tokenB.balanceOf(simpleDex.address);

    expect(tokenABalance).to.equal(amountToAddLiquidity);
    expect(tokenBBalance).to.equal(amountToAddLiquidity);
  });

  it("Should remove liquidity from the pool", async function () {
    // Agregar liquidez primero
    await tokenA.connect(owner).approve(simpleDex.address, amountToAddLiquidity);
    await tokenB.connect(owner).approve(simpleDex.address, amountToAddLiquidity);
    await simpleDex.connect(owner).addLiquidity(amountToAddLiquidity, amountToAddLiquidity);

    // Retirar liquidez
    await simpleDex.connect(owner).removeLiquidity(amountToRemoveLiquidityA, amountToRemoveLiquidityB);

    const tokenABalance = await tokenA.balanceOf(owner.address);
    const tokenBBalance = await tokenB.balanceOf(owner.address);

    expect(tokenABalance).to.be.above(0);
    expect(tokenBBalance).to.be.above(0);
  });

  it("Should swap TokenA for TokenB", async function () {
    // Agregar liquidez primero
    await tokenA.connect(owner).approve(simpleDex.address, amountToAddLiquidity);
    await tokenB.connect(owner).approve(simpleDex.address, amountToAddLiquidity);
    await simpleDex.connect(owner).addLiquidity(amountToAddLiquidity, amountToAddLiquidity);

    // Aprobamos el swap por addr1
    await tokenA.connect(addr1).approve(simpleDex.address, amountToSwapAforB);

    // Realizamos el intercambio de TokenA por TokenB
    await simpleDex.connect(addr1).swapAforB(amountToSwapAforB);

    // Verificamos los balances después del swap
    const tokenABalanceAddr1 = await tokenA.balanceOf(addr1.address);
    const tokenBBalanceAddr1 = await tokenB.balanceOf(addr1.address);

    expect(tokenABalanceAddr1).to.be.below(ethers.parseUnits("100", 18));
    expect(tokenBBalanceAddr1).to.be.above(0);
  });

  it("Should swap TokenB for TokenA", async function () {
    // Agregar liquidez primero
    await tokenA.connect(owner).approve(simpleDex.address, amountToAddLiquidity);
    await tokenB.connect(owner).approve(simpleDex.address, amountToAddLiquidity);
    await simpleDex.connect(owner).addLiquidity(amountToAddLiquidity, amountToAddLiquidity);

    // Aprobamos el swap por addr2
    await tokenB.connect(addr2).approve(simpleDex.address, amountToSwapBforA);

    // Realizamos el intercambio de TokenB por TokenA
    await simpleDex.connect(addr2).swapBforA(amountToSwapBforA);

    // Verificamos los balances después del swap
    const tokenABalanceAddr2 = await tokenA.balanceOf(addr2.address);
    const tokenBBalanceAddr2 = await tokenB.balanceOf(addr2.address);

    expect(tokenABalanceAddr2).to.be.above(0);
    expect(tokenBBalanceAddr2).to.be.below(ethers.parseUnits("100", 18));
  });

  it("Should get the price of TokenA and TokenB", async function () {
    // Agregar liquidez primero
    await tokenA.connect(owner).approve(simpleDex.address, amountToAddLiquidity);
    await tokenB.connect(owner).approve(simpleDex.address, amountToAddLiquidity);
    await simpleDex.connect(owner).addLiquidity(amountToAddLiquidity, amountToAddLiquidity);

    // Obtener los precios de TokenA y TokenB
    const priceTokenA = await simpleDex.getPrice(tokenA.address);
    const priceTokenB = await simpleDex.getPrice(tokenB.address);

    console.log(`Precio de TokenA en términos de TokenB: ${ethers.formatUnits(priceTokenA, 18)}`);
    console.log(`Precio de TokenB en términos de TokenA: ${ethers.formatUnits(priceTokenB, 18)}`);

    // Verificamos que el precio no sea cero
    expect(priceTokenA).to.be.above(0);
    expect(priceTokenB).to.be.above(0);
  });
});

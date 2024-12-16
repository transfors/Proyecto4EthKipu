const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Usando la cuenta:", deployer.address);

  const tokenAAddress = "0xCA46873ABFF4585853Fca46cE41d0B1524A4e999";
  const tokenBAddress = "0x7dD669FDb0767Bb7095F839129C36A00509c7B29";
  const simpleDEXAddress = "0x3b703acF01bA2f566873D3bB6481abCC7c980A60";

  // Enlazar contratos
  const TokenA = await ethers.getContractFactory("TokenA");
  const tokenA = TokenA.attach(tokenAAddress);

  const TokenB = await ethers.getContractFactory("TokenB");
  const tokenB = TokenB.attach(tokenBAddress);

  const SimpleDex = await ethers.getContractFactory("SimpleDEX");
  const simpleDex = SimpleDex.attach(simpleDEXAddress);

  console.log("Contratos enlazados correctamente");
  
  // Cantidades a usar
  const amountToAddLiquidity = ethers.parseUnits("0.05", 18);  
  const amountToRemoveLiquidityA = ethers.parseUnits("0.02", 18);
  const amountToRemoveLiquidityB = ethers.parseUnits("0.02", 18);
  const amountToSwapAforB = ethers.parseUnits("0.01", 18);
  const amountToSwapBforA = ethers.parseUnits("0.02", 18);

   // 1. Agregar liquidez al SimpleDEX ---
   console.log("\n 1. Agregar liquidez al SimpleDEX");
   await tokenA.approve(simpleDEXAddress, amountToAddLiquidity);
   await tokenB.approve(simpleDEXAddress, amountToAddLiquidity);
 
   console.log("Tokens aprobados para agregar liquidez.");
   await simpleDex.addLiquidity(amountToAddLiquidity, amountToAddLiquidity);
   console.log("Liquidez añadida correctamente al DEX.");

  // 2. Retirar liquidez del SimpleDEX ---
  console.log("\n 2. Retirar liquidez del SimpleDEX");
  await simpleDex.removeLiquidity(amountToRemoveLiquidityA, amountToRemoveLiquidityB);
  console.log(`Retirada de liquidez: ${ethers.formatUnits(amountToRemoveLiquidityA, 18)} TokenA y ${ethers.formatUnits(amountToRemoveLiquidityB, 18)} TokenB.`);

  // 3. Intercambiar TokenA por TokenB)
  console.log("\n 3. Intercambiar TokenA por TokenB");
  console.log("Aprobando TokenA para swap...");
  await tokenA.approve(simpleDEXAddress, amountToSwapAforB);

  console.log(`Intercambiando ${ethers.formatUnits(amountToSwapAforB, 18)} TokenA por TokenB...`);
  await simpleDex.swapAforB(amountToSwapAforB);
  console.log("Intercambio completado.");
 
  // 4. Intercambiar TokenB por TokenA
  console.log("\n 4. Intercambiar TokenB por TokenA");
  await tokenB.approve(simpleDEXAddress, amountToSwapBforA);
  console.log(`Intercambiando ${ethers.formatUnits(amountToSwapBforA, 18)} TokenB por TokenA...`);
  await simpleDex.swapBforA(amountToSwapBforA);
  console.log("Intercambio completado: TokenB por TokenA.");

  // 5. Obtener precios de TokenA y TokenB
  console.log("\n 5. Obtener precios de los tokens");
  const priceTokenA = await simpleDex.getPrice(tokenAAddress);
  const priceTokenB = await simpleDex.getPrice(tokenBAddress);

  console.log(`Precio de TokenA en términos de TokenB: ${ethers.formatUnits(priceTokenA, 18)}`);
  console.log(`Precio de TokenB en términos de TokenA: ${ethers.formatUnits(priceTokenB, 18)}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error en el script:", error);
    process.exit(1);
  });
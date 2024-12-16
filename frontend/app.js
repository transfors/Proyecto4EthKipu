const provider = new ethers.BrowserProvider(window.ethereum);
let signer;

const tokenAAddress = "0xCA46873ABFF4585853Fca46cE41d0B1524A4e999";
const tokenBAddress = "0x7dD669FDb0767Bb7095F839129C36A00509c7B29";
const simpleDEXAddress = "0x3b703acF01bA2f566873D3bB6481abCC7c980A60";

const simpleDEXABI = [{"inputs":[{"internalType":"address","name":"_tokenA","type":"address"},{"internalType":"address","name":"_tokenB","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amountA","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amountB","type":"uint256"}],"name":"LiquidityAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amountA","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amountB","type":"uint256"}],"name":"LiquidityRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amountIn","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amountOut","type":"uint256"}],"name":"TokenSwapped","type":"event"},{"inputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"name":"addLiquidity","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_token","type":"address"}],"name":"getPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"name":"removeLiquidity","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountAIn","type":"uint256"}],"name":"swapAforB","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountBIn","type":"uint256"}],"name":"swapBforA","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"tokenA","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tokenB","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}];

const connectWalletBtn = document.getElementById("connectWallet");
const addLiquidityBtn = document.getElementById("addLiquidity");
const removeLiquidityBtn = document.getElementById("removeLiquidity");
const swapAforBBtn = document.getElementById("swapAforB");
const swapBforABtn = document.getElementById("swapBforA");
const getPricesBtn = document.getElementById("getPrices");

const walletAddressP = document.getElementById("walletAddress");
const walletBalanceP = document.getElementById("walletBalance");
const priceTokenA = document.getElementById("priceTokenA");
const priceTokenB = document.getElementById("priceTokenB");

let simpleDEX;

// Conectar la billetera
connectWalletBtn.addEventListener("click", async () => {
  await window.ethereum.request({ method: "eth_requestAccounts" });
  signer = await provider.getSigner();
  const address = await signer.getAddress();
  const balance = await provider.getBalance(address);

  walletAddressP.textContent = `Dirección: ${address}`;
  walletBalanceP.textContent = `Balance: ${ethers.formatEther(balance)} ETH`;

  simpleDEX = new ethers.Contract(simpleDEXAddress, simpleDEXABI, signer);
});

// Agregar liquidez
addLiquidityBtn.addEventListener("click", async () => {
    const amount = ethers.parseUnits("0.05", 18);
    const tokenA = new ethers.Contract(tokenAAddress, ["function approve(address, uint256)"], signer);
    const tokenB = new ethers.Contract(tokenBAddress, ["function approve(address, uint256)"], signer);

    console.log("Aprobando TokenA y TokenB...");
    const txApproveA = await tokenA.approve(simpleDEXAddress, amount);
    await txApproveA.wait(); // Esperar confirmación
    const txApproveB = await tokenB.approve(simpleDEXAddress, amount);
    await txApproveB.wait(); // Esperar confirmación

    console.log("Agregando liquidez...");
    const txAddLiquidity = await simpleDEX.addLiquidity(amount, amount);
    await txAddLiquidity.wait(); // Esperar confirmación

    alert("Liquidez añadida correctamente al DEX.");
});

// Retirar liquidez
removeLiquidityBtn.addEventListener("click", async () => {
    const amount = ethers.parseUnits("0.02", 18);

    console.log("Retirando liquidez...");
    const txRemoveLiquidity = await simpleDEX.removeLiquidity(amount, amount);
    await txRemoveLiquidity.wait(); // Esperar confirmación

    alert("Liquidez retirada correctamente.");
});

// Intercambiar TokenA por TokenB
swapAforBBtn.addEventListener("click", async () => {
    const amount = ethers.parseUnits("0.02", 18);
    const tokenA = new ethers.Contract(tokenAAddress, ["function approve(address, uint256)"], signer);

    console.log("Aprobando TokenA para intercambio...");
    const txApprove = await tokenA.approve(simpleDEXAddress, amount);
    await txApprove.wait(); // Esperar confirmación

    console.log("Intercambiando TokenA por TokenB...");
    const txSwap = await simpleDEX.swapAforB(amount);
    await txSwap.wait(); // Esperar confirmación

    alert("Intercambio completado: TokenA por TokenB.");
});

// Intercambiar TokenB por TokenA
swapBforABtn.addEventListener("click", async () => {
    const amount = ethers.parseUnits("0.02", 18);
    const tokenB = new ethers.Contract(tokenBAddress, ["function approve(address, uint256)"], signer);

    console.log("Aprobando TokenB para intercambio...");
    const txApprove = await tokenB.approve(simpleDEXAddress, amount);
    await txApprove.wait(); // Esperar confirmación

    console.log("Intercambiando TokenB por TokenA...");
    const txSwap = await simpleDEX.swapBforA(amount);
    await txSwap.wait(); // Esperar confirmación

    alert("Intercambio completado: TokenB por TokenA.");
});

// Obtener precios
getPricesBtn.addEventListener("click", async () => {
  const priceA = await simpleDEX.getPrice(tokenAAddress);
  const priceB = await simpleDEX.getPrice(tokenBAddress);

  priceTokenA.textContent = `Precio de TokenA: ${ethers.formatUnits(priceA, 18)} TokenB`;
  priceTokenB.textContent = `Precio de TokenB: ${ethers.formatUnits(priceB, 18)} TokenA`;
});
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("SimpleDEX", (m) => {
  // Parámetros externos para las direcciones de TokenA y TokenB
  const tokenA = m.getParameter("tokenA", "0xCA46873ABFF4585853Fca46cE41d0B1524A4e999");
  const tokenB = m.getParameter("tokenB", "0x7dD669FDb0767Bb7095F839129C36A00509c7B29");

  // Desplegamos el contrato SimpleDEX con las direcciones proporcionadas
  const SimpleDex = m.contract("SimpleDEX", [tokenA, tokenB]);

  return { SimpleDex };
});

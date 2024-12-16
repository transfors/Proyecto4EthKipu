const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TokenB", (m) => {
  const tokenB = m.contract("TokenB");
  return { tokenB };
});

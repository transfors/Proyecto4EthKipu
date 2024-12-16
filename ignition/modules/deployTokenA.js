const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TokenA", (m) => {
  const tokenA = m.contract("TokenA");
  return { tokenA };
});

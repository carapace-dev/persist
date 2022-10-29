const { ethers, upgrades } = require("hardhat");

const CarapaceDepositProxy = "0x63E282aABa6d8cA1138648C77E1c25745852CacF";

const CarapaceSafeAddress = false;

// Upgradeability ----------------------------------------------------------------------------------------------
const contractDeposit = await ethers.getContractFactory("CarapaceDeposit");
if(CarapaceSafeAddress) {
    // OpenZeppelin Defender + Gnosis Safe Multisig
    console.log("Preparing upgrade to safe address...");
    const proxyDepositv2 = await upgrades.prepareUpgrade(CarapaceDepositProxy, contractDeposit);
    console.log("Done! Complete the upgrade process in OpenZeppelin Defender using the new contract implementation address:", proxyDepositv2);
} else {
    // Single account upgrade
    console.log("Upgrading for owner single account...");
    const proxyDepositv2 = await upgrades.upgradeProxy(CarapaceDepositProxy, contractDeposit);
    console.log("Upgraded CarapaceDeposit Proxy:", proxyDepositv2.address);
}
// Upgradeability ----------------------------------------------------------------------------------------------
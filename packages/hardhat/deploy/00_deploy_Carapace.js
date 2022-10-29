// deploy/00_deploy_Carapace.js
// import { getImplementationAddress } from '@openzeppelin/upgrades-core';

const { ethers, upgrades } = require("hardhat");

const localChainId = "31337";

const sleep = (ms) =>
  new Promise((r) =>
    setTimeout(() => {
      // console.log(`waited for ${(ms / 1000).toFixed(3)} seconds`);
      r();
    }, ms)
  );

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();
  //const args = [ ethers.utils.parseEther("0.01"), 10, 5 ];
  //const args = [];

  const deployContracts = true; // false will upgrade
  const transferOwnership = true;
  const verifyContracts = true;
  const CarapaceDepositProxy = "0x64fBbe2eE842289004e2124c79F249572b7DD92C"; // only if upgrade (deployContracts = false) - Goerli
  // const CarapaceDepositProxy = "0x4e82744aeDacF770420E8dC43F2F3F1b00f19102" // Polygon
  const CarapaceSafe = true; // false will upgrade using single account
  // const CarapaceSafeAddress = "0x1A22ae438c0348C2052aFd9951F2C06BCf6914e8"; // Transfer Ownership Gnosis (Goerli)
  const CarapaceSafeAddress = "0x19AB34A2e13D787f38B20Ae33108E9F777f4cD5D"; // Transfer Ownership Gnosis (Polygon Mainnet)

  console.log("Start deploying contracts...\n\n");
  if (deployContracts) {
    await deploy("CarapaceAccess", {
      // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
      from: deployer,
      args: [], // [ ethers.utils.parseEther("0.01"), 10 ],
      log: true,
    });

    // Getting a previously deployed contract
    const CarapaceAccess = await ethers.getContract("CarapaceAccess", deployer);

    await deploy("CarapaceStorage", {
      // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
      from: deployer,
      args: [CarapaceAccess.address], // [ ethers.utils.parseEther("0.01"), 10 ],
      log: true,
    });

    // Getting a previously deployed contract
    const CarapaceStorage = await ethers.getContract("CarapaceStorage", deployer);

    await deploy("CarapaceEscrow", {
      // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
      from: deployer,
      args: [CarapaceAccess.address], // [ ethers.utils.parseEther("0.01"), 10 ],
      log: true,
    });

    // Getting a previously deployed contract
    const CarapaceEscrow = await ethers.getContract("CarapaceEscrow", deployer);

    await deploy("CarapaceTreasury", {
      // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
      from: deployer,
      args: [], // [ ethers.utils.parseEther("0.01"), 10 ],
      log: true,
    });

    // Getting a previously deployed contract
    const CarapaceTreasury = await ethers.getContract("CarapaceTreasury", deployer);

    await deploy("CarapaceStaking", {
      // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
      from: deployer,
      args: [CarapaceAccess.address], // [CarapaceTreasury.address], // [ ethers.utils.parseEther("0.01"), 10 ],
      log: true,
    });

    // Getting a previously deployed contract
    const CarapaceStaking = await ethers.getContract("CarapaceStaking", deployer);

    console.log("Deploying CarapaceDeposit...");
    const contractDeposit = await ethers.getContractFactory("CarapaceDeposit");

    const proxyDeposit = await upgrades.deployProxy(contractDeposit, [CarapaceStaking.address, CarapaceTreasury.address, CarapaceAccess.address], {
      kind: 'uups',
      from: deployer,
      //args: [CarapaceStaking.address],
      log: true,
    });

    console.log("CarapaceDeposit Proxy Contract:", proxyDeposit.address);
    console.log("Waiting for some confirmations to get implementation address...");
    await sleep(25000);
    const proxyImplementationAddress = await upgrades.erc1967.getImplementationAddress(proxyDeposit.address);
    console.log("CarapaceDeposit Implementation:", proxyImplementationAddress);

    await deploy("CarapaceSmartVault", {
      from: deployer,
      args: [CarapaceStorage.address, proxyDeposit.address, CarapaceEscrow.address],
      // args: ["0x70B5362a81850041c12518a6f8cEDB4ba71B84F7", "0x0fEaf12f76935d00b6e01f8E768d51e4653edf2D", "0xd989592C62CbFEE6898eEAa03e98669b3A4e6e55"],
      log: true,
    });
    // Getting a previously deployed contract
    const CarapaceSmartVault = await ethers.getContract("CarapaceSmartVault", deployer);
    // Setup Access
    console.log("\n\nConfiguring Carapace contracts authorizations... please wait.");
    await CarapaceAccess.setAccess(CarapaceSmartVault.address, CarapaceStorage.address);
    console.log(CarapaceSmartVault.address+" granted access to "+CarapaceStorage.address);
    await CarapaceAccess.setAccess(CarapaceSmartVault.address, CarapaceEscrow.address);
    console.log(CarapaceSmartVault.address+" granted access to "+CarapaceEscrow.address);
    await CarapaceAccess.setAccess(CarapaceSmartVault.address, proxyDeposit.address);
    console.log(CarapaceSmartVault.address+" granted access to "+proxyDeposit.address);
    await CarapaceAccess.setAccess(proxyDeposit.address, CarapaceStaking.address);
    console.log(proxyDeposit.address+" granted access to "+CarapaceStaking.address);
    console.log("Authorizations set!");
    
    // Only transfers ownership on demand
    if(transferOwnership){
      console.log("\n\nTransfering contracts Ownership to Carapace Safe Address "+CarapaceSafeAddress+", please wait.");
      console.log("Carapace Access");
      await CarapaceAccess.transferOwnership(CarapaceSafeAddress);
      console.log("Carapace Treasury");
      await CarapaceTreasury.transferOwnership(CarapaceSafeAddress);
      console.log("Carapace Deposit Proxy");
      // await upgrades.admin.transferProxyAdminOwnership(CarapaceSafeAddress); // not for UUPS proxy kind
      await proxyDeposit.transferOwnership(CarapaceSafeAddress);
      console.log("Contracts ownership transfered!");
    }

    // Only verifies on demand
    if(verifyContracts){
      // wait for etherscan to be ready to verify
      console.log("\n\nVerifiying contracts on Etherscan...");
      console.log("Please wait some blocks confirmations for CarapaceAccess contract:", CarapaceAccess.address);
      // await CarapaceAccess.deployTransaction.wait(5); // wait 5 blocks confirmations
      await sleep(20000);
      try {
        await run("verify:verify", {
          address: CarapaceAccess.address,
          contract: "contracts/CarapaceAccess.sol:CarapaceAccess",
          // contractArguments: [ ethers.utils.parseEther("0.01"), 10 ],
          //  constructorArguments: args, //[ ethers.utils.parseEther("0.01"), 10 ],
        });
      } catch (err) { 
        console.log("Carapace Access:", err.message);
      }

      console.log("Please wait some blocks confirmations for CarapaceStorage contract:", CarapaceStorage.address);
      // await CarapaceStorage.deployTransaction.wait(5);
      await sleep(20000);
      try {
        await run("verify:verify", {
          address: CarapaceStorage.address,
          contract: "contracts/CarapaceStorage.sol:CarapaceStorage",
          constructorArguments: [CarapaceAccess.address],
        });
      } catch (err) {
        console.log("Carapace Storage:", err.message);
      }

      console.log("Please wait some blocks confirmations for CarapaceEscrow contract:", CarapaceEscrow.address);
      // await CarapaceEscrow.deployTransaction.wait(5);
      await sleep(20000);
      try {
        await run("verify:verify", {
          address: CarapaceEscrow.address,
          contract: "contracts/CarapaceEscrow.sol:CarapaceEscrow",
          constructorArguments: [CarapaceAccess.address],
        });
      } catch (err) {
        console.log("Carapace Escrow:", err.message);
      }

      console.log("Please wait some blocks confirmations for CarapaceTreasury contract:", CarapaceTreasury.address);
      // await CarapaceTreasury.deployTransaction.wait(5);
      await sleep(20000);
      try {
        await run("verify:verify", {
          address: CarapaceTreasury.address,
          contract: "contracts/CarapaceTreasury.sol:CarapaceTreasury",
        });
      } catch (err) {
        console.log("Carapace Treasury:", err.message);
      }

      console.log("Please wait some blocks confirmations for CarapaceStaking contract:", CarapaceStaking.address);
      // await CarapaceStaking.deployTransaction.wait(5);
      await sleep(20000);
      try {
        await run("verify:verify", {
          address: CarapaceStaking.address,
          contract: "contracts/CarapaceStaking.sol:CarapaceStaking",
          constructorArguments: [CarapaceAccess.address],
        });
      } catch (err) {
        console.log("Carapace Staking:", err.message);
      }
    
      // Proxy contract normally is automatically verified as one per network
      // It will show "Similar Match Source Code" on etherscan
      // Checker: https://rinkeby.etherscan.io/proxyContractChecker
      console.log("Please wait some blocks confirmations for CarapaceDeposit Proxy contract:", proxyDeposit.address);
      // await CarapaceStaking.deployTransaction.wait(5);
      await sleep(20000);
      try {
        await run("verify:verify", {
          address: proxyDeposit.address,
          contract: "contracts/CarapaceDeposit.sol:CarapaceDeposit",
          // constructorArguments: [CarapaceStaking.address, CarapaceTreasury.address, CarapaceAccess.address],
        });
      } catch (err) {
        console.log("Carapace Deposit:", err.message);
      }

      // Verify Deposit Implementation Contract
      console.log("Please wait some blocks confirmations for CarapaceDeposit Implementation contract:", proxyImplementationAddress);
      // await CarapaceStaking.deployTransaction.wait(5);
      await sleep(20000);
      try {
        await run("verify:verify", {
          address: proxyImplementationAddress,
          contract: "contracts/CarapaceDeposit.sol:CarapaceDeposit",
          // constructorArguments: [CarapaceStaking.address, CarapaceTreasury.address, CarapaceAccess.address],
        });
      } catch (err) {
        console.log("Carapace Deposit:", err.message);
      }

      console.log("Please wait some blocks confirmations for CarapaceSmartVault contract:", CarapaceSmartVault.address);
      // await CarapaceSmartVault.deployTransaction.wait(5);
      await sleep(20000);
      try {
        await run("verify:verify", {
          address: CarapaceSmartVault.address,
          contract: "contracts/CarapaceSmartVault.sol:CarapaceSmartVault",
          constructorArguments: [CarapaceStorage.address, proxyDeposit.address, CarapaceEscrow.address],
        });
      } catch (err) {
        // if (err.message.includes("Reason: Already Verified")) {
        //   console.log("Contract CSV already verified!");
        // } else 
        console.log("Carapace Smart Vault:", err.message);
      }

      console.log("Contracts verified.\n\nAll done!");
    }
  } else {
    // Upgradeability ----------------------------------------------------------------------------------------------
    const contractDeposit = await ethers.getContractFactory("CarapaceDeposit");
    if(CarapaceSafe) {
        // OpenZeppelin Defender + Gnosis Safe Multisig
        console.log("Preparing upgrade to safe address...");
        const proxyDepositv2 = await upgrades.prepareUpgrade(CarapaceDepositProxy, contractDeposit);
        // Verify Deposit Implementation Contract
        console.log("\n\nVerifiying contracts on Etherscan...");
        console.log("Please wait some blocks confirmations for CarapaceDeposit Implementation contract:", proxyDepositv2);
        // await CarapaceStaking.deployTransaction.wait(5);
        await sleep(20000);
        try {
          await run("verify:verify", {
            address: proxyDepositv2,
            contract: "contracts/CarapaceDeposit.sol:CarapaceDeposit",
            // constructorArguments: [CarapaceStaking.address, CarapaceTreasury.address, CarapaceAccess.address],
          });
        } catch (err) {
          console.log("Carapace Deposit:", err.message);
        }
        console.log("Done! Complete the upgrade process in Gnosis Safe using the new contract implementation address and upgradeTo function:", proxyDepositv2);
    } else {
        // Single account upgrade
        console.log("Upgrading for owner single account...");
        const proxyDepositv2 = await upgrades.upgradeProxy(CarapaceDepositProxy, contractDeposit);
        console.log("Upgraded CarapaceDeposit Proxy:", proxyDepositv2.address);
        // Verify Deposit Implementation Contract
        console.log("\n\nVerifiying contracts on Etherscan...");
        console.log("Please wait some blocks confirmations for CarapaceDeposit Implementation contract:", proxyDepositv2.address);
        // await CarapaceStaking.deployTransaction.wait(5);
        await sleep(20000);
        try {
          await run("verify:verify", {
            address: proxyDepositv2,
            contract: "contracts/CarapaceDeposit.sol:CarapaceDeposit",
            // constructorArguments: [CarapaceStaking.address, CarapaceTreasury.address, CarapaceAccess.address],
          });
        } catch (err) {
          console.log("Carapace Deposit:", err.message);
        }
    }
  }

    // console.log("Upgrade started...");
    // const contractDeposit = await ethers.getContractFactory("CarapaceDeposit");
    // // One account upgrade
    // const proxyDepositv2 = await upgrades.upgradeProxy(CarapaceDepositProxy, contractDeposit);
    // console.log("Upgraded CarapaceDeposit Proxy:", proxyDepositv2.address);

    // OpenZeppelin Defender + Gnosis Safe
    // console.log("Preparing upgrade...");
    // const proxyDepositv2 = await upgrades.prepareUpgrade(CarapaceDepositProxy, contractDeposit);
    // console.log("Done! Complete the upgrade process in OpenZeppelin Defender using the new contract implementation address:", proxyDepositv2);
    // Upgradeability ----------------------------------------------------------------------------------------------
  // }
  
  
  // To take ownership of yourContract using the ownable library uncomment next line and add the 
  // address you want to be the owner. 
  // yourContract.transferOwnership(YOUR_ADDRESS_HERE);

  //const yourContract = await ethers.getContractAt('YourContract', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!
  

  /*
  //If you want to send value to an address from the deployer
  const deployerWallet = ethers.provider.getSigner()
  await deployerWallet.sendTransaction({
    to: "0x34aA3F359A9D614239015126635CE7732c18fDF3",
    value: ethers.utils.parseEther("0.001")
  })
  */

  /*
  //If you want to send some ETH to a contract on deploy (make your constructor payable!)
  const yourContract = await deploy("YourContract", [], {
  value: ethers.utils.parseEther("0.05")
  });
  */

  /*
  //If you want to link a library into your contract:
  // reference: https://github.com/austintgriffith/scaffold-eth/blob/using-libraries-example/packages/hardhat/scripts/deploy.js#L19
  const yourContract = await deploy("YourContract", [], {}, {
   LibraryName: **LibraryAddress**
  });
  */
};
module.exports.tags = ["CarapaceStorage", "CarapaceDeposit", "CarapaceSmartVault"];

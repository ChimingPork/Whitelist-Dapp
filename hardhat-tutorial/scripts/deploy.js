const { ethers } = require("hardhat");

async function main() {
  //contractFactor is an abstraction used to deploy new smart contracts
  //whitelistContract here is a factory for the instances of Whitelist contract

  const whitelistContract = await ethers.getContractFactory("Whitelist");

  //Here we deploy the contract
  const deployWhitelistContract = await whitelistContract.deploy(10);
  //10 is the maximum number of whitelisted addresses allowed

  //Wait for it to finish deploying
  await deployWhitelistContract.deployed();

  // print the address of the deployed contract
  console.log("Whitelist Contract Address:", deployWhitelistContract.address);
}

//Call the function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
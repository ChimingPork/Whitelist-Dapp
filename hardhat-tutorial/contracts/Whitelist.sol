//SPDX-License-Identifier: UnLicensed
pragma solidity ^0.8.0;

contract Whitelist {
    //Max number of whiteListed addresses allowed
    uint8 public maxWhitelistedAddresses;

    //Create a mapping of addresses
    //If address is whitelisted, we set to true. If not, false
    mapping(address => bool) public whitelistedAddresses;

    // numAddressesWhitelisted should be used to keep track of how many addresses have been whitelisted
    uint8 public numAddressesWhitelisted;

    //Setting the max number of whitelisted addresses
    //User will add value at time of deployment
    constructor(uint8 _maxWhitelistedAddresses) {
        maxWhitelistedAddresses =  _maxWhitelistedAddresses;
    }


    // addAddressToWhitelist - this function adds the address of the sender to the whitelist
    function addAddressToWhitelist() public {
        // check if the user has already been whitelisted
        require(!whitelistedAddresses[msg.sender], "Sender has already been whitelisted");
        // check if the numAddressesWhitelisted < maxWhitelistedAddresses, if not then throw error
        require(numAddressesWhitelisted < maxWhitelistedAddresses, "Whitelist limit reached");
        // Add the address which called the function to the whitelistedAddress array
        whitelistedAddresses[msg.sender] = true;
        //Increase the number of whitelisted addresses
        numAddressesWhitelisted += 1;
    }
}
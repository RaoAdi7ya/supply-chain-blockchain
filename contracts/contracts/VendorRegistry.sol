// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract VendorRegistry {
    
    struct Vendor {
        uint id;
        string name;
        string location;
        bool isActive;
        address walletAddress;
    }

    mapping(uint => Vendor) public vendors;
    uint public vendorCount = 0;
    address public owner;

    event VendorRegistered(uint id, string name, address walletAddress);
    event VendorDeactivated(uint id);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can do this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerVendor(
        string memory _name,
        string memory _location,
        address _walletAddress
    ) public onlyOwner {
        vendorCount++;
        vendors[vendorCount] = Vendor(vendorCount, _name, _location, true, _walletAddress);
        emit VendorRegistered(vendorCount, _name, _walletAddress);
    }

    function deactivateVendor(uint _id) public onlyOwner {
        require(_id <= vendorCount, "Vendor does not exist");
        vendors[_id].isActive = false;
        emit VendorDeactivated(_id);
    }

    function getVendor(uint _id) public view returns (Vendor memory) {
        require(_id <= vendorCount, "Vendor does not exist");
        return vendors[_id];
    }
}
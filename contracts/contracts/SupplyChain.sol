// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SupplyChain {

    enum Stage { Created, AtWarehouse, InTransit, Delivered, Completed }

    struct Product {
        uint id;
        string name;
        string description;
        uint vendorId;
        Stage stage;
        uint timestamp;
        address createdBy;
    }

    struct TrackingEvent {
        uint productId;
        Stage stage;
        string location;
        string notes;
        uint timestamp;
        address updatedBy;
    }

    mapping(uint => Product) public products;
    uint public productCount = 0;
    mapping(uint => TrackingEvent[]) public productHistory;
    address public owner;

    event ProductCreated(uint id, string name, uint vendorId);
    event StageUpdated(uint productId, Stage newStage, string location);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can do this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createProduct(
        string memory _name,
        string memory _description,
        uint _vendorId
    ) public onlyOwner {
        productCount++;
        products[productCount] = Product(productCount, _name, _description, _vendorId, Stage.Created, block.timestamp, msg.sender);
        productHistory[productCount].push(TrackingEvent(productCount, Stage.Created, "Origin", "Product created", block.timestamp, msg.sender));
        emit ProductCreated(productCount, _name, _vendorId);
    }

    function updateStage(
        uint _productId,
        Stage _newStage,
        string memory _location,
        string memory _notes
    ) public onlyOwner {
        require(_productId <= productCount, "Product does not exist");
        products[_productId].stage = _newStage;
        products[_productId].timestamp = block.timestamp;
        productHistory[_productId].push(TrackingEvent(_productId, _newStage, _location, _notes, block.timestamp, msg.sender));
        emit StageUpdated(_productId, _newStage, _location);
    }

    function getProduct(uint _id) public view returns (Product memory) {
        require(_id <= productCount, "Product does not exist");
        return products[_id];
    }

    function getProductHistory(uint _id) public view returns (TrackingEvent[] memory) {
        require(_id <= productCount, "Product does not exist");
        return productHistory[_id];
    }
}
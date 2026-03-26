// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Payment {

    enum PaymentStatus { Pending, Released, Refunded }

    struct PaymentRecord {
        uint id;
        uint productId;
        uint vendorId;
        address payable vendor;
        address buyer;
        uint amount;
        PaymentStatus status;
        uint createdAt;
        uint releasedAt;
    }

    mapping(uint => PaymentRecord) public payments;
    uint public paymentCount = 0;
    address public owner;

    event PaymentCreated(uint id, uint productId, uint amount, address vendor);
    event PaymentReleased(uint id, address vendor, uint amount);
    event PaymentRefunded(uint id, address buyer, uint amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can do this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createPayment(uint _productId, uint _vendorId, address payable _vendor) public payable onlyOwner {
        require(msg.value > 0, "Payment amount must be greater than 0");
        paymentCount++;
        payments[paymentCount] = PaymentRecord(paymentCount, _productId, _vendorId, _vendor, msg.sender, msg.value, PaymentStatus.Pending, block.timestamp, 0);
        emit PaymentCreated(paymentCount, _productId, msg.value, _vendor);
    }

    function releasePayment(uint _paymentId) public onlyOwner {
        PaymentRecord storage payment = payments[_paymentId];
        require(payment.status == PaymentStatus.Pending, "Payment already processed");
        payment.status = PaymentStatus.Released;
        payment.releasedAt = block.timestamp;
        payment.vendor.transfer(payment.amount);
        emit PaymentReleased(_paymentId, payment.vendor, payment.amount);
    }

    function refundPayment(uint _paymentId) public onlyOwner {
        PaymentRecord storage payment = payments[_paymentId];
        require(payment.status == PaymentStatus.Pending, "Payment already processed");
        payment.status = PaymentStatus.Refunded;
        payable(payment.buyer).transfer(payment.amount);
        emit PaymentRefunded(_paymentId, payment.buyer, payment.amount);
    }

    function getPayment(uint _id) public view returns (PaymentRecord memory) {
        require(_id <= paymentCount, "Payment does not exist");
        return payments[_id];
    }

    function getContractBalance() public view returns (uint) {
        return address(this).balance;
    }
}
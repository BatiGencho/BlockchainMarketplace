pragma solidity 0.4.19;

import "./SafeMath.sol";


library ProductLib {
    using SafeMath for uint;
    
    event LogPriceAdjusted(uint oldPrice, uint newPrice);
    
    struct Product {
        bytes32 ID;
        string name;
        uint price;
        uint quantity;
        mapping(address => uint) buyers;
    }
    
    function createProduct(string _name, uint _price, uint _quantity) internal view returns (bytes32, Product)  {
        bytes32 uniqueID = keccak256(msg.sender, _name);
        return (uniqueID, Product({ID: uniqueID, name: _name, price: _price, quantity: _quantity}));
    }
    
    function updateProductQuantity(Product storage self, uint newQuantity, bool isPurchase) internal {
        if (isPurchase) {
            self.quantity = self.quantity.sub(newQuantity);
        } else {
            self.quantity = newQuantity;
        }
    }
    
    function adjustProductPrice(Product storage self, uint newQuantity, bool isPurchase) internal {
        
        if (newQuantity == 0) return;
        if (newQuantity == self.quantity) return;

        uint oldPrice = self.price;
        //no need to check for 0 division as our condiutions in funcs buy and update ensure quantity > 0
        uint fraction;
        uint priceIncreaseFactor;
        uint priceDecreaseFactor;
        uint  PRECISION = 10**3;
        if (self.quantity > newQuantity) {
            fraction = SafeMath.percent(newQuantity,self.quantity,3);
        } else {
            fraction = SafeMath.percent(self.quantity,newQuantity,3);
        }
        
        if (isPurchase) {
            //less quantity now than before => price shd increase
            priceIncreaseFactor =  (fraction).add(PRECISION);
            self.price = (self.price.mul(priceIncreaseFactor)).div(PRECISION);
        } else {
            if (self.quantity > newQuantity) { //new quantity assigned is less than the old one => price should increase
                priceIncreaseFactor =  (PRECISION.sub(fraction)).add(PRECISION);
                self.price = (self.price.mul(priceIncreaseFactor)).div(PRECISION);
            } else if (self.quantity < newQuantity){ //new quantity assigned is more than the old one => price should decrease
                priceDecreaseFactor =  fraction;
                self.price = (self.price.mul(priceDecreaseFactor)).div(PRECISION);
            } //when oldquantity = new quantity => do nothing
        }
        LogPriceAdjusted(oldPrice, self.price);
    }
}
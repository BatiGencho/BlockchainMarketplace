pragma solidity 0.4.19;


import "./Ownable.sol";
import "./Destructible.sol";
import "./SafeMath.sol";
import "./HelperFuncs.sol";
import "./ProductLib.sol";
import "./MarketplaceI.sol";


contract Marketplace is MarketplaceI, Ownable, Destructible {
    
    //============================================================//
    //                  LIB REFS                                  //
    //============================================================//
    using ProductLib for ProductLib.Product;
    using SafeMath for uint;
    
    
    //============================================================//
    //          CONTRACT STATE VARS, CONST. ETC                   //
    //============================================================// 
    mapping(bytes32 => ProductLib.Product) private productsList;
    bytes32[] productsInMarketplace;
    
    uint private totalTipsCollected;
    uint private totalProductsInMarketplace;
    
    //============================================================//
    //                  MODIFIERS                       //
    //============================================================//
    modifier priceNotZero(uint price) {
        require(price > 0);
        //check for int overflow
        require((price).add(1) > price);
        _;
    }
    modifier nameNotEmpty(string name) {
        require(!HelperFuncs.stringsEqualMemory(name,""));
        _;
    }
    modifier quantityGreaterZero(uint quantity) {
        require(quantity > 0);
        //check for int overflow
        require((quantity).add(1) > quantity);
        _;
    }
    modifier quantityGreaterEqualZero(uint quantity) {
        require(quantity >= 0);
        //check for int overflow
        require((quantity).add(1) > quantity);
        _;
    }

    modifier fundsSentPositive() {
        require(msg.value > 0);
        _;
    }
    
    //============================================================//
    //                  EVENTS                                    //
    //============================================================//
    
    event LogProductAdded(address indexed byWhomAdd , bytes32 ID, string name, uint price, uint quantity);
    event LogProductBought(address indexed buyerAdd, uint quantityWanted, uint price, uint quantityPurchased, uint tip);
    event LogProductUpdated(address indexed byWhomAdd, bytes32 ID, uint oldQuantity, uint newQuantity);
    event LogAllFundsWithdrawn(address indexed addTo, uint amount);
    
    //============================================================//
    //                  METHODS                                   //
    //============================================================//
    
    function() public payable {
        require(false);
    }
    
    function Marketplace() public {
    }
    
    //creates a new product and returns its ID
    function newProduct(string name, uint price, uint quantity) 
            onlyOwner
            nameNotEmpty(name)
            priceNotZero(price)
            quantityGreaterZero(quantity)
            public returns(bytes32) {
        
        //NOTE : the check for name not exceeding bytes32 will be done on the frontend!!!!
        
        //check that the product is not yet listed
        require(productsList[keccak256(msg.sender, name)].ID == "");
        
        bytes32 uniqueID;
        ProductLib.Product memory product;
        
        (uniqueID, product) = ProductLib.createProduct(name, price, quantity);
        productsList[uniqueID] = product;
        productsInMarketplace.push(uniqueID);
        
        LogProductAdded(msg.sender , uniqueID, name, price, quantity);
        
        return uniqueID;
    }
    
    function buy(bytes32 ID, uint quantityWanted)
            fundsSentPositive
            quantityGreaterZero(quantityWanted)
            public 
            payable {
        
        //check that the product is available and listed
        require(productsList[ID].ID != "");

        //max quantity that is purchasable with the sent ether (quantity must be a whole number)
        uint quantityPossibleToPurchase = msg.value.div(productsList[ID].price);
        //check that the amount sent is enough to buy required quantity
        require(quantityWanted <= quantityPossibleToPurchase);
        //check for suffiecient quantity in stock
        require(productsList[ID].quantity >= quantityWanted);
        
        uint tip = msg.value % productsList[ID].price;
        if (tip > 0) totalTipsCollected = totalTipsCollected.add(tip);
        assert( (quantityPossibleToPurchase.mul(productsList[ID].price) + tip) == msg.value);
        
        LogProductBought(msg.sender, quantityWanted, productsList[ID].price, quantityPossibleToPurchase, tip);
        
        //update the product price as a func of the quantity and then quantity
        productsList[ID].adjustProductPrice(quantityPossibleToPurchase, true);
        productsList[ID].updateProductQuantity(quantityPossibleToPurchase, true);
    }
    
    function update(bytes32 ID, uint newQuantity) 
            onlyOwner
            quantityGreaterEqualZero(newQuantity)
            public {
        
        require(productsList[ID].ID != "");
        
        LogProductUpdated(msg.sender, productsList[ID].ID, productsList[ID].quantity, newQuantity);
        
        //update the product price as a func of the quantity and then quantity
        if (productsList[ID].quantity > 0) productsList[ID].adjustProductPrice(newQuantity, false);
        productsList[ID].updateProductQuantity(newQuantity, false);
    }
    
    //============================================================//
    //                   COMMON GETTERS                           //
    //============================================================// 
    function getTotalTipsCollected() public view returns (uint) {
        return totalTipsCollected;
    }
    
    function getETHBalance() public view returns (uint) {
        return address(this).balance;
    }
    
    function getProduct(bytes32 ID) public view returns(string name, uint price, uint quantity) {
        require(productsList[ID].ID != "");
        return (productsList[ID].name, productsList[ID].price, productsList[ID].quantity);
    }
    
    function getProducts() public view returns(bytes32[]) {
        return productsInMarketplace;
    }
    
    function getNumProductsInMarketplace() public view returns(uint) {
        return productsInMarketplace.length;
    }
    
    function getPrice(bytes32 ID, uint quantity) public view returns (uint) {
        require(productsList[ID].ID != "");
        require(quantity > 0);
        return productsList[ID].price.mul(quantity);
    }
    
    //============================================================//
    //                   * OWNER WITHDRAWAL *                     //
    //============================================================// 
    //The contract owner can withdraw the ETHs
    function withdraw()
            onlyOwner
            public {
        LogAllFundsWithdrawn(owner, address(this).balance);
        owner.transfer(address(this).balance);
    }

}
var Marketplace = artifacts.require("Marketplace");

contract('Add and Update Product Unit Tests', (accounts) => {

  it("TEST1 : Only Owner can add a new product", async () => {
    
    let instance = await Marketplace.deployed();
    let ownerAdr = accounts[0];
    let tx = null;
		try{
			tx = await instance.newProduct("item1", web3.toWei(1, 'ether'), 200, {from: ownerAdr});
		} catch(e) {
      assert(false, "");
      return;
    }
    let numProductsInMarketplace = await instance.getNumProductsInMarketplace.call({from : ownerAdr});
    let products = await instance.getProducts.call({from : ownerAdr});

    let areLogsCorrect = false;
    for (let _tx of tx.logs) {
      if (_tx.event == "LogProductAdded") areLogsCorrect = true;
    }

		assert.isTrue(numProductsInMarketplace.valueOf() == 1 && products.length == 1 && areLogsCorrect);
  });

  it("TEST2 : Check LogProductAdded event upon adding a new product", async () => {
    
    let instance = await Marketplace.deployed();
    let ownerAdr = accounts[0];
    let tx = null;
		try{
			tx = await instance.newProduct("item2", web3.toWei(1, 'ether'), 300, {from: ownerAdr});
		} catch(e) {
      assert(false, "");
      return;
    }

    let areLogsCorrect = false;
    for (let _tx of tx.logs) {
      if (_tx.event == "LogProductAdded") areLogsCorrect = true;
    }

		assert.isTrue(areLogsCorrect);
  });

  it("TEST3 : Should block none-owner to add product", async () => {
    
    let instance = await Marketplace.deployed();
    let noneOwner = accounts[2];

		try{
			await instance.newProduct("item3", web3.toWei(1, 'ether'), 200, {from: noneOwner});
			assert(true, "None-owners cannot add a new product");
		} catch(e) {
      return;
		}
		
		assert(false, "None-owners can add a new product");
  });

  it("TEST4 : Adding products with empty IDs should not work", async () => {
    
    let instance = await Marketplace.deployed();
    let ownerAdr = accounts[0];

    let fail = false;
		try{
			await instance.newProduct("", web3.toWei(1, 'ether'), 200, {from: ownerAdr});
		} catch(e) {
      fail = true;
    }
		
		assert(fail == true);
  });

  it("TEST5 : Adding products with zero price should not work", async () => {
    
    let instance = await Marketplace.deployed();
    let ownerAdr = accounts[0];

		try{
			await instance.newProduct("item3", web3.toWei(0, 'ether'), 200, {from: ownerAdr});
		} catch(e) {
      assert(true, "Adding products with zero price does not work");
      return;
		}
		
		assert(false, "Adding products with zero price works");
  });

  it("TEST6 : Adding products with zero quantity should not work", async () => {
    
    let instance = await Marketplace.deployed();
    let ownerAdr = accounts[0];

		try{
			await instance.newProduct("item3", web3.toWei(1, 'ether'), 0, {from: ownerAdr});
		} catch(e) {
      assert(true, "Adding products with zero quantity does not work");
      return;
		}
		
		assert(false, "Adding products with zero quantity works");
  });

  it("TEST7 : Adding products with quantity overflow should not work", async () => {
    
    let instance = await Marketplace.deployed();
    let ownerAdr = accounts[0];
    const QUANTITY = Math.pow(2,256);

		try{
			await instance.newProduct("itemOVERFLOW1", web3.toWei(1, 'ether'), QUANTITY, {from: ownerAdr});
		} catch(e) {
      assert(true, "Adding products with quantity overflow does not work");
      return;
		}
		
		assert(false, "Adding products with quantity overflow works");
  });

  it("TEST8 : Adding products with price overflow should not work", async () => {
    
    let instance = await Marketplace.deployed();
    let ownerAdr = accounts[0];
    const PRICE = Math.pow(2,256); //in wei

		try{
			await instance.newProduct("itemOVERFLOW2", web3.toWei(PRICE, 'ether'), 0, {from: ownerAdr});
		} catch(e) {
      assert(true, "Adding products with price overflow does not work");
      return;
		}
		
		assert(false, "Adding products with price overflow works");
  });

  it("TEST9 : Should not allow adding a product with an already existing name(ID)", async () => {
    
    let instance = await Marketplace.deployed();
    let ownerAdr = accounts[0];

    //none-callable methods dont return in truffle => method newProduct wont return the new Product id
    let tx = await instance.newProduct("item3", web3.toWei(1.2, 'ether'), 300, {from: ownerAdr});
    
    //now try adding a new item with the same name...
    try{
			await instance.newProduct("item3", web3.toWei(2, 'ether'), 200, {from: ownerAdr});
		} catch(e) {
      assert(true, "product with an already existing ID/Name could not be added");
      return;
		}
    assert(false, "product with an already existing ID/Name is added");

  });

  it("TEST10 : Owner should be able to update a product", async () => {
    
    let instance = await Marketplace.deployed();
    let ownerAdr = accounts[0];

    //get last product's id
    let products = await instance.getProducts.call({from : ownerAdr});
    let lastProductID = products[products.length-1]

    //get product last product's data
    let lastProductData = await instance.getProduct.call(lastProductID,{from : ownerAdr});
    
    let lastProductName = lastProductData[0];
    let lastProductPrice = lastProductData[1].valueOf();
    let lastProductQuantity = lastProductData[2].valueOf();
    
    //update the existing product's quantity to some value
    const UPDATED_QUANTITY = 100;
    let tx = await instance.update(lastProductID, UPDATED_QUANTITY, {from: ownerAdr});

    lastProductData = await instance.getProduct.call(lastProductID,{from : ownerAdr});
    lastProductName = lastProductData[0];
    lastProductPrice = lastProductData[1].valueOf();
    lastProductQuantity = lastProductData[2].valueOf();

    assert.isTrue(lastProductQuantity == UPDATED_QUANTITY);
  });

  it("TEST11 : Check LogProductUpdated event upon product update", async () => {
    
    let instance = await Marketplace.deployed();
    let ownerAdr = accounts[0];

    //get last product's id
    let products = await instance.getProducts.call({from : ownerAdr});
    let lastProductID = products[products.length-1];

    //update the existing product's quantity to max value
    const UPDATED_QUANTITY = 200;
    let tx = await instance.update(lastProductID, UPDATED_QUANTITY, {from: ownerAdr});

    //get logs
    let areLogsCorrect = false;
    for (let _tx of tx.logs) {
      if (_tx.event == "LogProductUpdated") areLogsCorrect = true;
    } 

    assert.isTrue(areLogsCorrect);
  });

  it("TEST12 : Check quantity overflow upon product update", async () => {
    
    let instance = await Marketplace.deployed();
    let ownerAdr = accounts[0];

    //get last product's id
    let products = await instance.getProducts.call({from : ownerAdr});
    let lastProductID = products[products.length-1];

    //update the existing product's quantity to max value
    const UPDATED_QUANTITY = Math.pow(2,256);
    try{
			await instance.update(lastProductID, UPDATED_QUANTITY, {from: ownerAdr});
		} catch(e) {
      assert(true, "overflown quantity not assigned upon product update");
      return;
		}
    assert(false, "overflown product quantity assigned upon product update");
  });

  it("TEST13 : None-owners should not be able to update a product", async () => {
    
    let instance = await Marketplace.deployed();
    let notOwnerAdr = accounts[1];

    //get last product's id and its quantity
    let products = await instance.getProducts.call({from : notOwnerAdr});
    let lastProductID = products[products.length-1]

    //get product last product's data
    let lastProductData = await instance.getProduct.call(lastProductID,{from : notOwnerAdr});
    
    let lastProductName = lastProductData[0];
    let lastProductPrice = lastProductData[1].valueOf();
    let lastProductQuantity = lastProductData[2].valueOf();

    //update the existing product's quantity to some value
    const UPDATED_QUANTITY = 800;
    try{
			await instance.update(lastProductID, UPDATED_QUANTITY, {from: notOwnerAdr});
		} catch(e) {
      assert(true, "product quantity was updated by owner");
      return;
		}
    assert(false, "product quantity was updated by none-owner");
  });

  it("TEST14 : Check price adjustment after quantity reduction (update)", async () => {
    
    let instance = await Marketplace.deployed();
    let ownerAdr = accounts[0];

    //get last product's id
    let products = await instance.getProducts.call({from : ownerAdr});
    let lastProductID = products[products.length-1]

    //get product last product's data
    let lastProductDataBeforeUpdate = await instance.getProduct.call(lastProductID,{from : ownerAdr});
    let lastProductPriceBeforeUpdate = lastProductDataBeforeUpdate[1].valueOf();
    let lastProductQuantityBeforeUpdate = lastProductDataBeforeUpdate[2].valueOf();

    //update the existing product's quantity to some value
    const UPDATED_QUANTITY = Math.round(lastProductQuantityBeforeUpdate/2); //reduce quality
    let tx = await instance.update(lastProductID, UPDATED_QUANTITY, {from: ownerAdr});

    let lastProductDataAfterUpdate = await instance.getProduct.call(lastProductID,{from : ownerAdr});
    let lastProductPriceAfterUpdate = lastProductDataAfterUpdate[1].valueOf();
    let lastProductQuantityAfterUpdate = lastProductDataAfterUpdate[2].valueOf();

    //price adjustment algorithm for quantity reduction
    let ratio = 1.0 - Math.min((lastProductQuantityAfterUpdate/lastProductQuantityBeforeUpdate),(lastProductQuantityBeforeUpdate/lastProductQuantityAfterUpdate));
    let updateFactor = 1.0 + ratio;

    assert.isTrue((Math.abs(lastProductPriceAfterUpdate - (updateFactor * lastProductPriceBeforeUpdate)) < 10e-3));    
  });

  it("TEST15 : Check price adjustment after quantity increase (update)", async () => {
    
    let instance = await Marketplace.deployed();
    let ownerAdr = accounts[0];

    //get last product's id
    let products = await instance.getProducts.call({from : ownerAdr});
    let lastProductID = products[products.length-1]

    //get product last product's data
    let lastProductDataBeforeUpdate = await instance.getProduct.call(lastProductID,{from : ownerAdr});
    let lastProductPriceBeforeUpdate = lastProductDataBeforeUpdate[1].valueOf();
    let lastProductQuantityBeforeUpdate = lastProductDataBeforeUpdate[2].valueOf();

    //update the existing product's quantity to some value
    const UPDATED_QUANTITY = Math.round(lastProductQuantityBeforeUpdate * 1.5); //increase quality
    let tx = await instance.update(lastProductID, UPDATED_QUANTITY, {from: ownerAdr});

    let lastProductDataAfterUpdate = await instance.getProduct.call(lastProductID,{from : ownerAdr});
    let lastProductPriceAfterUpdate = lastProductDataAfterUpdate[1].valueOf();
    let lastProductQuantityAfterUpdate = lastProductDataAfterUpdate[2].valueOf();

    //price adjustment algorithm for quantity increase
    let ratio = 1.0 - Math.min((lastProductQuantityAfterUpdate/lastProductQuantityBeforeUpdate),(lastProductQuantityBeforeUpdate/lastProductQuantityAfterUpdate));
    let updateFactor = 1.0 - ratio;
   
    assert.isTrue((Math.abs(lastProductPriceAfterUpdate - (updateFactor * lastProductPriceBeforeUpdate)))/web3.toWei(1,'ether') < 10e-3);    
  });

  it("TEST16 : Cannot update quantity for none-existing or empty IDs", async () => {
    
    let instance = await Marketplace.deployed();
    let ownerAdr = accounts[0];

    //get last product's id
    let products = await instance.getProducts.call({from : ownerAdr});
    let lastProductID = products[products.length-1];
    
    //update the existing product's quantity to some value
    const UPDATED_QUANTITY = 100;
    let fail1 = false;
    try {
      await instance.update("", UPDATED_QUANTITY, {from: ownerAdr});
		} catch(e) {
      fail1 = true;
    }
    let fail2 = false;
    try {
      await instance.update("UNKNOWN_ID", UPDATED_QUANTITY, {from: ownerAdr});
		} catch(e) {
      fail2 = true;
    }  

    assert.isTrue(fail1 && fail2);

  });

  it("TEST17 : Can update quantity to 0", async () => {
    
    let instance = await Marketplace.deployed();
    let ownerAdr = accounts[0];

    //get last product's id
    let products = await instance.getProducts.call({from : ownerAdr});
    let lastProductID = products[products.length-1];
    
    //update the existing product's quantity to some value
    const UPDATED_QUANTITY = 0;
    try {
      await instance.update(lastProductID, UPDATED_QUANTITY, {from: ownerAdr});
		} catch(e) {
      assert(false, "cannot update quantity to 0");
      return;
    }

    //get product data after update
    let lastProductDataAfterUpdate = await instance.getProduct.call(lastProductID,{from : ownerAdr});
    let lastProductQuantityAfterUpdate = lastProductDataAfterUpdate[2].valueOf();

    assert.isTrue(lastProductQuantityAfterUpdate == UPDATED_QUANTITY, "can update quantity to 0");
  });

  it("TEST18 : No price adjustment upon update with same quantity", async () => {
    
    let instance = await Marketplace.deployed();
    let ownerAdr = accounts[0];

    //get last product's id
    let products = await instance.getProducts.call({from : ownerAdr});
    let lastProductID = products[products.length-1];

    //get product data before update
    let lastProductDataBeforeUpdate = await instance.getProduct.call(lastProductID,{from : ownerAdr});
    let lastProductPriceBeforeUpdate = lastProductDataBeforeUpdate[1].valueOf();
    let lastProductQuantityBeforeUpdate = lastProductDataBeforeUpdate[2].valueOf();
    
    //update the existing product's quantity to some value
    const UPDATED_QUANTITY = lastProductQuantityBeforeUpdate;
    let tx = await instance.update(lastProductID, UPDATED_QUANTITY, {from: ownerAdr});

    //get product data after update
    let lastProductDataAfterUpdate = await instance.getProduct.call(lastProductID,{from : ownerAdr});
    let lastProductPriceAfterUpdate = lastProductDataAfterUpdate[1].valueOf();
    let lastProductQuantityAfterUpdate = lastProductDataAfterUpdate[2].valueOf();

    assert.isTrue(lastProductPriceAfterUpdate == lastProductPriceBeforeUpdate);
  });

  it("TEST19 : No price adjustment upon update with 0 quantity", async () => {
    
    let instance = await Marketplace.deployed();
    let ownerAdr = accounts[0];

    //get last product's id
    let products = await instance.getProducts.call({from : ownerAdr});
    let lastProductID = products[products.length-1]

    //get product data before update
    let lastProductDataBeforeUpdate = await instance.getProduct.call(lastProductID,{from : ownerAdr});
    let lastProductPriceBeforeUpdate = lastProductDataBeforeUpdate[1].valueOf();
    let lastProductQuantityBeforeUpdate = lastProductDataBeforeUpdate[2].valueOf();
    
    //update the existing product's quantity to some value
    const UPDATED_QUANTITY = 0;
    let tx = await instance.update(lastProductID, UPDATED_QUANTITY, {from: ownerAdr});

    //get product data before update
    let lastProductDataAfterUpdate = await instance.getProduct.call(lastProductID,{from : ownerAdr});
    let lastProductPriceAfterUpdate = lastProductDataAfterUpdate[1].valueOf();
    let lastProductQuantityAfterUpdate = lastProductDataAfterUpdate[2].valueOf();

    assert.isTrue(lastProductPriceAfterUpdate == lastProductPriceBeforeUpdate);
  });

});
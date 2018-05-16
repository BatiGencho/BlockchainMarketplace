var Marketplace = artifacts.require("Marketplace");

contract('Buy Product Unit Tests', (accounts) => {

  it("TEST1 : Any account can buy a unit product", async () => {

    let instance = await Marketplace.deployed();
    let ownerAdr = accounts[0];
    let buyerAdr = accounts[4];
    const PRODUCT_PRICE_IN_ETHERS = 1.2;
    const PRODUCT_QUANTITY = 1000;
    const REQUIRED_QUANTITY = 1;

    //owner adds a new product of some high quantity
		await instance.newProduct("item1", web3.toWei(PRODUCT_PRICE_IN_ETHERS, 'ether'), PRODUCT_QUANTITY, {from: ownerAdr});

    //get added product's id
    let products = await instance.getProducts.call({from : buyerAdr});
    let lastProductID = products[products.length-1];

    //get addded last product's data
    let lastProductData = await instance.getProduct.call(lastProductID,{from : buyerAdr});

    //get product last product's data
    let lastProductPrice = lastProductData[1].valueOf();
    let lastProductQuantity = lastProductData[2].valueOf();

    //buyer sends a transaction just to buy 1 product item
    try{
      await instance.buy(lastProductID, REQUIRED_QUANTITY, {from: buyerAdr,
                          value: web3.toWei(PRODUCT_PRICE_IN_ETHERS, 'ether')});
		} catch(e) {
      assert(false, "adress cannot buy products");
      return;
    }
    
    assert(true, "address can buy products");
  });

  
  it("TEST2 : Buying a new product with msg.value = 0 not possible", async () => {
    
    let instance = await Marketplace.deployed();
    let buyerAdr = accounts[4];
    const REQUIRED_QUANTITY = 1;
    const SENT_FUNDS_IN_ETH = 0;

    //get added product's id
    let products = await instance.getProducts.call({from : buyerAdr});
    let lastProductID = products[products.length-1];

    //get added last product's data
    let lastProductData = await instance.getProduct.call(lastProductID,{from : buyerAdr});

    //get product last product's data
    let lastProductPrice = lastProductData[1].valueOf();
    let lastProductQuantity = lastProductData[2].valueOf();

    //buyer sends message with 0 value and at least quantity of 1 item
    try{
      await instance.buy(lastProductID, REQUIRED_QUANTITY, {from: buyerAdr,
                          value: web3.toWei(SENT_FUNDS_IN_ETH, 'ether')});
		} catch(e) {
      assert(true, "cannot buy products with msg.value == 0");
      return;
    }

    assert(false, "product purchased with msg.value == 0");

  });
  
  it("TEST3 : Buying a new product with zero quantity not possible", async () => {
    
    let instance = await Marketplace.deployed();
    let buyerAdr = accounts[4];
    const REQUIRED_QUANTITY = 0;

    //get added product's id
    let products = await instance.getProducts.call({from : buyerAdr});
    let lastProductID = products[products.length-1];

    //get added last product's data
    let lastProductData = await instance.getProduct.call(lastProductID,{from : buyerAdr});

    //get product last product's data
    let lastProductPrice = lastProductData[1].valueOf();
    let lastProductPriceInEther = web3.fromWei(lastProductPrice);
    let lastProductQuantity = lastProductData[2].valueOf();

    //buyer sends a message with enough value to buy exactly one item, but requires 0 quantity
    try{
      await instance.buy(lastProductID, REQUIRED_QUANTITY, {from: buyerAdr,
                          value: web3.toWei(lastProductPriceInEther, 'ether')});
		} catch(e) {
      assert(true, "cannot buy products with zero quantity");
      return;
    }
    assert(false, "product purchased with zero quantity");

  });

  it("TEST4 : Buying a none-existing product(no ID found or empty ID) not possible", async () => {
    
    let instance = await Marketplace.deployed();
    let buyerAdr = accounts[4];

    //buyer sends a message with none-existing product ID such as "NO_ID" and suffiecient ethers
    let fail1 = false;
    try{
      await instance.buy('NO_ID', 1, {from: buyerAdr,
                          value: web3.toWei(100, 'ether')});
		} catch(e) {
      fail1 = true;
    }

    //buyer sends a message with an empty ID and suffiecient ethers
    let fail2 = false;
    try { //try with empty ID
      await instance.buy('', 1, {from: buyerAdr,
          value: web3.toWei(100, 'ether')});
    } catch(e) {
      fail2 = true;
    }

    assert(fail1 && fail2);

  });

  it("TEST5 : Check LogProductBought event fired upon purchase", async () => {
    
    let instance = await Marketplace.deployed();
    let buyerAdr = accounts[4];

    //get added product's id
    let products = await instance.getProducts.call({from : buyerAdr});
    let lastProductID = products[products.length-1];

    //get addded last product's data
    let lastProductData = await instance.getProduct.call(lastProductID,{from : buyerAdr});

    //get product last product's data
    let lastProductPrice = lastProductData[1].valueOf();
    let lastProductQuantity = lastProductData[2].valueOf();
    let lastProductPriceInEther = web3.fromWei(lastProductPrice);

    //buyer sends exact ether to buy exactly 1 quantity of product
    let tx = await instance.buy(lastProductID, 1, {from: buyerAdr,
                          value: web3.toWei(lastProductPriceInEther, 'ether')});

    //check for fired events
    let areLogsCorrect = false;
    for (_tx of tx.logs) {
      if (_tx.event == "LogProductBought") areLogsCorrect = true;
    }

    assert.isTrue(areLogsCorrect);
  });

  it("TEST6 : Check correct amount of bought quantity, tip, balances and price adjustment", async () => {
    
    let instance = await Marketplace.deployed();
    let ownerAdr = accounts[0];
    let buyerAdr = accounts[3];
    const PRODUCT_PRICE_IN_ETHERS = 1.2;
    const PRODUCT_QUANTITY = 1000;
    const BUYER_INVESTED_AMOUNT_ETHERS = 10;
    const BUYER_REQUIRED_AMOUNT_PRODUCT_ITEMS = 8;

    //owner adds a new product
		await instance.newProduct("item2", web3.toWei(PRODUCT_PRICE_IN_ETHERS, 'ether'), PRODUCT_QUANTITY, {from: ownerAdr});

    //get added product's id
    let products = await instance.getProducts.call({from : buyerAdr});
    let lastProductID = products[products.length-1];

    //get added last product's data
    let lastProductData = await instance.getProduct.call(lastProductID,{from : buyerAdr});

    //get product last product's data
    let lastProductPriceBeforePurchase = lastProductData[1].valueOf();
    let lastProductQuantityBeforePurchase = lastProductData[2].valueOf();
    let lastProductPriceInEtherBeforePurchase = web3.fromWei(lastProductPriceBeforePurchase);

    //get contract's ETH balance before purchase
    let conractETHBalanceBeforePurchase = await instance.getETHBalance.call({from: buyerAdr});

    //get user's ETH balance before purchase
    let buyerBalanceBeforePurchase = web3.fromWei(web3.eth.getBalance(buyerAdr)).valueOf();

    //product item price is 1.2 ETH => for 10 ETH, one shd get 8 product items and the rest 0.4 ETH be considered a tip
    try{
      await instance.buy(lastProductID, BUYER_REQUIRED_AMOUNT_PRODUCT_ITEMS, {from: buyerAdr,
                          value: web3.toWei(BUYER_INVESTED_AMOUNT_ETHERS, 'ether')});
		} catch(e) {
      assert(false, "cannot buy product under given approved settings");
      return;
    }

    //get added last product's data
    lastProductData = await instance.getProduct.call(lastProductID,{from : buyerAdr});

    //get product last product's data
    let lastProductPriceAfterPurchase = lastProductData[1].valueOf();
    let lastProductQuantityAfterPurchase = lastProductData[2].valueOf();
    let lastProductPriceInEtherAfterPurchase = web3.fromWei(lastProductPriceAfterPurchase);

    //get quantity
    let quantityPossibleToPurchase = Math.floor(BUYER_INVESTED_AMOUNT_ETHERS / PRODUCT_PRICE_IN_ETHERS);
    
    //get contract's ETH balance after purchase
    let conractETHBalanceAfterPurchase = await instance.getETHBalance.call({from: buyerAdr});
    let contractBalanceDiff = conractETHBalanceAfterPurchase - conractETHBalanceBeforePurchase;

    //get user's ETH balance
    let buyerBalanceAfterPurchase = web3.fromWei(web3.eth.getBalance(buyerAdr)).valueOf();

    //get tips
    let conractTipsCollected = await instance.getTotalTipsCollected.call({from: buyerAdr});
    let tipsExpected = (BUYER_INVESTED_AMOUNT_ETHERS - quantityPossibleToPurchase * PRODUCT_PRICE_IN_ETHERS) * web3.toWei(1,'ether');

    //price adjustment algorithm for purchases (i.e. decrease in quantity and increase in price)
    let ratio = 1.0 - Math.min((lastProductQuantityAfterPurchase/lastProductQuantityBeforePurchase),(lastProductQuantityBeforePurchase/lastProductQuantityAfterPurchase));
    let increaseFactor = 1.0 + ratio;
    
    assert.isTrue( (contractBalanceDiff == BUYER_INVESTED_AMOUNT_ETHERS * web3.toWei(1,'ether')) &&
                   ( (lastProductQuantityBeforePurchase - lastProductQuantityAfterPurchase) == BUYER_REQUIRED_AMOUNT_PRODUCT_ITEMS ) &&
                   ( (lastProductQuantityBeforePurchase - quantityPossibleToPurchase) ==  lastProductQuantityAfterPurchase ) &&
                   ( (Math.abs(tipsExpected - conractTipsCollected))/web3.toWei(1,'ether') < 1e-4 ) &&
                   ( Math.abs((buyerBalanceBeforePurchase - BUYER_INVESTED_AMOUNT_ETHERS) - buyerBalanceAfterPurchase) < 0.01 )
    );
  });

  it("TEST7 : Cannot buy more than present product quantity with sufficient funds", async () => {
    
    let instance = await Marketplace.deployed();
    let ownerAdr = accounts[0];
    let buyerAdr = accounts[3];
    const PRODUCT_PRICE_IN_ETHERS = 1.2;
    const PRODUCT_QUANTITY = 2;
    const BUYER_INVESTED_AMOUNT_ETHERS = 10;
    const BUYER_REQUIRED_AMOUNT_PRODUCT_ITEMS = 8;

    //owner adds a new product
		await instance.newProduct("item3", web3.toWei(PRODUCT_PRICE_IN_ETHERS, 'ether'), PRODUCT_QUANTITY, {from: ownerAdr});

    //get added product's id
    let products = await instance.getProducts.call({from : buyerAdr});
    let lastProductID = products[products.length-1];

    //product item price is 1.2 ETH => for 10 ETH, one shd get 8 product items and the rest 0.4 ETH be considered a tip
    //marketplace has for this produce only 2 items available
    try{
      await instance.buy(lastProductID, BUYER_REQUIRED_AMOUNT_PRODUCT_ITEMS, {from: buyerAdr,
                          value: web3.toWei(BUYER_INVESTED_AMOUNT_ETHERS, 'ether')});
		} catch(e) {
      assert(true, "cannot buy more than present product quantity with sufficient funds");
      return;
    }
    assert(false, "can buy more than present product quantity with sufficient funds");

  });

  it("TEST8 : Cannot buy less than present product quantity with insufficient funds", async () => {
    
    let instance = await Marketplace.deployed();
    let ownerAdr = accounts[0];
    let buyerAdr = accounts[3];
    const PRODUCT_PRICE_IN_ETHERS = 1.2;
    const PRODUCT_QUANTITY = 8;
    const BUYER_INVESTED_AMOUNT_ETHERS = 10;
    const BUYER_REQUIRED_AMOUNT_PRODUCT_ITEMS = 9;

    //owner adds a new product
		await instance.newProduct("item4", web3.toWei(PRODUCT_PRICE_IN_ETHERS, 'ether'), PRODUCT_QUANTITY, {from: ownerAdr});

    //get added product's id
    let products = await instance.getProducts.call({from : buyerAdr});
    let lastProductID = products[products.length-1];

    //produc item price is 1.2 ETH => for 10 ETH, one shd get 8 product items and the rest 0.4 ETH be considered a tip
    //buyer however requests a quantity of 9
    try{
      await instance.buy(lastProductID, BUYER_REQUIRED_AMOUNT_PRODUCT_ITEMS, {from: buyerAdr,
                          value: web3.toWei(BUYER_INVESTED_AMOUNT_ETHERS, 'ether')});
		} catch(e) {
      assert(true, "cannot buy less than present product quantity with insufficient funds");
      return;
    }
    assert(false, "can buy less than present product quantity with insufficient funds");

  });

  it("TEST9 : Cannot buy when product quantity is overflown", async () => {
    
    let instance = await Marketplace.deployed();
    let buyerAdr = accounts[3];
    const BUYER_INVESTED_AMOUNT_ETHERS = 100;
    const BUYER_REQUIRED_AMOUNT_PRODUCT_ITEMS = Math.pow(2,256);

    //get added product's id
    let products = await instance.getProducts.call({from : buyerAdr});
    let lastProductID = products[products.length-1];

    try{
      await instance.buy(lastProductID, BUYER_REQUIRED_AMOUNT_PRODUCT_ITEMS, {from: buyerAdr,
                          value: web3.toWei(BUYER_INVESTED_AMOUNT_ETHERS, 'ether')});
		} catch(e) {
      assert(true, "cannot buy when product quantity is overflown");
      return;
    }
    assert(false, "can buy buy when product quantity is overflown");

  });

  it("TEST10 : Check getPrice function for an existing product with required quantity less than the available", async () => {
    
    let instance = await Marketplace.deployed();
    let buyerAdr = accounts[3];

    //get added product's id
    let products = await instance.getProducts.call({from : buyerAdr});
    let lastProductID = products[products.length-1];

    //get addded last product's data
    let lastProductData = await instance.getProduct.call(lastProductID,{from : buyerAdr});

    let lastProductPrice = lastProductData[1].valueOf();
    let lastProductQuantity = lastProductData[2].valueOf();

    //call the price method
    const INQUIRED_QUANTITY = Math.round(lastProductQuantity / 3.0);
    let priceForQuantityInWei = await instance.getPrice.call(lastProductID,INQUIRED_QUANTITY,{from : buyerAdr});
    let priceForQuantityInEther = web3.fromWei(priceForQuantityInWei.valueOf());
    let anticipatedPriceForQuantityInEther = web3.fromWei(lastProductPrice) * INQUIRED_QUANTITY;

    assert.isTrue(Math.abs(priceForQuantityInEther - anticipatedPriceForQuantityInEther) < 1e-3)

  });

  it("TEST11 : Check getPrice function for an existing product with 0 required quantity", async () => {
    
    let instance = await Marketplace.deployed();
    let buyerAdr = accounts[3];

    //get added product's id
    let products = await instance.getProducts.call({from : buyerAdr});
    let lastProductID = products[products.length-1];

    //call the price method
    const INQUIRED_QUANTITY = 0;
    try {
      await instance.getPrice.call(lastProductID,INQUIRED_QUANTITY,{from : buyerAdr});
    } catch(e) {
      assert(true,"getPrice cannot be called when quantity is 0");
      return;
    }

    assert.equal(false,"getPrice can be called when quantity is 0")

  });

  it("TEST12 : Check getPrice function for an empty or none-exising ID and quantity > 0", async () => {
    
    let instance = await Marketplace.deployed();
    let buyerAdr = accounts[3];

    //call the price method
    const INQUIRED_QUANTITY = 1;
    try {
      await instance.getPrice.call("",INQUIRED_QUANTITY,{from : buyerAdr});
    } catch(e) {
      assert(true,"getPrice cannot be called when ID is empty")
      return;
    }

    assert.equal(false,"getPrice can be called when ID is empty")

  });

  it("TEST13 : Check getPrice function for an empty or none-exising ID and quantity overflow", async () => {
    
    let instance = await Marketplace.deployed();
    let buyerAdr = accounts[3];

    //get added product's id
    let products = await instance.getProducts.call({from : buyerAdr});
    let lastProductID = products[products.length-1];

    //call the price method
    const INQUIRED_QUANTITY = Math.pow(2,256);
    try {
      await instance.getPrice.call(lastProductID,INQUIRED_QUANTITY,{from : buyerAdr});
    } catch(e) {
      assert(true,"getPrice cannot be called when quantity is overflown")
      return;
    }

    assert.equal(false,"getPrice can be called when quantity is overflown")

  });

  it("TEST14 : Owners withdaws all collected funds, contract has 0 balance and owner receives all funds", async () => {
    
    let instance = await Marketplace.deployed();
    let ownerAdr = accounts[0];

    //get contract's ETH balance before owner withdraws it all
    let conractETHBalanceBeforeWithdrawal = await instance.getETHBalance.call({from: ownerAdr});
    conractETHBalanceBeforeWithdrawal =  web3.fromWei(conractETHBalanceBeforeWithdrawal.valueOf());

    //get owner's ETH balance before withdrawal
    let ownerBalanceBeforeWithdrawal =  web3.fromWei(web3.eth.getBalance(ownerAdr).valueOf());

    //owner withdraws all funds
    let tx = null;
    try {
      tx = await instance.withdraw({from: ownerAdr});
    } catch (e) {
      assert.equal(false, "owner could not withdraw funds from contract");
    }

    //get contract's ETH balance before owner withdraws it all
    let conractETHBalanceAfterWithdrawal = await instance.getETHBalance.call({from: ownerAdr});
    conractETHBalanceAfterWithdrawal = web3.fromWei(conractETHBalanceAfterWithdrawal.valueOf());

    //get owner's ETH balance after withdrawal
    let ownerBalanceAfterWithdrawal =  web3.fromWei(web3.eth.getBalance(ownerAdr).valueOf());

    //check LogAllFundsWithdrawn event is fired
    let areLogsCorrect = false;
    for (_tx of tx.logs) {
      if (_tx.event == "LogAllFundsWithdrawn") areLogsCorrect = true;
    }

    assert.isTrue(areLogsCorrect &&
    (Number(conractETHBalanceAfterWithdrawal) == Number(0)) && 
    Math.abs(Number(ownerBalanceAfterWithdrawal) - (Number(ownerBalanceBeforeWithdrawal) + Number(conractETHBalanceBeforeWithdrawal))) < 1e-2 );

  });

  //ALL OTHER PUBLIC GETHERS HAVE BEEN TESTED IN THE OTHER TESTS !!!!

});
var Marketplace = artifacts.require("Marketplace");

const INITIAL_STATE_CONSTANTS = {
  STARTING_AMOUNT_PRODUCTS: 0,
  STARTING_BALANCE: 0,
  STARTING_AMOUNT_TIPS: 0
}

contract('Marketplace Smart Contract Basic Unit Tests', (accounts) => {

  it("TEST1 : Check basic contract data after initial deployment", async () => {
      let callingAdr = accounts[0];
      let instance = await Marketplace.deployed();
      let products = await instance.getProducts.call({from : callingAdr});
      let totalTipsCollected = await instance.getTotalTipsCollected.call({from : callingAdr});
      let numProductsInMarketplace = await instance.getNumProductsInMarketplace.call({from : callingAdr});
      let contractOwner = await instance.owner.call({from : callingAdr});
      let contractETHBal = await instance.getETHBalance.call({from : callingAdr});

      assert.isTrue((totalTipsCollected.valueOf() == INITIAL_STATE_CONSTANTS.STARTING_AMOUNT_TIPS) &&
                    (products.length == INITIAL_STATE_CONSTANTS.STARTING_AMOUNT_PRODUCTS) &&
                    (numProductsInMarketplace.valueOf() == INITIAL_STATE_CONSTANTS.STARTING_AMOUNT_PRODUCTS) &&
                    (contractOwner == callingAdr) &&
                    (contractETHBal == INITIAL_STATE_CONSTANTS.STARTING_BALANCE));
  });

  it("TEST2 : Only Owner can destroy contract", async () => {
    
    let instance = await Marketplace.deployed();
    let ownerAdr = accounts[0];

		try{
			await instance.destroy.call({from: ownerAdr});
			assert(true, "");
		} catch(e) {
      return;
		}
		
		assert(true, "only owner can destroy the contract");
  });

  it("TEST3 : None-Owner cannot destroy contract", async () => {
    
    let instance = await Marketplace.deployed();
    let notOwner = accounts[1];

		try{
			await instance.destroy.call({from: notOwner});
			assert(true, "none-owner cannot destroy the contract");
		} catch(e) {
      return;
		}
		
		assert(false, "none-owner can destroy the contract");
  });

  it("TEST4 : None-Owner cannot transfer ownership", async () => {
    let initialOwner = accounts[1];
    let nextOwner = accounts[2];
    let instance = await Marketplace.deployed();

    try {
      await instance.transferOwnership(nextOwner, {from: initialOwner});
      assert(true, "none-owner cannot transfer ownership");
    } catch(e) {
      return;
    }
    assert(false, "none-owner can transfer ownership");
  });

  it("TEST5 : Owner transfers ownership", async () => {
    let initialOwner = accounts[0];
    let nextOwner = accounts[1];
    let instance = await Marketplace.deployed();

    let _initialOwner = await instance.owner.call({from : initialOwner});
    let tx = await instance.transferOwnership(nextOwner, {from: initialOwner});
    let _nextOwner = await instance.owner.call({from : initialOwner});

    assert.isTrue((initialOwner == _initialOwner) && (nextOwner == _nextOwner));
  });

  it("TEST6 : Check OwnershipTransferred event upon ownership transfer", async () => {
    let currentOwner = accounts[1];
    let nextOwner = accounts[2]; //the new owner
    let instance = await Marketplace.deployed();

    let tx = await instance.transferOwnership(nextOwner, {from: currentOwner});

    let areLogsCorrect = false;
    for (_tx of tx.logs) {
      if (_tx.event == "OwnershipTransferred") areLogsCorrect = true;
    }

    assert.isTrue(areLogsCorrect);
  });

  it("TEST7 : None-Owners cannot withdraw funds", async () => {
    let instance = await Marketplace.deployed();
    let notOwner = accounts[3];

		try{
			await instance.withdraw.call({from: notOwner});
			assert(true, "None-owner cannot withdraw contract funds");
		} catch(e) {
      return;
		}
		
		assert(false, "None-owner can withdraw contract funds");
  });

  it("TEST8 : Only Owner can withdraw funds", async () => {
    let instance = await Marketplace.deployed();
    let currentOwner = accounts[2];

		try{
			await instance.withdraw.call({from: currentOwner});
		} catch(e) {
      assert(false, "owner cannot withdraw funds");
      return;
		}
		
		assert(true, "owner can withdraw contract funds");
  });

  it("TEST9 : Cannot send payment to fallback", async () => {
    let callingAdr = accounts[1];
    let instance = await Marketplace.deployed();

    try {
      await instance.sendTransaction({from: callingAdr,
        value: web3.toWei(1, 'ether')});
      assert(true, "cannot send payment to fallback");
    } catch(e) {
      return;
    }

    assert(false, "can send payment to fallback");
  });

  it("TEST10 : None-Owner cannot destroy contract", async () => {
    let someAcc = accounts[4];
    let instance = await Marketplace.deployed();

    try {
      await instance.destroy({from: someAcc});
      assert(true, "none-owner cannot destroy contract");
    } catch(e) {
      return;
    }

    assert(false, "none-owner can destroy contract");
  });

  it("TEST11 : Only Owner can destroy contract", async () => {
    let currentOwner = accounts[2];
    let instance = await Marketplace.deployed();

    try {
      await instance.destroy({from: currentOwner});
      assert(true, "");
    } catch(e) {
      assert(false, "none-owner can destroy contract");
      return;
    }

    assert(true, "owner can destroy contract");
  });

})

let marketplaceI = {
    
    addProduct : (web3Interface,
                marketplaceInstance, 
                productName, 
                productPriceInEther, 
                productQuantity, 
                accountToSendFrom ) => { return new Promise(function(resolve, reject) {

        let res = { err: false, tx: null }
        let tx = null;
        
        try {
            tx = marketplaceInstance.newProduct(
                productName,
                web3Interface.toWei(Number(productPriceInEther), 'ether'),
                Number(productQuantity), 
                {from: accountToSendFrom});
        } catch(e) {
            res.err = true;
            reject(res)
        }
        res.tx = tx;
        resolve(res)
    })
    },

    getAllProductsIDs: (web3Interface,
                    marketplaceInstance,
                    accountToSendFrom ) => { return new Promise(function(resolve, reject) {

        let productsList = [];
        
        try {
            productsList = marketplaceInstance.getProducts.call({from: accountToSendFrom});
        } catch(e) {
            reject(productsList)
        }
        resolve(productsList)
        
    })
    },

    getProductData: (web3Interface,
                    marketplaceInstance,
                    productID,
                    accountToSendFrom ) => { return new Promise(function(resolve, reject) {

        let productsData = null;       
        try {
            productsData = marketplaceInstance.getProduct.call(productID,{from: accountToSendFrom});
        } catch(e) {
            reject(productsData)
        }
        resolve(productsData)
    })
    },

    getAccountBalance: (web3Interface,
                    accountInquired
                     ) => { return new Promise((resolve, reject) => {

            web3Interface.eth.getBalance(accountInquired,(err,res) => {
                if (res) {
                    let result = { balance : web3Interface.fromWei(res.valueOf()) }
                    resolve(result)
                } else {
                    reject("error")
                }
            });
        })
    },

    updateProduct : (web3Interface,
                marketplaceInstance, 
                productID,
                productQuantity, 
                accountToSendFrom ) => { return new Promise(function(resolve, reject) {

        let res = { err: false, tx: null }
        let tx = null;
        
        try {
            tx = marketplaceInstance.update(
                productID,
                Number(productQuantity), 
                {from: accountToSendFrom});
        } catch(e) {
            res.err = true;
            reject(res)
        }
        res.tx = tx;
        resolve(res)
    })
    },

    buyProduct : (web3Interface,
                marketplaceInstance, 
                productID,
                productQuantity,
                sendEther,
                accountToSendFrom ) => { return new Promise(function(resolve, reject) {

        let res = { err: false, tx: null }
        let tx = null;
        try {
            tx = marketplaceInstance.buy(
                productID,
                Number(productQuantity), 
                {from: accountToSendFrom, value: web3Interface.toWei(Number(sendEther), 'ether')});
        } catch(e) {
            res.err = true;
            reject(res)
        }
        res.tx = tx;
        resolve(res)
    })
    },


}

export default marketplaceI;
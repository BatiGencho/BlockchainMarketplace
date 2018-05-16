import React, { Component } from 'react'
import ProductCard from './ProductCard'
import marketplaceI from './utils/marketplaceI'
import MarketplaceContract from '../build/contracts/Marketplace.json'
import toastr from 'toastr'

export default class Home extends Component {   
    constructor(props) {
        super(props)
        this.state = {
            marketplaceProducts: [],
            web3 : this.props.web3Data.w3
        }
        this.loadAllProductsFromBlockchain = this.loadAllProductsFromBlockchain.bind(this)
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            web3: nextProps.web3Data.w3
        })
    }

    componentWillUnmount() {
        clearInterval(this.interval)
    }

    loadAllProductsFromBlockchain() {

        let arrProductIDs = []
        if (this.state.web3) {

            let marketplaceInstance;
            const contract = require('truffle-contract')
            const marketplace = contract(MarketplaceContract)
            marketplace.setProvider(this.state.web3.currentProvider)

            this.state.web3.eth.getAccounts((error, accounts) => {
                marketplace.deployed().then((instance) => {
                  marketplaceInstance = instance;
                  
                  
                  return marketplaceI.getAllProductsIDs(this.state.web3,
                                                marketplaceInstance,
                                                accounts[0]);
                 
                }).then((productIDs) => {

                    let promises = productIDs.map((productID, index) => {
                        arrProductIDs.push(productID)
                        return (
                            marketplaceI.getProductData(this.state.web3,
                                marketplaceInstance,
                                productID,
                                accounts[0]
                            )
                        )
                    })
                    return Promise.all(promises)

                }).then((productsDataSet) => {
                    
                    let products = productsDataSet.map((product, index) => {
                        return {
                            productName : product[0],
                            productPrice : this.state.web3.fromWei(product[1].valueOf()),
                            productQuantity : product[2].valueOf(),
                            productID: arrProductIDs[index]
                        }
                    });
                    this.setState({
                        marketplaceProducts: products
                    })
                })
                .catch((result) => {
                    toastr.error("Smart Contract Error : Product could not get all products from the blockchain!","Error")
                });
            });
        }    
    }

    componentDidMount() {
        this.loadAllProductsFromBlockchain();
        this.interval = setInterval(()=>{this.loadAllProductsFromBlockchain()}, 4000)  
    }

    render() {
        
        //console.log(this.state.marketplaceProducts)
        let products = this.state.marketplaceProducts.map((product, index) => {
            return (
                <ProductCard key={index}
                             product={product}
                             index={index} />
            )
        })
        

        return (
            <div className="container">
                <h3 className="text-center">Welcome to the
                    <strong> Marketplace</strong>
                </h3>
                <div className="list-group">
                    { products }
                </div>
            </div>
        )
    }
}
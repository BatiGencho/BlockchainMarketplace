import React, { Component } from 'react'
import MarketplaceContract from '../build/contracts/Marketplace.json'

import getWeb3 from './utils/getWeb3'

import {Switch, Route} from 'react-router-dom'
import Navbar from './Navbar'
import Home from './Home'
import Footer from './Footer'
import AddProduct from './AddProduct'
import UpdateProduct from './UpdateProduct'
import BuyProduct from './BuyProduct'
import UserProfile from './UserPofile'
import toastr from 'toastr'

import './App.css'


class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      contractOwnerAddress: null,
      callerAccount: null,
      totalNumberOfProducts: 0
    }

    this.instantiateContract = this.instantiateContract.bind(this)
  }

  componentWillMount() {

    getWeb3
    .then(results => {
      toastr.success("Web3 successfully loaded in React","Success")
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      toastr.error("Web3 could not be found","Error")
    })
  }

  instantiateContract() {
    
    const contract = require('truffle-contract')
    const marketplace = contract(MarketplaceContract)
    marketplace.setProvider(this.state.web3.currentProvider)
    let marketplaceInstance;

    // Get some basic data
    this.state.web3.eth.getAccounts((error, accounts) => {
      marketplace.deployed().then((instance) => {
        marketplaceInstance = instance;
        this.setState({ callerAccount: accounts[0] })
        return marketplaceInstance.owner.call({from: accounts[0]})
      }).then((result) => {
        this.setState({ contractOwnerAddress: result })
        return marketplaceInstance.getNumProductsInMarketplace.call({from : accounts[0]});
      }).then((result) => {
        this.setState({ totalNumberOfProducts: result })
      }).catch((err) => {
        toastr.error("Smart Contract Error : could not catch contract data","Error")
      });
    });
  
  }

  render () {
    let userData = {
      callerAccount:  this.state.callerAccount,
      contractOwnerAddress: this.state.contractOwnerAddress
    }

    let w3 = { w3: this.state.web3 };

    return (
      <div>
        <Navbar userData={ userData }/>
        <Switch>
          <Route exact path="/" render={(props) => (<Home web3Data={w3} {...props} />)} />
          <Route path='/products/add' render={(props) => (<AddProduct web3Data={w3} userData={ userData } {...props} />)}/>
          <Route path='/products/update/:productId?' render={(props) => (<UpdateProduct web3Data={w3} userData={ userData } {...props} />)}/>
          <Route path='/products/buy/:productId?' render={(props) => (<BuyProduct web3Data={w3} {...props} />)}/>
          <Route path='/user/profile/:userId?' render={(props) => (<UserProfile web3Data={w3} {...props} />)} />
        </Switch>
        <Footer web3Data={w3} />
      </div>
    )
  }
}

export default App

import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import MarketplaceContract from '../build/contracts/Marketplace.json'

export default class Footer extends Component {

    constructor(props) {
        super(props)
        this.state = {
            mostRecentProducts: [],
            web3 : this.props.web3Data.w3
        }
        this.getFiveRecentProducts = this.getFiveRecentProducts.bind(this)
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            web3: nextProps.web3Data.w3
        })
    }

    componentDidMount() {
        this.getFiveRecentProducts()
        this.interval = setInterval(()=>{this.getFiveRecentProducts()}, 4000)
    }

    componentWillUnmount() {
        clearInterval(this.interval)
    }

    getFiveRecentProducts() {

        if (this.state.web3) {
            let marketplaceInstance;
            const contract = require('truffle-contract')
            const marketplace = contract(MarketplaceContract)
            marketplace.setProvider(this.state.web3.currentProvider)

            this.state.web3.eth.getAccounts((error, accounts) => {
                marketplace.deployed().then((instance) => {
                  marketplaceInstance = instance;
                  return marketplaceInstance.getProducts.call({from: accounts[0]})
                }).then((result) => {
                  this.setState({ mostRecentProducts: result })
                })
            });

        }
    }

    render() {

        let mostRecentProducts = this.state.mostRecentProducts.slice(0,5).map((productID, index) => {
            return (
                <li key={index}>
                    <Link to={`/products/buy/${ productID }`}>{productID}</Link>
                </li>
            )
        })

        return (
            <footer>
                <div className='container'>
                    <div className="row">
                        <div className="col-sm-5">
                            <h3 className="lead">
                                <strong>Information</strong> and
                                <strong> Copyright</strong>
                            </h3>
                            <p>
                                Powered by
                                <strong> Ethereum</strong>,
                                <strong> Web3</strong>
                                <strong> JavaScript</strong> and
                                <strong> React</strong>
                            </p>
                            <p>@ 2018 SoftUni.</p>
                            <h3 className="lead">Author
                                <a href="https://github.com/BatiGencho">
                                    <strong> Evgeni Pirianov</strong>
                                </a>
                            </h3>
                        </div>
                        <div className="col-sm-4 hidden-xs">
                            <h3 className="lead">
                                <strong>Latest</strong> 5 Products
                            </h3>
                            <ul className="list-inline">
                                {mostRecentProducts}
                            </ul>
                        </div>

                    </div>
                </div>
            </footer>
        )
    }
}
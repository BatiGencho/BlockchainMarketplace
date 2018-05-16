import React, { Component } from 'react'
import marketplaceI from './utils/marketplaceI'
import MarketplaceContract from '../build/contracts/Marketplace.json'
import toastr from 'toastr'


export default class UserProfile extends Component {

    constructor(props) {
        super(props)

        this.state = {
            contractOwnerAddress: 'unknown',
            contractETHBalance: 'unknown',
            contractTipsCollected: 'unknown',
            currentAccountAddress: 'unknown',
            currentAccountBalance: 'unknown',
            web3 : this.props.web3Data.w3
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            web3: nextProps.web3Data.w3
        })
    }

    componentDidMount() {

        if (this.state.web3) {

            //get current account address & balance
            marketplaceI.getAccountBalance(this.state.web3,this.props.match.params.userId)
            .then((result) => {
                this.setState({
                    currentAccountAddress: this.props.match.params.userId,
                    currentAccountBalance: result.balance
                })
            }).catch((result) => {
                toastr.error("Web3 error whilst getting the account balance","Error")
            });

            //get owners address & contract balance & tips
            const contract = require('truffle-contract')
            const marketplace = contract(MarketplaceContract)
            marketplace.setProvider(this.state.web3.currentProvider)
            let marketplaceInstance;

            this.state.web3.eth.getAccounts((error, accounts) => {
                marketplace.deployed().then((instance) => {
                    marketplaceInstance = instance;
                    return marketplaceInstance.owner.call({from: accounts[0]})
                }).then((result) => {
                    this.setState({ contractOwnerAddress: result })
                    return marketplaceInstance.getETHBalance.call({from : accounts[0]});
                }).then((result) => {
                    this.setState({ contractETHBalance: this.state.web3.fromWei(result.valueOf()) })
                    return marketplaceInstance.getTotalTipsCollected.call({from : accounts[0]});
                }).then((result) => {
                    this.setState({ contractTipsCollected: this.state.web3.fromWei(result.valueOf()) })
                }).catch((error)=> {
                    toastr.error("Smart Contract Error : could not catch contract data","Error")
                });
              });
            
        }
    }

    render() {

        return (
            <div>
                <div className="container profile-container">
                    <div className="profile-img">
                        {<img src='./public/images/user-default.png' alt="..." />}
                    </div>
                    <div className="profile-info clearfix">
                        <h4 className='lead'>Current Account Information:</h4>
                        <h4 className="lead">
                            <strong> { this.state.currentAccountAddress } </strong>
                        </h4>
                        <h4 className='lead'>Contract Owner Information:</h4>
                        <h4 className="lead">
                            <strong> { this.state.contractOwnerAddress } </strong>
                        </h4>
                    </div>
                </div>
                <div className="container profile-container">
                    <div className="profile-stats clearfix">
                        <ul>
                            <li>
                                <span className="stats-number">{ this.state.contractETHBalance }</span>Contract Funds ETH
                            </li>
                            <li>
                                <span className="stats-number">{ this.state.contractTipsCollected }</span>Contract Tips ETH
                            </li>
                            <li>
                                <span className="stats-number">{ this.state.currentAccountBalance }</span>Current Account ETH
                            </li>
                        </ul>
                    </div>
                    <div className="pull-right btn-group">
                        <a className="btn btn-primary">
                            { 'Find on Etherscan' }
                        </a>
                    </div>
                </div>
            </div>
        )
    }

}
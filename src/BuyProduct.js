import React from 'react';
import toastr from 'toastr'
import MarketplaceContract from '../build/contracts/Marketplace.json'
import marketplaceI from './utils/marketplaceI'

export default class BuyProduct extends React.Component {
    constructor(props) {
        super(props);
        
        let _ID = (this.props.match.params.productId || '');
        this.state = {
            ID: _ID,
            sentEther: '',
            quantity: '',
            IDValidationState: '',
            sentEtherValidationState: '',
            quantityValidationState: '',
            helpBlockID: '',
            helpBlockSentEther: '',
            helpBlockQuantity: '',
            web3 : this.props.web3Data.w3
        };
        this.isPositiveInteger = this.isPositiveInteger.bind(this);
        this.isPositiveFloat = this.isPositiveFloat.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            web3: nextProps.web3Data.w3
        })
    }

    isPositiveInteger(value) { return /^[0-9]+$/.test(String(value)) }
    isPositiveFloat(value) { return /^[+]?\d+(\.\d+)?$/.test(String(value)) }

    handleSubmit(e) {
        
        e.preventDefault();

        let productID = this.state.ID.trim();
        let productSentEther = this.state.sentEther.trim();
        let productQuantity = this.state.quantity.trim();

        if (productID === "") {
            this.setState({
                IDValidationState: 'has-error',
                helpBlockID: 'Please enter none-empty Product ID!'
            });
            return;
        } else {
            this.setState({
                IDValidationState: '',
                helpBlockID: ''
            });
        }

        if (!this.isPositiveFloat(productSentEther) || productSentEther === "") {
            this.setState({
                sentEtherValidationState: 'has-error',
                helpBlockSentEther: 'Please enter a decimal amount greater than zero!'
            });
            return;
        } else {
            this.setState({
                sentEthereValidationState: '',
                helpBlockSentEther: ''
            });
        }
        
        if (!this.isPositiveInteger(productQuantity) || productQuantity === "") {
            this.setState({
                quantityValidationState: 'has-error',
                helpBlockQuantity: 'Please enter an exact quantity greater than zero!'
            });
            return;
        } else {
            this.setState({
                quantityValidationState: '',
                helpBlockQuantity: ''
            });
        }

        if (this.state.web3) {
            
            let marketplaceInstance;
            const contract = require('truffle-contract')
            const marketplace = contract(MarketplaceContract)
            marketplace.setProvider(this.state.web3.currentProvider)

            
            this.state.web3.eth.getAccounts((error, accounts) => {
                marketplace.deployed().then((instance) => {
                  marketplaceInstance = instance;

                  return marketplaceI.buyProduct(this.state.web3,
                                                marketplaceInstance, 
                                                productID,
                                                productQuantity,
                                                productSentEther,
                                                accounts[0]);

                }).then((result) => {
                    //toastr.success("Product successfully bought","Success")
                    this.props.history.push('/')
                })
                .catch((result) => {
                    toastr.error("Smart Contract Error : Product could not be bought !","Error")
                });
            });

        } else {
            toastr.error("Web3 is not loaded. Could not add a product","Error")
        }
    }

    handleIDChange(e) {
        let ID = e.target.value;
        this.setState({
            ID: ID
        });
    }

    handleSentEtherChange(e) {
        let sentEther = e.target.value;
        this.setState({
            sentEther: sentEther
        });
    }

    handleQuantityChange(e) {
        let quantity = e.target.value;
        this.setState({
            quantity: quantity
        });
    }

    render() {
        return (
            <div className='container'>
                <div className='row flipInX animated'>
                    <div className='col-sm-8'>
                        <div className='panel panel-default'>
                            <div className='panel-heading'>Buy Product</div>
                            <div className='panel-body'>
                                <form onSubmit={  this.handleSubmit.bind(this)  }>

                                    <div className={ 'form-group ' + this.state.IDValidationState }>
                                        <label className='control-label'>ID</label>
                                        <input type='text' className='form-control' ref='IDTextField'
                                               value={ this.state.ID }
                                               onChange={ this.handleIDChange.bind(this) } autoFocus/>
                                        <span className='help-block'>{ this.state.helpBlockID }</span>
                                    </div>

                                    <div className={ 'form-group ' + this.state.quantityValidationState }>
                                        <label className='control-label'>Quantity</label>
                                        <input type='text' className='form-control' ref='quantityTextField'
                                               value={ this.state.quantity }
                                               onChange={ this.handleQuantityChange.bind(this) } autoFocus/>
                                        <span className='help-block'>{ this.state.helpBlockQuantity }</span>
                                    </div>

                                    <div className={ 'form-group ' + this.state.sentEtherValidationState }>
                                        <label className='control-label'>ETH to send (in ETHER)</label>
                                        <input type='text' className='form-control' ref='sentEtherTextField'
                                               value={ this.state.sentEther }
                                               onChange={ this.handleSentEtherChange.bind(this) } autoFocus/>
                                        <span className='help-block'>{ this.state.helpBlockSentEther }</span>
                                    </div>
                                    <button type='submit' className='btn btn-primary'>Buy</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
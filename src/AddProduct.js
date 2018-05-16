import React from 'react';
import toastr from 'toastr'
import MarketplaceContract from '../build/contracts/Marketplace.json'
import marketplaceI from './utils/marketplaceI'

export default class AddProduct extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            name: '',
            price: '',
            quantity: '',
            description: '',
            nameValidationState: '',
            priceValidationState: '',
            quantityValidationState: '',
            helpBlockName: '',
            helpBlockPrice: '',
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
        
        //console.log(this.state.web3)
        e.preventDefault();

        let productName = this.state.name.trim();
        let productPrice = this.state.price.trim();
        let productQuantity = this.state.quantity.trim();
        let description = this.state.description.trim();


        if (productName === "") {
            this.setState({
                nameValidationState: 'has-error',
                helpBlockName: 'Please enter none-empty Product name!'
            });
            return;
        } else {
            this.setState({
                nameValidationState: '',
                helpBlockName: ''
            });
        }

        if (!this.isPositiveFloat(productPrice) || productPrice === "") {
            this.setState({
                priceValidationState: 'has-error',
                helpBlockPrice: 'Please enter a decimal price greater than zero!'
            });
            return;
        } else {
            this.setState({
                priceValidationState: '',
                helpBlockPrice: ''
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

                  return marketplaceI.addProduct(this.state.web3,
                                                marketplaceInstance, 
                                                productName, 
                                                productPrice, 
                                                productQuantity, 
                                                accounts[0]);

                }).then((result) => {
                    //toastr.success("Product successfully added","Success")
                    this.props.history.push('/')
                })
                .catch((result) => {
                    toastr.error("Smart Contract Error : Product could not be added !","Error")
                });
            });

        } else {
            toastr.error("Web3 is not loaded. Could not add a product","Error")
        }
    }

    handleNameChange(e) {
        
        let name = e.target.value;
        this.setState({
            name: name
        });
    }

    handlePriceChange(e) {
        let price = e.target.value;
        this.setState({
            price: price
        });
    }

    handleQuantityChange(e) {
        let quantity = e.target.value;
        this.setState({
            quantity: quantity
        });
    }

    handleDescriptionChange(e) {
        let description = e.target.value;
        this.setState({
            description: description
        });
    }

    render() {

        if (this.props.userData.callerAccount !== this.props.userData.contractOwnerAddress) {
            toastr.info("Only the Contract Owner can add a product","info")
            return null;
        }

        return (
            <div className='container'>
                <div className='row flipInX animated'>
                    <div className='col-sm-8'>
                        <div className='panel panel-default'>
                            <div className='panel-heading'>Add New Product</div>
                            <div className='panel-body'>
                                <form onSubmit={  this.handleSubmit.bind(this)  }>

                                    <div className={ 'form-group ' + this.state.nameValidationState }>
                                        <label className='control-label'>Name</label>
                                        <input type='text' className='form-control' ref='nameTextField'
                                               value={ this.state.name }
                                               onChange={ this.handleNameChange.bind(this) } autoFocus/>
                                        <span className='help-block'>{ this.state.helpBlockName }</span>
                                    </div>

                                    <div className={ 'form-group ' + this.state.priceValidationState }>
                                        <label className='control-label'>Price (in ETHER)</label>
                                        <input type='text' className='form-control' ref='priceTextField'
                                               value={ this.state.price }
                                               onChange={ this.handlePriceChange.bind(this) } autoFocus/>
                                        <span className='help-block'>{ this.state.helpBlockPrice }</span>
                                    </div>

                                    <div className={ 'form-group ' + this.state.quantityValidationState }>
                                        <label className='control-label'>Quantity</label>
                                        <input type='text' className='form-control' ref='quantityTextField'
                                               value={ this.state.quantity }
                                               onChange={ this.handleQuantityChange.bind(this) } autoFocus/>
                                        <span className='help-block'>{ this.state.helpBlockQuantity }</span>
                                    </div>

                                    <div className='form-group'>
                                        <label className='control-label'>Description</label>
                                        <textarea className='form-control'
                                                  rows="5"
                                                  value={ this.state.description }
                                                  onChange={ this.handleDescriptionChange.bind(this) } />
                                    </div>

                                    <button type='submit' className='btn btn-primary'>Submit</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
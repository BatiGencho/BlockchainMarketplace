import React from 'react';
import toastr from 'toastr'
import MarketplaceContract from '../build/contracts/Marketplace.json'
import marketplaceI from './utils/marketplaceI'

export default class UpdateProduct extends React.Component {
    constructor(props) {
        super(props);
        
        let _ID = (this.props.match.params.productId || '');
        this.state = {
            ID: _ID,
            quantity: '',
            IDValidationState: '',
            quantityValidationState: '',
            helpBlockID: '',
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
        let productQuantity = this.state.quantity.trim();

        if (productID === "") {
            this.setState({
                IDValidationState: 'has-error',
                helpBlockID: 'Please none-empty enter Product ID!'
            });
            return;
        } else {
            this.setState({
                IDValidationState: '',
                helpBlockID: ''
            });
        }
        
        if (!this.isPositiveInteger(productQuantity) || productQuantity === "") {
            this.setState({
                quantityValidationState: 'has-error',
                helpBlockQuantity: 'Please enter an exact quantity greater or equal zero!'
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
                console.log(productID,productQuantity);
                  return marketplaceI.updateProduct(this.state.web3,
                                                marketplaceInstance, 
                                                productID, 
                                                productQuantity, 
                                                accounts[0]);

                }).then((result) => {
                    //toastr.success("Product successfully updated","Success")
                    this.props.history.push('/')
                })
                .catch((result) => {
                    toastr.error("Smart Contract Error : Product could not be updated !","Error")
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

    handleQuantityChange(e) {
        let quantity = e.target.value;
        this.setState({
            quantity: quantity
        });
    }

    render() {

        if (this.props.userData.callerAccount !== this.props.userData.contractOwnerAddress) {
            toastr.info("Only the Contract Owner can update a product","info")
            return null;
        }

        return (
            <div className='container'>
                <div className='row flipInX animated'>
                    <div className='col-sm-8'>
                        <div className='panel panel-default'>
                            <div className='panel-heading'>Update Product</div>
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

                                    <button type='submit' className='btn btn-primary'>Update</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
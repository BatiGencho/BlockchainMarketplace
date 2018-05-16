import React, { Component } from 'react'
import { Link } from 'react-router-dom'


export default class ProductCard extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="animated fadeIn">
                <div className="media movie">
                    <span className="position pull-left">{this.props.index + 1}</span>
                    <div className="media-body">
                        <h4 className="media-heading">
                            Product Name : {this.props.product.productName}
                        </h4>
                        <h4>Price: {this.props.product.productPrice} ETH / Item</h4>
                        <br />
                        <p>ID: { this.props.product.productID }</p>
                        <h4>
                            <Link to={`/products/update/${ this.props.product.productID }`} >
                                UPDATE
                            </Link>
                            <br />
                            <Link to={`/products/buy/${ this.props.product.productID }`} >
                                BUY
                            </Link>
                        </h4>
                        <br />
                        <span className="votes">Quantity: {this.props.product.productQuantity}</span>
                    </div>
                </div>
                <div id="clear" />
            </div>
        )
    }
}
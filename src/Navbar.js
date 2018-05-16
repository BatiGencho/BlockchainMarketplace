import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import NavbarUserMenu from './NavbarUserMenu'

export default class Navbar extends Component {

    constructor(props) {
        super(props)
        this.state = {
            ajaxAnimationClass: ''
        }
    }

    componentDidMount() {
    }

    render() {

        let navbarUserMenu = <NavbarUserMenu userData = { this.props.userData } />

        return (
            <nav className="navbar navbar-default navbar-static-top">
                <div className="navbar-header">
                    <button type="button"
                        className="navbar-toggle collapsed"
                        data-toggle="collapse"
                        data-target="#navbar">
                        <span className="sr-only">Toggle Navigation</span>
                        <span className="icon-bar"/>
                        <span className="icon-bar"/>
                        <span className="icon-bar"/>
                    </button>
                    <Link to='/' className="navbar-brand">
                        <span
                            ref="triangles"
                            className={"triangles animated" + this.state.ajaxAnimationClass}>
                            <div className="tri invert" />
                            <div className="tri invert" />
                            <div className="tri" />
                            <div className="tri invert" />
                            <div className="tri invert" />
                            <div className="tri" />
                            <div className="tri invert" />
                            <div className="tri" />
                            <div className="tri invert" />
                        </span>
                        Marketplace
                    </Link>
                </div>
                <div id="navbar" className="navbar-collapse collapse" >
                    <ul className="nav navbar-nav">
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        <li>
                            <Link to="/products/add">Add Product</Link>
                        </li>
                        <li>
                            <Link to="/products/update/">Update Product</Link>
                        </li>
                        <li>
                            <Link to="/products/buy/">Buy Product</Link>
                        </li>
                    </ul>
                    { navbarUserMenu }
                </div>
            </nav>
        )
    }
}
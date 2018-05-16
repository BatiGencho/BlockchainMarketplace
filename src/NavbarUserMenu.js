import React, { Component } from 'react'
import { Link } from 'react-router-dom'


export default class NavbarUserMenu extends Component {

    constructor(props) {
        super(props)

        this.state = {
            callerAccount : this.props.userData.callerAccount
        }
    }

    // THE COMPONENT STATE DEPENDS ON ITS PROPERTIES
    // STATE CHANGE IS ONLY TRIGGERED UPON CHANGES OF THE PROPS THE COMPONENT RECEIVES
    componentWillReceiveProps(nextProps) {
        this.setState({
            callerAccount: nextProps.userData.callerAccount
        })
    }

    render() {

        let userMenu = null

        if (!this.state.callerAccount) {
            userMenu = (
            <ul className="nav navbar-nav pull-right">
                <li>
                    <a href='#' onClick={ this.props.userData.loginUser} >Login</a>
                </li>

            </ul>
            )

        } else {
            userMenu = (
                <ul className="nav navbar-nav pull-right">
                    <li>
                        <Link to={`/user/profile/${ this.state.callerAccount}`}><strong>current account : </strong> { this.state.callerAccount }</Link>
                    </li>
                </ul>
                )
        }

        return (
            <div>
                { userMenu }
            </div>
        )
    }
}
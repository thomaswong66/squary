import React from 'react';
import {Button, Panel, PanelGroup, Input} from 'rsuite';

import cartSummaryUtils from "../../utils/CartSummaryUtils.js";
import {withRouter, Redirect} from 'react-router-dom';

import * as firebase from 'firebase';

class OrderSummary extends React.Component{
    constructor(props){
        super(props);
        this.state = { 
             cart: null,
        };
        console.log(this.props.match.params.info);
    }

    componentDidMount() {
        console.log(localStorage.getItem('isHost'));
        if(localStorage.getItem('isHost') === '1'){
            cartSummaryUtils.setCompletedOrder(firebase.database(), this.props.match.params.info, localStorage.getItem('room_id'))
            .then(()=>{
                cartSummaryUtils.getCompletedOrder(firebase.database(), this.props.match.params.info)
                .then((compResponse) => {
                    this.setState({
                        cart: compResponse.result
                    },()=> localStorage.clear())
                })
            })
        } else {
            console.log("HELLO");
            cartSummaryUtils.getCompletedOrder(firebase.database(), this.props.match.params.info)
            .then((compResponse) => {
                this.setState({
                    cart: compResponse.result
                },()=> localStorage.clear())
            })
        }   
    }

    componentWillUnmount() {
      
    }

    render(){
        return (
            <div>
                {this.state.cart && 
                    this.state.cart.size} 
            </div>
        );
    }
}


export default withRouter(OrderSummary);
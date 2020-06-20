import React from 'react';
import {Button, Icon} from 'rsuite';

class CartButton extends React.Component{
    constructor(props){
        super(props);
        this.state = { 
            cart: this.props.cart, 
            count: 0,
            total: this.props.total
        };

        this.formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'CAD',
        });
    }

    componentWillReceiveProps(nextProps){
        this.setState({total: nextProps.total})
        if (nextProps.cart !== this.state.cart) {
            this.setState({ cart: nextProps.cart, total: nextProps.total });
            var count = Number(0);
            for(let cartItem of nextProps.cart){
                if(cartItem[1].count != null){
                    count += Number(cartItem[1].count);
                }  
            }
            this.setState({ count: count });
        }
    }

    render(){
        return (
            <div className="cartButtonSectionDIV">
                <Button className="cartButtonSectionME" align="middle" justify="center" onClick={() => this.props.onClick()}>
                    <div className="cartButtonInsideME">
                        <span >
                            <span className="cartCount">{this.state.count}</span>
                            <Icon className="cartIcon" icon="shopping-cart" size="2x"/>
                        </span>
                        <span>
                            View Cart
                        </span>
                        <span>
                            {this.formatter.format(this.state.total/100)}
                        </span>
                    </div>
                </Button>
            </div>
        );
    }
}


export default CartButton;
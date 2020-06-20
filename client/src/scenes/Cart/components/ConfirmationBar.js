import React from 'react';
import {IconButton, Button, Panel, PanelGroup} from 'rsuite';

class ConfirmationBar extends React.Component{
    constructor(props){
        super(props);
        this.state = { 
            statusCount: this.props.statusCount, 
            guests: this.props.guests, 
            confirmationCount: 0,
            guestCount: 0,
        };

        this.isHost = Boolean(Number(localStorage.getItem("isHost")))
    }

    componentWillReceiveProps(nextProps){
        if (nextProps.statusCount !== this.state.statusCount || 
            nextProps.guests !== this.state.guests ) {
            this.setState({ statusCount: nextProps.statusCount, guests: nextProps.guests }, () => {
                 this.updateConfCount();
            });
        }
    }

    updateConfCount(){
        var count = 0;
        var confirmations = this.state.statusCount;
        if(confirmations != null){
            confirmations.forEach((value, key) => {
                if(value.status)
                    count++;
            })
        }
        this.setState({
            confirmationCount: count
        });
    }

    render(){
        var confirmedCount = this.state.confirmationCount;
        if(this.state.guests != null)
            var guestCount = this.state.guests.length;

        return (
            <div className="checkOutButton">
                {this.state.guests && this.isHost && confirmedCount === guestCount &&
                    <Button appearance="primary" onClick={()=>this.props.onPay()}>
                        <span>Checkout</span>
                    </Button>
                }
                {this.state.guests && this.isHost && confirmedCount !== guestCount &&
                    <Button disabled appearance="primary" >
                        <span>Checkout (Waiting on {guestCount - confirmedCount} / {guestCount})</span>
                    </Button>
                }
                {this.state.guests && !this.isHost &&
                    <Button disabled appearance="primary" onClick={()=>this.props.onPay()}>
                        <span>Waiting for host to checkout...</span>
                    </Button>
                }
            </div>
        );
    }
}


export default ConfirmationBar;
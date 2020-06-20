import React from 'react';
import {Button, Panel, PanelGroup, Icon, IconButton, Input} from 'rsuite';

class CartItem extends React.Component{
    constructor(props){
        super(props);
        this.item = props.item;
        this.title = props.item.item.detail.name;
        this.desc = props.item.item.detail.description;
        this.onValueUpdate = props.onValueUpdate;
        this.state = {
            item: this.item.item,
            count: this.item.count,
            changed: false,
            showHeader: props.showHeader,
            self: props.self,
            owner: this.item.owner
        }

        this.savedCartID = localStorage.getItem('currentCartID');
        this.savedUserID = localStorage.getItem('user_id');
        this.futureValue = 0;
        this.lastValue = -1;
    }

    componentWillReceiveProps(nextProps){
        if (nextProps.item.item !== this.state.item) {
            this.setState({ 
                item: nextProps.item.item,
                count: nextProps.item.count
                });
        }
    }

    updateValue(value, event){
        if(value <= 0){
            this.setState({ count:0, changed: true});
        }else if(value <= 100)
            this.setState({ count:value, changed: true});
        else 
            this.setState({ count:100, changed: true});        
    }

    updateItemValue(){
        this.onValueUpdate(this.item.item, this.state.count, this.props.itemKey)
        this.setState({ changed: false });
        this.lastValue = this.state.count;
    }

    updateActualMonetaryValue(cost){
        var formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'CAD',
        });

        return formatter.format(this.state.count * (cost/100));
    }

    render(){
        const item = this.state.item;
        return(
            <div>
                { (this.state.count >= 0 || this.state.changed) &&
                    <div>
                        {this.state.showHeader && 
                            <span className="orderHost">{this.state.owner}</span>
                        }
                        <Panel className="cartItemPanel">
                            <div className="numberInput">
                                {this.state.self
                                    ?   <Input type="number" placeholder="Default Input" value={this.state.count} 
                                            onChange={(value, event) => this.updateValue(value, event)}
                                        />
                                    :   <Input  disabled type="number" placeholder="Default Input" value={this.state.count} 
                                            onChange={(value, event) => this.updateValue(value, event)}
                                        />
                                }   
                                {this.state.changed && 
                                    <Button className="buttonUpdatevalue"appearance="primary" onClick={() => this.updateItemValue()}>
                                        Update
                                    </Button>
                                }
                                
                            </div>
                            <div className="cartOrder">
                                <h6>{this.title}</h6>
                                <p>{item.note} </p>
                            </div>
                            <span>{this.updateActualMonetaryValue(item.variation.item_variation_data.price_money.amount)}</span>
                            
                        </Panel>
                    </div>
                }
            </div>
        )
    }
}

export default CartItem;
import React from 'react';
import {Button, Panel, PanelGroup, IconButton, Icon, Input} from 'rsuite';

import cartUtils from "../../utils/CartUtils.js";
import firebaseCartUtils from "../../utils/FirebaseCartUtils.js";
import firebaseRoomUtils from "../../utils/FirebaseRoomUtils.js";

import {withRouter, Redirect, Link} from 'react-router-dom';
import CartItem from "./components/CartItem.js";
import ConfirmationBar from "./components/ConfirmationBar.js";
import * as firebase from 'firebase';

class Cart extends React.Component{
    constructor(props){
        super(props);
        this.state = { 
            cart: new Map(),
            yourCart: null,
            othersCart: null,
            tableNumber: "",
            selfOrderConfirmed: false,
            isHost: false,
            guests: [],
            confirmations: null,
        };

        this.database = firebase.database();
        this.savedCartID = localStorage.getItem('currentCartID');
        this.savedRoomID = localStorage.getItem('room_id');
        this.savedUserID = localStorage.getItem('user_id');
        this.onItemValueUpdate = this.onItemValueUpdate.bind(this);
    }

    componentDidMount(){
        this.checkIfCartExistsAndFetch();
        var isHostTemp = Boolean(Number(localStorage.getItem('isHost')));
        var tableTemp = "";
        if(localStorage.getItem('tableNumber') == null)
            tableTemp = `undefined`;
        else{
            tableTemp = localStorage.getItem('tableNumber');
        }
        if(localStorage.getItem('selfOrderConfirmed') == null)
            this.setState({ selfOrderConfirmed: false })
        else{
            this.setState({ selfOrderConfirmed: localStorage.getItem('selfOrderConfirmed') })
        }

        this.setState({
            isHost: isHostTemp,
            tableNumber: tableTemp
            });
    }

    componentWillUnmount() {
        firebaseCartUtils.removeAllListener(this.database, this.savedCartID);
    }

    onOrderCompleted(cartId){
        this.props.history.push(`/order-summary/${cartId}`);
    }

    checkIfCartExistsAndFetch(){
        if(localStorage.getItem('currentCartID') === null){
            firebaseCartUtils.createANewFirebaseCart(this.database, firebase.database.ServerValue.TIMESTAMP, this.savedRoomID, this.savedUserID)
            .then(response => {
                localStorage.setItem('currentCartID', response.result.key);
                this.savedCartID = response.result.key;
                this.updateSortedCart();
            })
        }else{
            firebaseCartUtils.getExistingCart(this.database, this.savedCartID)
            .then(response => {
                this.setState({ cart: new Map(response.result)}, ()=>this.updateSortedCart());
            })
        }
        firebaseCartUtils.addContentRemovalListener(this.database, this.savedCartID, (updatedCart)=>this.updateCartCount(updatedCart));
        firebaseCartUtils.addContentAdditionListener(this.database, this.savedCartID, (updatedCart)=>this.updateCartCount(updatedCart));
        firebaseCartUtils.addContentChangedListener(this.database, this.savedCartID, (updatedCart)=>this.updateCartCount(updatedCart));
        firebaseCartUtils.addConfirmationListener(this.database, this.savedCartID, (updatedCart)=>this.updateConfirmationCount(updatedCart));
        firebaseCartUtils.addOrderStatusListener(this.database, this.savedCartID, (id) => this.onOrderCompleted(id));

        firebaseRoomUtils.fetchRoom(this.database, this.savedRoomID)
            .then((response) => {
                var list = Object.values(response.result.guests);
                this.setState({guests: list})
            })

        firebaseRoomUtils.addRoomListener(this.database, this.savedRoomID, (guest)=>this.onGuestAdded(guest))
    }

    onGuestAdded(guest){
        var list = this.state.guests;
        if(!list.find(item => item.nickname === guest.val().nickname))
            list.push(guest.val());
        this.setState({guests: list}); 
    }

    updateCartCount(updatedCart){
        var cart = this.state.cart;
        switch(updatedCart.type){
            case "removal":
                cart.delete(updatedCart.content.key);
                this.setState({cart: new Map(cart)}, ()=>this.updateSortedCart());
                break;
            case "change":
                var item = cart.get(updatedCart.content.key);
                item = updatedCart.content.val()
                cart.set(updatedCart.content.key, item);
                this.setState({cart: new Map(cart)}, ()=>this.updateSortedCart());
                break;
            default:
                cart.set(updatedCart.content.key, updatedCart.content.val());
                this.setState({cart: new Map(cart)}, ()=>this.updateSortedCart());
                break;
        }
        // this.setState({ cart: new Map(updatedCart)}, ()=>this.updateSortedCart());
    }

    updateConfirmationCount(updatedCart){
        this.setState({ confirmations: new Map(updatedCart)});
    }

    updateSortedCart(){
        const cart = this.state.cart;
        var yourTempCart = new Map();
        var othersTempCart = new Map();
        var userID = this.savedUserID;
        for (const [key, value] of cart.entries()) {
            if(value.owner === userID){
                yourTempCart.set(key, value);
            } else {
                othersTempCart.set(key, value)
            }
        }
        var otherTemArray = Array.from(othersTempCart.entries());
        var filteredArray = otherTemArray.filter(itm => itm[1].owner != null);
        filteredArray.sort((a, b) => {
            var nameA = a[1].owner.toUpperCase(); // ignore upper and lowercase
            var nameB = b[1].owner.toUpperCase(); // ignore upper and lowercase
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        })

         this.setState({
            yourCart: yourTempCart,
            othersCart: new Map(filteredArray)
        })
    }

    onItemValueUpdate(item, itemCount, key){
        var savedCartID = this.savedCartID;
        var userID = this.savedUserID
        var carat = new Map(this.state.cart);
        firebaseCartUtils.updateItemInCart(this.database, savedCartID, item, userID, itemCount, key)
            .then((response)=> {
                // if(response.status === "delete"){
                //      carat.delete(response.result)
                //      this.setState({cart: new Map(carat)}, ()=>this.updateSortedCart())
                // }
               
            })
    }

    calculateTotalPerUser(userID, isSelf){
        var formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'CAD',
        });
        var total = {
            beforeTax: 0,
            tax: 0,
            total: 0
        };
        var cart = this.state.cart;
       // console.log(cart);
        if(userID != null){
            for(let itm of cart.entries()){
                if(itm[1].owner != null && itm[1].owner === userID){
                    total.beforeTax += ((itm[1].count * itm[1].item.variation.item_variation_data.price_money.amount)/100);
                }
            }
        } else {
            for(let itm of cart.entries()){
                if(itm[1].owner != null)
                    total.beforeTax += ((itm[1].count * itm[1].item.variation.item_variation_data.price_money.amount)/100);
            }
        }

        total.tax = (total.beforeTax * 0.05);
        total.total = (total.tax + total.beforeTax);
        total.tax = formatter.format(total.tax);
         total.total = formatter.format( total.total);
        return total;
    }

    updateTableNumber(table){
        this.setState({ tableNumber: table });
        localStorage.setItem("tableNumber", table);
    }

    confirmOrder(){
        firebaseCartUtils.updateConfirmationStatus(this.database, this.savedCartID, this.savedUserID, true)
            .then((response) => {
                this.setState({ selfOrderConfirmed: true });
                localStorage.setItem("selfOrderConfirmed", 1);
            });
    }

    checkOut(){
        var condensedCart = new Array();
        //var condensedCartArray = new Map();

        var currentCart = this.state.cart;

        for(let item of currentCart.values()){
             if(item.placeholder !== 'placeholder'){
                if(!condensedCart.find(element => (element.catalog_object_id === item.item.variation.id) && (element.note === item.item.note))){
                    condensedCart.push({   
                        'catalog_object_id': item.item.variation.id,
                        'quantity': String(item.count),
                        'note': item.item.note,
                        'extra-name': item.item.detail.name,
                        'extra-desc': item.item.detail.desc,
                        'base_price_money': {
                            'amount': item.item.variation.item_variation_data.price_money.amount,
                            'currency': item.item.variation.item_variation_data.price_money.currency
                        }
                    });
                }else{
                    var cartItemIndex = condensedCart.findIndex(item.item.variation.id);
                    var cartItem = condensedCart[cartItemIndex];
                    if(item.item.note !== ""){
                        condensedCart.push({   
                            'catalog_object_id': item.item.variation.id,
                            'quantity': String(item.count),
                            'note': item.item.note,
                            'extra-name': item.item.detail.name,
                            'extra-desc': item.item.detail.desc,
                            'base_price_money': {
                                'amount': item.item.variation.item_variation_data.price_money.amount,
                                'currency': item.item.variation.item_variation_data.price_money.currency
                            }
                        })
                    }else{
                        var itemQ = Number(cartItem.quantity);
                        itemQ += item.count;
                        cartItem.quantity = String(itemQ);
                        condensedCart.splice(cartItemIndex, 1, cartItem);
                       
                    }
                }
             }
        }
        
        var lineItems = Array.from(condensedCart.values());
        var actualCart = {
            'location_id': "GH6BA9AEDGTMW",
            'customer_id': localStorage.getItem('user_id'),
            'line_items': lineItems,
            'taxes': [
                {
                    'uid': "gstTax",
                    'name': "GST",
                    'type': "ADDITIVE",
                    'percentage': "5",
                    'scope': "ORDER"
                }
            ],
            'state': "OPEN"
        }

        var jsonobj = JSON.stringify(actualCart);
        cartUtils.createAnOrder(actualCart, this.savedCartID)
            .then((response)=>{
                window.location.assign(JSON.parse(response).result.checkout.checkout_page_url);
                console.log(JSON.parse(response).result.checkout.checkout_page_url);
            })
    }

    render(){
        const yourCart = this.state.yourCart;
        const othersCart = this.state.othersCart;
        var cachedUser = null;
        var differentUser = true;
        return (
            <div>
                <div>
                    <div className="menuHeader" align="middle" justify="end">
                    <div className="menuHeaderTitle">
                        <text style={{fontWeight: "bold", fontSize: 30, color: "black"}}>Cart</text>
                    </div >
                </div>
                    <div className="menu">
                    {this.state.yourCart &&
                        <Panel className="menuItemPanel" bordered shaded>
                            <span className="orderOwner">Your Order</span>
                            <div className="spacing"></div>
                            {Array.from(yourCart.values()).map((value, index) => {
                                return <CartItem
                                    key={value.item.variation.id + value.owner + Math.random(200)} 
                                    item={value}
                                    onValueUpdate={this.onItemValueUpdate}
                                    itemKey={Array.from(yourCart.keys())[index]}
                                    showHeader = {false}
                                    self = {true}
                                />
                            })}
                            {this.state.cart && 
                                <div>
                                    <div className="orderTotals">
                                        <div className="orderTotal">Taxes: <div className="totalNum">{this.calculateTotalPerUser(this.savedUserID, true).tax}</div></div>
                                        <div className="orderTotal">Total: <div  className="totalNum">{this.calculateTotalPerUser(this.savedUserID, true).total}</div></div>
                                    </div>
                                    <div className="bottomSelfCart"> 
                                        {this.state.isHost &&
                                            <div className="confirmation">
                                                <label>Table No.</label>
                                                <Input style={{ width: 50 }} type="number" placeholder="0" value={this.state.tableNumber} 
                                                    onChange={(value, event) => this.updateTableNumber(value, event)}
                                                />
                                            </div>
                                        }
                                        {(this.state.isHost && this.state.tableNumber === `undefined`) && this.state.cart.size == null && 
                                            <Button className="confirmTableID" disabled appearance="primary">
                                                    Confirm Order
                                                </Button>
                                        }
                                        {(this.state.isHost && this.state.tableNumber !== `undefined` && !this.state.selfOrderConfirmed) && this.state.cart && this.state.cart.size > 1 && 
                                            <Button className="confirmTableID" appearance="primary" onClick={() => this.confirmOrder()}>
                                                    Confirm Order
                                                </Button>
                                        }
                                        {!this.state.isHost &&  !this.state.selfOrderConfirmed && this.state.cart && this.state.cart.size > 1 && 
                                            <Button className="confirmTableID" appearance="primary" onClick={() => this.confirmOrder()}>
                                                Confirm Order
                                            </Button>
                                        }

                                        {this.state.selfOrderConfirmed && this.state.cart && this.state.cart.size > 1 && 
                                            <Button className="confirmTableID" disabled appearance="primary">
                                                Confirmed!
                                            </Button>
                                        }
                                    </div>
                                </div>
                            }
                        </Panel>
                    }
                    
                    </div>
                </div>
                <div className="othersCartSection">
                    {this.state.othersCart && 
                    <div>
                        {Array.from(othersCart.values()).map((value, index) => {
                            if(value.owner != null){
                                differentUser = (cachedUser !== value.owner);  
                                cachedUser = value.owner;
                            
                                return <CartItem 
                                    key={value.item.variation.id + value.owner + Math.random(200)} 
                                    item={value}
                                    onValueUpdate={this.onItemValueUpdate}
                                    itemKey={Array.from(othersCart.keys())[index]}
                                    showHeader = {differentUser}
                                    self = {false}
                                />
                            }
                        })}
                         </div>
                    }
                   

                    {this.state.othersCart && 
                        <div className="orderTotalsTOtal">
                            <div className="orderTotal">Taxes: <div className="totalNum">{this.calculateTotalPerUser(null, true).tax}</div></div>
                            <div className="orderTotal">Grand Total: <div  className="totalNum">{this.calculateTotalPerUser(null, true).total}</div></div>
                        </div>
                    }
                </div>

                {this.state.cart && this.state.cart.size > 1
                    ? <ConfirmationBar guests={this.state.guests} statusCount={this.state.confirmations} onPay={()=>this.checkOut()}/>
                    : <Link to="/menu" className="noItemsInCart" ><span>Add something to the order!</span></Link>
                }

            </div>
        );
    }
}


export default withRouter(Cart);
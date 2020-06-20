import React from 'react';
import MenuItem from "./components/MenuItem.js";
import CartButton from "../Cart/components/CartButton.js";
import VirtualLine from "../../components/VirtualLine.js";
import {withRouter, Link} from 'react-router-dom';
import * as firebase from 'firebase';
import {IconButton, Icon, Modal, FlexboxGrid} from 'rsuite';
import catalogFetch from "../../utils/CatalogFetch";
import firebaseCartUtils from "../../utils/FirebaseCartUtils.js";
import firebaseRoomUtils from "../../utils/FirebaseRoomUtils.js";
import MenuAddModal from "../Menu/components/MenuAddModal.js";

class Menu extends React.Component{
    constructor(props){
        super(props);
        this.state = { 
            data: [] ,
            showVirtualLine: false,
            cart: new Map(),
            guests: new Map(),
            showModal: false,
            itemSelected: null,
            totalCost: Number(0)
        };
        this.closeVirtualLine = this.closeVirtualLine.bind(this);
        this.openVirtualLine = this.openVirtualLine.bind(this);
        this.database = firebase.database();
    }

    componentDidMount(){
        this.fetchCatalog();
        this.checkStuff();
    }

    checkStuff(){
        var savedRoomID = localStorage.getItem('room_id');
         if(localStorage.getItem('isHost') === "0" && localStorage.getItem('currentCartID') === null){

            this.database.ref('rooms/' + savedRoomID ).on('value', snapshot => {
                if(snapshot.val().cart != null){
                    localStorage.setItem('currentCartID', snapshot.val().cart);
                    this.checkIfCartExistsAndFetch();
                }
            })
        }else{
             this.checkIfCartExistsAndFetch();
        }
    }

    componentWillUnmount() {
        var savedCartID = localStorage.getItem('currentCartID');
        firebaseCartUtils.removeAllListener(this.database, savedCartID);
    }

    nextPath(path) {
        this.props.history.push(path);
    }

    fetchCatalog() {
        catalogFetch()
            .then(response => {
                this.setState({ menu: response.result.objects });
            })
    }

    checkIfCartExistsAndFetch(){
        var savedUserID = localStorage.getItem('user_id');
        var savedCartID = localStorage.getItem('currentCartID');
        var savedRoomID = localStorage.getItem('room_id');

        if(localStorage.getItem('isHost') === "1" && localStorage.getItem('currentCartID') === null){
            firebaseCartUtils.createANewFirebaseCart(this.database, firebase.database.ServerValue.TIMESTAMP, savedRoomID, savedUserID)
            .then(response => {
                localStorage.setItem('currentCartID', response.result.key);
                firebaseCartUtils.updateRoomDataWithNewCart(this.database, response.result.key, savedRoomID)
                    .then((response) => {
                        console.log(response);
                    })
                firebaseCartUtils.addContentRemovalListener(this.database, response.result.key, (updatedCart)=>this.updateCartCount(updatedCart));
                firebaseCartUtils.addContentAdditionListener(this.database, response.result.key, (updatedCart)=>this.updateCartCount(updatedCart));
                firebaseCartUtils.addContentChangedListener(this.database, response.result.key, (updatedCart)=>this.updateCartCount(updatedCart));
                firebaseCartUtils.addOrderStatusListener(this.database, response.result.key, (id) => this.onOrderCompleted(id));
            })
        } else{
            savedCartID = localStorage.getItem('currentCartID');
            firebaseCartUtils.getExistingCart(this.database, savedCartID)
            .then(response => {
                this.setState({ cart: response.result},()=> this.updateCartCost());
                firebaseCartUtils.addContentRemovalListener(this.database, savedCartID, (updatedCart)=>this.updateCartCount(updatedCart));
                firebaseCartUtils.addContentAdditionListener(this.database, savedCartID, (updatedCart)=>this.updateCartCount(updatedCart));
                firebaseCartUtils.addContentChangedListener(this.database, savedCartID, (updatedCart)=>this.updateCartCount(updatedCart));
                firebaseCartUtils.addOrderStatusListener(this.database, savedCartID, (id) => this.onOrderCompleted(id));
            })
        }

        firebaseRoomUtils.fetchRoom(this.database, savedRoomID)
            .then((response) => {
               var list = Object.values(response.result.guests);
                this.setState({guests: list})

                firebaseRoomUtils.addRoomListener(this.database, savedRoomID, (stuff)=>this.onGuestAdded(stuff))
            })

       
    }

    onGuestAdded(guest){
        var list = this.state.guests;
        if(!list.find(item => item.nickname === guest.val().nickname))
            list.push(guest.val());
        this.setState({guests: list}); 
    }

    onOrderCompleted(cartId){
        this.props.history.push(`/order-summary/${cartId}`);
    }

    updateCartCount(updatedCart){
        var cart = this.state.cart;
        switch(updatedCart.type){
            case "removal":
                cart.delete(updatedCart.content.key);
                this.setState({cart: new Map(cart)}, ()=>this.updateCartCost());
                break;
            case "change":
                var item = cart.get(updatedCart.content.key);
                item = updatedCart.content.val()
                cart.set(updatedCart.content.key, item);
                this.setState({cart: new Map(cart)}, ()=>this.updateCartCost());
                break;
            default:
                cart.set(updatedCart.content.key, updatedCart.content.val());
                this.setState({cart: new Map(cart)}, ()=>this.updateCartCost());
                break;
        }
    }

    updateCartCost(){
        var cart = this.state.cart;
        var total = Number(0);
        for(let item of cart.values()){
            if(item.placeholder == null){
                var itemPrice = item.item.variation.item_variation_data.price_money.amount;
                total += (Number(item.count) * Number(itemPrice));
            }
        }
        this.setState({totalCost: Number(total)});
    }

    onMenuItemClicked(item){
        var savedCartID = localStorage.getItem('currentCartID');
        var savedUserID = localStorage.getItem('user_id');

        var itemToAdd = 
        {
            'detail': {
                'name': item.item_data.name,
                'desc': item.item_data.description,
                'categoryID': item.item_data.category_id
            },
            'variation': item.item_data.variations[0],
            'note': ""
        }
        this.setState({showModal: true, itemSelected: itemToAdd});
    }

    addMenuItemToCart(item, note){
        var savedCartID = localStorage.getItem('currentCartID');
        var savedUserID = localStorage.getItem('user_id');
        var tempItem = item;
        if(note !== ""){
            tempItem.note = note;
        }
        firebaseCartUtils.addItemToCart(this.database, savedCartID, tempItem, savedUserID)
            .then(resp => {
                this.setState({showModal: false, itemSelected: null});
            })
    }

    closeVirtualLine() {
      this.setState({ showVirtualLine: false });
    }
    
    openVirtualLine() {
      this.setState({ showVirtualLine: true });
    }

    render(){
        const menuList = this.state.menu;
        const cart = this.state.cart;
        var isVirtualLineDisabled = (localStorage.getItem("table_id") &&
                                        localStorage.getItem("table_id") != "undefined");
                                        
        return (
            <div className="full-height show-grid">
                <div className="menuHeader" align="middle" justify="end">
                    <div className="menuHeaderTitle">
                        <p style={{fontWeight: "bold", fontSize: 30, color: "black"}}>Menu</p>
                    </div >
                    <div className="menuHeaderButtons">
                        <div>
                            <IconButton 
                                className="menuHeaderButton"
                                size="lg"
                                icon={<Icon icon="clock-o" size="2x"/>}
                                onClick={() => this.openVirtualLine()}
                                disabled={isVirtualLineDisabled}>
                                
                            </IconButton>
                        </div>
                        <div>
                            <Link to="/">
                                <IconButton 
                                    className="menuHeaderButton"
                                    size="lg"
                                    icon={<Icon icon="sign-out" size="2x"/>}
                                    onClick={()=>localStorage.clear()}
                                    color="ffea21">
                                </IconButton>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="menu">
                    {this.state.menu && 
                        menuList.filter(item => item.type === "ITEM").map(item => 
                            <MenuItem key={item.item_data.name} 
                                item={item}
                                onClick={() => this.onMenuItemClicked(item)}
                                />
                    )}
                </div>
                <Modal show={this.state.showVirtualLine}
                       onHide={this.closeVirtualLine}
                       size="sm">
                        <Modal.Header>
                        </Modal.Header>
                    <VirtualLine/>
                </Modal>
                <CartButton cart={this.state.cart} total={this.state.totalCost} onClick={()=> this.nextPath('/cart')}/>
                {this.state.showModal === true && this.state.itemSelected !== null &&
                    <MenuAddModal 
                        show={this.state.showModal} 
                        item={ this.state.itemSelected}
                        guests={this.state.guests} 
                        onClose={()=>this.setState({showModal: false})} 
                        onOK={(item, note)=>this.addMenuItemToCart(item, note)}/> 
                }
            </div>
        );
    }
}


export default withRouter(Menu);
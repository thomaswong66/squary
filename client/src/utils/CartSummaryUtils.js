const cartSummaryUtils = {
    getCompletedOrder: function (firebaseDB, cartID){
        var ref = firebaseDB.ref('completedCarts/');
        var array = new Map()
        return ref.once("value", function(snapshot){
            snapshot.forEach(function(childSnapshot) {
                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();
                array.set(childKey,childData);
            });
        }, function(errorObj) {
            var response = {
                "title": "Feaaatch Cart Failed",
                "result": errorObj.code
            }
            return response;
        }).then(()=>{
            var response = {
                "title": "Fetch Cart",
                "result": array
            };
            return response;
        });
    },
    setCompletedOrder: function (firebaseDB, cartID, roomID){
        var cartRef = firebaseDB.ref('carts/' + cartID);
        var actualyRef = firebaseDB.ref('carts/' + cartID + '/content');
        var completedRef = firebaseDB.ref('completedCarts/' + cartID);
        
        var condensedCart = new Map();
        var currentCart = new Map();

        return actualyRef.once("value", function(snapshot){
           
            snapshot.forEach(function(childSnapshot) {
                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();
                currentCart.set(childKey,childData);
            });
            for(let item of currentCart.values()){
                if(item.placeholder !== 'placeholder'){
                    if(!condensedCart.has(item.item.variation.id)){

                        console.log(item.item.detail.desc);
                        condensedCart.set(
                            item.item.variation.id, 
                            {   
                                'catalog_object_id': item.item.variation.id,
                                'quantity': String(item.count),
                                'extra-name': item.item.detail.name,
                                'extra-desc': item.item.detail.desc,
                                'base_price_money': {
                                    'amount': item.item.variation.item_variation_data.price_money.amount,
                                    'currency': item.item.variation.item_variation_data.price_money.currency
                                }
                            }
                        )
                    }else{
                        var cartItem = condensedCart.get(item.item.variation.id);
                        var itemQ = Number(cartItem.quantity);
                        itemQ += item.count;
                        cartItem.quantity = String(itemQ);
                        condensedCart.set(item.item.variation.id, cartItem);
                    }
                    
                }
            }
            
        }).then(()=>{
            completedRef.push(
                condensedCart.values()[0]
            )
            completedRef.set({
                'content': []
            }).then(()=> {
                for(let val of condensedCart.entries())
                    completedRef.child('content').push(
                        val[1]
                    )
            })
            
            cartRef.once("value", function(cartsnapshot){
                var cartData = cartsnapshot.val();
                cartData.status = 'confirmed';
                cartRef.update(cartData);
            }).then(() => {
                return condensedCart;
            });  
        })
        
        // return ref.once("value", function(snapshot){
        //     snapshot.forEach(function(childSnapshot) {
        //         var childKey = childSnapshot.key;
        //         var childData = childSnapshot.val();
        //         array.set(childKey,childData);
        //     });
        // }, function(errorObj) {
        //     var response = {
        //         "title": "Fetch Cart Failed",
        //         "result": errorObj.code
        //     }
        //     return response;
        // }).then(()=>{
        //     var response = {
        //         "title": "Fetch Cart",
        //         "result": array
        //     };
        //     return response;
        // });
    }
}
export default cartSummaryUtils;
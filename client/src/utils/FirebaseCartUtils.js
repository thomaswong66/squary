const firebaseCartUtils = {
    createANewFirebaseCart: function (firebaseDB, timeStamp, roomID, owner){
        var cartID = roomID + "_" + (new Date()).getTime();
        var ref = firebaseDB.ref('carts/' + cartID);
        var storeSnapshot = null;
        var response = null;
        return ref.once("value", function(snapshot){
            storeSnapshot = snapshot;
            if(!snapshot.exists())
            {
                console.log("NOT EXISTS");
                ref.set({
                    "createAt": timeStamp,
                    "content": [],
                    "confirmations": [],
                    "status": 'pending'
                })
                .then(() => {
                    ref.child('confirmations').push({
                        'owner': owner,
                        'status': false
                    })
                    ref.child('content').push({
                        'placeholder': 'placeholder'
                    })
                    response = {
                        "title": "Created New Cart",
                        "result": snapshot
                    }
                })
            }
        }).then(() => {
            ref.once("value", function(snapshot){
                storeSnapshot = snapshot;
                response = {
                    "title": "Cart Existed",
                    "result": storeSnapshot
                }
            });
        }).then(() => {
            return response;
        })
    },
    getExistingCart: function (firebaseDB, cartID){
        var ref = firebaseDB.ref('carts/' + cartID + '/content');
        var array = new Map()
        return ref.once("value", function(snapshot){
            snapshot.forEach(function(childSnapshot) {
                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();
                array.set(childKey,childData);
            });
        }, function(errorObj) {
            var response = {
                "title": "Fetch Cart Failed",
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
    addItemToCart: function (firebaseDB, cartID, item, owner){
        var ref = firebaseDB.ref('carts/' + cartID + '/content');
        var itemToUpdate = null;
        var resp = null
        return ref.orderByChild("item/variation/id").equalTo(item.variation.id).once('value', function(snapshot){
            var key = null;
            itemToUpdate = null;
            if(snapshot.val() != null){
                snapshot.forEach(function(childSnapshot) {
                    if(childSnapshot.val().owner === owner && childSnapshot.val().item.note === item.note){
                        itemToUpdate = childSnapshot.val();
                        key = childSnapshot.key;
                        return;
                    }
                });
                if(itemToUpdate != null){
                    itemToUpdate.count++;
                    ref.child(key).update(itemToUpdate)
                    resp = {
                        "title": "Updated Item to Cart",
                        "result": itemToUpdate
                    }
                }else{
                    itemToUpdate = {
                        'item': item,
                        'owner': owner,
                        'count': 1
                    }
                    ref.push({
                        'item': itemToUpdate.item,
                        'owner': itemToUpdate.owner,
                        'count': itemToUpdate.count
                    })
                    resp = {
                        "title": "Add Item to Cart",
                        "result": itemToUpdate
                    }
                }
            }else {
                itemToUpdate = {
                    'item': item,
                    'owner': owner,
                    'count': 1
                }
                ref.push({
                    'item': itemToUpdate.item,
                    'owner': itemToUpdate.owner,
                    'count': itemToUpdate.count
                })
                resp = {
                    "title": "Add Item to Cart",
                    "result": itemToUpdate
                }
            }
        }).then(() => {
            return resp;
        })
    },
    addContentRemovalListener: function (firebaseDB, cartID, listener){
        var ref = firebaseDB.ref('carts/' + cartID + `/content`);
        return ref.on("child_removed", function(snapshot){
        console.log("FCK");
        var msg = {
            type: 'removal',
            content: snapshot
        }
            listener(msg);
        })
    },
    addContentAdditionListener: function (firebaseDB, cartID, listener){
        var ref = firebaseDB.ref('carts/' + cartID + `/content`);
        return ref.on("child_added", function(snapshot){
            var msg = {
                type: 'add',
                content: snapshot
            }
            listener(msg);
        })
        
    },
    addContentChangedListener: function (firebaseDB, cartID, listener){
        var ref = firebaseDB.ref('carts/' + cartID + `/content`);
        return ref.on("child_changed", function(snapshot){
            var msg = {
                type: 'change',
                content: snapshot
            }
            listener(msg);
        }) 
    },
    addOrderStatusListener: function (firebaseDB, cartID, listener){
        var ref = firebaseDB.ref('carts/' + cartID + `/status`);
        return ref.on("value", function(snapshot){
            if(snapshot.val() === 'confirmed')
            listener(cartID);
        })
    },
    addConfirmationListener: function (firebaseDB, cartID, listener){
        var ref = firebaseDB.ref('carts/' + cartID + `/confirmations`);
        var array = new Map();
        return ref.on("value", function(snapshot){
            snapshot.forEach(function(childSnapshot) {
                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();
                array.set(childKey,childData);
            });
            listener(array);
        })
    },
    removeAllListener: function (firebaseDB, cartID){
        var ref = firebaseDB.ref('carts/' + cartID);
        firebaseDB.ref('carts/' + cartID).off();
        firebaseDB.ref('carts/' + cartID + '/content').off();
        firebaseDB.ref('carts/' + cartID + `/status`).off();
    },
    updateItemInCart: function (firebaseDB, cartID, item, owner, count, key){
        var ref = firebaseDB.ref('carts/' + cartID + '/content/' + key);
        var itemToUpdate = null;
        var resp = null
        return ref.once('value', function(snapshot){
            var key = null;
            itemToUpdate = null;
            console.log(snapshot.val());
            if(snapshot.val() != null){
                itemToUpdate = snapshot.val()
                if(itemToUpdate != null){
                    if(Number(count) !== 0){
                        itemToUpdate.count = Number(count);
                        ref.update(itemToUpdate)
                        resp = {
                            "title": "Updated Item to Cart",
                            "result": itemToUpdate
                        }
                    }else if(Number(count) === 0) {

                        ref.set(null);
                        resp = {
                            "title": "Updated Item to Cart",
                            "status": 'delete',
                            "result": key
                        }
                    }
                }
            }
        }).then(() => {
            return resp;
        })
    },
    updateConfirmationStatus: function(firebaseDB, cartID, owner, status){
        var ref = firebaseDB.ref('carts/' + cartID + '/confirmations');
        var recordToUpdate = null;
        var recordKey = null;
        var resps = null;
        return ref.orderByChild("owner").equalTo(owner).once('value', function(snapshot){
            recordToUpdate = null;
            if(snapshot.val() != null){
                snapshot.forEach(function(childSnapshot) {
                    if(childSnapshot.val().owner === owner){
                        recordToUpdate = childSnapshot.val();
                        recordKey = childSnapshot.key;
                        return;
                    }
                });
                if(recordToUpdate != null){
                    recordToUpdate.status = status;
                    ref.child(recordKey).update(recordToUpdate)
                    resps = {
                        "title": "Updated Order Confirmation Status",
                        "result": recordToUpdate
                    }
                }else{
                    recordToUpdate = {
                        'ownerID': owner,
                        'status': status
                    }
                    ref.push({
                       'ownerID': recordToUpdate.owner,
                        'status': recordToUpdate.status
                    })
                    resps = {
                        "title": "Add new confirmation status",
                        "result": recordToUpdate
                    }
                }
            }else{
                recordToUpdate = {
                    'owner': owner,
                    'status': status
                }
                ref.push({
                    'owner': recordToUpdate.owner,
                    'status': recordToUpdate.status
                })
                resps = {
                    "title": "Add new confirmation status",
                    "result": recordToUpdate
                }
            }
        }).then(() => {
            return resps;
        })
    },
    updateRoomDataWithNewCart: function(firebaseDB, cartID, roomID){
        var query =  firebaseDB.ref('rooms/').orderByKey().equalTo(roomID);
        var roomData = null
        return query.once('value', snapshot => {
            if(snapshot.exists()){
                roomData = snapshot.val();
                console.log(roomData[roomID]);
                roomData[roomID].cart = cartID
                var roomRef = firebaseDB.ref('rooms/')
                roomRef.update(roomData);
            }
        }).then(() => {
            var response= {
                "title": "Updated Room with new Cart ID",
                "result": roomData
            }

            return response;
        })
    }

}
export default firebaseCartUtils;
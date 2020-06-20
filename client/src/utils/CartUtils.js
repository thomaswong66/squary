const cartUtils = {
    createAnOrder: function (order, cartID){
        return fetch('http://localhost:4000/create-checkout', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'cartID': cartID,
                'order': order
            })
        })
        .catch(err => {
            alert('Network error: ' + err);
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(errorInfo => Promise.reject(errorInfo));
            }else {
                console.log(response);
                return response.text();
            }
        })
    },
    addItemToCart: function (item){
        return fetch('http://localhost:4000/add-item-to-cart', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'item': item
            })
        })
        .then(response => {
            return response.text();
        })
    },
    updateItemInCart: function (id, count){
        return fetch('http://localhost:4000/update-item-in-cart', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'itemID': id,
                'count': count
            })
        })
        .then(response => {
            return response.text();
        })
    },
    getItem: function(){
        return fetch('http://localhost:4000/get-cart', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        }).then(response => {
            return response.text();
        })
    }

}
export default cartUtils;
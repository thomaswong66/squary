import {auth, database, fb} from '../index.js';

const userAuthUtils = {
    createSquareCustomer: function (email_adress, phone_number = ''){
        //return customer id
        console.log('creating customer...');
        console.log(email_adress);
        return fetch('http://localhost:4000/create-customer', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'email_address': email_adress,
                'phone_number': phone_number
            })
        })
        .then(response => {
            return (response.text());
        })
        .catch(error => {
            return (error);
        })
    },
    authenticationSetUp: function() {
        auth.setPersistence(fb.auth.Auth.Persistence.SESSION)
        .then(function() {
            console.log('Persistence set as SESSION');
        });
    },
    signIn: function(email, password) {
        auth.signInWithEmailAndPassword(email, password)
        .then(function(result) {
           console.log('Signed in as ' + result.user.email);
        }).catch(function(error) {
            console.log(error);
        });
    },
    signOut: function() {
        auth.signOut()
        .then(function(result) {
            console.log('signed out');
            return result;
        }).catch(function(error){
            console.log(error);
            return error;
        });
    },
    register: function(email, password, phone=''){
        auth.createUserWithEmailAndPassword(email, password)
        .then(function(result){
            userAuthUtils.createSquareCustomer(email, phone).then(response => {
                var users = database.ref().child('users');
                var newUser = users.child(result.user.uid)
                var newCustomerId = JSON.parse(response).result.customer.id;

                newUser.set({
                "customer_id": newCustomerId
                })

                return true;
            }).catch(error => {
                console.log(error);
            });
        }).catch(function(error){
            console.log(error);
            return false;
        });
    },
    getCustomerId: function() {
        var currentUser = auth.currentUser;

        if (currentUser != null) {
            var user = database.ref('users/' + currentUser.uid);
            user.once('value', function(snapshot) {
                console.log(snapshot.val());
                return snapshot.val();
            });
        } else {
            console.log("No current user!");
            return null;
        }
    }
}

export default userAuthUtils;
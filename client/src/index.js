import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Link, BrowserRouter, Switch } from 'react-router-dom'
import './index.css';
import App from './App';
import Cart from './scenes/Cart';
import Admin from './scenes/Admin';

import * as serviceWorker from './serviceWorker';
import * as firebase from 'firebase';
import EnterRoomID from './components/EnterRoomID';
import RoomIDEntered from './components/RoomIDEntered';
import Menu from './scenes/Menu/index';
import OrderSummary from './scenes/OrderSummary/index';
import MainPage from './components/MainPage';
import Reminder from './components/Reminder';


var firebaseConfig = {
  apiKey: "AIzaSyAUvd9QqLM0g6bI-zREu5USydyUCArOZhg",
  authDomain: "squarey-7b5a4.firebaseapp.com",
  databaseURL: "https://squarey-7b5a4.firebaseio.com",
  projectId: "squarey-7b5a4",
  storageBucket: "squarey-7b5a4.appspot.com",
  messagingSenderId: "681736161279",
  appId: "1:681736161279:web:51e3a0a04f456ec71249ca",
  measurementId: "G-7F3HTD3MFP"
};

firebase.initializeApp(firebaseConfig);
export const database = firebase.database();
export const auth = firebase.auth();
export const fb = firebase;

export function addRoom() {
  var room_id = Math.floor(1000 + Math.random() * 9000)
  var rootRef = firebase.database().ref()
  var roomsRef = rootRef.child('rooms')
  var newRoomRef = roomsRef.child(room_id)
  newRoomRef.set({
    "createdAt": firebase.database.ServerValue.TIMESTAMP,
    "guests" : ""
  })
  localStorage.setItem('room_id', room_id)
  console.log(room_id, "inside add room function")
}

export function getRoom() {
  return firebase.database().ref('rooms/').once('value').then(function(snapshot) {
    // var customers = (snapshot.val() && snapshot.val().customers) || 'Empty';
    console.log(snapshot.val())
    return snapshot.val();
  });
}

export function addGuest(nickname, room_id) {
  var roomRef = firebase.database().ref('rooms/' + room_id)
  var guestRef = roomRef.child('/guests')
  var newGuestRef = guestRef.child(nickname);
  newGuestRef.set({
    nickname
  })
}

function deleteRoom(room_id) {
  firebase.database().ref('rooms/' + room_id).set(null)
}

const routs = (
   < BrowserRouter >
      <div className="full-height">
         <Switch>
            <Route exact path="/" component={MainPage} />
            <Route path="/cart" component={Cart} />
            <Route path="/Admin" component={Admin}/>
            <Route path="/" exact component={MainPage}/>
            <Route path="/enterroomid/" exact component={EnterRoomID}/>
            <Route path="/tableid/:id" exact component={MainPage}/>
            <Route path="/roomidentered" exact component={RoomIDEntered}/>
            <Route path='/menu' exact component={Menu}/>
             <Route path='/order-summary/:info' exact component={OrderSummary}/>
            {/* <Route path="/contactus" component={ContactUs} />
            <Route component={ErrorPage} /> */}
         </Switch>
         <Reminder/>
      </div>
   </ BrowserRouter >
);

ReactDOM.render(
  routs,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import 'rsuite/dist/styles/rsuite-default.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Square from './components/Square';
import EnterRoomID from './components/EnterRoomID';
import RoomIDEntered from './components/RoomIDEntered';
// import EnterRoomIDFromQR from './components/EnterRoomIDFromQR';
import MainPage from './components/MainPage';


const App = () => {
  const [isLoad, setLoad] = useState(false);
  useEffect(() => {
    let sqPaymentScript = document.createElement("script");
    // sandbox: https://js.squareupsandbox.com/v2/paymentform
    // production: https://js.squareup.com/v2/paymentform
    sqPaymentScript.src = "https://js.squareupsandbox.com/v2/paymentform";
    sqPaymentScript.type = "text/javascript";
    sqPaymentScript.async = false;
    sqPaymentScript.onload = () => {
      setLoad(true);
    };
    document.getElementsByTagName("head")[0].appendChild(sqPaymentScript);
  });

  const squarePayment = isLoad ? (
        <Square paymentForm={ window.SqPaymentForm }/>
    ) : (
       null
    )

  return (
      <div className="full-height">
        {/* <Router>
          <Switch>
            <Route path="/" exact component={MainPage}/>
            <Route path="/enterroomid/" exact component={EnterRoomID}/>
            <Route path="/tableid/:id" exact component={EnterRoomIDFromQR}/>
            <Route path="/roomidentered" exact component={RoomIDEntered}/>
          </Switch>
        </Router> */}
        {/* <div className="App">
            <h1>Square</h1>
          {squarePayment}
        </div> */}
        {/* <Menu/>*/}
      </div>
  );
}

export default App;
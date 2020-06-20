import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import IosArrowForward from 'react-ionicons/lib/IosArrowForward'
import QrCode from './QrCode';
import { Link } from 'react-router-dom';
import Background from '../assets/Rectangle_57.png';
import { addGuest }from '../index';
import * as firebase from 'firebase';

class EnterRoomID extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            roomID: localStorage.getItem('room_id'),
            nickname: '',
            };
    
        this.handleChange = this.handleChange.bind(this);        
        this.handleChange2 = this.handleChange2.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.checkIfGuestExists = this.checkIfGuestExists.bind(this);
    }

    handleChange(event) {
        this.setState({roomID: event.target.value});
    }

    handleChange2(event) {
        this.setState({nickname: event.target.value});
    }

    checkIfGuestExists(name){
        return firebase.database().ref('rooms/' + this.state.roomID + '/guests/').child(name).once('value', snapshot => {
            console.log(name, "THIS IS THE GUEST VAL")
            if(snapshot.exists()){
                alert("Guest already exists for this room");
                return false;
            }else if(!snapshot.exists()){
                addGuest(name, this.state.roomID);
                console.log("Guest added to room");
                alert('Room ID is set to: ' + this.state.roomID + '\nNickname is set to: ' + this.state.nickname);
                localStorage.setItem('user_id', name);
                localStorage.setItem('isHost', 1);
                this.props.history.push('/menu');
                return true;
            }
        })
    }

    

    handleSubmit = async(event) => {

        if(this.state.nickname.length < 3){
            alert('Nickname must be longer than 3 characters');
        }

        if(this.state.nickname.length >= 3){
            this.checkIfGuestExists(this.state.nickname);
        }
    }

    render() {
        return (
                <div style={{ justifyContent: "center", alignItems:"center"}}>
                    <div style={{display: "flex", justifyContent: "center", height: "50%", width: "100%", alignItems: "center", backgroundColor: "#ffea21", paddingTop: 100}}>
                        <form onSubmit={this.handleSubmit}>
                            {/* <div style={{ justifyContent: "center", flexDirection: "column", alignItems: "center"}}> */}
                                <label htmlFor="roomid" style={{fontWeight: "bold", fontSize: 30, display: "block", color: "black"}}>Your room id:<br />
                                <div>
                                    <input style={{marginLeft: 7,height: 30, width: 250, marginTop: 30, marginBottom: 60, fontWeight: "normal", borderRadius: 3, fontSize: 15}} type="text"  disabled value={this.state.roomID}/><br />
                                </div>
                                </label>
                            {/* </div> */}
                        </form>
                    </div>
                    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                        <form onSubmit={this.handleSubmit}>
                            <label htmlFor="nickname">
                                <input style={{height: 30, width: 250, marginTop: 60, borderRadius: 3, fontWeight: "normal", fontSize: 15}} type="text" placeholder="Nickname" value={this.state.nickname} onChange={this.handleChange2} /><br />
                            </label>
                            <div style={{display: "flex", flexDirection:"row-reverse"}}>
                                <IosArrowForward style={{ fontSize: 30, marginTop: 30}} onClick={this.handleSubmit}/>
                            </div>
                        </form>
                    </div>
                    <div>
                        {/* <QrCode/> */}
                    </div>
                </div>
        )
    }
}

export default EnterRoomID;


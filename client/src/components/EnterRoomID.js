import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import IosArrowForward from 'react-ionicons/lib/IosArrowForward'
// import { FormGroup } from 'react-bootstrap';
import QrCode from './QrCode';
import Background from '../assets/Rectangle_57.png'
import { useParams, Link, Redirect } from 'react-router-dom';
import * as firebase from 'firebase';
import './input.css';
import { addGuest } from '../index'

class EnterRoomID extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                roomID: '',
                nickname: '', 
                };
        
            this.handleChange = this.handleChange.bind(this);
            this.handleChange2 = this.handleChange2.bind(this);
            this.handleSubmit = this.handleSubmit.bind(this);
            this.checkIfRoomExists = this.checkIfRoomExists.bind(this);
            // this.checkIfGuestExists = this.checkIfGuestExists.bind(this);

    }

    checkIfRoomExists(id){
        var query =  firebase.database().ref('rooms/').orderByKey().equalTo(id);
        query.once('value', snapshot => {
            if(snapshot.exists()){
                var roomData =  snapshot.val();

                if(roomData[id].cart != null){

                } else {
                    localStorage.setItem('currentCartID', roomData[id].cart);
                }
                
                console.log("ROOM exists in the database", roomData)
                var query2= firebase.database().ref('rooms/' + this.state.roomID + '/guests/').child(this.state.nickname);
                    query2.once('value', snapshot => {
                        if(snapshot.exists()){
                            alert("Guest already exists for this room");
                        }else{
                            addGuest(this.state.nickname, this.state.roomID);
                            console.log('GUEST ADDED TO ROOM')
                            alert('Room ID is set to: ' + this.state.roomID + '\nNickname is set to: ' + this.state.nickname);
                            localStorage.setItem('user_id', this.state.nickname);
                            localStorage.setItem('isHost', 0);
                            localStorage.setItem('room_id', this.state.roomID);
                            this.props.history.push('/menu')
                        }
                    })
            }else{
                alert("Room does not exist. Please try again.")
            }
        })
    }

    // checkIfGuestExists(name){
    //     var query= firebase.database().ref('rooms/' + this.state.roomID + '/guests/').child(name);
    //     query.once('value', snapshot => {
    //         if(snapshot.exists()){
    //             alert("Guest already exists for this room");
    //         }else{
    //             addGuest(name, this.state.roomID);
    //         }
    //     })
    // }

    handleChange(event) {
        this.setState({roomID: event.target.value});
    }

    handleChange2(event) {
        this.setState({nickname: event.target.value});
    }


    handleSubmit = async(event) => {

        if(this.state.roomID.length != 4){
            alert('Room id must be a 4 digit code')
        }
        if(this.state.nickname.length < 3){
            alert('Nickname must be longer than 3 characters');
        }

        if(this.state.roomID.length == 4 && this.state.nickname.length >= 3){
            this.checkIfRoomExists(this.state.roomID)
        }
    }

    render() {
        const isEnabled = this.state.roomID.length > 0 && this.state.nickname.length > 4;
        return (
                <div style={{ justifyContent: "center", alignItems:"center"}}>
                    <div style={{display: "flex", justifyContent: "center", height: "50%", width: "100%", alignItems: "center", backgroundColor: "#ffea21", paddingTop: 100}}>
                        <form onSubmit={this.handleSubmit}>
                            {/* <div style={{ justifyContent: "center", flexDirection: "column", alignItems: "center"}}> */}
                                <label htmlFor="roomid" style={{fontWeight: "bold", fontSize: 30, display: "block", color: "black"}}>Enter your room id:<br />
                                    <input class="input" style={{marginLeft: 7,height: 30, width: 250, marginTop: 30, marginBottom: 60, fontWeight: "normal", borderRadius: 3, fontSize: 15}} type="number"  value={this.state.roomID} placeholder="Room id" onChange={this.handleChange}/><br />
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
                                <IosArrowForward disabled={!isEnabled} style={{ fontSize: 30, marginTop: 30}} onClick={this.handleSubmit}/>
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


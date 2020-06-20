import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'rsuite';
import { Link, useParams } from 'react-router-dom';
import { addRoom }from '../index';
// import QrCode from './QrCode';



class MainPage extends React.Component {
    constructor(props) {
        super(props);
        this.state= {
            table_id: ''
        }
    }

    componentDidMount=async()=>{
       await this.getTableID();

       await console.log(localStorage.getItem('table_id'), "THIS IS THE TABLE ID")
    }

    storeTableID = async() => {

        if(localStorage.getItem('table_id') !== undefined){
            localStorage.removeItem('table_id');
        }

        if(this.props.match.params.id == undefined || this.props.match.params.id == ''){
            localStorage.setItem('table_id', '')
        }

        if(this.props.match.params.id != null || this.props.match.params.id != ''){
            localStorage.setItem('table_id', this.props.match.params.id)
        }
    }

    getTableID = async() => {
        await this.storeTableID();

        var fetched_table_id = localStorage.getItem('table_id')
    }

    getRoomID= async()=> {
        await addRoom();
        var fetched_room_id = JSON.parse(localStorage.getItem('room_id'));
        console.log(fetched_room_id, "FETCHED ROOM ID");
    }

    clearRoomID () {
        localStorage.removeItem('room_id')
    }

    render(){
        return (
            <div style={{display: "flex", height: "100vh", backgroundColor: "#ffea21", justifyContent: "center", alignItems: "center", flexDirection: "column"}}>
                    <h1 style={{color: "black", fontSize: 50, fontWeight: "bold", fontStyle: "italic", fontFamily: "edwardian", marginBottom: 30}}>LOGO</h1>
                    <Link to="/roomidentered">
                        <Button  style={{backgroundColor: "white", width: 150, height: 45, marginBottom: 30, color: "black", fontWeight: "bold", fontSize: 30, borderRadius:3, padding: 0}} onClick={this.getRoomID}>
                            Host
                        </Button>
                    </Link>
                    <Link to="/enterroomid">
                        <Button style={{backgroundColor: "white", padding: 0, width: 150, height: 45, color: "black", fontWeight: "bold", fontSize: 30, borderRadius:3}} onClick={this.clearRoomID}>
                            Guest
                        </Button>
                    </Link>
                    {/* <QrCode/> */}

            </div>
        )
    }

}

export default MainPage;
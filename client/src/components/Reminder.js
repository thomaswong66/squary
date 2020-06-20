import React from 'react';
import {Modal} from 'rsuite';
import ReminderUtils from '../utils/ReminderUtils.js';
import VirtualLine from './VirtualLine.js';
import { useLocation} from "react-router";
        
class Reminder extends React.Component{
    constructor(props){
        super(props);
        this.roomId = localStorage.getItem("room_id");

        this.state = {
            reminderOpen: false
        };

        this.notificationOpenHandler = this.notificationOpenHandler.bind(this);
        this.notificationCloseHandler = this.notificationCloseHandler.bind(this);
    }
    
    componentDidMount(){
        ReminderUtils.getReminder(this.roomId, this.notificationOpenHandler);
    }

    componentWillUnmount(){
        ReminderUtils.getReminderOff(this.roomId);
    }
    
    notificationOpenHandler(val){
        if(val !== null && window.location.pathname !='/Admin'){
            this.setState({
                reminderOpen: true
            });
        }
    }

    notificationCloseHandler(val) {
        console.log('notification closed');
        this.setState({
            reminderOpen: false
        });
        ReminderUtils.removeReminder(this.roomId);
    }
    
    render(){
        return(
            <div>
            <Modal show={this.state.reminderOpen}
                    onHide={this.notificationCloseHandler}>
                        <Modal.Header>
                        <h3>Please respect social distancing guidelines!</h3>
                        </Modal.Header>
                    <div>
                        Click <a href={"https://www2.gov.bc.ca/gov/content/safety/emergency-preparedness-response-recovery/covid-19-provincial-support/bc-restart-plan"}> here</a> to learn more!
                    </div>
            </Modal>
            </div>
        )

    }
}

export default Reminder;
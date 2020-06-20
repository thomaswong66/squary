import React from 'react';
import {Button, Panel, PanelGroup} from 'rsuite';
import ReminderUtils from '../../../utils/ReminderUtils.js'

class Room extends React.Component{
    constructor(props){
        super(props);
        this.id = props.id;

        this.sendReminder = this.sendReminder.bind(this);
    }

    sendReminder(){
        ReminderUtils.setReminder(this.id);
    }

    render(){
        return(
            <div className="adminItem">
                {this.id}
                <Button onClick={this.sendReminder}
                        className="yellowButton">Send Reminder</Button>
            </div>
        )

    }
}

export default Room;
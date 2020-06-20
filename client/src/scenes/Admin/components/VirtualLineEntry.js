import React from 'react';
import {Button, Panel, PanelGroup} from 'rsuite';

class VirtualLineEntry extends React.Component{
    constructor(props){
        super(props);
        
        this.roomId = props.roomId;
        this.name = props.name;
        this.phone = props.phone;

        this.onValueUpdate = this.onValueUpdate.bind(this);
    }

    onValueUpdate(){
        this.props.onValueUpdate(this.roomId);
    }

    render(){
        return(
            <div className="adminItem">
                {this.roomId} : {this.name} ({this.phone})
                <Button onClick={this.onValueUpdate}
                        className="yellowButton">Remove from queue</Button>
            </div>
        )
    }
}

export default VirtualLineEntry;
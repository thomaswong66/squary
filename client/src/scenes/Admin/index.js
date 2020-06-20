import React from 'react';
import VirtualLineEntry from './components/VirtualLineEntry.js';
import Room from './components/Room.js';
import { getRoom } from '../../index.js';
import VirtualLineUtils from '../../utils/VirtualLineUtils.js';
import {withRouter, Link} from 'react-router-dom';
import {FlexboxGrid, Icon, IconButton} from 'rsuite';

class Admin extends React.Component{
    constructor(props){
        super(props);

        this.state = { 
            rooms: [],
            virtualLineEntries: []
        };

        this.onVirtualLineEntryDeactivate = this.onVirtualLineEntryDeactivate.bind(this);
        this.parseVirtualLineEntries = this.parseVirtualLineEntries.bind(this);
    }

    componentDidMount(){
        var rooms;
        var virtualLineEntries;
        getRoom().then(val => {
            rooms = Object.keys(val);
            this.setState({
                'rooms': rooms
            })
        });

        VirtualLineUtils.getVirtualLineEntries(this.parseVirtualLineEntries);
    }

    componentWillUnmount() {
        VirtualLineUtils.getVirtualLineEntriesOff();
    }

    parseVirtualLineEntries(entries){
        console.log(entries);
        var virtualLineEntries = Object.keys(entries).filter((roomId)=> {
            return entries[roomId].active;
        }).map((roomId)=>{
            var entryObject = {'roomId': roomId,
                                'name':entries[roomId].name,
                                'phone':entries[roomId].phone
                            };
            return entryObject;
        })

        this.setState({
            'virtualLineEntries': virtualLineEntries
        })
    }

    onVirtualLineEntryDeactivate(roomId){
        console.log('remove entry from list');
        VirtualLineUtils.deactivateFromVirtualLine(roomId);
    }

    render(){
        return(
            <div>
                <div className="menuHeader" align="middle" justify="end">
                    <div className="menuHeaderTitle">
                        <p style={{fontWeight: "bold", fontSize: 30, color: "black"}}>Menu</p>
                    </div >
                    <div className="menuHeaderButtons">
                        <div>
                            <Link to="/">
                                <IconButton 
                                    className="menuHeaderButton"
                                    size="lg"
                                    icon={<Icon icon="sign-out" size="2x"/>}
                                    onClick={()=>localStorage.clear()}
                                    color="ffea21">
                                </IconButton>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="adminContent">
                    <h4>Active Rooms</h4>
                    <p>Click 'Send Reminder' if you need to remind the table to follow physicial distancing rules</p>
                    <div className="adminList">
                    {Array.from(this.state.rooms.map((value, index) => {
                            return <Room key={value}
                                        id={value}/>
                        })
                    )}
                    </div>
                </div>
                <div className="adminContent">
                    <h4>Virtual Line Queue</h4>
                    <p>This is a list of people on your virtual line.</p>
                    <div className="adminList">
                        {Array.from(this.state.virtualLineEntries.map((value, index) => {
                                return <VirtualLineEntry key={value.roomId}
                                                        roomId={value.roomId}
                                                        name={value.name}
                                                        phone={value.phone}
                                                        onValueUpdate={this.onVirtualLineEntryDeactivate}/>
                            })
                        )}
                    </div>
                </div>
            </div>
        )

    }
}

export default withRouter(Admin);
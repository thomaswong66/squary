import React from 'react';
import {withRouter} from 'react-router-dom';
import { Modal, Button, ButtonToolBar,Checkbox, Input } from 'rsuite';


class MenuAddModal extends React.Component{
    constructor(props){
        super(props);
        this.state = { 
            item: props.item,
            guests: props.guests,
            note: "",
            showMe: props.show,
            sharedWith: [],
            you: localStorage.getItem('user_id')
        };
    }

    close() {
        this.props.onClose();
        this.setState({showMe: false});
    }

    onNoteChanged(value, event){
        this.setState({ note:value});
    }

    onShareChanged(value, event){
        var guestSharedWith = this.state.sharedWith;

         if(event === true){
             
            guestSharedWith.push(value.nickname);
            this.setState({sharedWith: guestSharedWith});
         }else{
             var index = guestSharedWith.findIndex(guest => guest === value.nickname);
             guestSharedWith.splice(index, 1);
             this.setState({sharedWith: guestSharedWith});
         }
    }

    onOK(){
        var noteToAdd = this.state.note;
        var sharedWith = this.state.sharedWith;
        if(sharedWith.length >  0){
            var strToAdd = "Share with: ";
            strToAdd = strToAdd.concat('', this.state.you);
            for(var i = 0; i < sharedWith.length; i++){
                if (i === sharedWith.length-1)
                    strToAdd = strToAdd.concat(' and ', sharedWith[i]);
                else
                    strToAdd = strToAdd.concat(', ', sharedWith[i]);
            }
            
            if(noteToAdd !== "")
                noteToAdd = noteToAdd.concat('. ', strToAdd)
            else
                noteToAdd = strToAdd
            this.setState({note: noteToAdd}, ()=>this.props.onOK(this.state.item, this.state.note))  
        }else
            this.props.onOK(this.state.item, this.state.note)

    }

    render(){
        const guestsList = this.state.guests;
        const you = this.state.you;
        var listOfCheckboxes = [];
        if(guestsList.length > 0){
            for(let i = 0; i < guestsList.length; i++) {
                if(guestsList[i].nickname === String(you))  
                    listOfCheckboxes.push(<Checkbox disabled defaultChecked key={guestsList[i].nickname} onChange={(value, event) => this.onShareChanged(guestsList[i], event)}>{guestsList[i].nickname}</Checkbox>)
                else
                    listOfCheckboxes.push(<Checkbox key={guestsList[i].nickname} onChange={(value, event) => this.onShareChanged(guestsList[i], event)}>{guestsList[i].nickname}</Checkbox>)
            }
        }
       
        return (
            <div className="modal-container">
                {this.state.item &&
                <Modal show={this.state.showMe} backdrop={true} onHide={()=>this.close()}>
                    <Modal.Header>
                            <Modal.Title className="addToOrderTitle">{this.state.item.detail.name}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>
                                {this.state.item.detail.desc}
                            </p>
                        </Modal.Body>
                        <Input
                            componentClass="textarea"
                            rows={3}
                            style={{ width: 300, resize: 'auto' }}
                            placeholder="Special Instruction"
                            value={this.state.note}
                            onChange={(value, event) => this.onNoteChanged(value, event)}
                        />

                        {this.state.guests && guestsList.length > 1 &&   
                            <div className="shareWithPanel">
                                Share this dish with:
                                {listOfCheckboxes}
                            </div>
                        }
                        
                        <Button className="addToOrderbutton"appearance="primary" onClick={()=>this.onOK()}>
                            Add to order
                        </Button>
                </Modal>
                }
            </div>
        );
    }
}


export default withRouter(MenuAddModal);
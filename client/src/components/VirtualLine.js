import React from 'react';
import { Button, InputNumber, Input, Form, FormGroup, FormControl, HelpBlock, ControlLabel } from 'rsuite';
import virtualLineUtils from '../utils/VirtualLineUtils.js';

class VirtualLine extends React.Component {
    constructor(props) {
        super(props);
        this.roomId = localStorage.getItem('room_id');

        this.state = {
            isOnVirtualLine: false,
            wasOnVirtualLine: false,
            name: '',
            phone: '',
            party: 0
        }

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.updateActiveState = this.updateActiveState.bind(this);
    }

    updateActiveState(val) {
        if (val) {
            this.setState({
                'isOnVirtualLine': val.active,
                'wasOnVirtualLine': !val.active
            });
        } else {
            this.setState({
                'isOnVirtualLine': false,
                'wasOnVirtualLine': false
            });
        }
    }
    componentDidMount() {       
        virtualLineUtils.isOnVirtualLine(this.roomId, this.updateActiveState);
    }

    componentWillUnmount() {
        virtualLineUtils.isOnVirtualLineOff(this.roomId);
    }

    handleInputChange(event) {
        const value = event.target.value;
        const name = event.target.name;

        this.setState({
          [name]: value
        });
    }

    handleSubmit(event) {
        if (!this.state.isOnVirtualLine && !this.state.wasOnVirtualLine) {
            // queue
            virtualLineUtils.addToVirtualLine(this.roomId,
                this.state.name, this.state.phone, this.state.party).then((val) => {
                    if(val) {
                        this.setState({
                            'isOnVirtualLine': true
                        })
                    }
                });
        } else if (this.state.isOnVirtualLine) {
            // cancel
            virtualLineUtils.removeFromVirtualLine(this.roomId).then((val) => {
                if(val) {
                    this.setState({
                        'isOnVirtualLine': false,
                        'wasOnVirtualLine': false
                    })
                }
            });
        }
        event.preventDefault();
    }

    render(){
        var header = ''
        var subheader = ''
        var buttonText = ''
        var buttonColor = ''
        if (this.state.isOnVirtualLine){
            header = 'You are already on the virtual line!';
            subheader = 'We will call you 15 minutes before your table is ready';
            buttonText = 'Cancel';
            buttonColor = 'red';
        } else if (this.state.wasOnVirtualLine){
            header = 'You are in!';
            subheader = 'You should have received a call from us. If there is an issue, \
                         call us on 778-123-4567.';
            buttonText = 'Cancel';
            buttonColor = 'red';
        } else {
            header = 'Join the virtual line!'
            subheader = 'We will call you 15 minutes before your table is ready';
            buttonText = 'Join!';
            buttonColor = 'green'
        }

        var isFormDisabled = this.state.isOnVirtualLine || this.state.wasOnVirtualLine;
        var isButtonDisabled = this.state.wasOnVirtualLine;
        
        const virtualLineForm = (
            <Form>
                <FormGroup>
                    <ControlLabel>Name</ControlLabel>
                    <FormControl name="name"
                                 type="string"
                                 value={this.state.name}
                                 onChange={(value, event)=>{
                                    this.handleInputChange(event);
                                 }}
                                 disabled={isFormDisabled}
                    />
                </FormGroup>
                <FormGroup>
                    <ControlLabel>Phone</ControlLabel>
                        <FormControl name="phone"
                                     type="string" value={this.state.phone}
                                     onChange={(value, event)=>{
                                        this.handleInputChange(event);
                                     }}
                                     disabled={isFormDisabled}
                        />
                </FormGroup>
                <FormGroup>
                    <ControlLabel>Party Size</ControlLabel>
                        <FormControl name="party"
                                     type="number"
                                     value={this.state.party}
                                     onChange={(value, event)=>{
                                        this.handleInputChange(event);
                                     }}
                                     disabled={isFormDisabled}
                        />
                </FormGroup>
                <Button onClick={this.handleSubmit}
                        disabled={isButtonDisabled}
                        color={buttonColor}>
                        {buttonText}
                </Button>
            </Form>
        )

        return (
            <div>
                <h3>{header}</h3>
                <h5>{subheader}</h5>
                <div className="virtualLineFormContent">
                {virtualLineForm}
                </div>
            </div>
        )
    }
}

//where to detach listeners?
//ref.off("value", originalCallback);

export default VirtualLine;
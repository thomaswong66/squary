import React from 'react';
import {Button, Panel, PanelGroup, Form, FormGroup, FormControl, ControlLabel, HelpBlock} from 'rsuite';
import userAuthUtils from "../utils/UserAuthUtils.js";

class UserAuthentication extends React.Component{
    constructor(props){
        super(props);
        this.isRegister = props.isRegister;

        this.state = {
            email: '',
            password: ''
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount(){
        userAuthUtils.authenticationSetUp();
    }

    handleInputChange(event) {
        const value = event.target.value;
        const name = event.target.name;
    
        this.setState({
          [name]: value
        });
    }

    handleSubmit(event) {
        if (this.isRegister) {
            console.log('registering');
            userAuthUtils.register(this.state.email, this.state.password);
        } else {
            console.log('is signing in');
            userAuthUtils.signIn(this.state.email, this.state.password);
        }
        event.preventDefault();
      }

    render(){
        const isRegister = this.isRegister;
        const authentication_form = (
            <Form>
                <FormGroup>
                    <ControlLabel>Email</ControlLabel>
                    <FormControl name="email" type="email" value={this.state.email}
                                    onChange={(value, event)=>{
                                        this.handleInputChange(event);
                                    }}
                    />
                    <HelpBlock tooltip>Required</HelpBlock>
                </FormGroup>
                <FormGroup>
                <FormGroup>
                    <ControlLabel>Password</ControlLabel>
                    <FormControl name="password" type="password" value={this.state.password}
                                    onChange={(value, event)=>{
                                        this.handleInputChange(event);
                                    }}
                    />
                    </FormGroup>
                </FormGroup>
                <Button onClick={this.handleSubmit}>{isRegister ? "Register" : "Sign In"}</Button>
            </Form>
        )

        return (
            <div>
                <div className="userAuthentication">
                    <h4>{`${isRegister ? "Register" : "Sign In"}`}</h4>
                    {authentication_form}
                </div>
            </div>
        );
    }
}


export default UserAuthentication;
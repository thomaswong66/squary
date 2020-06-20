import React from 'react';
import {Button, Panel, PanelGroup, Icon, IconButton, Grid, Row, Col, FlexboxGrid} from 'rsuite';

class MenuItem extends React.Component{
    constructor(props){
        super(props);
        this.item = props.item;
        this.title = props.item.item_data.name;
        this.desc = props.item.item_data.description;
    }

    render(){
        var maxLength = 30;
        var descLength = this.desc.length;
        var shortDescription = this.desc.substring(0, Math.min(descLength, maxLength));
        if (descLength > maxLength) {
            shortDescription += '...';
        }
        return(
            <div className="menuPanel">
                <Panel  className="menuItemPanel" bordered shaded>
                    <FlexboxGrid align="middle">
                        <FlexboxGrid.Item colspan={20}>
                            <h4>{this.title}</h4>
                            <p>{shortDescription}</p>
                        </FlexboxGrid.Item>
                        <FlexboxGrid.Item colspan={4}>
                            <IconButton 
                                className="menuButton"
                                icon={<Icon icon="plus" />}
                                onClick={() => this.props.onClick()}
                                circle
                                color="ffea21"
                                >
                            </IconButton>
                        </FlexboxGrid.Item>
                    </FlexboxGrid>
                </Panel>
            </div>
        )
    }
}

export default MenuItem;
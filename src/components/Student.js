import React from 'react';


export default class Student extends React.Component {
    render() {
        let rowIndex = this.props.displayrow;
        let index = this.props.displaydesk;
        let id = (this.props.deskPerRow*rowIndex) + index;
        return (
            <React.Fragment>
                <h4 id={id} 
                displayrow={rowIndex+1} 
                displaydesk={index} 
                draggable='true' 
                onDragEnd={this.props.updateOrder} 
                onDragStart={this.props.updateDragElement} 
                className='desk'>{this.props.name}</h4>
            </React.Fragment>
        )
    }
}
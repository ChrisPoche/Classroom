import React from 'react';


export default class Student extends React.Component {
    getClass = () => {
        switch (this.props.attendance.present) {
            case 0: 
                return this.props.mode.includes('Attendance') ? 'desk attendance-absent' : 'desk absent';
            case 1: 
                return this.props.mode.includes('Attendance') ? 'desk attendance-present' : 'desk';
            default: 
                return 'desk';
        }
        // if (this.props.attendance.present === 1) return 'desk attendance-present'
        // else if (this.props.attendance.present === 0) 'desk attendance-absent' :
        // 'desk'
    };
    render() {
        let rowIndex = this.props.displayrow;
        let index = this.props.displaydesk;
        let id = (this.props.deskPerRow * rowIndex) + index;
        return (
            <React.Fragment>
                <h4 id={id}
                    className={this.getClass()}

                    displayrow={rowIndex + 1}
                    displaydesk={index}

                    onClick={this.props.mode === 'quickAttendance' && this.props.mode.includes('Attendance') ? this.props.changeAttendanceStatus : this.noWhere}
                    onDoubleClick={this.props.mode !== 'quickAttendance' && this.props.mode.includes('Attendance') ? this.props.changeAttendanceStatus : this.noWhere}

                    draggable='true'
                    onDragEnd={this.props.updateOrder}
                    onDragStart={this.props.updateDragElement}>
                    {this.props.name}
                </h4>
            </React.Fragment >
        )
    }
}
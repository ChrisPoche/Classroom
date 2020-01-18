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
    };
    render() {
        let rowIndex = this.props.displayrow;
        let index = this.props.displaydesk;
        let id = (this.props.deskPerRow * rowIndex) + index;
        let style = this.props.mode === 'edit' ?
            { cursor: 'move' } :
            { cursor: 'default' };
        return (
            <React.Fragment>
                <h4 id={id}
                    className={this.getClass()}

                    style={style}

                    displayrow={rowIndex + 1}
                    displaydesk={index}

                    onClick={this.props.mode === 'quickAttendance' && this.props.mode.includes('Attendance') ? this.props.changeAttendanceStatus : this.noWhere}
                    onDoubleClick={this.props.mode !== 'quickAttendance' && this.props.mode.includes('Attendance') ? this.props.changeAttendanceStatus : this.noWhere}

                    draggable={this.props.mode === 'edit' ? 'true' : 'false'}
                    onDragEnd={this.props.updateOrder}
                    onDragStart={this.props.updateDragElement}>
                    {this.props.name}
                </h4>
            </React.Fragment >
        )
    }
}
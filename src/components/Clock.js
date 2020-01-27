import React from 'react';

export default class Clock extends React.Component {
    constructor(props) {
        super(props);
        let twentyFourHour = localStorage.getItem('Clock-ISO-Format') ?
            localStorage.getItem('Clock-ISO-Format') === 'false' ?
                false :
                true :
            false;
        let time = twentyFourHour ? new Date().toTimeString() : new Date().toLocaleTimeString();
        time = twentyFourHour ? time.slice(0, time.indexOf(' ') - 3) : time.slice(0, time.indexOf(' ') - 3) + time.slice(time.indexOf(' '));
        console.log('Clock Date',localStorage.getItem('Clock-date'));
        let clockDate = localStorage.getItem('Clock-date') ?
            localStorage.getItem('Clock-date') === 'true' ?
                new Date().toDateString() :
                '' :
            '';

        this.state = {
            clockDate,
            time,
            twentyFourHour
        }
    }
    componentDidMount = () => {
        this.getTime();
        localStorage.setItem('Clock-ISO-Format', this.state.twentyFourHour);
        let clock = document.getElementById('clock');
        clock.style.transform = 'scale(1.75)';
        console.log(this.state.clockDate);
    }
    componentDidUpdate = () => {
        this.getTime();
    }
    getTime = () => {
        let time = new Date();
        let offset = 60 - time.getSeconds();
        if (offset !== 0) setTimeout(this.updateTimeString, offset * 998); // offset the time of function call
    }
    updateTimeString = (twentyFourHour = this.state.twentyFourHour) => {
        let time = twentyFourHour ? new Date().toTimeString() : new Date().toLocaleTimeString();
        time = twentyFourHour ? time.slice(0, time.indexOf(' ') - 3) : time.slice(0, time.indexOf(' ') - 3) + time.slice(time.indexOf(' '));
        this.setState({ time })
    }
    toggleISOFormat = () => {
        let twentyFourHour = !!this.state.twentyFourHour ? false : true;
        localStorage.setItem('Clock-ISO-Format', twentyFourHour);
        this.setState({ twentyFourHour });
        this.updateTimeString(twentyFourHour);
    }
    toggleDate = () => {
        let clockDate = this.state.clockDate ? '' : new Date().toDateString();
        localStorage.setItem('Clock-date', clockDate ? true : false);
        this.setState({ clockDate });
    }
    render() {
        return (
            <div>
                {this.state.clockDate && <h3 id='clock-date'>{this.state.clockDate}</h3>}
                <h1 id='clock'>{this.state.time}</h1>
                <button id='tfh-button' onClick={this.toggleISOFormat}>{this.state.twentyFourHour ? '12 Hour Format' : '24 Hour Format'}</button>
                <button id='date-button' onClick={this.toggleDate}>{this.state.clockDate ? 'Toggle Date Off' : 'Toggle Date On'}</button>
            </div>
        );
    }
}
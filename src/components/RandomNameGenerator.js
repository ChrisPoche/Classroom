import React from 'react';

export default class RandomNameGenerator extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            randomName: '',
            nrClassList: JSON.parse(localStorage.getItem('no-repeat-class-list')) || this.props.classList.map(val => val.name)
        }
    }
    grabName = (e) => {
        e.preventDefault();
        let classList = e.target.id === 'generate-name-button' ? this.props.classList.map(val => val.name) : JSON.parse(localStorage.getItem('no-repeat-class-list')) || this.state.nrClassList;
        let index = Math.floor(Math.random() * classList.length);
        let randomName = classList[index];
        // console.log('grabbing name', randomName);
        if (randomName === this.state.randomName) this.grabName(e);
        else {
            this.setState({ randomName });
            // console.log(classList)
            if (e.target.id === 'generate-name-button-no-repeats') classList.length <= 1 ? localStorage.setItem('no-repeat-class-list', JSON.stringify(this.props.classList.map(val => val.name))) : localStorage.setItem('no-repeat-class-list', JSON.stringify(classList.filter((val, ind) => ind !== index)));
        }
    }
    clearName = () => {
        this.setState({ randomName: '' });
    }
    render() {
        let styleClear = {
            color: 'red',
            display: 'inline-block', 
            marginLeft: '20px'
        };
        return (
            <div>
                <button id='generate-name-button' onClick={this.grabName}>Generate Name</button>
                <button id='generate-name-button-no-repeats' onClick={this.grabName}>(Without Repeats)</button>
                <div>
                    <p id='random-name'>{this.state.randomName}</p>
                    {this.state.randomName && <p onClick={this.clearName} style={styleClear}>clear name</p>}
                </div>
            </div>
        );
    }
}
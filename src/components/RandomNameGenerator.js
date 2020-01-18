import React from 'react';

export default class RandomNameGenerator extends React.Component {
    constructor(props) {
        super(props);

        let filteredList = JSON.parse(localStorage.getItem('class-list'))
            .filter(val => {
                let record = val.attendance[val.attendance.length - 1];
                return new Date().toLocaleDateString() === record.date && record.present.toString().includes('1');
            })
            .map(val => val.name);

        this.state = {
            randomName: '',
            filteredList,
            nrClassList: JSON.parse(localStorage.getItem('no-repeat-class-list')) || filteredList,
        }
    }
    updateList = (filteredList) => {
        this.setState({ filteredList });
    }
    grabName = (e) => {
        e.preventDefault();
        let filteredList = false;
        if (this.state.filteredList.length > this.props.classList.length || this.state.filteredList.length < this.props.classList.length) {
            filteredList = this.props.classList
                .filter(val => {
                    let record = val.attendance[val.attendance.length - 1];
                    return new Date().toLocaleDateString() === record.date && record.present.toString().includes('1');
                })
                .map(val => val.name);
            this.updateList(filteredList);
        }
        let classList =
            e.target.id === 'generate-name-button' ?
                filteredList || this.state.filteredList :
                JSON.parse(localStorage.getItem('no-repeat-class-list')) || this.state.nrClassList;
        let index = Math.floor(Math.random() * classList.length);
        let randomName = classList[index];
        // console.log('grabbing name', randomName);
        if (randomName === this.state.randomName) this.grabName(e);
        else {
            this.setState({ randomName });
            // console.log(classList)
            if (e.target.id === 'generate-name-button-no-repeats') classList.length <= 1 ? localStorage.setItem('no-repeat-class-list', JSON.stringify(this.state.filteredList)) : localStorage.setItem('no-repeat-class-list', JSON.stringify(classList.filter((val, ind) => ind !== index)));
            // console.log('List Total Before Removal', classList.length)
            // console.log('New List', classList.filter((val, ind) => ind !== index));
        }
    }
    clearName = () => {
        this.setState({ randomName: '' });
    }
    render() {
        let styleClear = {
            color: 'red',
            display: 'inline-block',
            marginLeft: '20px',
            cursor: 'pointer'
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
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
        let nrClassListLength = JSON.parse(localStorage.getItem('no-repeat-class-list')) ? JSON.parse(localStorage.getItem('no-repeat-class-list')).length : 0;

        this.state = {
            randomName: '',
            filteredList,
            nrClassList: nrClassListLength > 0 ? JSON.parse(localStorage.getItem('no-repeat-class-list')) : filteredList,
        }
    }
    componentDidMount = () => {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'n') this.grabName('generate-name-button-no-repeats');
            if (e.key === 'r' || e.key === 'g') this.grabName('generate-name-button');
          })
    }
    updateList = (filteredList) => {
        this.setState({ filteredList });
    }
    grabName = (e) => {
        if (typeof e !== 'string') e.preventDefault();
        if (typeof e === 'string') {
            // console.log(e)
            let target = {
                id: e
            }
            e = {
                target
            }
        }
        let filteredList = false;
        let nrClassListLength = JSON.parse(localStorage.getItem('no-repeat-class-list')) ? JSON.parse(localStorage.getItem('no-repeat-class-list')).length : 0;
        if (this.state.filteredList.length > this.props.classList.length || this.state.filteredList.length < this.props.classList.length) {
            filteredList = JSON.parse(JSON.stringify(this.props.classList))
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
                nrClassListLength > 0 ? JSON.parse(localStorage.getItem('no-repeat-class-list')) : filteredList || this.state.nrClassList;
        let index = Math.floor(Math.random() * classList.length);
        let randomName = classList[index];
        if (randomName === this.state.randomName && this.state.filteredList.length <= 2) this.grabName(e);
        else {
            this.setState({ randomName });
            // console.log(classList)
            if (e.target.id === 'generate-name-button-no-repeats') classList.length < 1 ? localStorage.setItem('no-repeat-class-list', JSON.stringify(this.state.filteredList)) : localStorage.setItem('no-repeat-class-list', JSON.stringify(classList.filter((val, ind) => ind !== index)));
            // console.log('List Total Before Removal', classList.length)
            // console.log('grabbing name', randomName);
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
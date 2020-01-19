import React from 'react';
import FileSaver from 'file-saver';
import './App.css';
import Student from './components/Student';
import Clock from './components/Clock';
import RandomNameGenerator from './components/RandomNameGenerator';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    let date = new Date();
    date = date.toLocaleDateString();
    let classList = JSON.parse(localStorage.getItem('class-list')) || [];
    let attendanceTaken;
    if (JSON.parse(localStorage.getItem('class-list'))) {
      attendanceTaken = JSON.parse(localStorage.getItem('class-list')).length > 0 ? true : false;
    }
    else attendanceTaken = false;

    this.state = {
      attendanceTaken,
      classList,
      importedList: false,
      deskPerRow: 6,
      dragOver: -1,
      dragElement: '',
      rearrange: 'swap',
      date,
      mode: '' // edit 
    }

    this.changeAttendanceStatus = this.changeAttendanceStatus.bind(this);
    this.updateOrder = this.updateOrder.bind(this);
    this.updateDragElement = this.updateDragElement.bind(this);
    this.removeStudentFromClassList = this.removeStudentFromClassList.bind(this);
  }
  componentDidMount = () => {
    this.getClassroomScale();
    window.addEventListener('resize', () => {
      this.getClassroomScale();
    })
    let classList = JSON.parse(localStorage.getItem('class-list')) || [];
    this.setState({ classList });
    document.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.target.id) {
        this.setState({ dragOver: parseInt(e.target.id) });
      }
    })
    document.addEventListener('keydown', (e) => {
      if (e.key === 's') if (this.state.mode === 'edit') this.changeRearrangeType();
      if (e.key === 'e') this.changeEdit(e);
      if (e.key === 'a' || e.key === 't' || e.key === 'q') {
        this.toggleAttendance(e);
        if (e.key === 'q') this.changeQuickAttendance(e);
      }
    })
  }
  componentDidUpdate = (prevProps, prevState) => {
    if (!this.state.importedList) {
      localStorage.setItem('class-list', JSON.stringify(this.state.classList));
      this.setState({ importedList: true });
    }

    this.getClassroomScale();

    if (this.state.rearrange === 'swap') {
      if (this.state.dragElement) document.getElementById(this.state.dragElement).style.backgroundColor = '';
      document.addEventListener('drag', () => {
        if (this.state.dragOver !== -1 && prevState.rearrange !== 'slide' && prevState.mode === this.state.mode) document.getElementById(this.state.dragOver).style.backgroundColor = 'rgba(0,0,0,.2)';
      })
      if (prevState.dragOver !== this.state.dragOver) {
        if (prevState.dragOver !== -1) document.getElementById(prevState.dragOver).style.backgroundColor = '';
      }
      document.addEventListener('dragend', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        let dragElement = document.getElementById(e.target.id)
        dragElement.style.backgroundColor = '';
        let dragOver = document.getElementById(this.state.dragOver)
        dragOver.style.backgroundColor = '';
        this.showChangedDesks(parseInt(dragElement.id), parseInt(dragOver.id));
      })
    }

    if (this.state.rearrange === 'slide' && prevState.dragOver !== this.state.dragOver && this.state.dragOver !== -1 && this.state.dragOver !== this.state.dragElement) {
      if (prevState.dragOver !== -1) document.getElementById(prevState.dragOver).style.backgroundColor = '';
      if (prevState.rearrange !== 'swap') document.getElementById(this.state.dragOver).style.backgroundColor = 'rgba(0,0,0,.2)';

    }
    if (prevState.classList && (prevState.classList !== this.state.classList || this.state.dragElement === this.state.dragOver)) {
      if (this.state.dragOver !== -1) document.getElementById(this.state.dragOver).style.backgroundColor = '';
      if (prevState.classList.length > 0 && prevState.classList !== this.state.classList) {
        this.showChangedDesks();
      }
    }
  }
  showChangedDesks = (dragElement, dragOver) => {
    this.state.classList.filter(desk => {
      return this.state.rearrange === 'swap' ?
        (desk.order === dragElement || desk.order === dragOver) :
        this.state.dragElement > this.state.dragOver ?
          desk.order > this.state.dragOver :
          desk.order >= this.state.dragElement && desk.order !== this.state.dragOver
    }).forEach(desk => {
      let showUpdate = document.getElementById(desk.order);
      showUpdate.style.backgroundColor = 'rgba(0,0,0,.2)';
      let timeout = 500;
      showUpdate.style.transition = `all ${timeout}ms`;
      setTimeout(() => {
        timeout *= 1.5;
        showUpdate.style.transition = `all ${timeout}ms`;
        showUpdate.style.backgroundColor = '';
        setTimeout(() => {
          showUpdate.style.transition = '';
        }, timeout);
      }, timeout);
    });
  }
  changeRowCount = (e) => {
    e.stopPropagation();
    this.setState({ deskPerRow: e.target.value });
    this.updateRows(this.state.classList, e.target.value);
  }
  changeRearrangeType = (e) => {
    if (e) e.preventDefault();
    this.setState({ rearrange: this.state.rearrange === 'swap' ? 'slide' : 'swap' });
  }
  changeQuickAttendance = (e) => {
    e.preventDefault();
    this.setState({ mode: this.state.mode !== 'quickAttendance' ? 'quickAttendance' : 'Attendance' });
    this.quickAttendanceSetAll();
  }
  changeEdit = (e) => {
    e.preventDefault();
    this.setState({ mode: this.state.mode !== 'edit' ? 'edit' : '' });
  }
  toggleAttendance = (e) => {
    if (e) e.preventDefault();
    let mode = this.state.mode.includes('Attendance') ? '' : 'Attendance'
    this.setState({ mode });
    if (mode === '') {
      let classList = this.quickAttendanceSetAll('submit-attendance');
      let absent = document.getElementsByClassName('attendance-absent') || [];
      absent = [...absent];
      // console.log(absent);
      absent.forEach((desk, index) => {
        let student = document.getElementById(desk.id);
        student.className = 'desk absent';
        // student.setAttribute('draggable', false);
      });
      let noRepeatClassListTotal = classList || JSON.parse(JSON.stringify(this.state.classList))
      noRepeatClassListTotal = noRepeatClassListTotal.filter(val => {
        let date = val.attendance[val.attendance.length - 1].date;
        let present = val.attendance[val.attendance.length - 1].present.toString();
        return this.state.date === date && present.includes('1');
      }).map(val => val.name)
      let newPresentNames = this.state.changeInAttendance.filter(student => student.present === 1).map(student => student.name);
      let newAbsentNames = this.state.changeInAttendance.filter(student => student.present === 0).map(student => student.name);
      let lsNoRepeat = JSON.parse(localStorage.getItem('no-repeat-class-list')) || noRepeatClassListTotal;
      let noRepeatClassList = lsNoRepeat.length <= noRepeatClassListTotal.length ? lsNoRepeat : noRepeatClassListTotal;
      noRepeatClassList = noRepeatClassList.concat(newPresentNames).filter(name => !newAbsentNames.includes(name));
      localStorage.setItem('no-repeat-class-list', JSON.stringify(noRepeatClassList));
    }
    else if (mode === 'Attendance') {
      this.setState({ changeInAttendance: [] })
    }
  }
  updateRows = (classList, deskPerRow) => {
    let placeholder = [];
    let numberOfRows = deskPerRow || 4;
    if (classList.length > 0) {
      let subdivideRows = [...Array(classList.length).keys()];
      subdivideRows = subdivideRows.filter(val => val % numberOfRows === 0 || val === classList.length - 1);
      subdivideRows.forEach((val, index) => {
        if (index === subdivideRows.length - 1) placeholder.push(classList.slice(subdivideRows[index - 1]));
        else if (index > 0) placeholder.push(classList.slice(subdivideRows[index - 1], val));
      })
    }
    return placeholder;
  }
  importClassList = (e) => {
    // fetch('/files/class-list-number.txt')
    // fetch('/files/class-list.txt')
    let id = e.target.id;
    let date = this.state.date;
    date = date.split('/');
    date = date.join('_');
    let filename = id.includes('no') ? 'class-list.txt' : `class_attendance_${date}.txt`;
    fetch(`/files/${filename}`)
      .then(response => response.text())
      .then(text => {
        let date = new Date();
        date = date.toLocaleDateString();
        let classList = JSON.parse(text);
        classList.map(desk => desk.attendance ? desk.attendance = [{ date: this.state.date, present: desk.attendance[0].present, statusLastModified: `${this.state.date},${desk.attendance[0].statusLastModified.split(',')[1]}` }] : desk.attendance = [{ date, present: -1, statusLastModified: '' }]);
        classList.map((desk, index) => desk.order ? desk.order : desk.order = index + 1);
        let { attendance } = classList[0];
        this.setState({ classList })
        if (attendance.present !== -1 && !id.includes('no')) {
          this.toggleAttendance();
          this.toggleAttendance();
        }
      });
  }
  getClassroomScale = () => {
    let classroom = document.getElementById('classroom');
    let windowHeight = window.innerHeight;
    let ratio = (windowHeight / classroom.offsetHeight);
    classroom.style.transform = `scale(${ratio},${ratio})`;
  }
  updateDragElement = (e) => {
    let dragElement = parseInt(e.currentTarget.id);
    this.setState({ dragElement })
  }
  updateOrder = (e) => {
    let oldIndex = parseInt(e.currentTarget.id) - 1;
    let newIndex = parseInt(this.state.dragOver) - 1;

    let classList = this.state.classList;
    classList.map((desk, index) => desk.order = index + 1);

    let updatedClasslist = classList;

    if (this.state.rearrange === 'swap') {
      let temp = updatedClasslist[newIndex];
      updatedClasslist[newIndex] = updatedClasslist[oldIndex];
      updatedClasslist[oldIndex] = temp;
    }
    if (this.state.rearrange === 'slide') {
      if (oldIndex <= newIndex) {
        updatedClasslist = classList.slice(0, newIndex + 1).filter((val, index) => index !== oldIndex);
        updatedClasslist.push(classList[oldIndex])
        updatedClasslist = updatedClasslist.concat(classList.slice(newIndex + 1));
      }
      else if (oldIndex > newIndex) {
        let filteredClasslist = classList.filter((desk, index) => parseInt(desk.order) !== oldIndex + 1);
        updatedClasslist = filteredClasslist.slice(0, newIndex);
        updatedClasslist.push(classList[oldIndex]);

        filteredClasslist = filteredClasslist.slice(newIndex).filter(desk => parseInt(desk.order) !== oldIndex + 1);
        updatedClasslist = updatedClasslist.concat(filteredClasslist);
      }
      updatedClasslist.map((desk, index) => desk.order = (index + 1));
    }
    this.setState({ classList: updatedClasslist });
  }
  changeAttendanceStatus = (e) => {
    let index = parseInt(e.target.id) - 1;
    let classList = JSON.parse(JSON.stringify(this.state.classList));
    let attendanceArr = classList[index].attendance || [];
    let todaysIndex = -1;
    attendanceArr.filter((val, index) => {
      if (val.date === this.state.date) return todaysIndex = index;
      else return false;
    })
    let todaysAttendance = this.updateAttendance(attendanceArr, todaysIndex, 'change-status');

    //Track Changes to Attendance Between Submissions - for Random Number Genrator No Repeat
    let changeInAttendance = this.state.changeInAttendance;
    changeInAttendance.push({
      name: classList[index].name,
      present: todaysAttendance.present
    });
    todaysIndex === -1 ? attendanceArr.push(todaysAttendance) : attendanceArr[todaysIndex] = todaysAttendance;
    this.setState({ classList, changeInAttendance, attendanceTaken: true })
    // console.log('Double Clicked', classList[index]);
  }
  quickAttendanceSetAll = (originFunction = 'set-all') => {
    let classList = JSON.parse(JSON.stringify(this.state.classList));
    classList.map((val, index) => {
      let arr = val.attendance;
      let todaysIndex = -1;
      arr.filter((val, index) => {
        if (val.date === this.state.date) return todaysIndex = index;
        else return todaysIndex;
      })
      let todaysAttendance = val.attendance[0] ? val.attendance[0] : this.updateAttendance(val.attendance, todaysIndex, originFunction);
      return todaysIndex === -1 ? val.attendance.push(todaysAttendance) : val.attendance[todaysIndex] = todaysAttendance;
    });
    localStorage.setItem('class-list', JSON.stringify(classList));
    this.setState({ attendanceTaken: true, classList });
    if (originFunction === 'submit-attendance') return classList
  }
  updateAttendance = (student, todaysIndex, originFunction = 'submit-attendance') => {
    let date = new Date();
    let time = date.toLocaleString();
    let present;
    switch (originFunction) {
      case 'set-all':
        present = student[todaysIndex].present === -1 || student[todaysIndex].present === 1 ? 1 : 0;
        break;
      case 'change-status':
        present = student[todaysIndex].present < 1 ? 1 : 0;
        break;
      case 'submit-attendance':
        present = student[todaysIndex].present < 1 ? 0 : 1;
        break;
      default:
        present = 0;
    }
    let todaysAttendance = {
      date: this.state.date,
      present,
      statusLastModified: time
    }
    return todaysAttendance;
  }
  exportAttendanceList = () => {
    console.log("Exporting Attendance List");
    let classList = localStorage.getItem('class-list');
    var file = new File([classList], `class_attendance_${this.state.date}.txt`, { type: "text/plain;charset=utf-8" });
    FileSaver.saveAs(file)
  };
  removeStudentFromClassList = (e) => {
    let classListIndex = parseInt(e.target.id.split('-')[0]) - 1;
    console.log('Removing', classListIndex);
    let mode = 'remove-student';
    this.setState({ mode });
    document.getElementById('app').style.webkitFilter = 'blur(2px)';
    // Add logic to remove student
    console.log('Confirmation pop-up will (eventuall) launch now');
    setTimeout(() => {
      console.log('Removing blur test');
      document.getElementById('app').style.webkitFilter = null;
    }, 2000);
  }
  render() {
    return (
      <div>
        {this.state.mode === 'remove-child' && (
            <div id='removal-confirmation'>

            </div>
        )}
        <div id="app">
          {this.state.classList.length > 0 && (
            <div id='classroom-details'>
              <Clock />
              <form>
                <div>
                  <button id='toggle-edit-button' onClick={this.changeEdit}>{this.state.mode !== 'edit' ? 'Enable Edit Mode' : 'Disable Edit Mode'}</button>
                </div>
                {this.state.mode === 'edit' && (
                  <div>
                    <label>Number of desks per row: </label>
                    <input type='number' max='6' min='3' onChange={this.changeRowCount} value={this.state.deskPerRow} />
                    <div>
                      <label>Rearrange Method: {this.state.rearrange === 'swap' ? 'Swap Seats' : 'Slide Seats'} </label>
                      <div>
                        <button onClick={this.changeRearrangeType}>{this.state.rearrange === 'swap' ? 'Change to Slide Method' : 'Change to Swap Method'}</button>
                      </div>
                    </div>
                  </div>
                )}
                {this.state.mode.includes('Attendance') && (<div>
                  <button id='toggle-quickattendance-button' onClick={this.changeQuickAttendance}>{this.state.mode !== 'quickAttendance' ? 'Enable Quick Attendance' : 'Disable Quick Attendance'}</button>
                </div>)}
                {this.state.mode !== 'edit' && <div>
                  <button id='toggle-attendance-button' onClick={this.toggleAttendance}>{this.state.mode.includes('Attendance') ? 'Submit Attendance' : 'Take Attendance'}</button>
                  {this.state.mode === 'Attendance' && <div id='attendance-notes'><p>Double click the student's name to mark them present / absent.</p><p>Or enable quick attendance for single click changes.</p></div>}
                </div>}
                {this.state.attendanceTaken && (<div>
                  <button id='export-attendance-button' onClick={this.exportAttendanceList}>Export Attendance List</button>
                </div>)}
                {this.state.mode === '' && this.state.attendanceTaken && <RandomNameGenerator classList={this.state.classList} />}
              </form>
            </div>)
          }
          {
            this.state.classList.length === 0 && (
              <div id='import-button'>
                <p>New here? Click the button to import demo data</p>
                <button id='no-date' onClick={this.importClassList}>Import Demo Data</button>
                <button id='date' onClick={this.importClassList}>With Previous Date Info</button>
                <p><strong>Note: this data set is saved to local storage, but can be manually cleared from the devTools Application tab</strong></p>
              </div>
            )
          }
          <div id='classroom'>
            {this.state.classList.length > 0 && this.updateRows(this.state.classList, this.state.deskPerRow).map((row, rowIndex) => {
              return (
                <div className='row' key={`row-${rowIndex}`}>
                  {row.map((student, index) => {
                    return <Student
                      key={`${(this.state.deskPerRow * rowIndex) + index + 1}`}
                      deskPerRow={this.state.deskPerRow}
                      displayrow={rowIndex}
                      displaydesk={index + 1}
                      mode={this.state.mode}
                      changeAttendanceStatus={this.changeAttendanceStatus}
                      updateOrder={this.updateOrder}
                      updateDragElement={this.updateDragElement}
                      removeStudentFromClassList={this.removeStudentFromClassList}
                      name={student.name}
                      attendance={student.attendance && student.attendance[student.attendance.length - 1]}
                    />
                  })}
                </div>
              )
            })}
          </div>
        </div >
      </div>
    );
  }
}
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
      changeInAttendance: [],
      classListModified: 'No',
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
    this.removeConfirmation = this.removeConfirmation.bind(this);
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
      if (this.state.mode === 'remove-student') return this.clearConfirmation();
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

    if (this.state.changeInAttendance) if (this.state.changeInAttendance.length > 0 && this.state.classListModified === 'Yes') {
      document.getElementById('export-attendance-button').style.opacity = '1'
      document.getElementById('export-attendance-button').disabled = false;
    };

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
    if (this.state.mode === 'remove-student') {
      let seatChartOrigin = document.getElementById('classroom').getBoundingClientRect();
      let confirmationBox = document.getElementById('removal-confirmation');
      let cbWidth = confirmationBox.clientWidth;
      let centerSeatChart = ((seatChartOrigin.width - cbWidth) / 2) + seatChartOrigin.left;
      confirmationBox.style.left = `${centerSeatChart - 2}px`;
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
    this.quickAttendanceSetAll('set-all');
  }
  changeEdit = (e) => {
    e.preventDefault();
    let mode = this.state.mode !== 'edit' ? 'edit' : '';
    this.setState({ mode });
    setTimeout(() => {
      mode === 'edit' && document.getElementById('desks-per-row').focus();
    }, 200);
  }
  toggleAttendance = (e) => {
    if (e) e.preventDefault();
    let mode = e?.key === 'q' ? 'Attendance' : this.state.mode.includes('Attendance') ? '' : 'Attendance'
    this.setState({ mode });
    if (mode === '') {
      let classList = this.quickAttendanceSetAll('submit-attendance');
      let absent = document.getElementsByClassName('attendance-absent') || [];
      absent = [...absent];
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
      let newPresentNames = JSON.parse(JSON.stringify(this.state.changeInAttendance)).filter(student => student.present === 1).map(student => student.name);
      let newAbsentNames = JSON.parse(JSON.stringify(this.state.changeInAttendance)).filter(student => student.present === 0).map(student => student.name);
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
        if (index === subdivideRows.length - 1) {
          placeholder.push(classList.slice(subdivideRows[index - 1]));
          if (placeholder[placeholder.length - 1].length > deskPerRow) {
            ;
            placeholder.push([placeholder[placeholder.length - 1].pop()]);
          }
        }
        else if (index > 0) {
          placeholder.push(classList.slice(subdivideRows[index - 1], val));
        }
      })
    }
    return placeholder;
  }
  importClassList = (e) => {
    // fetch('/files/class-list-number.txt')
    // fetch('/files/class-list.txt')

    let id = e.target.id === 'no-date' ? 'no-date' : 'date';
    let filename = e.target.id === 'no-date' ? 'class-list.txt' : document.getElementById('date').files[0].name;


    fetch(`/files/${filename}`)
      .then(response => response.text())
      .then(text => {
        let date = new Date();
        date = date.toLocaleDateString();
        let classList = JSON.parse(text);
        classList.map(desk => {
          let last = desk.attendance.length - 1;
          return desk.attendance = desk.attendance[last].date.includes(this.state.date) ? [...desk.attendance] : [...desk.attendance, { date, present: -1, statusLastModified: '' }];
        });
        this.setState({ classList })
        let today = classList.some(student => student.attendance[student.attendance.length-1].present !== -1 && this.state.date === student.attendance[student.attendance.length-1].date ? true : false); 
        console.log(today);
        if (today && !id.includes('no')) {
          this.toggleAttendance();
          this.toggleAttendance();
        }
      });
  }
  getClassroomScale = () => {
    let classroom = document.getElementById('classroom');
    let windowHeight = window.innerHeight;
    let ratio = (windowHeight / classroom.offsetHeight);
    if (ratio <= 1) classroom.style.transform = `scale(${ratio},${ratio})`;
    if (document.getElementsByClassName('remove-student-button').length > 0) {
      let removeButton = Object.assign([], document.getElementsByClassName('remove-student-button'));
      if (ratio <= 1.1) removeButton.forEach(val => {
        val.style.transform = `scale(${ratio},${ratio})`;
        val.style.lineHeight = `${1 / ratio}`;
        val.style.textSize = `${ratio}%`;
      });
    }
  }
  updateDragElement = (e) => {
    let dragElement = typeof e === 'number' ? e : parseInt(e.currentTarget.id);
    this.setState({ dragElement })
  }
  updateOrder = (e) => {
    let oldIndex = parseInt(e.currentTarget.id) - 1;
    let newIndex = parseInt(this.state.dragOver) - 1;

    let classList = JSON.parse(JSON.stringify(this.state.classList));
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
    this.setState({ classList: updatedClasslist, classListModified: 'Yes' });
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
    let changeInAttendance = JSON.parse(JSON.stringify(this.state.changeInAttendance));
    const pushToArray = () => {
      changeInAttendance.push({
        name: classList[index].name,
        present: todaysAttendance.present
      });
    }
    const removeFromArray = () => {
      return changeInAttendance = changeInAttendance.filter(student => student.name !== classList[index].name);
    }
    changeInAttendance.some(student => student.name === classList[index].name) ? removeFromArray() : pushToArray();
    todaysIndex === -1 ? attendanceArr.push(todaysAttendance) : attendanceArr[todaysIndex] = todaysAttendance;
    changeInAttendance.length > 0 ? this.setState({ classList, changeInAttendance, attendanceTaken: true, classListModified: 'Yes' }) : this.setState({ classList, changeInAttendance, attendanceTaken: true, classListModified: 'No' });
  }
  quickAttendanceSetAll = (originFunction = 'set-all') => {
    let classList = JSON.parse(JSON.stringify(this.state.classList));
    classList.map((val, index) => {
      let arr = val.attendance;
      let last = arr.length;
      let todaysIndex = -1;
      arr.filter((val, index) => {
        if (val.date === this.state.date) return todaysIndex = index;
        else return todaysIndex;
      })
      let todaysAttendance = val.attendance[last] ? val.attendance[last] : this.updateAttendance(val.attendance, todaysIndex, originFunction);
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
  exportAttendanceList = (e) => {
    e.preventDefault();
    document.getElementById(e.target.id).style.opacity = '0';
    document.getElementById(e.target.id).disabled = true;
    let classList = localStorage.getItem('class-list');
    var file = new File([classList], `class_attendance_${this.state.date}.txt`, { type: "text/plain;charset=utf-8" });
    FileSaver.saveAs(file)
    this.setState({ classListModified: 'No' });
  };
  removeConfirmation = (e) => {
    let classListIndex = parseInt(e.target.id.split('-')[0]) - 1;
    let mode = 'remove-student';
    this.setState({ mode });
    document.getElementById('classroom').style.webkitFilter = 'blur(2px)';
    this.updateDragElement(classListIndex);
  }
  clearConfirmation = (e) => {
    if (e) e.stopPropagation();
    document.getElementById('classroom').style.webkitFilter = null;
    this.setState({ mode: 'edit' });
  }
  removeStudentFromClassList = () => {
    let indexOfRemovedStudent = this.state.dragElement;
    let classList = JSON.parse(JSON.stringify(this.state.classList));
    classList = classList.filter((val, index) => index !== indexOfRemovedStudent);
    this.setState({ classList });
    localStorage.setItem('class-list', JSON.stringify(classList));
    this.clearConfirmation()
  }
  clearlocalStorage = () => {
    localStorage.clear();
    window.location.reload();
  }
  render() {
    let warning = {
      color: 'red'
    }
    let noBold = {
      fontWeight: 'lighter'
    }
    return (
      <div id="app">
        {this.state.classList.length > 0 && (
          <div id='classroom-details'>
            <Clock />
            <button onClick={this.clearlocalStorage}>Clear Local Storage</button>
            <form>
              <div>
                <button id='toggle-edit-button' onClick={this.changeEdit}>{this.state.mode !== 'edit' && this.state.mode !== 'remove-student' ? 'Enable Edit Mode' : 'Disable Edit Mode'}</button>
              </div>
              {(this.state.mode === 'edit' || this.state.mode === 'remove-student') && (
                <div>
                  <label>Number of desks per row: </label>
                  <input id='desks-per-row' type='number' max='6' min='3' onChange={this.changeRowCount} value={this.state.deskPerRow} />
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
              {(this.state.mode !== 'edit' || this.state.mode !== 'remove-student') && <div>
                <button id='toggle-attendance-button' onClick={this.toggleAttendance}>{this.state.mode.includes('Attendance') ? 'Submit Attendance' : 'Take Attendance'}</button>
                {this.state.mode === 'Attendance' && <div id='attendance-notes'><p>Double click the student's name to mark them present / absent.</p><p>Or enable quick attendance for single click changes.</p></div>}
              </div>}
              {this.state.attendanceTaken && this.state.classListModified === 'Yes' && (<div>
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
              <p>Or choose a file with previous date info </p>
              <input type='file' id='date' onChange={this.importClassList} />
              <p>You can find these files within the <strong>classroom > public > files directory</strong></p>
              <p style={warning}><strong>Note: this data set is saved to local storage, but can be manually cleared from the devTools Application tab</strong></p>
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
                    removeConfirmation={this.removeConfirmation}
                    name={student.name}
                    attendance={student.attendance && student.attendance[student.attendance.length - 1]}
                  />
                })}
              </div>
            )
          })}
        </div>
        {this.state.mode === 'remove-student' && <div onClick={this.clearConfirmation} id='disable-page'></div>}
        {this.state.mode === 'remove-student' && (
          <div id='removal-confirmation'>
            <h4>Are you sure you want to remove {this.state.classList[this.state.dragElement].name} from this roster?</h4>
            <span style={noBold}>
              <p>You can press and key or click outside of this box to cancel.</p>
              <p style={warning}>Note: This action cannot be undone.</p>
            </span>
            <button id='confirm-remove' onClick={this.removeStudentFromClassList}>Remove</button><button id='confirm-cancel' onClick={this.clearConfirmation}>Cancel</button>
            <div><button id='removal-confimation-export-button' onClick={this.exportAttendanceList}>Export class list first, just in case...</button></div>
          </div>
        )}
      </div>
    );
  }
}
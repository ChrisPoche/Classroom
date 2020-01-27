import React from 'react';
import FileSaver from 'file-saver';
import './App.css';
import Student from './components/Student';
import Clock from './components/Clock';
import RandomNameGenerator from './components/RandomNameGenerator';
import html2canvas from 'html2canvas'

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
      // classListModified: 'Yes',
      classListModified: 'No',
      importedList: false,
      deskPerRow: 6,
      dragOver: -1,
      dragElement: '',
      rearrange: 'swap',
      date,
      mode: '', // edit
      // functionTracking: true,
      functionTracking: false,
      functionTrackingStyle: 'font-weight:bolder; font-size:medium; text-decoration: underline; color:green;',
      functionTrackingStyleReturn: 'font-weight:bolder; font-size:medium; text-decoration: underline; color:red;'
    }

    this.changeAttendanceStatus = this.changeAttendanceStatus.bind(this);
    this.updateOrder = this.updateOrder.bind(this);
    this.updateDragElement = this.updateDragElement.bind(this);
    this.removeConfirmation = this.removeConfirmation.bind(this);

    if (this.state.functionTracking) console.log('%cState Created', this.state.functionTrackingStyle);
  }
  componentDidMount = () => {
    // if (this.state.functionTracking) console.log('Did Mount', this.state.classList[0].attendance)
    this.getClassroomScale();
    if (this.state.functionTracking) console.log('%cReturn to Did Mount', this.state.functionTrackingStyleReturn);
    window.addEventListener('resize', () => {
      this.getClassroomScale();
      if (this.state.functionTracking) console.log('%cReturn to Did Mount', this.state.functionTrackingStyleReturn);
    })
    let classList = JSON.parse(localStorage.getItem('class-list')) || [];
    this.checkDate(classList);
    if (this.state.functionTracking) console.log('%cReturn to Did Mount', this.state.functionTrackingStyleReturn);
    // if (this.state.functionTracking) console.log('ClassList',this.state.classList)

    document.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.target.id) {
        this.setState({ dragOver: parseInt(e.target.id) });
      }
    })
    document.addEventListener('keydown', (e) => {
      if (this.state.classList.length > 0) {
        if (this.state.mode === 'remove-student') return this.clearConfirmation();
        if (e.key === 's') if (this.state.mode === 'edit') this.changeRearrangeType();
        if (e.key === 'e') this.changeEdit(e);
        if (e.key === 'a' || e.key === 't' || e.key === 'q') {
          this.toggleAttendance(e);
          if (e.key === 'q') this.changeQuickAttendance(e);
        }
        if (this.state.functionTracking) console.log('%cReturn to Did Mount', this.state.functionTrackingStyleReturn);
      }
    })
  }
  componentDidUpdate = (prevProps, prevState) => {
    if (this.state.functionTracking) console.log('%cComponent Did Update', this.state.functionTrackingStyle);
    if (!this.state.importedList) {
      // localStorage.setItem('class-list', JSON.stringify(this.state.classList));
      // this.setState({ importedList: true });
    }
    for (let val in this.state) {
      if (this.state.functionTracking) {
        if (this.state[val] !== prevState[val]) {
          console.log(`%cState Value: %c${val}`, 'color: black; font-weight: bold', 'color: red; font-weight: bolder;');
          console.log('PrevState', prevState[val][0].attendance);
          console.log('this.State', this.state[val][0].attendance);
          if (prevState[val][0].attendance === this.state[val][0].attendance) {
            console.log('PrevState', prevState[val]);
            console.log('this.State', this.state[val]);
          }
        }
      }
    }

    this.getClassroomScale();
    if (this.state.functionTracking) console.log('%cReturn to Component Did Update', this.state.functionTrackingStyleReturn);


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
        let removeButton = document.getElementById(`${e.target.id}-remove`);
        removeButton.style.opacity = 1;
        this.updateOrder(e)
        if (this.state.functionTracking) console.log('%cComponent Did Update', this.state.functionTrackingStyle);
        this.showChangedDesks(parseInt(dragElement.id), parseInt(dragOver.id));
        if (this.state.functionTracking) console.log('%cComponent Did Update', this.state.functionTrackingStyle);
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
        if (this.state.functionTracking) console.log('%cComponent Did Update', this.state.functionTrackingStyle);
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
    if (this.state.functionTracking) console.log('%cShow Changed Desks', this.state.functionTrackingStyle);
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
    if (this.state.functionTracking) console.log('%cChange Row Count', this.state.functionTrackingStyle);
    e.stopPropagation();
    this.setState({ deskPerRow: e.target.value });
    this.updateRows(this.state.classList, e.target.value);
    if (this.state.functionTracking) console.log('%cReturn to Change Row Count', this.state.functionTrackingStyleReturn);
  }
  changeRearrangeType = (e) => {
    if (this.state.functionTracking) console.log('%cChange Rearrange Type', this.state.functionTrackingStyle);
    if (e) e.preventDefault();
    this.setState({ rearrange: this.state.rearrange === 'swap' ? 'slide' : 'swap' });
  }
  changeQuickAttendance = (e) => {
    if (this.state.functionTracking) console.log('%cChange Quick Attendance', this.state.functionTrackingStyle);
    e.preventDefault();
    this.setState({ mode: this.state.mode !== 'quickAttendance' ? 'quickAttendance' : 'Attendance' });
    this.quickAttendanceSetAll('set-all');
    if (this.state.functionTracking) console.log('%cReturn to Change Quick Attendance', this.state.functionTrackingStyleReturn);
  }
  changeEdit = (e) => {
    if (this.state.functionTracking) console.log('%cChange Edit', this.state.functionTrackingStyle);
    e.preventDefault();
    let mode = this.state.mode !== 'edit' ? 'edit' : '';
    this.setState({ mode });
    setTimeout(() => {
      mode === 'edit' && document.getElementById('desks-per-row').focus();
    }, 200);
  }
  toggleAttendance = (e) => {
    if (this.state.functionTracking) console.log('%cToggle Attendance', this.state.functionTrackingStyle);
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
    if (this.state.functionTracking) console.log('%cUpdate Rows', this.state.functionTrackingStyle);
    // if (this.state.functionTracking) console.log(classList[0]);
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
  // importClassList = (e, filename = 'class_attendance_1_20_2020.txt') => {
  importClassList = (e) => {
    if (this.state.functionTracking) console.log('%cImport Class List', this.state.functionTrackingStyle);
    let id = e.target?.id === 'no-date' ? 'no-date' : 'date';
    let filename = e.target.id === 'no-date' ? 'class-list.txt' : document.getElementById('date').files[0].name;
    fetch(`/files/${filename}`)
      .then(response => response.text())
      .then(text => {
        let classList = JSON.parse(text);
        this.checkDate(classList);
        if (this.state.functionTracking) console.log('%cReturn to Import Class List', this.state.functionTrackingStyleReturn);
        let today = classList.some(student => student.attendance[student.attendance.length - 1].present !== -1 && this.state.date === student.attendance[student.attendance.length - 1].date ? true : false);
        // console.log(today);
        if (today && !id.includes('no')) {
          this.toggleAttendance();
          if (this.state.functionTracking) console.log('%cReturn to Import Class List', this.state.functionTrackingStyleReturn);
          this.toggleAttendance();
          if (this.state.functionTracking) console.log('%cReturn to Import Class List', this.state.functionTrackingStyleReturn);
        }
      });
  }
  checkDate = (classList) => {
    if (this.state.functionTracking) console.log('%cCheck Date', this.state.functionTrackingStyle);
    // if (this.state.functionTracking) console.log(classList[0].attendance);
    let date = new Date();
    date = date.toLocaleDateString();
    classList = classList.map((desk, index) => {
      let name = desk.name;
      let last = desk.attendance && desk.attendance.length - 1;
      let order = desk.attendance ? desk.attendance[last].date.includes(this.state.date) ? desk.order : index + 1 : index + 1;
      let attendance = desk.attendance ? [...desk.attendance] : [];
      if (desk.attendance) {
        if (!desk.attendance[last].date.includes(this.state.date)) attendance.push({ date, present: -1, statusLastModified: '' });
      }
      else attendance = [{ date, present: -1, statusLastModified: '' }];
      let newDesk = { name, order, attendance };
      return newDesk;
    });
    this.setState({ classList })
    // if (this.state.functionTracking) console.log(classList[0].attendance);
  };
  getClassroomScale = () => {
    if (this.state.functionTracking) console.log('%cGet Classroom Scale', this.state.functionTrackingStyle);
    let classroom = document.getElementById('classroom');
    let windowHeight = window.innerHeight;
    let ratio = (windowHeight / classroom.offsetHeight);
    if (ratio <= 1) classroom.style.transform = `scale(${ratio},${ratio})`;
    if (document.getElementById('roster')) {
      let inBetween = this.state.classList.length * 4;
      let roster = document.getElementById('roster');
      let ratio = (windowHeight / (roster.offsetHeight + 20 + inBetween));
      roster.style.transform = `scale(${ratio},${ratio})`;
    }
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
    if (this.state.functionTracking) console.log('%cUpdate Drag Element', this.state.functionTrackingStyle);
    let dragElement = typeof e === 'number' ? e : parseInt(e.currentTarget.id);
    this.setState({ dragElement })
  }
  updateOrder = (e) => {
    if (this.state.functionTracking) console.log('%cUpdate Order', this.state.functionTrackingStyle);
    let oldIndex = parseInt(this.state.dragElement) - 1;
    let newIndex = parseInt(this.state.dragOver) - 1;

    let classList = JSON.parse(JSON.stringify(this.state.classList));
    // classList.map((desk, index) => desk.order = index + 1);

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
    if (this.state.functionTracking) console.log('%cChange Attendance Status', this.state.functionTrackingStyle);
    let index = parseInt(e.target.id) - 1;
    let classList = JSON.parse(JSON.stringify(this.state.classList));
    let attendanceArr = classList[index].attendance || [];
    let todaysIndex = -1;
    attendanceArr.filter((val, index) => {
      if (val.date === this.state.date) return todaysIndex = index;
      else return false;
    })
    let todaysAttendance = this.updateAttendance(attendanceArr, todaysIndex, 'change-status');
    if (this.state.functionTracking) console.log('%cReturn to Change Attendance Status', this.state.functionTrackingStyleReturn);

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
    if (this.state.functionTracking) console.log('%cQuick Attendance Set All', this.state.functionTrackingStyle);
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
      if (this.state.functionTracking && todaysAttendance === val.attendance[last]) console.log('%cQuick Attendance Set All', this.state.functionTrackingStyle);
      return todaysIndex === -1 ? val.attendance.push(todaysAttendance) : val.attendance[todaysIndex] = todaysAttendance;
    });
    localStorage.setItem('class-list', JSON.stringify(classList));
    this.setState({ attendanceTaken: true, classList });
    if (originFunction === 'submit-attendance') return classList
  }
  updateAttendance = (student, todaysIndex, originFunction = 'submit-attendance') => {
    if (this.state.functionTracking) console.log('%cUpdate Attendance', this.state.functionTrackingStyle);
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
  removeConfirmation = (e) => {
    if (this.state.functionTracking) console.log('%cRemove Confirmation', this.state.functionTrackingStyleReturn);
    let classListIndex = parseInt(e.target.id.split('-')[0]) - 1;
    let mode = 'remove-student';
    this.setState({ mode });
    document.getElementById('classroom').style.webkitFilter = 'blur(2px)';
    this.updateDragElement(classListIndex);
    if (this.state.functionTracking) console.log('%cReturn to Remove Confirmation', this.state.functionTrackingStyleReturn);
  }
  clearConfirmation = (e) => {
    if (this.state.functionTracking) console.log('%cClear Confirmation', this.state.functionTrackingStyle);
    if (e) e.stopPropagation();
    document.getElementById('classroom').style.webkitFilter = null;
    this.setState({ mode: 'edit' });
  }
  removeStudentFromClassList = () => {
    if (this.state.functionTracking) console.log('%cRemove Student From Class List', this.state.functionTrackingStyleReturn);
    let indexOfRemovedStudent = this.state.dragElement;
    let classList = JSON.parse(JSON.stringify(this.state.classList));
    classList = classList.filter((val, index) => index !== indexOfRemovedStudent);
    this.setState({ classList });
    localStorage.setItem('class-list', JSON.stringify(classList));
    this.clearConfirmation()
    if (this.state.functionTracking) console.log('%cReturn to Remove Student From Class List', this.state.functionTrackingStyleReturn);
  }
  clearlocalStorage = () => {
    localStorage.clear();
    window.location.reload();
  }
  exportFile = (e) => {
    if (this.state.functionTracking) console.log('%cExport File', this.state.functionTrackingStyle);
    e.preventDefault();
    let exportRange = e.target.id;
    let exportButton = document.getElementById(e.target.id);
    exportButton.style.opacity = '0';
    exportButton.disabled = true;
    let classList = JSON.parse(localStorage.getItem('class-list'));
    let csvText = ['Name'];

    let earliestDate = new Date();
    let latestDate = new Date();

    if (exportRange.includes('this-week') || exportRange.includes('last-week')) {
      let day = exportRange.includes('this-week') ? new Date(earliestDate.setDate(earliestDate.getDate())) : new Date(earliestDate.setDate(earliestDate.getDate() - 7));
      if (exportRange.includes('last-week')) {
        classList.forEach(student => {
          let newDate = new Date(student.attendance[0].date)
          if (newDate < earliestDate) earliestDate = newDate;
        })
      }
      earliestDate = day.getDay() === 0 ? new Date(day.setDate(day.getDate() - 6)) : new Date(day.setDate(day.getDate() - (day.getDay() - 1)));
      latestDate = exportRange.includes('this-week') ? latestDate : new Date(day.setDate(earliestDate.getDate() + 4));
    }
    if (exportRange === 'export-csv-all') {
      classList.forEach(student => {
        student.attendance.forEach(record => {
          let newDate = new Date(record.date);
          if (newDate < earliestDate) earliestDate = newDate;
          else if (newDate > latestDate) latestDate = newDate;
        });
      });
    }
    if (exportRange.includes('-this-month')) {
      earliestDate = new Date(`${earliestDate.getMonth() + 1}/01/${earliestDate.getFullYear()}`);
    }

    let range = [earliestDate.toLocaleDateString()];
    let date = earliestDate;

    while (date < latestDate) {
      let day = new Date(date.setDate(date.getDate() + 1));
      if (day.getDay() > 0 && day.getDay() < 6) range.push(new Date(day).toLocaleDateString());
    }

    csvText = csvText.concat(range);
    csvText = csvText.join() + '\r\n';

    let csv = csvText;

    for (let c = 0; c < classList.length; c++) {
      let row = [classList[c].name];
      for (let i = 0; i < range.length; i++) {
        let attDates = [[], []];
        classList[c].attendance.forEach(attendance => {
          attDates[0].push(attendance.date);
          attDates[1].push(attendance.present);
        })


        let rangeIterate = 0;
        while (rangeIterate < range.length) {
          if (attDates[0].indexOf(range[i]) !== -1) {
            row.push(attDates[1][attDates[0].indexOf(range[i])] ? 'P' : 'A');
          }
          else if (attDates[0].indexOf(range[i]) === -1) {
            row.push('')
          }
          i++;
          rangeIterate++;
        }
        row += '\r\n';
        csv += row;
      }
    }

    let text = csv;
    console.log(text);
    let file;
    if (exportRange.includes('-this-week')) file = new File([text], `class_attendance_${range[0]}-${range[range.length - 1]}.csv`, { type: "text/plain;charset=utf-8" });
    else if (exportRange.includes('-last-week')) file = new File([text], `class_attendance_${range[0]}-${range[range.length - 1]}.csv`, { type: "text/plain;charset=utf-8" });
    else if (exportRange.includes('-this-month')) file = new File([text], `class_attendance_this_month_${new Date().toString().slice(4, 7)}.csv`, { type: "text/plain;charset=utf-8" });
    else if (exportRange.includes('-all')) file = new File([text], `class_attendance_all_logged_${this.state.date}.csv`, { type: "text/plain;charset=utf-8" });
    FileSaver.saveAs(file)
  }
  exportAttendanceList = (e) => {
    if (this.state.functionTracking) console.log('%cExport Attendance List', this.state.functionTrackingStyle);
    e.preventDefault();
    document.getElementById(e.target.id).style.opacity = '0';
    document.getElementById(e.target.id).disabled = true;
    let classList = localStorage.getItem('class-list');
    var file = new File([classList], `class_attendance_${this.state.date}.txt`, { type: "text/plain;charset=utf-8" });
    FileSaver.saveAs(file)
    this.setState({ classListModified: 'No' });
  };
  exportSeatingChart = (e) => {
    e.preventDefault();
    let seatingChartClone = document.getElementById('classroom');
    let seatingChart = seatingChartClone.cloneNode(true);
    seatingChart.id = 'screenshot-classroom'
    let seatingChartScreenshot = document.getElementById('seating-chart-screenshot');
    
    let rows = seatingChart.childNodes
    let desks = []
    rows.forEach(row => {
      row.childNodes.forEach(indDesk => {
        indDesk.childNodes.forEach(desk => {
          desk.className = 'desk';
          desks.push(desk)
        })
      })
    })
    
    let roster = document.createElement('div');
    roster.id = 'roster';
    seatingChartScreenshot.appendChild(roster);

    roster = document.getElementById('roster');

    let rosterText = '<div>';
    this.state.classList.forEach((student, index) => {
      rosterText += `<div><canvas id='checkBox-${index}' class='check-box'></canvas><h3>${student.name}</h3></div>`
    })
    rosterText += '</div>';
    roster.innerHTML = rosterText;
    seatingChartScreenshot.appendChild(roster);
    seatingChartScreenshot.appendChild(seatingChart);
    
    this.getClassroomScale();
    html2canvas(seatingChartScreenshot).then(canvas => {
      canvas.toBlob(blob => {
        FileSaver.saveAs(blob, "screenshot.png");
      }, "image/png");
    });
    seatingChartScreenshot.removeChild(roster);
    seatingChartScreenshot.removeChild(seatingChart);
  }
  render() {
    let warning = {
      color: 'red'
    }
    let noBold = {
      fontWeight: 'lighter'
    }
    if (this.state.functionTracking) console.log('%cRender', this.state.functionTrackingStyle);
    // if (this.state.functionTracking) console.log('ClassList',this.state.classList)
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
              <button id='export-seating-chart' className='export' onClick={this.exportSeatingChart}>Export Seating Chart</button>
              {this.state.attendanceTaken && this.state.classListModified === 'Yes' && (<div>
                <button id='export-attendance-button' className='export' onClick={this.exportAttendanceList}>Export Attendance List JSON</button>
                <div className='export'>
                  <button id='export-csv-all' className='export-csv' onClick={this.exportFile}>Export All Logged as CSV</button>
                  <button id='export-csv-this-month' className='export-csv' onClick={this.exportFile}>This month</button>
                  <button id='export-csv-this-week' className='export-csv' onClick={this.exportFile}>This week</button>
                  <button id='export-csv-last-week' className='export-csv' onClick={this.exportFile}>Last week</button>
                </div>
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
        <div id='seating-chart-screenshot'></div>
      </div>
    );
  }
}
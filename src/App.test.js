import React from 'react';
import { render } from '@testing-library/react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

// import 'jest-localstorage-mock';
//import { localStorageMock } from '../src/setupTests';

import App from './App';
import Clock from './components/Clock';
import RandomNameGenerator from './components/RandomNameGenerator';

Enzyme.configure({ adapter: new Adapter() });

describe('Testing Clock Component Functionalities', () => {
  const clock = shallow((<Clock />));
  it('Default state twentyFourHour equals false', () => {
    expect(clock.state('twentyFourHour')).toBe(false);
  });
  it('Click 24 hour format button to toggle state: true', () => {
    clock.find('#tfh-button').simulate('click');
    expect(clock.state('twentyFourHour')).toBe(true);
  });
  it('Click 12 hour format button to toggle state: false', () => {
    clock.find('#tfh-button').simulate('click');
    expect(clock.state('twentyFourHour')).toBe(false);
  });
  it('Click Toggle Date button: On', () => {
    clock.find('#date-button').simulate('click');
    expect(clock.state('clockDate')).toBe(new Date().toDateString());
  });
  it('Click Toggle Date button: Off', () => {
    clock.find('#date-button').simulate('click');
    expect(clock.state('clockDate')).toBe('');
  });
});
describe('Testing RandomNameGenerator Component Functionalities', () => {
  const classList = [{ "name": "Jamarcus", "order": 1, "attendance": [{ "date": new Date().toLocaleDateString(), "present": 1 }] },
  { "name": "Justice", "order": 2, "attendance": [{ "date": new Date().toLocaleDateString(), "present": 1 }] },
  { "name": "Felicity", "order": 3, "attendance": [{ "date": new Date().toLocaleDateString(), "present": 1 }] },
  { "name": "Marisol", "order": 4, "attendance": [{ "date": new Date().toLocaleDateString(), "present": 0 }] },
  { "name": "Lucy", "order": 5, "attendance": [{ "date": new Date().toLocaleDateString(), "present": 1 }] }]
  const rNG = mount((<RandomNameGenerator classList={classList} />));
  it('No Repeat List Gets Shorter with each click', () => {
    expect(rNG.state('noRepeatLocalStorage').length).toBe(4);
    expect(rNG.state('noRepeatLocalStorage')).toEqual(["Jamarcus", "Justice", "Felicity", "Lucy"]);
    rNG.find('#generate-name-button-no-repeats').simulate('click');
    expect(rNG.state('noRepeatLocalStorage').length).toBe(3);
    rNG.find('#generate-name-button-no-repeats').simulate('click');
    expect(rNG.state('noRepeatLocalStorage').length).toBe(2);
    rNG.find('#generate-name-button-no-repeats').simulate('click');
    expect(rNG.state('noRepeatLocalStorage').length).toBe(1);
    rNG.find('#generate-name-button-no-repeats').simulate('click');
    expect(rNG.state('noRepeatLocalStorage').length).toBe(0);
    rNG.find('#generate-name-button-no-repeats').simulate('click');
    expect(rNG.state('noRepeatLocalStorage').length).toBe(3);
    // global.storage = {
    //   store: {'no-repeat-class-list': ["Jamarcus", "Justice", "Felicity", "Lucy"]},
    //   getItem: (key) => this.store[key],
    //   setItem: (key, value) => this.store[key] = value
    // }
    // Storage.prototype.getItem = jest.fn(() => 'clicked');
    // expect(global.storage.store['no-repeat-class-list'].length).toBe(4);
    // localStorageMock.setItem({'no-repeat-class-list': ["Jamarcus","Justice","Felicity","Lucy"]});
    // expect(localStorageMock.getItem('no-repeat-class-list')).toBe(4);
  });
  it('Randomly Repeated Names Are Not Repeated Back To Back', () => {
    rNG.find('#generate-name-button').simulate('click');
    let name = rNG.instance().state.randomName;
    rNG.find('#generate-name-button').simulate('click');
    let name2 = rNG.instance().state.randomName;
    rNG.find('#generate-name-button').simulate('click');
    let name3 = rNG.instance().state.randomName;
    expect(name2).not.toMatch(name);
    expect(name3).not.toMatch(name2);
  })
  it('Filter List Length Expect 4', () => {
    expect(rNG.state('filteredList').length).toBe(4);
  });
  it('Filter List Length Expect 2', () => {
    const classList = [
      { "name": "Jamarcus", "order": 1, "attendance": [{ "date": new Date().toLocaleDateString(), "present": 1 }] },
      { "name": "Justice", "order": 2, "attendance": [{ "date": new Date().toLocaleDateString(), "present": 0 }] },
      { "name": "Felicity", "order": 3, "attendance": [{ "date": new Date().toLocaleDateString(), "present": 1 }] },
      { "name": "Marisol", "order": 4, "attendance": [{ "date": new Date().toLocaleDateString(), "present": 0 }] },
      { "name": "Lucy", "order": 5, "attendance": [{ "date": new Date().toLocaleDateString(), "present": 0 }] }]
      const rNG2 = shallow((<RandomNameGenerator classList={classList} />));
      expect(rNG2.state('filteredList').length).toBe(2);
    });
    it('Random NAme Cleared', () => {
      rNG.find('#generate-name-button').simulate('click');
      expect(rNG.state('randomName').length).toBeGreaterThan(0);
      rNG.find('#clear-name').simulate('click');
      expect(rNG.state('randomName').length).toBe(0);
  });
})
This is a simple classroom application. For the time being, students are hard coded in using an attached txt file with JSON formatted data.

## Planned features:
Widgets
- Daily announcement
- Group students (have ability to specify students to not group) 
- Notepad
- Timer
- Stoplight 
- Work Actions (silent, work with partner, etc)
- Dice
- ~~Time includes small date above (can be toggled)~~
- ~~Large clock in class details section~~
- ~~Random Name Generator~~
  - ~~Random Name Generator only chooses students with a status of present~~
  - Add spinner, random desk cycling animation
  - Click on randomly generated name, to highlight the student's desk
- Toolbox / Widget drawer, that teachers can drag and drop into their classroom details section (timer, random name generator, games)


Main Panel
- Seating Chart
  - ~~Take Attendance Mode: Double click student to change attendance status~~
  - ~~Quick Attendance Mode: All students are marked present, can be selected / deselected with single click~~
  - Click on student's chiclet to see more options (profile, grades, attendance, etc.)
  - Assign blank desk
  - Lasso desks to work together
  - Desk SVG with students name on desk, allowing seat orientation, rotate desks
  - Free moving desks - save layout
  - Customize student desks. Create lab tables for 2-4 drag and drop. Visually shows them together (same color as individual desks) to enable students to be moved
- Student profile - attendance data over time
  - Calendar month/week with green (present), yellow (tardy), red (absent) for each day
  - Same calendar but for whole class instead of individual student
- Enable PowerPoint to be uploaded and run in browser
- Enable full screen mode of main panel
- Add students one-by-one, or list (comma delimited, semi-colon, hard return)
- Within Edit Mode restrict functions when locked: 
  - ~~Disabling the rearrangement of students~~ 
  - ~~Removing and~~ Adding students
- Enable ability to rotate the screen for longer seating charts  
- ~~Remove students from classroom~~ 
- Classroom details section hidden in drawer

Backend 
- Expand to have multiple classrooms, with searchable dashboard
- Create tardy threshold for present based on time attendance status has changed
- ~~Export PNG of Seating Chart~~
  - Create form to (de)select items for PNG (Seating Chart, Class List, Check Boxes) 
- Export Excel of ~~present,~~ tardy ~~absent~~
- Grace period for tardy, back up manual override (that flags it as manual override) in case forgot to take attendance on time
- ~~Export attendance list (for testing)~~
- Enable (full) touch screen compatability
- Improve dynamic scaling on all objects


## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify

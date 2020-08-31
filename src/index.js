import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { Redirect, Route, BrowserRouter as Router, Switch } from "react-router-dom";
import HomePage from './components/HomePage'
import HelpPage from './components/HelpPage'

const serverURL = "http://localhost:3000"

const Website = () => (
    <Router>
        <Switch>
            <Route exact path="/">
                <HomePage/>
            </Route>
            <Route exact path="/help">
                <HelpPage/>
            </Route>
            <Route exact path="/game">
                <App/>
            </Route>
        </Switch>
    </Router>
)

ReactDOM.render(
    <React.Fragment>
        <Website />
    </React.Fragment>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

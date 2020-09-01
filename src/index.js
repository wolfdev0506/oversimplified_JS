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
            <Route exact path="/" component={HomePage}/>
            <Route exact path="/help" component={HelpPage}/>
            <Route exact path="/sandbox" component="lmao"/>
            <Route exact path="/game" component={App}/>
            <Route path="*">
                <Redirect to="/"/>
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

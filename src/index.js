import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import { Redirect, Route, BrowserRouter as Router, Switch } from "react-router-dom";
import HomePage from './components/HomePage'
import HelpPage from './components/HelpPage'
import SandboxPage from './components/SandboxPage';
import LobbyPage from './components/LobbyPage'
// import JoinPage from './components/JoinPage'

// const serverURL = "http://localhost:3000"
const serverURL = "oversimplified.herokuapp.com"

const Website = () => (
    <Router>
        <Switch>
            <Route exact path="/" component={HomePage}/>
            <Route exact path="/help" component={HelpPage}/>
            <Route exact path="/sandbox" component={SandboxPage}/>
            {/* <Route exact path="/join/:matchID/:player"> 
                <JoinPage serverURL={serverURL} />
            </Route> */}
            <Route exact path='/lobby'>
                <LobbyPage serverURL={serverURL}/>
            </Route>
            {/* <Route path="*">
                <Redirect to="/"/>
            </Route> */}
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

import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import { Redirect, Route, BrowserRouter as Router, Switch } from "react-router-dom";
import Pages from './components/Pages'
import Cookies from 'universal-cookie'

const serverURL = "localhost"
// const serverURL = "oversimplified.herokuapp.com"

class Website extends React.Component {
    constructor(props) {
        super(props)
        this.state = {cookiesAlertClosed: this.hasCookieAlertCookie()}
        this.cookies = new Cookies()
    }
    
    setCookieAlertCookie() {
        const cookies = new Cookies()
        cookies.set("saw-cookie-alert", true, {path: '/'})
        this.setState({cookiesAlertClosed: true})
    }

    hasCookieAlertCookie() {
        const cookies = new Cookies()
        return cookies.get("saw-cookie-alert") !== undefined
    }

    render() {
        return (
            <>
                <Router>
                    <Switch>
                        <Route exact path="/" component={Pages.HomePage}/>
                        <Route exact path="/help" component={Pages.HelpPage}/>
                        <Route exact path="/sandbox" component={Pages.SandboxPage}/>

                        <Route exact path="/match/:matchID" render={routeProps => <Pages.MatchPage match={routeProps} serverURL={serverURL} />}/>
                        <Route exact path="/match/:matchID&:serverURL" render={routeProps => <Pages.MatchPage match={routeProps} serverURL={routeProps.match.params.serverURL} indirect={true} />}/>
                        
                        <Route exact path="/create" render={routeProps => <Pages.CreatePage match={routeProps} serverURL={serverURL} />}/>
                        <Route exact path="/create&:serverURL" render={routeProps => <Pages.CreatePage match={routeProps} serverURL={routeProps.match.params.serverURL} indirect={true} />}/>
                        
                        <Route exact path='/lobby' render={routeProps => <Pages.LobbyPage match={routeProps} serverURL={serverURL}/>}/>
                        {/* <Route path="*">
                            <Redirect to="/"/>
                        </Route> */}
                    </Switch>
                </Router>

                <div className={"fixed col" + (this.state.cookiesAlertClosed? " hidden" : "")} id="cookieAlert">
                    <p>
                        Cookies and IP addresses are used to save some data and make your life easier.
                    </p>
                    <p>
                        I swear I'm not selling it to the Chinese or the Russians.
                    </p>
                    <div className="btn-container">
                        <button className="btn btn-primary" onClick={() => this.setCookieAlertCookie()}>
                        Aight, sounds good
                        </button>
                    </div>
                </div>
            </>

        )
    }
}

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

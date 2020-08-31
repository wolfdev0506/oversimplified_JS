import React from "react";
import HelpLink from './HelpLink'
import SandboxLink from './SandboxLink'
import Credits from './Credits'
import '../../css/shared.css'

const HomePage = (props) => (
  <div className="row flex-center">
    <div>
      <h1 className="title">Oversimplified</h1>
      <h2>A game of global domination ruled by alliances, trade, and deceit</h2>
      <HelpLink/>
      <SandboxLink/>
      <Credits/>
    </div>
  </div>
);

export default HomePage;
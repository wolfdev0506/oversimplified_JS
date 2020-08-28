import React from "react";
import HelpLink from './HelpLink'

const HomePage = (props) => (
  <div className="row flex-center title">
    <div>
      <h1>Oversimplified</h1>
      <h2>A game of global domination ruled by alliances, trade, and deceit</h2>
      <HelpLink/>
    </div>
  </div>
);

export default HomePage;
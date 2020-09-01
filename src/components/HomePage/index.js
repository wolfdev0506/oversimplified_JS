import React from "react"
import * as Buttons from '../Buttons/'
import '../../css/shared.css'

const HomePage = (props) => (
  <div className="row flex-center">
    <div>
      <h1 className="title">Oversimplified</h1>
      <h2>A game of global domination ruled by alliances, trade, and deceit</h2>

      <div className="row flex-center">
        <Buttons.HelpButton />
        <div className="col">
          <p>Learn the rules!</p>
        </div>
      </div>

      <div className="row flex-center">
        <Buttons.SandboxButton />
        <div className="col">
          <p>Experiment with the game!</p>
        </div>
      </div>

      <div className="row flex-center">
        <div className="col" style={{ textAlign: "center" }}>
          <p>
            Created by Max Gordon and Akiva Dienstfrey
          </p>
          <p>
            Explore the project on <a href="https://github.com/JohnnyWobble/oversimplified" target="_blank" rel="noopener noreferrer" style={{ "font-weight": "600" }}> Github</a>
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default HomePage;
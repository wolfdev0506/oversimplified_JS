import React from "react"
import * as Buttons from '../Buttons/'

export const HomePage = (props) => (
  <>
    <div className="row flex-center">
      <div>
        <h1 className="title">Oversimplified</h1>
        <h2>A game of imperialism ruled by alliances, trade, and warfare</h2>

        <div className="home-menu">
          <Buttons.HelpButton />
          <p>Learn the rules!</p>

          <Buttons.SandboxButton />
          <p>Experiment with the game!</p>

          <Buttons.LobbyButton />
          <p>Join an existing game!</p>
          
          <Buttons.GenerateMapButton />
          <p>Generate a new game map!</p>
        </div>
        <div className="row flex-center">
          <div className="col" style={{ textAlign: "center" }}>
            <p>
              Created by <a href="https://github.com/JohnnyWobble" target="_blank" rel="noopener noreferrer" className="bold">Max Gordon</a> in collaboration with <a href="https://github.com/AkivaDienstfrey" target="_blank" rel="noopener noreferrer" className="bold">Akiva Dienstfrey</a>
            </p>
            <p>
              Explore the project on <a href="https://github.com/JohnnyWobble/oversimplified" target="_blank" rel="noopener noreferrer" className="bold">Github</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </>
);
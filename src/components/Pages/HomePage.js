import React from "react"
import * as Buttons from '../Buttons/'

export const HomePage = (props) => (
  <>
    <div className="row flex-center">
      <div>
        <h1 className="title">Oversimplified</h1>
        <h2>A game of imperialism ruled by alliances, trade, and warfare</h2>

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
          <Buttons.LobbyButton />
          <div className="col">
            <p>Join an existing game!</p>
          </div>
        </div>

        <div className="row flex-center">
          <Buttons.GenerateMapButton />
          <div className="col">
            <p>Generate a new game map!</p>
          </div>
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
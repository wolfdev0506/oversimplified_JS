import { Link } from "react-router-dom";
import React from "react";

const SandboxLink = () => (
  <div className="row flex-center">
    <div className="col btn-container">
      <Link to="/sandbox" className="btn btn-primary">
        Sandbox mode
      </Link>
    </div>
    <div className="col">
      <p>Experiment with the game!</p>
    </div>
  </div>
);

export default SandboxLink;
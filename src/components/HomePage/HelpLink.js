import { Link } from "react-router-dom";
import React from "react";

const HelpLink = () => (
  <div className="row flex-center">
    <div className="col btn-container">
      <Link to="/help" className="btn btn-primary">
        How to play
      </Link>
    </div>
    <div className="col">
      <p>Learn the rules!</p>
    </div>
  </div>
);

export default HelpLink;
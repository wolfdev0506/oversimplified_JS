import { Link } from "react-router-dom";
import React from "react";

const HelpLink = () => (
  <div className="row flex-center">
    <div className="col">
      <Link to="/help">
        <button className="btn">How to play</button>
      </Link>
    </div>
    <div className="col">
      <p>Learn the rules!</p>
    </div>
  </div>
);

export default HelpLink;
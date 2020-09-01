import { Link } from "react-router-dom";
import React from "react";

export const SandboxButton = () => (
    <div className="col btn-container">
        <Link to="/sandbox" className="btn btn-primary">
            Sandbox mode
        </Link>
    </div>
);

export const HelpButton = () => (
    <div className="col btn-container">
      <Link to="/help" className="btn btn-primary">
        How to play
      </Link>
    </div>
);
import React from "react";

const repository = "https://github.com/JohnnyWobble/oversimplified";

const Credits = () => (
  <div className="row flex-center">
    <div className="col" style={{ textAlign: "center" }}>
      <p>
        Created by Max Gordon and Akiva Dienstfrey
      </p>
      <p>
        Explore the project on <a href={repository} target="_blank" rel="noopener noreferrer" style={{"font-weight": "600"}}> Github</a> 
      </p>
    </div>
  </div>
);

export default Credits;
import * as React from "react";
import { render } from "react-dom";

import Categorizer from "./Categorizer";

function App() {
  return (
    <div className="App pure-g">
      <div className="pure-u-1-1">
        <Categorizer />
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
render(<App />, rootElement);

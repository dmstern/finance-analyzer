import * as React from "react";
import { render } from "react-dom";

import Categorizer from "./Categorizer";

function App() {
  return (
    <div className="App">
      <Categorizer />
    </div>
  );
}

const rootElement = document.getElementById("root");
render(<App />, rootElement);

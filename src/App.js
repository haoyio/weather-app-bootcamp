import React from "react";

import "./App.css";
import Weather from "./Components/Weather";


class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Weather />
        </header>
      </div>
    );
  }
}

export default App;

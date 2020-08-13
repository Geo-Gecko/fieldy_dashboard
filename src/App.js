import React from 'react';
import MapView from './components/MapView';
import { BrowserRouter, Switch } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <PrivateRoute exact path="/">
            <MapView />
          </PrivateRoute>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;

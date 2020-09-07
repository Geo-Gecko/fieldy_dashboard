import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Switch } from 'react-router-dom';

import store from './store'
import MapView from './components/MapView';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <BrowserRouter>
          <Switch>
            <PrivateRoute exact path="/">
              <MapView />
            </PrivateRoute>
          </Switch>
        </BrowserRouter>
      </div>
    </Provider>
  );
}

export default App;

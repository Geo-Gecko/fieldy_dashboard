import React from 'react';
import { Provider } from 'react-redux'

import store from './store'
import MapView from './components/MapView';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <MapView/>
      </div>
    </Provider>
  );
}

export default App;

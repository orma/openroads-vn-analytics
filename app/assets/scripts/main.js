'use strict';
/* global L */
require('mapbox.js');
import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { syncHistory } from 'react-router-redux';
import { createLogger } from 'redux-logger';
import reducer from './reducers/reducer';
import config from './config';

L.mapbox.accessToken = config.mbToken;

import UhOh from './views/uhoh';
import App from './views/app';
import Home from './views/home';
import Editor from './views/editor';
import Explore from './views/explore';
import Analytics from './views/analytics';
import AnalyticsIndex from './views/analytics-index';
import AnalyticsAA from './views/analytics-admin-area';

const logger = createLogger({
  level: 'info',
  collapsed: true,
  predicate: (getState, action) => {
    return (config.environment !== 'production');
  }
});

// Sync dispatched route actions to the syncHistory
const reduxRouterMiddleware = syncHistory(hashHistory);
const finalCreateStore = compose(
  // Middleware you want to use in development:
  applyMiddleware(reduxRouterMiddleware, logger, thunkMiddleware)
  // Required! Enable Redux DevTools with the monitors you chose.
  // DevTools.instrument()
)(createStore);

const store = finalCreateStore(reducer);

// Required for replaying actions from devtools to work
// reduxRouterMiddleware.listenForReplays(store);

render((
  <Provider store={store}>
    <Router history={hashHistory}>
      <Route path='/' component={App}>
        <Route path='editor' component={Editor} />
        <Route path='editor/*' component={Editor} />
        <Route path='explore' component={Explore} />
        <Route path='analytics' component={Analytics}>
          <Route path='main' component={AnalyticsIndex} />
          <Route path=':aaId' component={AnalyticsAA} />
        </Route>
        <IndexRoute component={Home}/>
      </Route>
      <Route path='*' component={UhOh}/>
    </Router>
  </Provider>
), document.querySelector('.site-canvas'));

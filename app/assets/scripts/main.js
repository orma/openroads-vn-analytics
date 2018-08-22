'use strict';
import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, Redirect, IndexRoute, hashHistory } from 'react-router';
import store from './redux/store';

import UhOh from './views/uhoh';
import App from './views/app';
import Home from './views/home';
import Editor from './views/editor';
import Tasks from './views/tasks';
import Explore from './views/explore';
import Assets from './views/assets';
import AssetsIndex from './views/assets-index';
import AssetsAA from './views/assets-admin-area';
import AssetsDetail from './views/assets-detail';
import Upload from './views/upload';
import Faq from './views/faq';
import Job  from './views/job';


const validateLanguage = ({ params: { lang } }, replace) => {
  if (lang !== 'en' && lang !== 'vi') {
    replace('/en/404');
  }
};

render((
  <Provider store={store}>
    <Router history={hashHistory}>
      <Redirect from='/' to='/en' />
      <Route path='/:lang' component={App} onEnter={validateLanguage}>
        <Route path='tasks' component={Tasks} pageClass='tasks' />
        <Route path='upload' component={Upload} pageClass='upload' />
        <Route path='editor' component={Editor} pageClass='editor' />
        <Route path='editor/*' component={Editor} pageClass='editor' />
        <Route path='explore' component={Explore} pageClass='explore' />
        <Route path='faq' component={Faq} pageClass='faq' />
        <Route path='jobs/:id' component={Job} pageClass='job' />
        <Route path='assets' component={Assets}>
          <IndexRoute component={AssetsIndex} pageClass='assets' />
          <Route path='road/:vpromm' component={AssetsDetail} pageClass='assets-inner-canvas' />
          <Route path=':aaId' component={AssetsAA} pageClass='assets-inner-canvas' />
          <Route path=':aaId/:aaIdSub' component={AssetsAA} pageClass='assets-inner-canvas' />
        </Route>
        <IndexRoute component={Home} pageClass='page--landing' />
        <Route path='*' component={UhOh}/>
      </Route>
    </Router>
  </Provider>
), document.querySelector('.site-canvas'));

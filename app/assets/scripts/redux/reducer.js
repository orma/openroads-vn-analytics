import { combineReducers } from 'redux';
import { routeReducer } from 'react-router-redux';
import { localReducer } from 'redux-fractal';
import _ from 'lodash';
import * as actions from '../actions/action-types';
import waytasks from './modules/tasks';
import jobs from './modules/jobs';
import osmChange from './modules/osm';
import roads from './modules/roads';
import roadCount from './modules/roadCount';
import map from './modules/map';


const admins = function (state = {units: [], fetching: false, fetched: false}, action) {
  switch (action.type) {
    case actions.REQUEST_ADMINS:
      console.log('REQUEST_ADMINS');
      state = _.cloneDeep(state);
      state.fetching = true;
      break;
    case actions.RECEIVE_ADMINS:
      console.log('RECEIVE_ADMINS');
      state = _.cloneDeep(state);
      state.units = action.json;
      state.fetching = false;
      state.fetched = true;
      break;
    case actions.CLEAR_ADMINS:
      state = _.cloneDeep(state);
      state.units = [];
      break;
  }
  return state;
};


const search = function (state = {results: [], fetching: false, fetched: false, query: '', searching: false}, action) {
  switch (action.type) {
    case actions.REQUEST_SEARCH_RESULTS:
      console.log('REQUEST_SEARCH_RESULTS');
      state = _.cloneDeep(state);
      state.fetching = true;
      state.query = action.query;
      state.searching = true;
      break;
    case actions.RECEIVE_SEARCH_RESULTS:
      console.log('RECEIVE_SEARCH_RESULTS');
      state = _.cloneDeep(state);
      state.results = action.json;
      state.fetching = false;
      break;
    case actions.CLEAN_SEARCH_RESULTS:
      console.log('CLEAN_SEARCH_RESULTS');
      state = _.cloneDeep(state);
      state.results = [];
      state.fetching = false;
      state.fetched = true;
      state.query = '';
      state.searching = false;
      break;
  }
  return state;
};


const defaultFieldVProMMsids = {
  fetching: false,
  fetched: false,
  ids: []
};

const fieldVProMMsids = function (state = defaultFieldVProMMsids, action) {
  switch (action.type) {
    case actions.REQUEST_VPROMMS_FIELD_IDS:
      state = _.cloneDeep(state);
      state.fetching = true;
      break;
    case actions.RECEIVE_VPROMMS_FIELD_IDS:
      state = _.cloneDeep(state);
      state.fetching = false;
      state.fetched = true;
      state.ids = action.json;
      break;
    case actions.REMOVE_VPROMMS_FIELD_IDS:
      return defaultFieldVProMMsids;
  }
  return state;
};

const exploreMapDefaultState = {
  layer: 'iri',
  showNoVpromms: true
};
const exploreMap = function (state = exploreMapDefaultState, action) {
  const newState = _.cloneDeep(state);
  switch (action.type) {
    case actions.SELECT_EXPLORE_MAP_LAYER:
      newState.layer = action.layer;
      break;
    case actions.EXPLORE_MAP_SHOW_NO_VPROMMS:
      newState.showNoVpromms = action.bool;
      break;
  }
  return newState;
};


const defaultSearchType = {
  searchType: 'Admin'
};

const setSearchType = function (state = defaultSearchType, action) {
  switch (action.type) {
    case actions.SET_SEARCH_TYPE:
      state = _.cloneDeep(state);
      state.searchType = action.text;
      break;
  }
  return state;
};

const setFilteredVProMMs = function (state = [], action) {
  switch (action.type) {
    case actions.SET_FILTERED_VPROMMS:
      state = _.cloneDeep(state);
      state = action.array;
      break;
  }
  return state;
};

const defaultProvinces = {
  fetching: false,
  fetched: false,
  data: {}
};

const provinces = function (state = defaultProvinces, action) {
  switch (action.type) {
    case actions.REQUEST_PROVINCES:
      state = _.cloneDeep(state);
      state.fetching = true;
      break;
    case actions.RECEIVE_PROVINCES:
      state = _.cloneDeep(state);
      state.fetching = false;
      state.fetched = true;
      state.data = action.json;
      break;
  }
  return state;
};


const defaultAdminInfo = {
  fetched: false,
  fetching: false,
  data: {}
};

const adminInfo = function (state = defaultAdminInfo, action) {
  switch (action.type) {
    case actions.REQUEST_ADMIN_INFO:
      state = _.cloneDeep(state);
      state.fetching = true;
      break;
    case actions.RECEIVE_ADMIN_INFO:
      state = _.cloneDeep(state);
      state.fetching = false;
      state.fetched = true;
      state.data = action.json;
      break;
    case actions.REMOVE_ADMIN_INFO:
      state = defaultAdminInfo;
      break;
  }
  return state;
};


export default combineReducers({
  routing: routeReducer,
  local: localReducer,
  admins,
  adminInfo,
  roads,
  jobs,
  roadCount,
  map,
  waytasks,
  osmChange,
  search,
  exploreMap,
  provinces,
  setSearchType,
  setFilteredVProMMs,
  fieldVProMMsids // TODO - delete
});

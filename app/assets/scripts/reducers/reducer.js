import _ from 'lodash';
import { combineReducers } from 'redux';
import { routeReducer } from 'react-router-redux';

import * as actions from '../actions/action-types';
import { VPROMMS_IDS, ADMIN_MAP } from '../constants';

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

const adminBboxDefaultState = {
  fetching: false,
  fetched: false,
  bbox: []
};
const adminBbox = function (state = adminBboxDefaultState, action) {
  switch (action.type) {
    case actions.REQUEST_ADMIN_BBOX:
      console.log('REQUEST_ADMIN_BBOX');
      state = _.cloneDeep(state);
      state.fetching = true;
      state.fetched = false;
      break;
    case actions.RECEIVE_ADMIN_BBOX:
      console.log('RECEIVE_ADMIN_BBOX');
      state = _.cloneDeep(state);
      state.bbox = action.json.bbox;
      state.fetching = false;
      state.fetched = true;
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

const stats = function (state = {fetching: false, fetched: false, data: null}, action) {
  switch (action.type) {
    case actions.REQUEST_ADMIN_STATS:
      console.log('REQUEST_ADMIN_STATS');
      state = _.cloneDeep(state);
      state.error = null;
      state.fetching = true;
      break;
    case actions.RECEIVE_ADMIN_STATS:
      console.log('RECEIVE_ADMIN_STATS');
      state = _.cloneDeep(state);
      if (action.error) {
        state.error = action.error;
      } else {
        state = action.json;
      }
      state.fetching = false;
      state.fetched = true;
      break;
  }
  return state;
};

const waytasksDefaultState = {
  fetching: false,
  fetched: false,
  data: null,
  id: null
};
const waytasks = function (state = waytasksDefaultState, action) {
  switch (action.type) {
    case actions.REQUEST_WAY_TASK:
      console.log('REQUEST_WAY_TASK');
      state = _.cloneDeep(state);
      state.error = null;
      state.fetching = true;
      break;
    case actions.RECEIVE_WAY_TASK:
      console.log('RECEIVE_WAY_TASK');
      state = _.cloneDeep(state);
      if (action.error) {
        state.error = action.error;
      } else {
        state.data = action.json.data;
        state.id = action.json.id;
      }
      state.fetching = false;
      state.fetched = true;
      break;
    case actions.RELOAD_WAY_TASK:
      console.log('RELOAD_WAY_TASK');
      state = _.cloneDeep(state);
      state.id = null;
      state.data = null;
      break;
  }
  return state;
};

const osmChangeState = {
  fetching: false,
  fetched: false,
  taskId: null,
  error: null
};
const osmChange = function (state = osmChangeState, action) {
  switch (action.type) {
    case actions.REQUEST_OSM_CHANGE:
      console.log('REQUEST_OSM_CHANGE');
      state = _.cloneDeep(state);
      state.error = null;
      state.fetching = true;
      break;
    case actions.COMPLETE_OSM_CHANGE:
      console.log('COMPLETE_OSM_CHANGE');
      state = _.cloneDeep(state);
      if (action.error) {
        state.error = action.error;
      } else {
        state.taskId = action.taskId;
      }
      state.fetching = false;
      state.fetched = true;
      break;
    case actions.RELOAD_WAY_TASK:
      console.log('RELOAD_WAY_TASK');
      state = _.cloneDeep(state);
      state.fetched = false;
      state.taskId = false;
      break;
  }
  return state;
};

const projecttasksDefaultState = {
  fetching: false,
  fetched: false,
  data: {
    projecttasks: {
      meta: {
        page: null,
        limit: null,
        total: null
      },
      results: []
    }
  }
};
const projecttasks = function (state = projecttasksDefaultState, action) {
  switch (action.type) {
    case actions.REQUEST_PROJECT_TASKS:
      console.log('REQUEST_PROJECT_TASKS');
      state = _.cloneDeep(state);
      state.error = null;
      state.fetching = true;
      break;
    case actions.RECEIVE_PROJECT_TASKS:
      console.log('RECEIVE_PROJECT_TASKS');
      state = _.cloneDeep(state);
      if (action.error) {
        state.error = action.error;
      } else {
        state.data = action.json;
      }
      state.fetching = false;
      state.fetched = true;
      break;
  }
  return state;
};

const projectsDefaultState = {
  fetching: false,
  fetched: false,
  data: {
    projects: {
      meta: {
        page: null,
        limit: null,
        total: null
      },
      results: []
    }
  }
};
const projects = function (state = projectsDefaultState, action) {
  switch (action.type) {
    case actions.REQUEST_PROJECTS:
      console.log('REQUEST_PROJECTS');
      state = _.cloneDeep(state);
      state.error = null;
      state.fetching = true;
      break;
    case actions.RECEIVE_PROJECTS:
      console.log('RECEIVE_PROJECTS');
      state = _.cloneDeep(state);
      if (action.error) {
        state.error = action.error;
      } else {
        state.data = action.json;
      }
      state.fetching = false;
      state.fetched = true;
      break;
  }
  return state;
};

const projectsMetaDefaultState = {
  fetching: false,
  fetched: false,
  data: {
    type: []
  }
};
const projectsMeta = function (state = projectsMetaDefaultState, action) {
  switch (action.type) {
    case actions.REQUEST_PROJECTS_META:
      console.log('REQUEST_PROJECTS_META');
      state = _.cloneDeep(state);
      state.error = null;
      state.fetching = true;
      break;
    case actions.RECEIVE_PROJECTS_META:
      console.log('RECEIVE_PROJECTS_META');
      state = _.cloneDeep(state);
      if (action.error) {
        state.error = action.error;
      } else {
        state.data = action.json;
      }
      state.fetching = false;
      state.fetched = true;
      break;
  }
  return state;
};

const roadNetworkStatusDefaultState = {
  fetching: false,
  fetched: false,
  data: {
    dataAvailable: null
  }
};
const roadNetworkStatus = function (state = roadNetworkStatusDefaultState, action) {
  switch (action.type) {
    case actions.REQUEST_ROAD_NETWORK_STATUS:
      console.log('REQUEST_ROAD_NETWORK_STATUS');
      state = _.cloneDeep(state);
      state.error = null;
      state.fetching = true;
      break;
    case actions.RECEIVE_ROAD_NETWORK_STATUS:
      console.log('RECEIVE_ROAD_NETWORK_STATUS');
      state = _.cloneDeep(state);
      if (action.error) {
        state.error = action.error;
      } else {
        state.data = action.json;
      }
      state.fetching = false;
      state.fetched = true;
      break;
  }
  return state;
};

_.forEach(VPROMMS_IDS, (province) => {
  province.vpromms = province.vpromms.map((id) => {
    return {
      id,
      inTheDatabase: false,
      RoadLab: false,
      RouteShootUrl: '',
      RouteShootPro: false
    };
  });
});

const VProMMSidsDefaultState = {
  fetching: false,
  fetched: false,
  data: []
};

const VProMMSids = function (state = VProMMSidsDefaultState, action) {
  switch (action.type) {
    case actions.REQUEST_VPROMMS_IDS:
      state = _.cloneDeep(state);
      state.error = null;
      state.fetching = true;
      break;
    case actions.RECEIVE_VPROMMS_IDS:
      state = _.cloneDeep(state);
      if (action.error) {
        state.error = action.error;
      } else {
        state.data = action.json;
      }
      state.fetching = false;
      state.fetched = true;
      break;
  }
  return state;
};

const VProMMSidsAnalyticsDefaultState = {
  fetching: false,
  fetched: false,
  data: VPROMMS_IDS
};

const VProMMSidsAnalytics = function (state = VProMMSidsAnalyticsDefaultState, action) {
  switch (action.type) {
    case actions.REQUEST_VPROMMS_IDS:
      state = _.cloneDeep(state);
      state.error = null;
      state.fetching = true;
      break;
    case actions.RECEIVE_VPROMMS_IDS:
      state = _.cloneDeep(state);
      if (action.error) {
        state.error = action.error;
      } else {
        _.forEach(state.data, (province) => {
          const keys = Object.keys(action.json);
          province.vpromms = province.vpromms.map((v) => {
            if (keys.includes(v.id)) {
              return {
                id: v.id,
                inTheDatabase: keys.includes(v.id),
                RoadLabPro: Boolean(action.json[v.id]['iri_mean']),
                RouteShootUrl: action.json[v.id]['rs_url'] ? action.json[v.id]['rs_url'] : '',
                RouteShoot: Boolean(action.json[v.id]['rs_url'])
              };
            }
            return {
              id: v.id,
              inTheDatabase: keys.includes(v.id),
              RoadLabPro: false,
              RouteShootUrl: '',
              RouteShoot: false
            };
          });
        });
      }
      state.fetching = false;
      state.fetched = true;
      break;
  }
  return state;
};

const defaultVProMMSidSourceGeoJSON = {
  fetching: false,
  fetched: false,
  geoJSON: [],
  vprommId: '',
  provinceName: ''
};

const VProMMSidSourceGeoJSON = function (state = defaultVProMMSidSourceGeoJSON, action) {
  switch (action.type) {
    case actions.REQUEST_VPROMMS_SOURCE_GEOJSON:
      console.log('REQUEST_VPROMMS_SOURCE_GEOJSON');
      state = _.cloneDeep(state);
      state.fetching = true;
      break;
    case actions.RECIEVE_VPROMMS_SOURCE_GEOJSON:
      console.log('RECIEVE_VPROMMS_SOURCE_GEOJSON');
      state = _.cloneDeep(state);
      state.geoJSON = action.json;
      state.vprommId = action.vprommId;
      state.provinceName = action.provinceName;
      state.fetching = false;
      state.fetched = true;
      break;
    case actions.REMOVE_VPROMMS_SOURCE_GEOJSON:
      console.log('REMOVE_SOURCE_GEOJSON');
      return defaultVProMMSidSourceGeoJSON;
  }
  return state;
};

const VProMMsWayBboxDefaultState = {
  fetching: false,
  fetched: false,
  bbox: []
};

const VProMMsWayBbox = function (state = VProMMsWayBboxDefaultState, action) {
  switch (action.type) {
    case actions.REQUEST_VPROMMS_IDS:
      state = _.cloneDeep(state);
      state.error = null;
      state.fetching = true;
      break;
    case actions.RECIEVE_VPROMMS_BBOX:
      state = _.cloneDeep(state);
      state.fetching = false;
      state.fetched = true;
      state.bbox = action.json;
  }
  return state;
};

const defaultVProMMsProperties = {
  fetching: false,
  fetched: false,
  properties: {}
};

const VProMMsidProperties = function (state = defaultVProMMsProperties, action) {
  switch (action.type) {
    case actions.REQUEST_VPROMMS_PROPERTIES:
      state = _.cloneDeep(state);
      state.fetching = true;
      break;
    case actions.RECEIVE_VPROMMS_PROPERTIES:
      state = _.cloneDeep(state);
      state.fetching = false;
      state.fetched = true;
      state.properties = action.json;
      break;
    case actions.REMOVE_VPROMMS_PROPERTIES:
      state = defaultVProMMsProperties;
      break;
  }
  return state;
};

const defaultVProMMsAdminProperties = {
  fetching: false,
  fetched: false,
  json: []
};

const VProMMsAdminProperties = function (state = defaultVProMMsAdminProperties, action) {
  switch (action.type) {
    case actions.REQUEST_ADMIN_VPROMMS_PROPERTIES:
      state = _.cloneDeep(state);
      state.fetching = true;
      break;
    case actions.RECEIVE_ADMIN_VPROMMS_PROPERTIES:
      state = _.cloneDeep(state);
      state.fetching = false;
      state.fetched = true;
      state.data = action.json;
      break;
    case actions.REMOVE_ADMIN_VPROMMS_PROPERTIES:
      state = defaultVProMMsAdminProperties;
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
  }
  return state;
};

const exploreMapDefaultState = {
  layer: 'iri',
  showNoVpromms: false
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

const globZoomDefault = {
  y: 20.029232336299856,
  x: 105.73,
  z: 6
};

const globZoom = function (state = globZoomDefault, action) {
  switch (action.type) {
    case actions.SET_GLOBAL_ZOOM:
      state = _.cloneDeep(state);
      state = action.json;
      break;
  }
  return state;
};

const defaultAdmin = { id: '', name: '' };

const admin = function (state = defaultAdmin, action) {
  switch (action.type) {
    case actions.SET_ADMIN:
      state = _.cloneDeep(state);
      state.id = action.id;
      state.name = action.name;
      break;
  }
  return state;
};

const searchDisplay = function (state = {show: false}, action) {
  switch (action.type) {
    case actions.DISPLAY_SEARCH:
      state = _.cloneDeep(state);
      state.show = action.bool;
      break;
  }
  return state;
};

const searchResultsDisplay = function (state = {show: false}, action) {
  switch (action.type) {
    case actions.DISPLAY_SEARCH_RESULTS:
      state = _.cloneDeep(state);
      state.show = action.bool;
      break;
  }
  return state;
};

const defaultSearchType = {
  searchType: ''
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

const defaultCrossWalk = {
  province: {},
  district: {},
  set: false
};

const crosswalk = function (state = defaultCrossWalk, action) {
  switch (action.type) {
    case actions.SET_CROSSWALK:
      state = _.cloneDeep(state);
      state.province = _.pickBy(ADMIN_MAP.province, (province) => { return !/^\s*$/.test(province); });
      state.district = ADMIN_MAP.district;
      state.set = true;
      break;
  }
  return state;
};

const defaultVProMMsIdCount = {
  fetching: false,
  fetched: false,
  counts: []
};

const roadIdCount = function (state = defaultVProMMsIdCount, action) {
  switch (action.type) {
    case actions.REQUEST_VPROMMS_IDS_COUNT:
      state = _.cloneDeep(state);
      state.fetching = true;
      break;
    case actions.RECEIVE_VPROMMS_IDS_COUNT:
      state = _.cloneDeep(state);
      state.fetching = false;
      state.fetched = true;
      state.counts = action.json;
      break;
  }
  return state;
};

const defaultFieldVProMMsIdsCount = {
  fetching: false,
  fetched: false,
  counts: []
};

const fieldIdCount = function (state = defaultFieldVProMMsIdsCount, action) {
  switch (action.type) {
    case actions.REQUEST_VPROMMS_FIELD_IDS_COUNT:
      state = _.cloneDeep(state);
      state.fetching = true;
      break;
    case actions.RECEIVE_VPROMMS_FIELD_IDS_COUNT:
      state = _.cloneDeep(state);
      state.fetched = true;
      state.fetching = false;
      state.counts = action.json;
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

const defaultAdminLevel = { level: '' };

const adminLevel = function (state = defaultAdminLevel, action) {
  switch (action.type) {
    case actions.SET_ADMIN_LEVEL:
      state = _.cloneDeep(state);
      state.level = action.text;
  }
  return state;
};

const defaultAdminRoads = {
  fetching: false,
  fetched: false,
  ids: []
};

const adminRoads = function (state = defaultAdminRoads, action) {
  switch (action.type) {
    case actions.REQUEST_ADMIN_ROADS:
      state = _.cloneDeep(state);
      state.fetching = true;
      break;
    case actions.RECEIVE_ADMIN_ROADS:
      state = _.cloneDeep(state);
      state.fetched = true;
      state.fetching = false;
      state.ids = action.json;
      break;
  }
  return state;
};

const defaultFieldRoads = {
  fetching: false,
  fetched: false,
  ids: []
};

const fieldRoads = function (state = defaultFieldRoads, action) {
  switch (action.type) {
    case actions.REQUEST_FIELD_ROADS:
      state = _.cloneDeep(state);
      state.fetching = true;
      break;
    case actions.RECEIVE_FIELD_ROADS:
      state = _.cloneDeep(state);
      state.fetching = false;
      state.fetched = true;
      state.ids = action.json;
      break;
  }
  return state;
};

const defaultPagination = {currentPage: 0, currentIndex: 0, limit: 0, pages: 0};

const pagination = function (state = defaultPagination, action) {
  switch (action.type) {
    case actions.SET_PAGINATION:
      return action.json;
    case actions.UPDATE_PAGINATION:
      state = _.cloneDeep(state);
      state.currentIndex = action.json.currentIndex;
      state.currentPage = action.json.currentPage;
  }
  return state;
};

export default combineReducers({
  admin,
  admins,
  adminInfo,
  adminBbox,
  adminRoads,
  fieldIdCount,
  waytasks,
  osmChange,
  crosswalk,
  search,
  stats,
  adminLevel,
  exploreMap,
  globZoom,
  projecttasks,
  projects,
  projectsMeta,
  provinces,
  roadNetworkStatus,
  roadIdCount,
  routing: routeReducer,
  searchDisplay,
  searchResultsDisplay,
  setSearchType,
  setFilteredVProMMs,
  VProMMSids,
  VProMMSidsAnalytics,
  VProMMsWayBbox,
  VProMMsidProperties,
  VProMMsAdminProperties,
  VProMMSidSourceGeoJSON,
  fieldRoads,
  fieldVProMMsids,
  pagination
});

import fetch from 'isomorphic-fetch';
import _ from 'lodash';
import * as actions from './action-types';
import config from '../config';

// ////////////////////////////////////////////////////////////////
//                       ADMIN SUBREGIONS                        //
// ////////////////////////////////////////////////////////////////

function requestAdmins () {
  return {
    type: actions.REQUEST_ADMINS
  };
}

function receiveAdmins (json) {
  return {
    type: actions.RECEIVE_ADMINS,
    json: json,
    receivedAt: Date.now()
  };
}

export function fetchAdmins (id = null) {
  return function (dispatch) {
    dispatch(requestAdmins());

    // The function called by the thunk middleware can return a value,
    // that is passed on as the return value of the dispatch method.

    // In this case, we return a promise to wait for.
    // This is not required by thunk middleware, but it is convenient for us.
    let url = `${config.api}/admin/units?name=${id}&limit=10`;
    console.time('fetch subregions');
    return fetch(url)
      .then(response => response.json())
      .then(json => {
        console.timeEnd('fetch subregions');
        dispatch(receiveAdmins(json));
      });
      // catch any error in the network call.
  };
}

export function clearAdmins () {
  return {
    type: actions.CLEAR_ADMINS
  };
}

function requestAdminInfo () {
  return {
    type: actions.REQUEST_ADMIN_INFO
  };
}

function receiveAdminInfo (json) {
  return {
    type: actions.RECEIVE_ADMIN_INFO,
    json: json
  };
}

export function fetchAdminInfo (id) {
  return function (dispatch) {
    dispatch(requestAdminInfo());
    const url = `${config.api}/admin/${id}/info`;
    return fetch(url)
    .then(response => response.json())
    .then(json => {
      if (json.statusCode >= 400) {
        throw new Error('Bad Request');
      }
      dispatch(receiveAdminInfo(json));
    });
  };
}

export function removeAdminInfo () {
  return {
    type: actions.REMOVE_ADMIN_INFO
  };
}

// ////////////////////////////////////////////////////////////////
//                        SEARCH RESULTS                         //
// ////////////////////////////////////////////////////////////////

function requestSearchResults (query) {
  return {
    type: actions.REQUEST_SEARCH_RESULTS,
    query
  };
}

function receiveSearchResults (json) {
  return {
    type: actions.RECEIVE_SEARCH_RESULTS,
    json: json,
    receivedAt: Date.now()
  };
}

export function cleanSearchResults () {
  return {
    type: actions.CLEAN_SEARCH_RESULTS
  };
}

export function fetchSearchResults (searchQuery) {
  return function (dispatch) {
    dispatch(requestSearchResults(searchQuery));

    console.time('fetch search results');
    return fetch(`${config.api}/admin/search/${searchQuery}`)
      .then(response => response.json())
      .then(json => {
        console.timeEnd('fetch search results');
        // setTimeout(() => dispatch(receiveSearchResults(json)), 2000);
        dispatch(receiveSearchResults(json));
      });
      // catch any error in the network call.
  };
}

// ////////////////////////////////////////////////////////////////
//                         ADMIN STATS                           //
// ////////////////////////////////////////////////////////////////

function requestAdminStats () {
  return {
    type: actions.REQUEST_ADMIN_STATS
  };
}

function receiveAdminStats (json, error = null) {
  return {
    type: actions.RECEIVE_ADMIN_STATS,
    json: json,
    error,
    receivedAt: Date.now()
  };
}

export function fetchAdminStats (id = null) {
  return function (dispatch) {
    dispatch(requestAdminStats());
    // return dispatch(receiveAdminStats(mock));

    let url = id === null ? `${config.api}/admin/0/stats` : `${config.api}/admin/${id}/stats`;
    return fetch(url)
      .then(response => {
        if (response.status >= 400) {
          throw new Error('Bad response');
        }
        return response.json();
      })
      .then(json => {
        dispatch(receiveAdminStats(json));
      }, e => {
        console.log('e', e);
        return dispatch(receiveAdminStats(null, 'Data not available'));
      });
  };
}

// ////////////////////////////////////////////////////////////////
//                          WAYTASKS                             //
// ////////////////////////////////////////////////////////////////

function requestWayTask () {
  return {
    type: actions.REQUEST_WAY_TASK
  };
}

function reloadWayTask () {
  return {
    type: actions.RELOAD_WAY_TASK
  };
}

function receiveWayTask (json, error = null) {
  return {
    type: actions.RECEIVE_WAY_TASK,
    json: json,
    error,
    receivedAt: Date.now()
  };
}

export function fetchNextWayTask (skippedTasks) {
  return function (dispatch) {
    dispatch(requestWayTask());

    let url = `${config.api}/tasks/next`;
    if (Array.isArray(skippedTasks) && skippedTasks.length) {
      url += `?skip=${skippedTasks.join(',')}`;
    }
    return fetch(url)
      .then(response => {
        if (response.status === 404) {
          throw new Error('No tasks remaining');
        } else if (response.status >= 400) {
          throw new Error('Connection error');
        }
        return response.json();
      })
      .then(json => {
        json.data.features.forEach(feature => {
          feature.properties._id = feature.meta.id;
        });
        return dispatch(receiveWayTask(json));
      }, e => {
        console.log('e', e);
        return dispatch(receiveWayTask(null, e.message));
      });
  };
}

export function reloadCurrentTask (taskId) {
  return function (dispatch) {
    dispatch(reloadWayTask());
    dispatch(requestWayTask());
    let url = `${config.api}/tasks/${taskId}`;
    return fetch(url)
      .then(response => {
        if (response.status >= 400) {
          throw new Error('Bad response');
        }
        return response.json();
      })
      .then(json => {
        json.data.features.forEach(feature => {
          feature.properties._id = feature.meta.id;
        });
        return dispatch(receiveWayTask(json));
      }, e => {
        console.log('e', e);
        return dispatch(receiveWayTask(null, 'Data not available'));
      });
  };
}

// ////////////////////////////////////////////////////////////////
//                        osm changesets                         //
// ////////////////////////////////////////////////////////////////

export function markTaskAsDone (taskIds) {
  let ids = Array.isArray(taskIds) ? taskIds : [taskIds];
  return function (dispatch) {
    putPendingTask({way_ids: ids});
  };
}

function putPendingTask (ids) {
  let url = `${config.api}/tasks/pending`;
  return fetch(url, {
    method: 'PUT',
    body: objectToBlob(ids)
  }).then(response => {
    if (response.status >= 400) {
      throw new Error('Could not update task status');
    }
    return response;
  });
}

function requestOsmChange () {
  return {
    type: actions.REQUEST_OSM_CHANGE
  };
}

function completeOsmChange (taskId, error = null) {
  return {
    type: actions.COMPLETE_OSM_CHANGE,
    taskId,
    error,
    receivedAt: Date.now()
  };
}

export function queryOsm (taskId, payload) {
  return function (dispatch) {
    dispatch(requestOsmChange());
    createChangeset(dispatch, upload);

    function upload (changesetId) {
      let url = `${config.api}/changeset/${changesetId}/upload`;
      return fetch(url, {
        method: 'POST',
        body: objectToBlob({ osmChange: payload })
      })
      .then(() => {
        return dispatch(completeOsmChange(taskId));
      });
    }
  };
}

function createChangeset (dispatch, cb) {
  const changesetUrl = `${config.api}/changeset/create`;
  const details = {
    uid: 555555,
    user: 'Openroads Tasks'
  };
  return fetch(changesetUrl, {
    method: 'PUT',
    body: objectToBlob(details)
  }).then(response => {
    if (response.status >= 400) {
      throw new Error('Bad response');
    }
    return response.text();
  }).then(cb, e => {
    return dispatch(completeOsmChange(null, e));
  });
}

function objectToBlob (obj) {
  return new Blob([JSON.stringify(obj, null, 2)], {type: 'application/json'});
}

// ////////////////////////////////////////////////////////////////
//                        project tasks                          //
// ////////////////////////////////////////////////////////////////

function requestProjectTasks () {
  return {
    type: actions.REQUEST_PROJECT_TASKS
  };
}

function receiveProjectTasks (json, error = null) {
  return {
    type: actions.RECEIVE_PROJECT_TASKS,
    json: json,
    error,
    receivedAt: Date.now()
  };
}

export function fetchProjectTasks (aaid = null, page, limit) {
  return function (dispatch) {
    dispatch(requestProjectTasks());

    // Note: `page` is 0 based, so subtract 1.
    let url = aaid === null
      ? `${config.api}/admin/0/projecttasks?page=${--page}&limit=${limit}`
      : `${config.api}/admin/${aaid}/projecttasks?page=${--page}&limit=${limit}`;
    return fetch(url)
      .then(response => {
        if (response.status >= 400) {
          throw new Error('Bad response');
        }
        return response.json();
      })
      .then(json => {
        // setTimeout(() => dispatch(receiveProjectTasks(json)), 2000);
        return dispatch(receiveProjectTasks(json));
      }, e => {
        console.log('e', e);
        return dispatch(receiveProjectTasks(null, 'Data not available'));
      });
  };
}

// ////////////////////////////////////////////////////////////////
//                       LIST OF PROJECTS                        //
// ////////////////////////////////////////////////////////////////

function requestProjects () {
  return {
    type: actions.REQUEST_PROJECTS
  };
}

function receiveProjects (json, error = null) {
  return {
    type: actions.RECEIVE_PROJECTS,
    json: json,
    error,
    receivedAt: Date.now()
  };
}

export function fetchProjects (aaid = null, page, limit, filters) {
  return function (dispatch) {
    dispatch(requestProjects());
    let qs = [];
    _.forEach(filters, (v, k) => {
      if (v && v !== '--') {
        qs.push(`${k}=${v}`);
      }
    });

    // Note: `page` is 0 based, so subtract 1.
    let url = aaid === null
      ? `${config.api}/admin/0/projects?page=${--page}&limit=${limit}`
      : `${config.api}/admin/${aaid}/projects?page=${--page}&limit=${limit}`;

    if (qs.length) {
      url += '&' + qs.join('&');
    }
    return fetch(url)
      .then(response => {
        if (response.status >= 400) {
          throw new Error('Bad response');
        }
        return response.json();
      })
      .then(json => {
        // setTimeout(() => dispatch(receiveProjects(json)), 2000);
        return dispatch(receiveProjects(json));
      }, e => {
        console.log('e', e);
        return dispatch(receiveProjects(null, 'Data not available'));
      });
  };
}

// ////////////////////////////////////////////////////////////////
//                         PROJECT META                          //
// ////////////////////////////////////////////////////////////////

function requestProjectsMeta () {
  return {
    type: actions.REQUEST_PROJECTS_META
  };
}

function receiveProjectsMeta (json, error = null) {
  return {
    type: actions.RECEIVE_PROJECTS_META,
    json: json,
    error,
    receivedAt: Date.now()
  };
}

export function fetchProjectsMeta () {
  return function (dispatch) {
    dispatch(requestProjectsMeta());

    return fetch(`${config.api}/meta/projects`)
      .then(response => {
        if (response.status >= 400) {
          throw new Error('Bad response');
        }
        return response.json();
      })
      .then(json => {
        // setTimeout(() => dispatch(receiveProjects(json)), 2000);
        return dispatch(receiveProjectsMeta(json));
      }, e => {
        console.log('e', e);
        return dispatch(receiveProjectsMeta(null, 'Data not available'));
      });
  };
}

// ////////////////////////////////////////////////////////////////
//                         ROAD NETWORK                          //
// ////////////////////////////////////////////////////////////////

function requestRoadNetworkStatus () {
  return {
    type: actions.REQUEST_ROAD_NETWORK_STATUS
  };
}

function receiveRoadNetworkStatus (json, error = null) {
  return {
    type: actions.RECEIVE_ROAD_NETWORK_STATUS,
    json: json,
    error,
    receivedAt: Date.now()
  };
}

export function fetchRoadNetworkStatus (id = null) {
  return function (dispatch) {
    dispatch(requestRoadNetworkStatus());

    let url = id === null ? `${config.api}/admin/0?roadNetwork=true` : `${config.api}/admin/${id}?roadNetwork=true`;
    return fetch(url)
      .then(response => {
        return response.json();
      })
      .then(json => {
        console.log('json', json);

        if (json.statusCode === 400 && json.message.match(/greater than maximum/)) {
          return {dataAvailable: false};
        } else if (json.statusCode > 400) {
          throw new Error('Bad response');
        }
        return {dataAvailable: true};
      })
      .then(json => {
        // setTimeout(() => dispatch(receiveRoadNetworkStatus(json)), 2000);
        return dispatch(receiveRoadNetworkStatus(json));
      }, e => {
        console.log('e', e);
        return dispatch(receiveRoadNetworkStatus(null, 'Data not available'));
      });
  };
}

// ////////////////////////////////////////////////////////////////
//                         VProMMS IDs                           //
// ////////////////////////////////////////////////////////////////

function requestVProMMSids () {
  return {
    type: actions.REQUEST_VPROMMS_IDS
  };
}

function receiveVProMMSids (json, error = null) {
  return {
    type: actions.RECEIVE_VPROMMS_IDS,
    json: json,
    error,
    receivedAt: Date.now()
  };
}

export function fetchVProMMsids () {
  return function (dispatch) {
    dispatch(requestVProMMSids());
    const route = '/properties/roads/ids';
    let url = `${config.api}${route}`;
    return fetch(url)
      .then(response => {
        return response.json();
      })
      .then(json => {
        if (json.statusCode === 400) {
          return {dataAvailable: false};
        } else if (json.statusCode > 400) {
          throw new Error('Bad response');
        }
        dispatch(receiveVProMMSids(json));
      });
  };
}

// ////////////////////////////////////////////////////////////////
//                   VProMMS IDs Source Data                     //
// ////////////////////////////////////////////////////////////////

function requestVProMMSidSourceGeoJSON () {
  return {
    type: actions.REQUEST_VPROMMS_SOURCE_GEOJSON
  };
}

function recieveVPRoMMSidSourceGeoJSON (json, vprommId, provinceName) {
  return {
    type: actions.RECIEVE_VPROMMS_SOURCE_GEOJSON,
    json: json,
    vprommId: vprommId,
    provinceName: provinceName,
    recievedAt: Date.now()
  };
}

export function fetchVProMMsidSourceGeoJSON (vprommId, provinceName) {
  return function (dispatch) {
    dispatch(requestVProMMSidSourceGeoJSON());
    // hit the grouped field geometries endpoint. do not download it.
    let url = `${config.api}/field/geometries/${vprommId}?grouped=true`;
    return fetch(url)
    .then(response => response.json())
    .then(json => {
      if (json.statusCode >= 400) {
        throw new Error('Bad Response');
      }
      dispatch(recieveVPRoMMSidSourceGeoJSON(json, vprommId, provinceName));
    });
  };
}

export function removeVProMMsSourceGeoJSON () {
  return {
    type: actions.REMOVE_VPROMMS_SOURCE_GEOJSON,
    receivedAt: Date.now()
  };
}

function requestVProMMsidsProperties () {
  return {
    type: actions.REQUEST_VPROMMS_PROPERTIES
  };
}

function receiveVProMMsidsProperties (json) {
  return {
    type: actions.RECEIVE_VPROMMS_PROPERTIES,
    json: json
  };
}

export function fetchVProMMsidsProperties () {
  return function (dispatch) {
    dispatch(requestVProMMsidsProperties);
    const url = `${config.api}/properties/roads`;
    return fetch(url)
    .then(response => response.json())
    .then(json => {
      if (json.statusCode >= 400) {
        throw new Error('Bad Response');
      }
      dispatch(receiveVProMMsidsProperties(json));
    });
  };
}

export function removeVProMMsidsProperties () {
  return {
    type: actions.REMOVE_VPROMMS_PROPERTIES
  };
}

function requestVProMMsidsCount () {
  return {
    type: actions.REQUEST_VPROMMS_IDS_COUNT
  };
}

function receiveVProMMSidsCount (json) {
  return {
    type: actions.RECEIVE_VPROMMS_IDS_COUNT,
    json: json
  };
}

export function fetchVProMMsIdsCount (level, id) {
  return function (dispatch) {
    dispatch(requestVProMMsidsCount());
    let url = `${config.api}/admin/roads/total`;
    if (id) {
      id = id.join('');
      url = `${url}/${id}`;
    }
    if (level === 'district') {
      url = `${url}?level=district`;
    }
    return fetch(url)
    .then(response => response.json())
    .then(json => {
      if (json.statusCode >= 400) {
        throw new Error('Bad Request');
      }
      dispatch(receiveVProMMSidsCount(json));
    });
  };
}

export function removeVProMMsIdsCount () {
  return {
    type: actions.REMOVE_VPROMMS_IDS_COUNT
  };
}

// ////////////////////////////////////////////////////////////////
//                         Explore Map                           //
// ////////////////////////////////////////////////////////////////

export function selectExploreMapLayer (layer) {
  return {
    type: actions.SELECT_EXPLORE_MAP_LAYER,
    layer
  };
}

export function exploreMapShowNoVpromms (bool) {
  return {
    type: actions.EXPLORE_MAP_SHOW_NO_VPROMMS,
    bool
  };
}

// ////////////////////////////////////////////////////////////////
//                              Set Zoom                         //
// ////////////////////////////////////////////////////////////////

export function setGlobalZoom (zoomSource) {
  let json;
  if (typeof zoomSource === 'string') {
    zoomSource = zoomSource.split(/map=/)[1].split(/&/)[0].split('/');
    json = {
      z: Number(zoomSource[0]),
      x: Number(zoomSource[1]),
      y: Number(zoomSource[2])
    };
  } else {
    json = {
      z: zoomSource.zoom,
      x: zoomSource.lng,
      y: zoomSource.lat
    };
  }
  return {
    type: actions.SET_GLOBAL_ZOOM,
    json: json
  };
}

// ///////////////////////////////////////////////////////////////
//                          Set Admin                           //
// ///////////////////////////////////////////////////////////////

export function setAdmin (admin) {
  return {
    type: actions.SET_ADMIN,
    id: admin.id,
    name: admin.name
  };
}

// ///////////////////////////////////////////////////////////////
//                             Roads                            //
// ///////////////////////////////////////////////////////////////

function requestVProMMsBbox () {
  return {
    type: actions.REQUEST_VPROMMS_BBOX
  };
}

function recieveVProMMsBbox (json) {
  return {
    type: actions.RECIEVE_VPROMMS_BBOX,
    json: json
  };
}
export function fetchVProMMsBbox (vprommsId) {
  return function (dispatch) {
    dispatch(requestVProMMsBbox());
    let url = `${config.api}/way/${vprommsId}/bbox`;
    return fetch(url)
    .then(response => {
      return response.json();
    })
    .then(json => {
      if (json.statusCode >= 400) {
        return dispatch(recieveVProMMsBbox({}));
      }
      dispatch(recieveVProMMsBbox(json));
    });
  };
}

export function removeVProMMsBBox () {
  return {
    type: actions.REMOVE_VPROMMS_BBOX
  };
}

function requestFieldVProMMsids () {
  return {
    type: actions.REQUEST_VPROMMS_FIELD_IDS
  };
}

function receiveFieldVProMMsids (json) {
  return {
    type: actions.RECEIVE_VPROMMS_FIELD_IDS,
    json: json
  };
}

export function fetchFieldVProMMsIds (json) {
  return function (dispatch) {
    dispatch(requestFieldVProMMsids());
    const url = `${config.api}/field/ids`;
    return fetch(url)
    .then(response => response.json())
    .then(json => {
      if (json.statusCode >= 400) {
        throw new Error('Bad Response');
      }
      dispatch(receiveFieldVProMMsids(json));
    });
  };
}

function requestFieldVProMMsIdsCount () {
  return {
    type: actions.REQUEST_VPROMMS_FIELD_IDS_COUNT
  };
}

function receiveFieldVProMMsIdsCount (json) {
  return {
    type: actions.RECEIVE_VPROMMS_FIELD_IDS_COUNT,
    json: json
  };
}

export function removeFieldVProMMsIdsCount () {
  return {
    type: actions.REMOVE_VPROMMS_FIELD_IDS_COUNT
  };
}

export function fetchFieldVProMsIdsCount (level) {
  return function (dispatch) {
    dispatch(requestFieldVProMMsIdsCount());
    let url = `${config.api}/field/roads/total`;
    url = (level === 'district') ? `${url}?level=district` : url;
    return fetch(url)
    .then(response => response.json())
    .then(json => {
      if (json.statusCode >= 400) {
        throw new Error('Bad Request');
      }
      dispatch(receiveFieldVProMMsIdsCount(json));
    });
  };
}

function requestFieldRoads () {
  return {
    type: actions.REQUEST_FIELD_ROADS
  };
}

function receiveFieldRoads (json) {
  return {
    type: actions.RECEIVE_FIELD_ROADS,
    json: json
  };
}

export function fetchFieldRoads (json, level) {
  return function (dispatch) {
    dispatch(requestFieldRoads());
    let url = `${config.api}/field/roads?province=${json[0]}`;
    if (level === 'district') {
      url = `${url}&district=${json[1]}`;
    }
    return fetch(url)
    .then(response => response.json())
    .then(json => {
      if (json.statusCode >= 400) {
        throw new Error('Bad Response');
      }
      dispatch(receiveFieldRoads(json));
    });
  };
}

export function removeFieldRoads () {
  return {
    type: actions.REMOVE_FIELD_ROADS
  };
}

function requestAdminRoads () {
  return {
    type: actions.REQUEST_ADMIN_ROADS
  };
}

function receiveAdminRoads (json) {
  return {
    type: actions.RECEIVE_ADMIN_ROADS,
    json: json
  };
}

export function fetchAdminRoads (json, level, limit, offset) {
  return function (dispatch) {
    dispatch(requestAdminRoads());
    let url = `${config.api}/admin/roads?province=${json[0]}`;
    if (level === 'district') {
      url = `${url}&district=${json[1]}`;
    }
    if (offset) {
      url = `${url}&offset=${offset}`;
    }
    if (limit) {
      url = `${url}&limit=${limit}`;
    }
    return fetch(url)
    .then(response => response.json())
    .then(json => {
      if (json.statusCode >= 400) {
        throw new Error('Bad Response');
      }
      dispatch(receiveAdminRoads(json));
    });
  };
}

export function removeAdminRoads () {
  return {
    type: actions.REMOVE_ADMIN_ROADS
  };
}

function requestAdminVProMMsProps () {
  return {
    type: actions.REQUEST_ADMIN_VPROMMS_PROPERTIES
  };
}

function receiveAdminVProMMsProps (json) {
  return {
    type: actions.RECEIVE_ADMIN_VPROMMS_PROPERTIES,
    json: json
  };
}

export function fetchAdminVProMMsProps (json, level, limit, offset) {
  return function (dispatch) {
    dispatch(requestAdminVProMMsProps());
    let url = `${config.api}/admin/roads/properties?province=${json[0]}`;
    if (level === 'district') {
      url = `${url}&district=${json[1]}`;
    }
    if (offset) {
      url = `${url}&offset=${offset}`;
    }
    if (limit) {
      url = `${url}&limit=${limit}`;
    }
    return fetch(url)
    .then(response => response.json())
    .then(json => {
      if (json.statusCode >= 400) {
        throw new Error('Bad Request');
      }
      dispatch(receiveAdminVProMMsProps(json));
    });
  };
}

export function removeAdminVProMMsProps () {
  return {
    type: actions.REMOVE_ADMIN_VPROMMS_PROPERTIES
  };
}

// ////////////////////////////////////////////////////////////////
//                             Search                            //
// ////////////////////////////////////////////////////////////////

export function showSearch (bool) {
  return {
    type: actions.DISPLAY_SEARCH,
    bool: bool
  };
}

export function showSearchResults (bool) {
  return {
    type: actions.DISPLAY_SEARCH_RESULTS,
    bool: bool
  };
}

export function setSearchType (text) {
  return {
    type: actions.SET_SEARCH_TYPE,
    text: text
  };
}

export function setFilteredVProMMs (array) {
  return {
    type: actions.SET_FILTERED_VPROMMS,
    array: array
  };
}

// ////////////////////////////////////////////////////////////////
//                            Admins                             //
// ////////////////////////////////////////////////////////////////

function requestAdminBbox () {
  return {
    type: actions.REQUEST_ADMIN_BBOX
  };
}

function receiveAdminBbox (json) {
  return {
    type: actions.RECEIVE_ADMIN_BBOX,
    json: json
  };
}

export function fetchAdminBbox (id) {
  return function (dispatch) {
    dispatch(requestAdminBbox());
    let url = `${config.api}/admin/${id}/info`;
    return fetch(url)
    .then(response => {
      return response.json();
    })
    .then(json => {
      // if not found, throw an error.
      if (json.statusCode >= 400) {
        throw new Error('Bad response');
      }
      dispatch(receiveAdminBbox(json));
    });
  };
}

function requestProvinces () {
  return {
    type: actions.REQUEST_PROVINCES
  };
}

function receiveProvinces (json) {
  return {
    type: actions.RECEIVE_PROVINCES,
    json: json
  };
}

export function fetchProvinces () {
  return function (dispatch) {
    dispatch(requestProvinces());
    let url = `${config.api}/admin/province/units`;
    return fetch(url)
    .then(response => response.json())
    .then(json => {
      if (json.statusCode >= 400) {
        throw new Error('Bad response');
      }
      dispatch(receiveProvinces(json));
    });
  };
}

export function removeProvinces () {
  return {
    type: actions.REMOVE_PROVINCES
  };
}

export function setCrossWalk () {
  return {
    type: actions.SET_CROSSWALK
  };
}

export function removeCrosswalk () {
  return {
    type: actions.REMOVE_CROSSWALK
  };
}

// ////////////////////////////////////////////////////////////////
//                        PAGINATION                             //
// ////////////////////////////////////////////////////////////////

export function setPagination (paginationObject) {
  return {
    type: actions.SET_PAGINATION,
    json: paginationObject
  };
}

export function updatePagination (newIndex, newPage) {
  return {
    type: actions.UPDATE_PAGINATION,
    newIndex: newIndex,
    newPage: newPage
  };
}

export function updateClickedPage (page) {
  return {
    type: actions.UPDATE_PAGINATION_CLICKED_PAGE,
    page: page
  };
}

// ////////////////////////////////////////////////////////////////
//                           Language                            //
// ////////////////////////////////////////////////////////////////

export function setLanguage (lang) {
  return {
    type: actions.SET_LANGUAGE,
    text: lang
  };
}

import React from 'react';
import {
  compose,
  getContext,
  withHandlers
} from 'recompose';
import {
  withRouter
} from 'react-router';
import { connect } from 'react-redux';
import { local } from 'redux-fractal';
import { createStore } from 'redux';
import TableRow from '../components/road-table-row';
import {
  EDIT_ROAD,
  EDIT_ROAD_SUCCESS,
  EDIT_ROAD_ERROR,
  DELETE_ROAD,
  DELETE_ROAD_SUCCESS,
  DELETE_ROAD_ERROR,
  roadIdIsValid,
  editRoadEpic,
  deleteRoadEpic
} from '../redux/modules/editRoad';


const reducer = (
  state = {
    viewState: 'read',
    newRoadId: '',
    shouldShowProperties: false,
    formIsInvalid: false,
    status: 'complete',
    error: false
  },
  action
) => {
  if (action.type === 'SHOW_READ_VIEW') {
    return Object.assign({}, state, {
      viewState: 'read',
      newRoadId: '',
      formIsInvalid: false,
      status: 'complete',
      error: false
    });
  } else if (action.type === 'SHOW_EDIT_VIEW') {
    return Object.assign({}, state, {
      viewState: 'edit'
    });
  } else if (action.type === 'SHOW_DELETE_VIEW') {
    return Object.assign({}, state, {
      viewState: 'delete'
    });
  } else if (action.type === 'SHOW_PROPERTIES') {
    return Object.assign({}, state, {
      shouldShowProperties: true
    });
  } else if (action.type === 'HIDE_PROPERTIES') {
    return Object.assign({}, state, {
      shouldShowProperties: false
    });
  } else if (action.type === 'UPDATE_NEW_ROAD_ID') {
    return Object.assign({}, state, {
      newRoadId: action.id,
      formIsInvalid: false,
      status: 'complete',
      error: false
    });
  } else if (action.type === 'FORM_IS_INVALID') {
    return Object.assign({}, state, {
      formIsInvalid: true
    });
  } else if (action.type === EDIT_ROAD) {
    return Object.assign({}, state, {
      status: 'pending',
      formIsInvalid: false
    });
  } else if (action.type === EDIT_ROAD_SUCCESS) {
    return Object.assign({}, state, {
      status: 'complete',
      newRoadId: ''
    });
  } else if (action.type === EDIT_ROAD_ERROR) {
    return Object.assign({}, state, {
      status: 'error',
      error: action.error
    });
  } else if (action.type === DELETE_ROAD) {
    return Object.assign({}, state, {
      status: 'pending',
      formIsInvalid: false
    });
  } else if (action.type === DELETE_ROAD_SUCCESS) {
    return Object.assign({}, state, {
      status: 'complete'
    });
  } else if (action.type === DELETE_ROAD_ERROR) {
    return Object.assign({}, state, {
      status: 'error',
      error: action.error
    });
  }

  return state;
};


const TableRowContainer = compose(
  getContext({ language: React.PropTypes.string }),
  withRouter,
  connect(
    (state, { vpromm, router: { params: { aaId, aaIdSub } } }) => ({
      province: state.crosswalk.province[aaId] && state.crosswalk.province[aaId].id,
      district: state.crosswalk.district[aaIdSub] && state.crosswalk.district[aaIdSub]
    })
  ),
  local({
    key: ({ vpromm }) => `${vpromm}-table-row`,
    createStore: () => createStore(reducer),
    mapDispatchToProps: (dispatch, { vpromm }) => ({
      showProperties: () => dispatch({ type: 'SHOW_PROPERTIES' }),
      hideProperties: () => dispatch({ type: 'HIDE_PROPERTIES' }),
      showReadView: (e) => {
        e.preventDefault();
        dispatch({ type: 'SHOW_READ_VIEW' });
      },
      showEditView: (e) => {
        e.preventDefault();
        dispatch({ type: 'SHOW_EDIT_VIEW' });
      },
      showDeleteView: (e) => {
        e.preventDefault();
        dispatch({ type: 'SHOW_DELETE_VIEW' });
      },
      updateNewRoadId: ({ target: { value: id } }) => dispatch({ type: 'UPDATE_NEW_ROAD_ID', id }),
      invalidateForm: () => dispatch({ type: 'FORM_IS_INVALID' }),
      confirmDelete: () => dispatch(deleteRoadEpic(vpromm)),
      submitEdit: (newRoadId) => dispatch(editRoadEpic(vpromm, newRoadId))
    }),
    filterGlobalActions: ({ type }) =>
      [EDIT_ROAD, EDIT_ROAD_SUCCESS, EDIT_ROAD_ERROR, DELETE_ROAD, DELETE_ROAD_SUCCESS, DELETE_ROAD_ERROR].indexOf(type) > -1
  }),
  withHandlers({
    toggleProperties: ({ shouldShowProperties, showProperties, hideProperties }) => () =>
      shouldShowProperties ? hideProperties() : showProperties(),
    confirmEdit: ({ newRoadId, province, district, submitEdit, invalidateForm }) => (e) => {
      e.preventDefault();
      // TODO - expose validation error messages
      if (!roadIdIsValid(newRoadId, province, district)) {
        return invalidateForm();
      }

      submitEdit(newRoadId);
    }
  })
)(TableRow);

export default TableRowContainer;

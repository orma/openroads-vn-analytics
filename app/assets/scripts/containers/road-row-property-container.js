import React from 'react';
import {
  compose,
  getContext,
  withHandlers
} from 'recompose';
import { local } from 'redux-fractal';
import { createStore } from 'redux';
import RoadRowProperty from '../components/road-row-property';
import {
  EDIT_ROAD_PROPERTY,
  EDIT_ROAD_PROPERTY_ERROR,
  DELETE_ROAD_PROPERTY,
  DELETE_ROAD_PROPERTY_ERROR,
  EDIT_ROAD_PROPERTY_SUCCESS,
  editRoadPropertyEpic,
  deleteRoadPropertyEpic
} from '../redux/modules/roads';


const reducerFactory = (roadId, propertyKey, propertyValue) => (
  state = {
    status: 'complete',
    propertyKey,
    editPropertyValue: propertyValue,
    roadId,
    shouldShowEdit: false
  },
  action
) => {
  if (action.type === 'SHOW_EDIT') {
    return Object.assign({}, state, {
      shouldShowEdit: true
    });
  } else if (action.type === 'HIDE_EDIT') {
    return Object.assign({}, state, {
      shouldShowEdit: false
    });
  } else if (action.type === 'UPDATE_EDIT_VALUE') {
    return Object.assign({}, state, {
      editPropertyValue: action.value
    });
  } else if (
    (action.type === DELETE_ROAD_PROPERTY || action.type === EDIT_ROAD_PROPERTY)
    && state.propertyKey === action.key
  ) {
    return Object.assign({}, state, {
      status: 'pending'
    });
  } else if (
    (action.type === DELETE_ROAD_PROPERTY_ERROR || action.type === EDIT_ROAD_PROPERTY_ERROR)
    && state.propertyKey === action.key
  ) {
    return Object.assign({}, state, {
      status: 'error'
    });
  } else if (action.type === EDIT_ROAD_PROPERTY_SUCCESS && state.propertyKey === action.key) {
    return Object.assign({}, state, {
      status: 'complete',
      shouldShowEdit: false
    });
  }

  return state;
};


const RoadRowPropertyContainer = compose(
  getContext({ language: React.PropTypes.string }),
  local({
    key: ({ roadId, propertyKey }) => `${roadId}-${propertyKey}`,
    createStore: ({ roadId, propertyKey, propertyValue }) => createStore(reducerFactory(roadId, propertyKey, propertyValue)),
    mapDispatchToProps: (dispatch, { roadId, propertyKey }) => ({
      deleteHandler: () => dispatch(deleteRoadPropertyEpic(roadId, propertyKey)),
      submitEdit: (editPropertyValue) => {
        dispatch(editRoadPropertyEpic(roadId, propertyKey, editPropertyValue));
      },
      showEditHandler: () => dispatch({ type: 'SHOW_EDIT' }),
      hideEditHandler: () => dispatch({ type: 'HIDE_EDIT' }),
      updateEditValue: ({ target: { value } }) => dispatch({ type: 'UPDATE_EDIT_VALUE', value })
    }),
    filterGlobalActions: ({ type }) =>
      [EDIT_ROAD_PROPERTY, EDIT_ROAD_PROPERTY_SUCCESS, EDIT_ROAD_PROPERTY_ERROR, DELETE_ROAD_PROPERTY, DELETE_ROAD_PROPERTY_ERROR].indexOf(type) > -1
  }),
  withHandlers({
    submitEditHandler: ({ editPropertyValue, submitEdit }) => (e) => {
      e.preventDefault();
      submitEdit(editPropertyValue);
    },
    inputKeyDown: ({ hideEditHandler }) => ({ which }) => which === 27 && hideEditHandler()
  })
)(RoadRowProperty);


export default RoadRowPropertyContainer;

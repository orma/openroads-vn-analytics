'use strict';

import React from 'react';
import { connect } from 'react-redux';
import mapboxgl from 'mapbox-gl';
import config from '../config';
import getExtent from 'turf-extent';
import c from 'classnames';
import intersect from '@turf/line-intersect';
import pointOnLine from '@turf/point-on-line';
import point from 'turf-point';
import { createModifyLineString } from '../utils/to-osm';
import { t } from '../utils/i18n';

import {
  fetchNextWayTask,
  markTaskAsDone,
  setGlobalZoom,
  queryOsm,
  reloadCurrentTask,
  modifyWaysWithNewPoint
} from '../actions/action-creators';

const source = 'collisions';
const roadHoverId = 'road-hover';
const roadSelected = 'road-selected';
const layers = [{
  id: 'road',
  type: 'line',
  paint: {
    'line-width': 4,
    'line-opacity': 0.2
  },
  layout: { 'line-cap': 'round' }
}, {
  id: roadHoverId,
  type: 'line',
  paint: {
    'line-width': 6,
    'line-opacity': 0.9
  },
  layout: { 'line-cap': 'round' },
  filter: ['==', '_id', '']
}, {
  id: roadSelected,
  type: 'line',
  paint: {
    'line-width': 6,
    'line-opacity': 0.9,
    'line-color': '#FF0000'
  },
  layout: { 'line-cap': 'round' },
  filter: ['==', '_id', '']
}].map(layer => Object.assign({source}, layer));

const layerIds = layers.map(layer => layer.id);

var Tasks = React.createClass({
  getInitialState: function () {
    return {
      currentTaskId: null,
      renderedFeatures: null,
      mode: null,
      skippedTasks: [],
      hoverId: null,
      selectedIds: []
    };
  },

  propTypes: {
    _fetchNextTask: React.PropTypes.func,
    _setGlobalZoom: React.PropTypes.func,
    _queryOsm: React.PropTypes.func,
    _reloadCurrentTask: React.PropTypes.func,
    _markTaskAsDone: React.PropTypes.func,

    osmInflight: React.PropTypes.bool,
    meta: React.PropTypes.object,
    task: React.PropTypes.object,
    taskId: React.PropTypes.number,
    taskError: React.PropTypes.string
  },

  componentWillMount: function () {
    this.fetchNextTask();
  },

  componentDidMount: function () {
    mapboxgl.accessToken = config.mbToken;
    const map = this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v9',
      failIfMajorPerformanceCaveat: false,
      zoom: 12
    }).addControl(new mapboxgl.NavigationControl(), 'bottom-left');

    this.onMapLoaded(() => {
      let makeXYZ = function () {
        const xyz = map.getCenter();
        xyz.zoom = map.getZoom();
        return xyz;
      };

      map.on('zoom', () => {
        this.props._setGlobalZoom(makeXYZ());
      });

      map.on('moveend', () => {
        this.props._setGlobalZoom(makeXYZ());
      });

      map.on('mousemove', (e) => {
        // toggle cursor and hover filters on mouseover
        let features = map.queryRenderedFeatures(e.point, { layers: layerIds });
        let id;

        if (features.length && features[0].properties._id) {
          map.getCanvas().style.cursor = 'pointer';
          id = features[0].properties._id;
        } else {
          map.getCanvas().style.cursor = '';
          id = '';
        }

        this.setState({hoverId: id});
        map.setFilter(roadHoverId, ['==', '_id', id]);
      });

      map.on('click', (e) => {
        let features = map.queryRenderedFeatures(e.point, { layers: [ roadHoverId ] });
        if (features.length && features[0].properties._id) {
          let featId = features[0].properties._id;
          let selectedIds;
          if (this.state.mode === 'dedupe') {
            selectedIds = [featId];
          } else if (this.state.mode === 'join') {
            if (this.state.selectedIds[0] === featId) {
              // in join, don't allow de-selecting the initially selected road
              selectedIds = [].concat(this.state.selectedIds);
            } else {
              // in join, there can only be 2 selections
              selectedIds = [this.state.selectedIds[0], featId];
            }
          } else {
            // Clone the selected array.
            selectedIds = [].concat(this.state.selectedIds);
            let idx = findIndex(selectedIds, o => o === featId);

            if (idx === -1) {
              selectedIds.push(featId);
            } else {
              selectedIds.splice(idx, 1);
            }
          }

          map.setFilter(roadSelected, ['in', '_id'].concat(selectedIds));
          this.setState({ selectedIds });
        }
      });
    });
  },

  componentWillReceiveProps: function ({taskId, task, lastUpdated}) {
    if (taskId && taskId !== this.state.currentTaskId) {
      // We've queried and received a new task
      this.setState({
        currentTaskId: taskId,
        renderedFeatures: task
      }, () => this.onMapLoaded(() => this.syncMap()));
    } else if (lastUpdated && lastUpdated === this.state.currentTaskId) {
      // We've just successfully completed an osm changeset
      // Reload the task to sync UI with API
      this.props._reloadCurrentTask(this.state.currentTaskId);
      this.setState({
        currentTaskId: null,
        selectedIds: [],
        mode: null
      });
    }
  },

  fetchNextTask: function () {
    this.props._fetchNextTask(this.state.skippedTasks);
  },

  onMapLoaded: function (fn) {
    if (this.map.loaded()) fn();
    else this.map.once('load', fn);
  },

  syncMap: function () {
    const features = this.state.renderedFeatures;
    const { map } = this;
    const existingSource = map.getSource(source);
    if (!existingSource) {
      map.addSource(source, {
        type: 'geojson',
        data: features
      });
      layers.forEach(layer => {
        map.addLayer(layer);
      });
    } else {
      existingSource.setData(features);
    }
    map.fitBounds(getExtent(features), {
      linear: true,
      padding: 25
    });
    map.setFilter(roadSelected, ['in', '_id'].concat(this.state.selectedIds));
  },

  renderPlaceholder: function () {
    const { taskError } = this.props;
    const message = taskError || 'Loading your first task...';
    return (
      <div className='placeholder__fullscreen'>
        <h3 className='placeholder__message'>{t(message)}</h3>
      </div>
    );
  },

  renderPropertiesOverlay: function () {
    const { hoverId } = this.state;
    const { task } = this.props;
    const properties = task.features.find(c => hoverId === c.properties._id).properties;
    const displayList = Object.keys(properties).map(key => key.charAt(0) === '_' ? null : [
      <dt key={`${key}-key`}><strong>{t('key')}</strong></dt>,
      <dd key={`${key}-value`}>{t(`${properties[key] || '--'}`)}</dd>
    ]).filter(Boolean);
    return (
      <aside className='properties__overlay'>
        <dl>
          {displayList}
        </dl>
      </aside>
    );
  },

  renderInstrumentPanel: function () {
    const { mode, renderedFeatures } = this.state;
    return (
      <div className='map-options map-panel'>
        { renderedFeatures ? <h2>Showing {renderedFeatures.features.length} Roads</h2> : null }
        {mode ? null : (
          <div>
            <div className='form-group'>
              <p>{`1. ${t('Select roads to work on')}.`}</p>
              <div className='map__panel--selected'>
                {this.renderSelectedIds()}
              </div>
            </div>
            <div className='form-group map__panel--form'>
              <p>{`2. ${t('Choose an action to perform')}.`}</p>
              <button className={c('bttn bttn-m bttn-secondary', {disabled: this.state.selectedIds.length < 2})} type='button' onClick={this.onDedupe}>{t('Remove Duplicates')}</button>
              <br />
              <button className={c('bttn bttn-m bttn-secondary', {disabled: this.state.selectedIds.length !== 1})} type='button' onClick={this.onJoin}>{t('Create Intersection')}</button>
            </div>
            <div className='form-group map__panel--form'>
              <button className='bttn bttn-m bttn-secondary' type='button' onClick={this.markAsDone}>{t('Finish task')}</button>
              <br />
              <button className='bttn bttn-m bttn-secondary' type='button' onClick={this.next}>{t('Skip task')}</button>
            </div>
          </div>
        )}
        {mode === 'dedupe' ? this.renderDedupeMode() : null}
        {mode === 'join' ? this.renderJoinMode() : null}
      </div>
    );
  },

  onJoin: function () {
    this.setState({mode: 'join'});
  },

  onDedupe: function () {
    const { selectedIds } = this.state;
    const { task } = this.props;
    const selectedFeatures = {
      type: 'FeatureCollection',
      features: selectedIds.map(id => task.features.find(f => f.properties._id === id))
    };
    this.setState({mode: 'dedupe', renderedFeatures: selectedFeatures, selectedIds: []}, this.syncMap);
  },

  exitMode: function () {
    const { task } = this.props;
    this.setState({mode: null, renderedFeatures: task, selectedIds: []}, this.syncMap);
  },

  renderDedupeMode: function () {
    return (
      <div className='form-group map__panel--form'>
        <h2>{t('Remove Duplicate Roads')}</h2>
        <p>{t('Click on a road to keep. The other roads here will be deleted.')}</p>
        <button className={c('bttn bttn-m bttn-secondary', {disabled: !this.state.selectedIds.length})} type='button' onClick={this.commitDedupe}>{t('Confirm')}</button>
        <br />
        <button className='bttn bttn-m bttn-secondary' type='button' onClick={this.exitMode}>{t('Cancel')}</button>
      </div>
    );
  },

  renderJoinMode: function () {
    return (
      <div className='form-group map__panel--form'>
        <h2>Create an Intersection</h2>
        <p>Click on a road to create an intersection with.</p>
        <button className={c('bttn bttn-m bttn-secondary', {disabled: this.state.selectedIds.length !== 2})} type='button' onClick={this.commitJoin}>{t('Confirm')}</button>
        <br />
        <button className='bttn bttn-m bttn-secondary' type='button' onClick={this.exitMode}>{t('Cancel')}</button>
      </div>
    );
  },

  commitDedupe: function () {
    const { selectedIds, renderedFeatures, currentTaskId } = this.state;
    const { features } = renderedFeatures;
    const toDelete = features.filter(feature => selectedIds[0] !== feature.properties._id);
    this.props._queryOsm(currentTaskId, {
      delete: {
        way: toDelete.map(feature => ({id: feature.properties._id}))
      }
    });
    this.props._markTaskAsDone(toDelete.map(feature => feature.properties._id));
  },

  commitJoin: function () {
    const { selectedIds, renderedFeatures, currentTaskId } = this.state;
    const { features } = renderedFeatures;
    const line1 = features.find(f => f.properties._id === selectedIds[0]);
    const line2 = features.find(f => f.properties._id === selectedIds[1]);
    const intersectingFeatures = intersect(line1, line2);
    const changes = [];
    if (!intersectingFeatures.features.length) {
      // lines don't intersect, join them from the nearest endpoint of line 1
      // find the end of line 1 that's closest to line 2
      // add that point to both ways
      let start = pointOnLine(line2, point(line1.geometry.coordinates[0]));
      let end = pointOnLine(line2, point(line1.geometry.coordinates[line1.geometry.coordinates.length - 1]));
      let fromStart = start.properties.dist < end.properties.dist;
      let intersection = fromStart ? start : end;
      let connectingFeature = Object.assign({}, line1, {
        geometry: {
          type: 'LineString',
          coordinates: fromStart
            ? [intersection.geometry.coordinates].concat(line1.geometry.coordinates)
            : line1.geometry.coordinates.concat([intersection.geometry.coordinates])
        }
      });
      changes.push(connectingFeature);
      changes.push(insertPointOnLine(line2, intersection));
    } else {
      let intersection = intersectingFeatures.features[0];
      changes.push(insertPointOnLine(line1, intersection));
      changes.push(insertPointOnLine(line2, intersection));
    }
    const changeset = createModifyLineString(changes);
    this.props._queryOsm(currentTaskId, changeset);
    this.props._markTaskAsDone([line1.properties._id, line2.properties._id]);
  },

  markAsDone: function () {
    // This function is different from #next, in that it allows you
    // to specify all visible roads as 'done'
    this.props._markTaskAsDone(this.state.renderedFeatures.features.map(feature => feature.properties._id));
    this.next();
  },

  next: function () {
    // Deselect roads.
    this.map.setFilter(roadSelected, ['all', ['in', '_id', '']]);

    // Add the skipped task to state, so we can request one we haven't gotten yet.
    const skippedTasks = this.state.skippedTasks.concat([this.state.currentTaskId]);
    this.setState({ selectedIds: [], skippedTasks, mode: null }, this.fetchNextTask);
  },

  renderSelectedIds: function () {
    const { selectedIds } = this.state;
    if (!selectedIds.length) {
      return <p className='empty'>{t('No roads selected yet. Click a road to select it.')}</p>;
    }
    if (selectedIds.length === 1) {
      return <p>{t('1 road selected. Select at least another one.')}</p>;
    }
    return <p>{`${selectedIds.length} ${t('roads')} ${t('selected')}.`}</p>;
  },

  renderInflight: function () {
    return (
      <div className='map-options map-panel'>
        <h2>{t('Performing action...')}</h2>
      </div>
    );
  },

  render: function () {
    const { hoverId } = this.state;
    const { task, taskError, osmInflight } = this.props;
    return (
      <div className='task-container'>
        <div className='map-container'>
          <div id='map' />
        </div>
        {!task || taskError ? this.renderPlaceholder() : null}
        {hoverId ? this.renderPropertiesOverlay() : null}
        {osmInflight ? this.renderInflight() : this.renderInstrumentPanel()}
      </div>
    );
  }
});

function selector (state) {
  return {
    task: state.waytasks.data,
    taskId: state.waytasks.id,
    taskError: state.waytasks.error,
    osmInflight: state.osmChange.fetching,
    lastUpdated: state.osmChange.taskId
  };
}

function dispatcher (dispatch) {
  return {
    _fetchNextTask: function (skippedTasks) { dispatch(fetchNextWayTask(skippedTasks)); },
    _markTaskAsDone: function (taskId) { dispatch(markTaskAsDone(taskId)); },
    _queryOsm: function (taskId, payload) { dispatch(queryOsm(taskId, payload)); },
    _reloadCurrentTask: function (taskId) { dispatch(reloadCurrentTask(taskId)); },
    _modifyWaysWithNewPoint: function (features, point) {
      dispatch(modifyWaysWithNewPoint(features, point));
    },
    _setGlobalZoom: function (...args) { dispatch(setGlobalZoom(...args)); }
  };
}

module.exports = connect(selector, dispatcher)(Tasks);

function findIndex (haystack, fn) {
  let idx = -1;
  haystack.some((o, i) => {
    if (fn(o)) {
      idx = i;
      return true;
    }
    return false;
  });
  return idx;
}

function insertPointOnLine (feature, point) {
  const nearest = pointOnLine(feature, point);
  const coordinates = feature.geometry.coordinates.slice();
  coordinates.splice(nearest.properties.index + 1, 0, point.geometry.coordinates);
  return Object.assign({}, feature, {
    geometry: {
      type: 'LineString',
      coordinates
    }
  });
}

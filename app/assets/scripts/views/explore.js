'use strict';

import React from 'react';
import { connect } from 'react-redux';
import mapboxgl from 'mapbox-gl';

import config from '../config';
import lineColors from '../utils/line-colors';
import {
  selectExploreMapLayer,
  exploreMapShowNoVpromms,
  setGlobalZoom,
  removeVProMMsBBox,
  setPreviousLocation
} from '../actions/action-creators';
import MapOptions from '../components/map-options';
import MapLegend from '../components/map-legend';

var Explore = React.createClass({
  displayName: 'Explore',

  propTypes: {
    _removeVProMMsBBox: React.PropTypes.func,
    _setGlobalZoom: React.PropTypes.func,
    _setPreviousLocation: React.PropTypes.func,
    layer: React.PropTypes.string,
    showNoVpromms: React.PropTypes.bool,
    dispatch: React.PropTypes.func,
    globX: React.PropTypes.number,
    globY: React.PropTypes.number,
    globZ: React.PropTypes.number,
    adminBbox: React.PropTypes.array,
    vprommsBbox: React.PropTypes.array,
    location: React.PropTypes.object
  },

  componentDidMount: function () {
    mapboxgl.accessToken = config.mbToken;
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v9',
      failIfMajorPerformanceCaveat: false,
      center: [this.props.globX, this.props.globY],
      zoom: this.props.globZ
    }).addControl(new mapboxgl.NavigationControl(), 'bottom-left');
    this.map.on('load', () => {
      // Load all roads with VPRoMMS values, and color by IRI
      this.map.addLayer({
        id: 'conflated',
        type: 'line',
        source: {
          type: 'vector',
          url: 'mapbox://openroads.vietnam-conflated'
        },
        'source-layer': 'conflated',
        paint: { 'line-width': 4 },
        layout: { 'line-cap': 'round' }
      }).setPaintProperty(
        'conflated',
        'line-color',
        lineColors['iri']
      ).setFilter('conflated', ['has', 'or_vpromms']);
    });
  },

  makeXYZ: function () {
    const xyz = this.map.getCenter();
    xyz.zoom = this.map.getZoom();
    return xyz;
  },

  handleLayerChange: function (e) {
    const property = e.target.value;
    this.props.dispatch(selectExploreMapLayer(property));
    this.map.setPaintProperty(
      'conflated',
      'line-color',
      lineColors[property]
    );
  },

  handleShowNoVpromms: function (e) {
    const show = e.target.checked;
    this.props.dispatch(exploreMapShowNoVpromms(show));
    if (show) {
      this.map.setFilter('conflated', null);
    } else {
      this.map.setFilter('conflated', ['has', 'or_vpromms']);
    }
  },

  componentWillUnmount: function () {
    this.props._setGlobalZoom(this.makeXYZ());
    this.props._setPreviousLocation(this.props.location.pathname);
  },

  componentWillReceiveProps: function (nextProps) {
    let bounds;
    if (nextProps.adminBbox !== this.props.adminBbox) {
      bounds = nextProps.adminBbox;
      return this.map.fitBounds(bounds);
    }
    if (nextProps.vprommsBbox !== this.props.vprommsBbox) {
      bounds = nextProps.vprommsBbox;
      return this.map.fitBounds(bounds);
    }
  },

  shouldComponentUpdate: function (nextProps) {
    if (nextProps.vprommsBbox.length === 0) { return false; }
    return true;
  },

  render: function () {
    return (
      <div className='map-container' >
        <div id='map'></div>

        <MapOptions
          handleLayerChange={ this.handleLayerChange }
          handleShowNoVpromms={ this.handleShowNoVpromms }
        />

        <MapLegend
          layer={this.props.layer}
        />
      </div>
    );
  }
});

function selector (state) {
  return {
    layer: state.exploreMap.layer,
    globX: state.globZoom.x,
    globY: state.globZoom.y,
    globZ: state.globZoom.z,
    vprommsBbox: state.VProMMsWayBbox.bbox,
    adminBbox: state.adminBbox.bbox
  };
}

function dispatcher (dispatch) {
  return {
    _removeVProMMsBBox: function () { dispatch(removeVProMMsBBox()); },
    _setGlobalZoom: function (xyzObj) { dispatch(setGlobalZoom(xyzObj)); },
    _setPreviousLocation: function (location) { dispatch(setPreviousLocation(location)); }
  };
}

module.exports = connect(selector, dispatcher)(Explore);

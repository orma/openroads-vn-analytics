'use strict';

import React from 'react';
import mapboxgl from 'mapbox-gl';
import { flatten, uniq } from 'lodash';
import { connect } from 'react-redux';
import { fetchVProMMsidSourceGeoJSON, setPreviousLocation } from '../actions/action-creators';
import config from '../config';
import AAFieldMapLegend from './aa-field-map-legend';

import {
  makeNWSE,
  makeNewZoom,
  makeCenterpoint,
  newZoomScale,
  pixelDistances,
  transformGeoToPixel
} from '../utils/zoom';

import {
  generateBbox,
  generateSourceFC,
  generateLayer
} from '../utils/field-map';

var AAFieldMap = React.createClass({
  displayName: 'AAFieldMap',
  propTypes: {
    adminName: React.PropTypes.string,
    roadId: React.PropTypes.string,
    geoJSON: React.PropTypes.array,
    provinceName: React.PropTypes.string,
    fetched: React.PropTypes.bool,
    params: React.PropTypes.object,
    vpromm: React.PropTypes.string,
    location: React.PropTypes.object,
    _fetchVProMMsidSourceGeoJSON: React.PropTypes.func,
    _removeVProMMsSourceGeoJSON: React.PropTypes.func,
    _setPreviousLocation: React.PropTypes.func
  },

  generateLngLatZoom: function (featureCollection) {
    // see test for this util for helpful description of
    // what all is happening here.
    var bounds = flatten(generateBbox(featureCollection));
    var NWSE = makeNWSE(bounds);
    var dummyZoom = 10;
    var nw = transformGeoToPixel(NWSE.nw, dummyZoom);
    var se = transformGeoToPixel(NWSE.se, dummyZoom);
    var distances = pixelDistances(nw, se);
    var adminAreaMapDiv = document.getElementById('aa-map');
    var dimensions = { x: adminAreaMapDiv.offsetWidth, y: adminAreaMapDiv.offsetHeight };
    var zoomScale = newZoomScale(distances, dimensions);
    var newZoom = makeNewZoom(zoomScale, dummyZoom);
    var cp = makeCenterpoint(bounds);
    return {
      lng: cp.x,
      lat: cp.y,
      zoom: newZoom - 2
    };
  },

  generateMap: function (geoJSON) {
    // generate the bounding box used to set initial zoom of gl map
    var lngLatZoom = this.generateLngLatZoom(geoJSON[0]);
    mapboxgl.accessToken = config.mbToken;
    var map = new mapboxgl.Map({
      container: 'aa-map',
      center: [lngLatZoom.lng, lngLatZoom.lat],
      zoom: lngLatZoom.zoom,
      style: 'mapbox://styles/mapbox/light-v9',
      failIfMajorPerformanceCaveat: false
    });
    map.on('load', () => {
      map.addControl(new mapboxgl.ScaleControl({unit: 'metric'}));
      map.addControl(new mapboxgl.NavigationControl());
      // forEach geoJSON source, add the feature collection
      var sourceId = `${this.props.roadId}-field-data`;
      geoJSON.forEach(fc => {
        map.addSource(sourceId, generateSourceFC(geoJSON[0]));
        fc.features.forEach(feature => {
          var fieldDataSource = feature.properties.source;
          map.addLayer(generateLayer(sourceId, fieldDataSource, this.props.roadId));
        });
      });
    });
  },

  // before component mounts, fetch the GeoJSON for
  // the VProMMs id
  componentWillMount: function () {
    const vpromm = this.props.params.vpromm;
    this.props._fetchVProMMsidSourceGeoJSON(vpromm);
  },

  componentWillUnmount: function () {
    this.props._setPreviousLocation(this.props.location.pathname);
  },

  // only once the GeoJSON is fetched, generate the map
  componentWillReceiveProps: function (nextProps) {
    if (nextProps.fetched) { this.generateMap(nextProps.geoJSON); }
  },

  // same rule that applied in componentWillReceiveProps goes for
  // the header render and the map render.
  renderMap: function (geoJSON) {
    const sources = geoJSON[0].features.map(feature => feature.properties.source);
    return (
      <div>
        <div id='aa-map' className='aa-map'></div>
        <AAFieldMapLegend sources={uniq(sources)} />
      </div>
    );
  },

  renderHeader: function (adminName) {
    return (<h1>{adminName} Province - Road # {this.props.params.vpromm}</h1>);
  },

  render: function () {
    return (
      <div>
        <div className="a-headline a-header">
          { this.props.fetched ? this.renderHeader(this.props.adminName) : ''}
        </div>
        <div className="a-main__status">
          <div className='aa-map-wrapper'>
            { this.props.fetched ? this.renderMap(this.props.geoJSON) : <div id='aa-map' className='aa-map'></div>}
          </div>
        </div>
      </div>
    );
  }
});

function selector (state) {
  return {
    geoJSON: state.VProMMSidSourceGeoJSON.geoJSON,
    fetched: state.VProMMSidSourceGeoJSON.fetched,
    adminName: state.admin.name
  };
}
function dispatcher (dispatch) {
  return {
    _fetchVProMMsidSourceGeoJSON: (id) => dispatch(fetchVProMMsidSourceGeoJSON(id)),
    _setPreviousLocation: (location) => dispatch(setPreviousLocation(location))
  };
}

module.exports = connect(selector, dispatcher)(AAFieldMap);

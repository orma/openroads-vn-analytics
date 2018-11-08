import React from 'react';
import { connect } from 'react-redux';
import {
  compose,
  withProps,
  getContext
} from 'recompose';
import mapboxgl from 'mapbox-gl';
import _ from 'lodash';
import T from '../components/t';
import config from '../config';
import lineColors from '../utils/line-colors';
import {
  selectExploreMapLayer,
  exploreMapShowNoVpromms
} from '../actions/action-creators';
import {
  setMapPosition
} from '../redux/modules/map';
import {
  fetchRoadBboxEpic
} from '../redux/modules/roads';
import MapSearch from '../components/map-search';
import MapOptions from '../components/map-options';
import MapLegend from '../components/map-legend';
import { withRouter } from 'react-router';


var Explore = React.createClass({
  displayName: 'Explore',

  propTypes: {
    layer: React.PropTypes.string,
    activeRoad: React.PropTypes.string,
    lng: React.PropTypes.number,
    lat: React.PropTypes.number,
    zoom: React.PropTypes.number,
    selectExploreMapLayer: React.PropTypes.func,
    exploreMapShowNoVpromms: React.PropTypes.func,
    setMapPosition: React.PropTypes.func,
    fetchActiveRoad: React.PropTypes.func
  },

  componentDidMount: function () {
    mapboxgl.accessToken = config.mbToken;

    const { lng, lat, zoom, activeRoad, language } = this.props;

    if (activeRoad) {
      this.props.fetchActiveRoad(activeRoad);
    }

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/openroads/cjdvlo06e68g22rmt6tme34xg',
      failIfMajorPerformanceCaveat: false,
      center: [lng, lat],
      zoom: zoom
    });

    this.map.addControl(new mapboxgl.NavigationControl(), 'top-left');

    // Disable map rotation using right click + drag.
    this.map.dragRotate.disable();

    // Disable map rotation using touch rotation gesture.
    this.map.touchZoomRotate.disableRotation();

    // Remove compass.
    document.querySelector('.mapboxgl-ctrl .mapboxgl-ctrl-compass').remove();

    this.map.on('load', () => {
      // Load all roads with VPRoMMS values, and color by IRI
      this.map
        .addLayer({
          id: 'national-roads',
          type: 'line',
          source: {
            type: 'vector',
            url: 'mapbox://openroads.05tgvz1w'
          },
          'source-layer': 'national',
          paint: {
            'line-width': [
              'interpolate', ['linear'], ['zoom'],
              0, 1,
              10, 2
            ]
          },
          layout: { 'line-cap': 'round' },
          maxzoom: 11
        })
        .addLayer({
          id: 'active_road',
          type: 'line',
          source: {
            type: 'vector',
            url: 'mapbox://openroads.vietnam-conflated-1'
          },
          'source-layer': 'conflated',
          paint: {
            'line-width': 20,
            'line-color': '#D3D3D3'
          },
          layout: { 'line-cap': 'round' },
          filter: ['==', 'or_vpromms', activeRoad]
        })
        .addLayer({
          id: 'novpromm',
          type: 'line',
          source: {
            type: 'vector',
            url: 'mapbox://openroads.vietnam-conflated-1'
          },
          'source-layer': 'conflated',
          paint: {
            'line-width': [
              'interpolate', ['linear'], ['zoom'],
              0, 1,
              10, 2
            ]
          },
          layout: { 'line-cap': 'round' },
          filter: ['!has', 'or_vpromms'],
          maxzoom: 11
        })
        .addLayer({
          id: 'novpromm_dashed',
          type: 'line',
          source: {
            type: 'vector',
            url: 'mapbox://openroads.vietnam-conflated-1'
          },
          'source-layer': 'conflated',
          paint: {
            'line-width': [
              'interpolate', ['linear'], ['zoom'],
              0, 1,
              10, 2
            ],
            'line-dasharray': [1, 2, 1]
          },
          layout: { 'line-cap': 'round' },
          filter: ['!has', 'or_vpromms'],
          minzoom: 10
        })
        .addLayer({
          id: 'vpromm',
          type: 'line',
          source: {
            type: 'vector',
            url: 'mapbox://openroads.vietnam-conflated-1'
          },
          'source-layer': 'conflated',
          paint: {
            'line-width': [
              'interpolate', ['linear'], ['zoom'],
              0, 1,
              10, 2
            ]
          },
          layout: {
            'line-cap': 'round'
          },
          filter: ['has', 'or_vpromms']
        })
        .addLayer({
          id: 'vpromm-label',
          type: 'symbol',
          source: {
            type: 'vector',
            url: 'mapbox://openroads.vietnam-conflated-1'
          },
          'source-layer': 'conflated',
          layout: {
            'symbol-placement': 'line',
            'text-anchor': 'top',
            'text-field': ['get', 'or_vpromms'],
            'text-font': ['DIN Offc Pro Regular', 'Open Sans Semibold'],
            'text-size': 10
          }
        })
        .addLayer({
          id: 'vpromm-interaction',
          type: 'line',
          source: {
            type: 'vector',
            url: 'mapbox://openroads.vietnam-conflated-1'
          },
          'source-layer': 'conflated',
          paint: {
            'line-width': [
              'interpolate', ['linear'], ['zoom'],
              0, 3,
              10, 8
            ],
            'line-opacity': 0
          },
          layout: {'line-cap': 'round'},
          filter: ['has', 'or_vpromms']
        })
        .addLayer({
          id: 'cvts',
          type: 'line',
          source: {
            type: 'vector',
            url: 'mapbox://openroads.18lep9y5'
          },
          'source-layer': 'license-counts-cv07we',
          paint: {
            'line-width': 1,
            'line-opacity': 1
          },
          layout: {
            visibility: 'none'
          }
        })
        .setPaintProperty(
          'novpromm',
          'line-color',
          lineColors['iri']
        )
        .setPaintProperty(
          'novpromm_dashed',
          'line-color',
          lineColors['iri']
        )
        .setPaintProperty(
          'vpromm',
          'line-color',
          lineColors['iri']
        );

      this.map.on('mousemove', (e) => {
        const features = this.map.queryRenderedFeatures(e.point, {layers: ['vpromm-interaction', 'cvts']});
        this.map.getCanvas().style.cursor = features.length ? 'pointer' : '';
      });

      this.map.on('click', 'vpromm-interaction', (e) => {
        const vpromm = _.get(e, 'features[0].properties.or_vpromms', null);
        if (vpromm) {
          this.props.router.push(`/${language}/assets/road/${vpromm}`);
        }
      });
    });
  },

  switchLayerTo: function (layer) {
    console.log('switching to layer', layer);
    if (layer === 'cvts') {
      this.map.setLayoutProperty('vpromm', 'visibility', 'none');
      this.map.setLayoutProperty('novpromm', 'visibility', 'none');
      this.map.setLayoutProperty('novpromm_dashed', 'visibility', 'none');
      this.map.setLayoutProperty('vpromm-interaction', 'visibility', 'none');
      this.map.setLayoutProperty('cvts', 'visibility', 'visible');
      this.map.setPaintProperty('cvts', 'line-color', lineColors['cvts']);
      this.map.setZoom(9);
    } else if (layer === 'iri') {
      this.map.setLayoutProperty('vpromm', 'visibility', 'visible');
      this.map.setLayoutProperty('novpromm', 'visibility', 'visible');
      this.map.setLayoutProperty('novpromm_dashed', 'visibility', 'visible');
      this.map.setLayoutProperty('vpromm-interaction', 'visibility', 'visible');
      this.map.setLayoutProperty('cvts', 'visibility', 'none');
    }
  },

  componentWillReceiveProps: function ({ layer, lng, lat, zoom, activeRoad }) {
    console.log('receiving props', this.props.layer, layer);

    if (this.props.layer !== layer) {
      this.switchLayerTo(layer);
    }
    if (lng !== this.props.lng || lat !== this.props.lat || zoom !== this.props.zoom) {
      this.map.flyTo({ center: [lng, lat], zoom });
    }

    if (activeRoad !== this.props.activeRoad) {
      this.map.setFilter('active_road', ['==', 'or_vpromms', activeRoad]);
      this.props.fetchActiveRoad(activeRoad);
    }
  },

  componentWillUnmount: function () {
    const { lng, lat } = this.map.getCenter();
    const zoom = this.map.getZoom();
    this.props.setMapPosition(lng, lat, zoom);
  },

  handleLayerChange: function ({ target: { value } }) {
    this.props.selectExploreMapLayer(value);
    this.map.setPaintProperty(
      'conflated',
      'line-color',
      lineColors[value]
    );
  },

  handleShowNoVpromms: function ({ target: { checked } }) {
    this.props.exploreMapShowNoVpromms(checked);

    if (checked) {
      this.map.setLayoutProperty('novpromm', 'visibility', 'visible');
      this.map.setLayoutProperty('novpromm_dashed', 'visibility', 'visible');
    } else {
      this.map.setLayoutProperty('novpromm', 'visibility', 'none');
      this.map.setLayoutProperty('novpromm_dashed', 'visibility', 'none');
    }
  },

  render: function () {
    return (
      <section className='inpage inpage--alt'>
        <header className='inpage__header'>
          <div className='inner'>
            <div className='inpage__headline'>
              <h1 className='inpage__title'><T>Explore</T></h1>
            </div>
            <div className='inpage__actions'>
              <MapSearch page='explore' />
            </div>
          </div>
        </header>
        <div className='inpage__body'>
          <div className='inner'>
            <figure className='map'>
              <div className='map__media' id='map'></div>
              <div className='map__controls map__controls--top-right'>
                <MapOptions
                  handleLayerChange={this.handleLayerChange}
                  handleShowNoVpromms={this.handleShowNoVpromms}
                />
              </div>
              <div className='map__controls map__controls--bottom-right'>
                <MapLegend
                  layer={this.props.layer}
                />
              </div>
            </figure>
          </div>
        </div>
      </section>
    );
  }
});


export default compose(
  withRouter,
  withProps(({ location: { query: { activeRoad = '' } } }) => ({
    activeRoad
  })),
  getContext({ language: React.PropTypes.string }),
  connect(
    state => ({
      layer: state.exploreMap.layer,
      lng: state.map.lng,
      lat: state.map.lat,
      zoom: state.map.zoom
    }),
    (dispatch, { activeRoad }) => ({
      setMapPosition: (lng, lat, zoom) => dispatch(setMapPosition(lng, lat, zoom)),
      selectExploreMapLayer: (value) => dispatch(selectExploreMapLayer(value)),
      exploreMapShowNoVpromms: (checked) => dispatch(exploreMapShowNoVpromms(checked)),
      fetchActiveRoad: (activeRoad) => dispatch(fetchRoadBboxEpic(activeRoad))
    })
  )
)(Explore);

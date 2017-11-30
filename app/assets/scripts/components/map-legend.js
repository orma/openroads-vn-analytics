import React from 'react';
import {
  getContext
} from 'recompose';
import lineColors from '../utils/line-colors';
import T from './T';


const renderTitle = (layer) => {
  if (layer === 'iri') {
    return <T>IRI</T>;
  } else if (layer === 'or_width') {
    return <T>Width</T>;
  } else if (layer === 'or_condition') {
    return <T>Condition</T>;
  } else if (layer === 'or_surface') {
    return <T>Surface</T>;
  }
};

const MapLegend = ({ layer }) => {
  const colors = lineColors[layer];
  const continuous = (colors.type !== 'categorical');
  const stops = colors.stops;

  let bestColorLabel;
  let worstColorLabel;

  if (continuous) {
    bestColorLabel = stops[0][0];
    worstColorLabel = stops[stops.length - 1][0];
  }

  return (
    <figcaption className='panel legend-panel'>
      <div className='panel__body'>
        <h3 className='map-legend-title'>{renderTitle(layer)}</h3>
        { continuous ?
          <div>
            <div className='map-legend-scale'></div>
            <p className='map-legend-label'>{ bestColorLabel }</p>
            <p className='map-legend-label'>{ worstColorLabel }</p>
          </div> :
          <div>
            <p className='empty'><T>No available data</T></p>
          </div>
        }
      </div>
    </figcaption>
  );
};


MapLegend.propTypes = {
  layer: React.PropTypes.string,
  language: React.PropTypes.string
};


export default getContext({ language: React.PropTypes.string })(MapLegend);

import React from 'react';
import { connect } from 'react-redux';
import { t, setLanguage } from '../utils/i18n';

const MapOptions = React.createClass({
  displayName: 'MapOptions',

  propTypes: {
    layer: React.PropTypes.string,
    handleLayerChange: React.PropTypes.func,
    handleShowNoVpromms: React.PropTypes.func,
    language: React.PropTypes.string
  },

  componentWillReceiveProps: function (nextProps) {
    if (this.props.language !== nextProps.language) {
      setLanguage(nextProps.language);
    }
  },

  render: function () {
    return (
      <div className='map-options map-panel'>
        <div className='form-group'>
          <label className='map-options-label form__option form__option--custom-checkbox' htmlFor='show-no-vpromms'>
            <input type='checkbox' name='show-no-vpromms' id='show-no-vpromms' value='show-no-vpromms' onChange={ e => this.props.handleShowNoVpromms(e) } />
            <span className='form__option__text' data-title={`${t('These will have no properties')}.`}>{t('Show road without vPromMMS ID')}</span>
            <span className='form__option__ui'></span>
          </label>
        </div>

        <div className='form-group'>
          <label className='map-options-label'>{t('Select visualized variable')}</label>
          <select className='map__options--select' onChange={ e => this.props.handleLayerChange(e) }>
            <option value='iri'>{t('IRI')}</option>
            <option value='or_width'>{t('Width')}</option>
            <option value='or_condition'>{t('Condition')}</option>
            <option value='or_surface'>{t('Surface')}</option>
          </select>
        </div>
      </div>
    );
  }
});

function selector (state) {
  return {
    language: state.language.current
  };
}

module.exports = connect(selector)(MapOptions);

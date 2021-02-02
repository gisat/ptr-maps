var WWWmsLayer = null;
import {isServer} from '@gisatcz/ptr-core';
if (!isServer) {
	var WWWmsLayer = require('webworldwind-esa').WmsLayer;
	var Location = require('webworldwind-esa').Location;
	var Sector = require('webworldwind-esa').Sector;
}

import _ from 'lodash';

/**
 * @param layer {Object}
 * @param layer.key {string}
 * @param layer.opacity {number}
 * @param layer.options {Object}
 * @param layer.options.url {string}
 * @param layer.options.params {object}
 * @augments WorldWind.WmsLayer
 * @constructor
 */
class WmsLayer extends WWWmsLayer {
	constructor(layer) {
		const {key, options, opacity} = layer;
		const {
			imageFormat,
			layers,
			name,
			styles,
			version,
			...params
		} = options.params;

		const worldWindOptions = {
			key: key,
			format: imageFormat || 'image/png',
			layerNames: layers,
			levelZeroDelta: new Location(45, 45),
			name: name,
			numLevels: 18,
			opacity: opacity || 1,
			params: _.isEmpty(params) ? null : params,
			sector: new Sector(-90, 90, -180, 180),
			service: options.url,
			size: 256,
			styleNames: styles,
			version: version || '1.3.0',
		};

		super(worldWindOptions);

		this.key = key;
		this.attributions = options.attributions;
		this.layerNames = layers;
		this.service = options.url;
		this.styleNames = styles || '';
		this.customParams = params;
		this.numLevels = worldWindOptions.numLevels;

		this.cachePath = `${this.service}/${this.layerNames}`;
		if (this.styleNames) {
			this.cachePath += `/${this.styleNames}`;
		}
		if (this.customParams && this.customParams.time) {
			this.cachePath += `/${this.customParams.time}`;
		}

		this.opacity = worldWindOptions.opacity;

		// TODO extend url builder to accept custom params
	}

	doRender(dc) {
		WWWmsLayer.prototype.doRender.call(this, dc);
		dc.screenCreditController.clear();
	}
}

export default WmsLayer;

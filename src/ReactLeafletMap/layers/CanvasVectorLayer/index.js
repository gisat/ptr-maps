import {MapLayer, withLeaflet} from 'react-leaflet';
import LeafletCanvasLayer from './LeafletCanvasLayer';

class CanvasVectorLayer extends MapLayer {
	createLeafletElement(props) {
		let layer = new LeafletCanvasLayer({
			paneName: props.uniqueLayerKey,
			paneZindex: props.zIndex,
		});
		layer.setProps(props);
		return layer;
	}

	updateLeafletElement(fromProps, toProps) {
		super.updateLeafletElement(fromProps, toProps);

		if (fromProps.zIndex !== toProps.zIndex) {
			this.leafletElement.setPaneZindex(toProps.uniqueLayerKey, toProps.zIndex);
		}

		// TODO
		if (
			fromProps.selected !== toProps.selected ||
			fromProps.features !== toProps.features ||
			fromProps.style !== toProps.style ||
			fromProps.omittedFeatureKeys !== this.props.omittedFeatureKeys
		) {
			this.leafletElement.setProps(toProps);
		}
	}
}

export default withLeaflet(CanvasVectorLayer);

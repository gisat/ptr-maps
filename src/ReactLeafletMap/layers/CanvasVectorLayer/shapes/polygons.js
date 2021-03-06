import helpers from './helpers';

/**
 * Draw shape to the given canvas
 * @param context {Object} canvas context
 * @param coordinates {Array}
 * @param style {Object} Panther style definition
 */
function drawPolygon(context, coordinates, style) {
	context.beginPath();

	coordinates.forEach(linearRing => {
		const start = linearRing[0];
		const rest = linearRing.slice(1);

		context.moveTo(Math.floor(start.x), Math.floor(start.y));
		rest.forEach(point => {
			context.lineTo(Math.floor(point.x), Math.floor(point.y));
		});

		context.closePath();
	});

	helpers.setPolygonStyle(context, style);
}

function drawMultiPolygon(context, coordinates, style) {
	coordinates.map(polygon => drawPolygon(context, polygon, style));
}

export default {
	drawPolygon,
	drawMultiPolygon,
};

import helpers from './helpers';

/**
 * Draw shape to the given canvas
 * @param context {Object} canvas context
 * @param center {Object} center point of the shape
 * @param style {Object} Panther style definition
 * @param pixelSizeInMeters {number | null}
 */
function draw(context, center, style, pixelSizeInMeters) {
	// TODO add other shapes
	if (style.shape === 'square') {
		square(context, center, style, pixelSizeInMeters);
	} else {
		circle(context, center, style, pixelSizeInMeters);
	}
}

function square(context, center, style, pixelSizeInMeters) {
	const size = helpers.getSize(style.size, pixelSizeInMeters);
	const a = 2 * size; // side length
	context.beginPath();
	context.rect(center.x - a / 2, center.y - a / 2, a, a);
	helpers.setPolygonStyle(context, style);
	context.closePath();
}

function circle(context, center, style, pixelSizeInMeters) {
	context.beginPath();
	const size = helpers.getSize(style.size, pixelSizeInMeters);
	context.arc(Math.floor(center.x), Math.floor(center.y), size, 0, Math.PI * 2);
	helpers.setPolygonStyle(context, style);
	context.closePath();
}

export default {
	draw,
};

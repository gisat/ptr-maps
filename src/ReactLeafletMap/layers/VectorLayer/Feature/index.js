import React from 'react';
import PropTypes from 'prop-types';
import {Circle, Polygon, Marker, Polyline} from 'react-leaflet';

import ContextWrapper from "./ContextWrapper";
import {utils} from "@gisatcz/ptr-utils";
import MarkerIcon from "./MarkerIcon";
import * as turf from "@turf/turf";

class Feature extends React.PureComponent {
    static propTypes = {
        feature: PropTypes.object,
        fid: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]),
        fidColumnName: PropTypes.string,
        hoverable: PropTypes.bool,
        selectable: PropTypes.bool,
        defaultStyle: PropTypes.object,
        hoveredStyle: PropTypes.object,
        selectedStyle: PropTypes.object,
        selectedHoveredStyle: PropTypes.object,
        selected: PropTypes.bool,
        changeContext: PropTypes.func,
        hoveredFromContext: PropTypes.bool,
        interactive: PropTypes.bool
    };

    static getDerivedStateFromProps(props, state) {
        if (props.feature) {
            const flippedFeature = turf.flip(props.feature);
            const leafletCoordinates = flippedFeature && flippedFeature.geometry && flippedFeature.geometry.coordinates;

            return {
                leafletCoordinates
            }
        }

        // Return null if the state hasn't changed
        return null;
    }

    constructor(props) {
        super(props);

        this.onClick = this.onClick.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseOut = this.onMouseOut.bind(this);
        this.onAdd = this.onAdd.bind(this);

        this.fid = props.fid;

        if (props.type === "Point" && props.pointAsMarker) {
            this.iconId = this.props.fid ? `${this.props.fid}_icon` : utils.uuid();
        }

        this.state = {
            hovered: false
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.hasOwnProperty('hoveredFromContext')) {
            if (this.props.hoveredFromContext && !this.state.hovered) {
                this.showOnTop();
                this.setState({hovered: true});
            } else if (!this.props.hoveredFromContext && this.state.hovered) {
                if (!this.props.selected) {
                    this.showOnBottom();
                }
                this.setState({hovered: false});
            }
        }
    }

    componentWillUnmount() {
        if (this.props.changeContext) {
            this.props.changeContext(null);
        }
    }

    onAdd(event) {
        if (event.target) {
            this.leafletFeature = event.target;
        }
    }

    onClick() {
        if (this.props.selectable) {
            this.showOnTop();

            if (this.props.onClick && this.fid) {
                this.props.onClick(this.fid);
            }
        }
    }

    onMouseMove(event) {
        if (this.props.hoverable) {
            this.showOnTop();

            if (this.fid && this.props.changeContext) {
                this.props.changeContext([this.fid], {
                    popup: {
                        x: event.originalEvent ? event.originalEvent.pageX : event.pageX,
                        y: event.originalEvent ? event.originalEvent.pageY : event.pageY,
                        fidColumnName: this.props.fidColumnName,
                        data: this.props.feature.properties
                    }
                });
            }

            if (!this.state.hovered) {
                this.setState({hovered: true});
            }
        }
    }

    onMouseOut() {
        if (this.props.hoverable) {
            if (!this.props.selected) {
                this.showOnBottom();
            }

            if (this.props.changeContext) {
                this.props.changeContext(null);
            }

            this.setState({hovered: false});
        }
    }

    /**
     * Show feature on the top of others, if it's not a point
     */
    showOnTop() {
        if (this.leafletFeature && this.props.type !== "Point") {
            this.leafletFeature.bringToFront();
        }
    }

    /**
     * Show feature in the bottom, if it's a polygon
     */
    showOnBottom() {
        if (this.leafletFeature && (this.props.type === "Polygon" || this.props.type === "MultiPolygon")) {
            this.leafletFeature.bringToBack();
        }
    }

    render() {
        let style = this.props.defaultStyle;

        if (this.props.selected && this.state.hovered && this.props.selectedHoveredStyle) {
            style = this.props.selectedHoveredStyle;
        } else if (this.state.hovered && this.props.hoveredStyle) {
            style = this.props.hoveredStyle;
        } else if (this.props.selected && this.props.selectedStyle) {
            style = this.props.selectedStyle;
        }

        // TODO add support for other geometry types
        switch (this.props.type) {
            case "Polygon":
            case "MultiPolygon":
                return this.renderPolygon(style);
            case "Point":
            case "MultiPoint":
                return this.renderPoint(style);
            case "LineString":
            case "MultiLineString":
                return this.renderLine(style);
            default:
                return null;
        }
    }

    renderPolygon(style) {
        return (
            <Polygon
                interactive={this.props.hoverable || this.props.selectable}
                onAdd={this.onAdd}
                onClick={this.onClick}
                onMouseMove={this.onMouseMove}
                onMouseOut={this.onMouseOut}
                positions={this.state.leafletCoordinates}
                {...style}
            />
        );
    }

    renderLine(style) {
        return (
            <Polyline
                interactive={this.props.hoverable || this.props.selectable}
                onAdd={this.onAdd}
                onClick={this.onClick}
                onMouseOver={this.onMouseMove}
                onMouseMove={this.onMouseMove}
                onMouseOut={this.onMouseOut}
                positions={this.state.leafletCoordinates}
                {...style}
            />
        );
    }

    renderPoint(style) {
        if (this.props.pointAsMarker) {
            return this.renderShape(style);
        } else {
            return (
                <Circle
                    interactive={this.props.hoverable || this.props.selectable}
                    onAdd={this.onAdd}
                    onClick={this.onClick}
                    onMouseMove={this.onMouseMove}
                    onMouseOver={this.onMouseMove}
                    onMouseOut={this.onMouseOut}
                    center={this.state.leafletCoordinates}
                    {...style}
                />
            );
        }
    }

    renderShape(style) {
        if (!this.icon) {
            this.icon = new MarkerIcon(this.iconId, style, {
                iconAnchor: style.radius ? [style.radius, style.radius] : null,
                onMouseMove: this.onMouseMove,
                onMouseOut: this.onMouseOut,
                onMouseOver: this.onMouseMove,
                onClick: this.onClick
            });

            this.icon.setStyle(style);
        }

        if (!_.isEqual(this.style, style)) {
            this.style = style;
            this.icon.setStyle(style);
        }

        return (
            <Marker
                interactive={this.props.hoverable || this.props.selectable}
                position={this.state.leafletCoordinates}
                icon={this.icon}
                onAdd={this.onAdd}
            />
        );
    }
}

export default ContextWrapper(Feature);
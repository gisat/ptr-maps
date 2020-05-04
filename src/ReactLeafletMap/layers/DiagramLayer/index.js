import React from 'react';
import _ from "lodash";
import {Pane} from 'react-leaflet';
import * as turf from "@turf/turf";
import constants from "../../../constants";

import VectorLayer from "../VectorLayer";
import Feature from "../VectorLayer/Feature";

class DiagramLayer extends VectorLayer {
    constructor(props) {
        super(props);
    }

    getDiagramDefaultStyle(feature, defaultStyleObject) {
        return this.getDiagramLeafletStyle(feature, defaultStyleObject);
    }

    getDiagramAccentedStyle(feature, defaultStyleObject, accentedStyleObject) {
        const style = {...defaultStyleObject, ...accentedStyleObject};
        return this.getDiagramLeafletStyle(feature, style);
    }

    getDiagramLeafletStyle(feature, style) {
        let finalStyle = {};

        finalStyle.color = style.diagramOutlineColor ? style.diagramOutlineColor : null;
        finalStyle.weight = style.diagramOutlineWidth ? style.diagramOutlineWidth : 0;
        finalStyle.opacity = style.diagramOutlineOpacity ? style.diagramOutlineOpacity : 1;
        finalStyle.fillOpacity = style.diagramFillOpacity ? style.diagramFillOpacity : 1;
        finalStyle.fillColor = style.diagramFill

        if (!style.diagramFill) {
            finalStyle.fillColor = null;
            finalStyle.fillOpacity = 0;
        }

        if (!style.diagramOutlineColor || !style.diagramOutlineWidth) {
            finalStyle.color = null;
            finalStyle.opacity = 0;
            finalStyle.weight = 0;
        }

        if (style.diagramSize) {
            finalStyle.radius = style.diagramSize;
        } else if (style.diagramVolume) {
            finalStyle.radius = Math.sqrt(style.diagramVolume/Math.PI);
        }

        return finalStyle;
    }

    prepareData(features) {
        if (features) {
            let data = [];

            _.forEach(features, (feature) => {
                const fid = this.props.fidColumnName && feature.properties[this.props.fidColumnName];
                const centroid = turf.centerOfMass(feature.geometry);

                let selected = null;
                let areaSelectedStyle = null;
                let diagramSelectedStyle = null;
                let areaSelectedHoveredStyle = null;
                let diagramSelectedHoveredStyle = null;
                if (this.props.selected && fid) {
                    _.forIn(this.props.selected, (selection, key) => {
                        if (selection.keys && _.includes(selection.keys, fid)) {
                            selected = selection;
                        }
                    });
                }

                // Flip coordinates due to different leaflet implementation
                const flippedFeature = turf.flip(feature);
                const flippedCentroid = turf.flip(centroid);

                const diagramLeafletCoordinates = flippedCentroid && flippedCentroid.geometry && flippedCentroid.geometry.coordinates;
                const areaLeafletCoordinates = flippedFeature && flippedFeature.geometry && flippedFeature.geometry.coordinates;

                // Prepare default styles
                const defaultStyleObject = this.getDefaultStyleObject(feature);
                const areaDefaultStyle = this.getFeatureDefaultStyle(feature, defaultStyleObject);
                const diagramDefaultStyle = this.getDiagramDefaultStyle(feature, defaultStyleObject);

                // Prepare hovered styles
                const hoveredStyleObject = (this.props.hovered && this.props.hovered.style) || {...constants.vectorFeatureStyle.hovered, ...constants.diagramStyle.hovered};
                const areaHoveredStyle = this.getFeatureAccentedStyle(feature, defaultStyleObject, hoveredStyleObject);
                const diagramHoveredStyle = this.getDiagramAccentedStyle(feature, defaultStyleObject, hoveredStyleObject);

                // Prepare selected and selected hovered style, if selected
                if (selected) {
                    const selectedStyleObject = selected.style || {...constants.vectorFeatureStyle.selected, ...constants.diagramStyle.selected};
                    const selectedHoveredStyleObject = selected.hoveredStyle || {...constants.vectorFeatureStyle.selectedHovered, ...constants.diagramStyle.selectedHovered};
                    areaSelectedStyle = this.getFeatureAccentedStyle(feature, defaultStyleObject, selectedStyleObject);
                    areaSelectedHoveredStyle = this.getFeatureAccentedStyle(feature, defaultStyleObject, selectedHoveredStyleObject);
                    diagramSelectedStyle = this.getDiagramAccentedStyle(feature, defaultStyleObject, selectedStyleObject);
                    diagramSelectedHoveredStyle = this.getDiagramAccentedStyle(feature, defaultStyleObject, selectedHoveredStyleObject);
                }

                data.push({
                    feature,
                    fid,
                    selected: !!selected,
                    areaDefaultStyle,
                    areaHoveredStyle,
                    areaSelectedStyle,
                    areaSelectedHoveredStyle,
                    areaLeafletCoordinates,
                    diagramDefaultStyle,
                    diagramHoveredStyle,
                    diagramSelectedStyle,
                    diagramSelectedHoveredStyle,
                    diagramLeafletCoordinates
                });
            });

            return _.orderBy(data, ['diagramDefaultStyle.radius'], ['desc']);
        } else {
            return null;
        }
    }

    render() {
        const data = this.prepareData(this.props.features);
        let sortedPolygons = data;
        if (this.props.selected) {
            sortedPolygons =  _.orderBy(data, ['selected'], ['asc']);
        }

        return (
            data ? (
                <>
                    <Pane>
                        {sortedPolygons.map((item, index) => this.renderArea(item, index))}
                    </Pane>
                    <Pane>
                        {data.map((item, index) => this.renderDiagram(item, index))}
                    </Pane>
                </>
            ) : null
        );
    }

    renderArea(data, index) {
        return (
            <Feature
                key={data.fid || index}
                fid={data.fid}
                onClick={this.onFeatureClick}
                fidColumnName={this.props.fidColumnName}
                type={data.feature.geometry.type}
                defaultStyle={data.areaDefaultStyle}
                hoveredStyle={data.areaHoveredStyle}
                selectedStyle={data.areaSelectedStyle}
                selectedHoveredStyle={data.areaSelectedHoveredStyle}
                selected={data.selected}
                leafletCoordinates={data.areaLeafletCoordinates}
                feature={data.feature}
            />
        );
    }

    renderDiagram(data, index) {
        return (
            <Feature
                key={data.fid || index}
                fid={data.fid}
                onClick={this.onFeatureClick}
                fidColumnName={this.props.fidColumnName}
                type="Point"
                defaultStyle={data.diagramDefaultStyle}
                hoveredStyle={data.diagramHoveredStyle}
                selectedStyle={data.diagramSelectedStyle}
                selectedHoveredStyle={data.diagramSelectedHoveredStyle}
                selected={data.selected}
                leafletCoordinates={data.diagramLeafletCoordinates}
                feature={data.feature}
            />
        );
    }
}

export default DiagramLayer;
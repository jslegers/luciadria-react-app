import FeatureModel from "luciad/model/feature/FeatureModel";
import FusionTileSetModel from "luciad/model/tileset/FusionTileSetModel";
import FeatureLayer from "luciad/view/feature/FeatureLayer";
import GridLayer from "luciad/view/grid/GridLayer";
import LonLatGrid from "luciad/view/grid/LonLatGrid";

import LayerGroup from "luciad/view/LayerGroup";
import LayerType from "luciad/view/LayerType";

import WMSTileSetModel from "luciad/model/tileset/WMSTileSetModel";
import RasterTileSetLayer from "luciad/view/tileset/RasterTileSetLayer";

class LayerFactory {

    public createWMSLayer(wmsModel: WMSTileSetModel, options: any) {
        if (typeof options === "undefined") {
            options = {}
        };
        const wmsLayer = new RasterTileSetLayer(wmsModel, {
            label: options.label ? options.label : "Earth Image",
            layerType: options.layerType ? options.layerType : LayerType.STATIC
        });
        return wmsLayer;
    }

    public createLTSLayer(elevationModel:FusionTileSetModel, options: any) {
        if (typeof options === "undefined") {
            options = {};
        }
        const elevationLayer = new RasterTileSetLayer(elevationModel, {
            label: options.label ? options.label : "Elevation",
            layerType: options.layerType ? options.layerType : LayerType.STATIC
        });
        return elevationLayer;
    }

    public createGrid() {
        const settings = [
            {scale: 40000.0E-9, deltaLon: 1 / 60, deltaLat: 1 / 60},
            {scale: 20000.0E-9, deltaLon: 1 / 30, deltaLat: 1 / 30},
            {scale: 10000.0E-9, deltaLon: 1 / 10, deltaLat: 1 / 10},
            {scale: 5000.0E-9, deltaLon: 1 / 2, deltaLat: 1 / 2},
            {scale: 1000.0E-9, deltaLon: 1, deltaLat: 1},
            {scale: 200.0E-9, deltaLon: 5, deltaLat: 5},
            {scale: 20.0E-9, deltaLon: 10, deltaLat: 10},
            {scale: 9.0E-9, deltaLon: 20, deltaLat: 20},
            {scale: 5.0E-9, deltaLon: 30, deltaLat: 30},
            {scale: 0, deltaLon: 45, deltaLat: 45}

        ];
        const lonLatGridModel = new LonLatGrid(settings);
        const gridLayer = new GridLayer(lonLatGridModel, {label: "Grid", id: "Grid"});
        return gridLayer;
    }

    public createNewLayerGroup(options: any) {
        if (typeof options === "undefined") {
            options = {};
        }
        options.label = options.label ? options.label : "New group";
        const layer = new LayerGroup(options);
       // layer.collapsed = typeof options.collapsed !== "undefined" ? options.collapsed : false;
        return layer;
    }

    public createFeatureLayer(model: FeatureModel, options: any) {
        if (typeof options === "undefined") {
            options = {};
        }
        const layer = new FeatureLayer(model, {
            label: options.label ? options.label : "Feature Layer",
            layerType: options.layerType ? options.layerType : LayerType.STATIC
        });
        return layer;
    }
}

export default new LayerFactory();

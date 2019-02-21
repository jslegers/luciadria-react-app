import * as React from 'react';
import './LuciadMap.css';

// LuciadRIA libraries
import ReferenceProvider from 'luciad/reference/ReferenceProvider';
import WebGLMap from 'luciad/view/WebGLMap';

import LayerFactory from "../Factories/LayerFactory";
import ModelFactory from "../Factories/ModelFactory";

class LuciadMap extends React.Component {
    public map: WebGLMap;
    private luciadmapref = React.createRef<HTMLDivElement>();

    // Create the Map only after the Dome element is mounted
    public componentDidMount() {
        this.createMap();
        this.createLayers();
    }

    public createMap() {
        const domElement = this.luciadmapref.current as HTMLElement;
        const REF_GEOCENTRIC = ReferenceProvider.getReference("EPSG:4978");
        this.map = new WebGLMap(domElement, {reference: REF_GEOCENTRIC});
    //    this.map.effects.starfield = false;
        this.map.effects.atmosphere = false;
    }

    public createLayers() {
        // Create Models
        const wmsModel = ModelFactory.createWMSModel(undefined);
        const elevationModel = ModelFactory.createLTSModel(undefined);
        const vectorModel = ModelFactory.createGeoJSONModel({url:"data/countries.json"});
        // Create Layers
        const WMSlayer = LayerFactory.createWMSLayer(wmsModel, undefined);
        const swissMap = LayerFactory.createFeatureLayer(vectorModel, undefined);
        const elevationLayer = LayerFactory.createLTSLayer(elevationModel, {label: "World Elevation"});
        // Insert Layers
        this.map.layerTree.addChild(WMSlayer, "bottom");
        this.map.layerTree.addChild(elevationLayer);
        this.map.layerTree.addChild(swissMap);
        // Add Grid
        const gridLayer = LayerFactory.createGrid();
        this.map.layerTree.addChild(gridLayer, "top");
    }

    public render() {
        return (
            <div ref={this.luciadmapref} className="LuciadMap"/>
        );
    }
}

export default LuciadMap;

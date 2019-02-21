import UrlStore from "luciad/model/store/UrlStore";

import FeatureModel from "luciad/model/feature/FeatureModel";
import FusionTileSetModel from "luciad/model/tileset/FusionTileSetModel";
import RasterDataType from "luciad/model/tileset/RasterDataType";
import RasterSamplingMode from "luciad/model/tileset/RasterSamplingMode";
import WMSTileSetModel from "luciad/model/tileset/WMSTileSetModel";
import ReferenceProvider from "luciad/reference/ReferenceProvider";

import ShapeFactory from "luciad/shape/ShapeFactory";



class ModelFactory {

    public createWMSModel(options: any) {
        if (typeof options === "undefined") { // If options == undefined use default WMS layer
            options = {
                getMapRoot: "https://sampleservices.luciad.com/wms",
                layers: ["4ceea49c-3e7c-4e2d-973d-c608fb2fb07e"],
                reference: ReferenceProvider.getReference("CRS:84"),
                transparent: false,
                version: "1.3.0"
            };
        }
        const wmsModel = new WMSTileSetModel(options);
        return wmsModel;
    }

    public createLTSModel(options: any) {
        const tileSetReference = ReferenceProvider.getReference("EPSG:4326");

        if (typeof options === "undefined") {// If options == undefined use default LTS layer
            options = {
                bounds: ShapeFactory.createBounds(tileSetReference, [-180, 360, -90, 180]),
                coverageId: "e8f28a35-0e8c-4210-b2e8-e5d4333824ec",
                dataType: RasterDataType.ELEVATION,
                level0Columns: 4,
                level0Rows: 2,
                levelCount: 24,
                reference: tileSetReference,
                samplingMode: RasterSamplingMode.POINT,
                tileHeight: 32,
                tileWidth: 32,
                url: "https://sampleservices.luciad.com/lts",
            };
        }
        const elevationModel = new FusionTileSetModel(options);
        return elevationModel;
    }


    public createGeoJSONModel (options: any) {
        const urlStore = new UrlStore({
            target: options.url
        });

        const model = new FeatureModel(urlStore);
        return model;
    }

}

export default new ModelFactory();

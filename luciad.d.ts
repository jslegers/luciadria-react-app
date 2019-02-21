declare namespace luciad {
  namespace error {
    class InvalidReferenceError {
      constructor(message?: string);
    }

    class InvalidXMLError {
      constructor(message?: string);
    }

    class NoBoundsError {
      constructor(message?: string);
    }

    class NotImplementedError {
      constructor(message?: string);
    }

    class OutOfBoundsError {
      constructor(message?: string);
    }

    class ProgrammingError {
      constructor(message?: string);
    }
  }

  namespace geodesy {
    import Point = luciad.shape.Point;
    import CoordinateReference = luciad.reference.CoordinateReference;

    class GeodesyFactory {
      static createCartesianGeodesy(ref: CoordinateReference): Geodesy;

      static createEllipsoidalGeodesy(ref: CoordinateReference): Geodesy;

      static createSphericalGeodesy(ref: CoordinateReference, earthRadius?: number): Geodesy;
    }

    abstract class Geodesy {
      reference: luciad.reference.CoordinateReference;

      area(shape: luciad.shape.Shape): number;

      distance(shape1: Point, shape2: Point, lineType?: LineType): number;

      distance3D(shape1: Point, shape2: Point): number;

      forwardAzimuth(point1: Point, point2: Point, lineType?: LineType): number;

      interpolate(startPoint: Point, endPoint: Point, fraction: number, lineType?: LineType): Point;
      interpolate(point: Point, distance: number, azimuth: number, lineType?: LineType): Point;

      shortestDistanceToLine(fromPoint: Point, linePointOne: Point, linePointTwo: Point,
                             options: { clipToSegment?: boolean }, resultPointSFCT: Point): number;
    }

    enum LineType {
      CONSTANT_BEARING,
      SHORTEST_DISTANCE
    }
  }

  namespace geometry {
    import CoordinateReference = luciad.reference.CoordinateReference;

    class TopologyFactory {

      static createCartesianTopology(reference: CoordinateReference): Topology;

      static createEllipsoidalTopology(reference: CoordinateReference): Topology;
    }

    abstract class Topology {
      calculateIntersections(shape0: luciad.shape.Shape, shape1: luciad.shape.Shape): {
        intersectionPoint: luciad.shape.Point,
        intersectionSegments: {
          shape: luciad.shape.Shape,
          points: luciad.shape.Point[]
        }[]
      }[];
    }

    namespace mesh {
      type Mesh = {};

      class MeshFactory {
        static create3DMesh(positions: number[], indices: number[], options?: {
          texCoords?: number[],
          image?: HTMLImageElement,
          colors?: number[],
          normals?: number[]
        }): Mesh;
      }
    }

    namespace constructive {
      import Shape = luciad.shape.Shape;

      interface ConstructiveGeometry {
        difference(shapes: Shape[]): Shape;

        intersection(shapes: Shape[]): Shape;

        union(shapes: Shape[]): Shape;
      }

      class ConstructiveGeometryFactory {
        static createCartesian(reference: CoordinateReference): ConstructiveGeometry;

        static createEllipsoidal(reference: CoordinateReference): ConstructiveGeometry;

        static createSpherical(reference: CoordinateReference): ConstructiveGeometry;
      }
    }
  }

  namespace model {

    interface Cursor {
      hasNext(): boolean;

      next(): luciad.model.feature.Feature;
    }

    interface Model extends luciad.reference.CoordinateReferenced {
      coordinateType: luciad.reference.CoordinateType;
      reference: luciad.reference.CoordinateReference;
      modelDescriptor: ModelDescriptor;
    }

    class ModelDescriptor {
      description: string;
      name: string;
      source: string;
      type: string;
    }

    namespace codec {
      type DecodeData = {
        content: any,
        contentType?: string,
        reference?: luciad.reference.CoordinateReference
      }

      type EncodeData = {
        content: string,
        contentType: string
      };

      interface Codec {
        decode(object: luciad.model.codec.DecodeData): luciad.model.Cursor;

        encode(cursor: luciad.model.Cursor): EncodeData;
      }

      class GeoJsonCodec implements Codec {
        constructor(options?: {
          mode3D?: boolean,
          generateIDs?: boolean
        });

        decode(object: luciad.model.codec.DecodeData): luciad.model.Cursor;

        encode(cursor: luciad.model.Cursor): EncodeData;
      }

      class GMLCodec implements Codec {
        constructor(options?: {});

        decode(object: luciad.model.codec.DecodeData): luciad.model.Cursor;

        encode(cursor: luciad.model.Cursor): EncodeData;
      }
    }

    namespace feature {
      import Store = luciad.model.store.Store;
      import Promise = luciad.util.Promise;

      class Feature {
        constructor(shape: luciad.shape.Shape, properties?: any, id?: number | string);

        id: string | number;
        properties: any;
        shape: luciad.shape.Shape;

        copy(): Feature;
      }

      class FeatureModel implements Model, luciad.util.Evented {
        bounds: luciad.shape.Bounds;
        coordinateType: luciad.reference.CoordinateType;
        modelDescriptor: ModelDescriptor;
        reference: luciad.reference.CoordinateReference;
        store: Store;

        constructor(store: Store, options?: {
          reference: luciad.reference.CoordinateReference,
          bounds?: luciad.shape.Bounds
        })

        //TODO model optional methods.  All but query() are only present if the underlying store has them
        query(query?: any, options?: any): Promise<Cursor> | Cursor;

        spatialQuery(bounds: luciad.shape.Bounds, query?: any): Promise<Cursor> | Cursor;

        get(id: number | string): Feature | Promise<Feature>;

        add(feature: luciad.model.feature.Feature, options?: any): string | number | Promise<string> | Promise<number>;

        put(feature: luciad.model.feature.Feature, options?: any): string | number | Promise<string> | Promise<number>;

        remove(id: number | string): string | number | Promise<string> | Promise<number>;

        on(event: string, callback: (...args: any[]) => any, context?: any, options?: any): luciad.util.RemoveHandle;

        emit(event: string, ...args: any[]): void;
      }
    }

    namespace image {
      import Bounds = luciad.shape.Bounds;
      import CoordinateReference = luciad.reference.CoordinateReference;
      import CoordinateType = luciad.reference.CoordinateType;

      abstract class RasterImageModel implements Model, luciad.shape.Bounded {
        bounds: luciad.shape.Bounds;
        coordinateType: CoordinateType;
        reference: CoordinateReference;
        modelDescriptor: ModelDescriptor;
      }

      class GoogleImageModel extends RasterImageModel {
        constructor(options?: {
          serviceUrl?: string,
          accountLimits?: {
            maxScale?: number,
            maxSize?: number[]
          },
          requestParameters?: any
        });
      }

      class WMSImageModel extends RasterImageModel {
        backgroundColor: string;
        dimensions: any;
        layers: string[];
        queryable: boolean;
        queryLayers: string[];
        requestParameters: any;
        sld: string;
        sldBody: string;
        styles: string[];
        transparent: boolean;

        constructor(options: {
          getMapRoot: string,
          layers: string[],
          version?: string,
          transparent?: boolean,
          backgroundColor?: string,
          bounds?: Bounds,
          reference?: CoordinateReference,
          queryLayers?: string[],
          styles?: string[],
          imageFormat?: string,
          infoFormat?: string,
          sld?: string,
          sldBody?: string,
          requestParameters?: any,
          dimensions?: any,
          credentials?: boolean
        });
      }
    }

    namespace kml {
      class KMLModel extends luciad.model.feature.FeatureModel {
        constructor(uri: string);
      }
    }

    namespace store {
      import Feature = luciad.model.feature.Feature;
      import Bounds = luciad.shape.Bounds;
      import RemoveHandle = luciad.util.RemoveHandle;
      import CoordinateReference = luciad.reference.CoordinateReference;
      import Codec = luciad.model.codec.Codec;
      import Promise = luciad.util.Promise;

      interface Store {
        query(query?: any, options?: any): Promise<Cursor> | Cursor;

        spatialQuery?(bounds: Bounds, query?: any, options?: any): Promise<Cursor> | Cursor;

        add?(feature: Feature, options?: any): number | string | Promise<number> | Promise<string>;

        get?(id: number | string, options?: any): Feature | Promise<Feature>;

        put?(feature: Feature, options?: any): number | string | Promise<number> | Promise<string>;
        
        remove?(id: number | string): boolean | Promise<boolean>;

        on?(event: string, callback: (...args: any[]) => any, context?: any, options?: any): luciad.util.RemoveHandle;

        emit?(event: string, ...args: any[]): void;
      }

      class MemoryStore implements Store {

        constructor(options?: {
          data?: Feature[]
        });

        query(query?: any, options?: any): Cursor;

        add(feature: Feature, options?: any): number | string;

        get(id: number | string, options?: any): Feature;

        put(feature: Feature, options?: any): number | string;

        remove(id: number | string): boolean;

        on(event: string, callback: (...args: any[]) => any, context?: any, options?: any): luciad.util.RemoveHandle;

        emit(event: string, ...args: any[]): void;

        remove(id: number | string): boolean;

        clear(): boolean;

        reload(): boolean;
      }

      interface HttpHeadersOption {
        [headerName: string]: string | number | boolean
      }

      interface WithSpecialHttpOptions {
        withCredentials?: boolean,
        requestHeaders?: HttpHeadersOption
      }

      class UrlStore implements Store {
        constructor(options: {
          target: string,
          accepts?: string,
          codec?: luciad.model.codec.Codec
        } & WithSpecialHttpOptions);

        query(query?: any, options?: any): Cursor | Promise<Cursor>;
      }

      type WFSFeatureStoreConstructorOptions = {
        serviceURL: string,
        typeName: string
        reference: CoordinateReference,
        codec?: Codec,
        outputFormat?: string,
        versions?: string[],
        methods?: string[]
      } & WithSpecialHttpOptions;

      type WFSFeatureStoreQueryParameters = {
        filter?: luciad.ogc.filter.OGCCondition | luciad.ogc.filter.Identifiers,
        maxFeatures?: number,
        propertyNames?: string[]
      };

      class WFSFeatureStore implements Store {
        constructor(options: WFSFeatureStoreConstructorOptions);

        query(query?: WFSFeatureStoreQueryParameters): Promise<Cursor> | Cursor;

        spatialQuery(bounds: Bounds, query?: WFSFeatureStoreQueryParameters): Promise<Cursor> | Cursor;
      }
    }

    namespace tileset {
      import Bounds = luciad.shape.Bounds;
      import Bounded = luciad.shape.Bounded;
      import Model = luciad.model.Model;
      import CoordinateType = luciad.reference.CoordinateType;
      import CoordinateReference = luciad.reference.CoordinateReference;
      import Promise = luciad.util.Promise;

      type TileCoordinate = {
        level: number,
        x: number,
        y: number
      }

      interface AttributedTileSet {
        getAttribution(grid: { level: number, x: number, y: number, width: number, height: number }): string[];

        getLogo(): string;
      }

      class BingMapsTileSetModel extends UrlTileSetModel implements AttributedTileSet {
        constructor(options: {
          brandLogoUri: string,
          culture: string,
          imageUrlSubdomains?: string[],
          imageryProviders?: any[]
        });

        getAttribution(grid: { level: number, x: number, y: number, width: number, height: number }): string[];

        getLogo(): string;
      }

      class FusionTileSetModel extends UrlTileSetModel {
        constructor(options: {
          reference: luciad.reference.CoordinateReference,
          bounds: luciad.shape.Bounds,
          url: string,
          coverageId: string,
          level0Columns: number,
          level0Rows: number
          tileWidth: number,
          tileHeight: number,
          dataType?: RasterDataType,
          samplingMode?: RasterSamplingMode
        });
      }

      enum RasterDataType {
        IMAGE,
        ELEVATION
      }

      enum RasterSamplingMode {
        POINT,
        AREA
      }

      class RasterTileSetModel implements Model, Bounded {
        bounds: Bounds;
        levelCount: number;
        coordinateType: CoordinateType;
        reference: CoordinateReference;
        modelDescriptor: ModelDescriptor;
        dataType: RasterDataType;
        samplingMode: RasterSamplingMode;

        constructor(options: {
          reference: CoordinateReference,
          bounds: Bounds,
          levelCount?: number,
          level0Columns?: number,
          level0Rows?: number,
          tileWidth?: number,
          tileHeight?: number,
          dataType?: RasterDataType,
          samplingMode?: RasterSamplingMode
        });

        getImage(tile: TileCoordinate, onSuccess: (tile: TileCoordinate, image: HTMLImageElement) => void,
                 onError: (tile: TileCoordinate, error: any) => void): void;

        getPixelDensity(level: number): number;

        getTileColumnCount(level: number): number;

        getTileHeight(level: number): number;

        getTileRowCount(level: number): number;

        getTileWidth(level: number): number;

        invalidate(): void;
      }

      class UrlTileSetModel extends RasterTileSetModel {
        baseUrl: string;
        bounds: Bounds;
        coordinateType: CoordinateType;
        modelDescriptor: ModelDescriptor;
        reference: CoordinateReference;
        subdomains: string[];

        constructor(options: {
          reference: CoordinateReference,
          bounds: Bounds,
          baseURL: string,
          credentials?: boolean,
          levelCount?: number,
          level0Columns?: number,
          level0Rows?: number,
          tileWidth?: number,
          tileHeight?: number,
          dataType?: RasterDataType,
          samplingMode?: RasterSamplingMode,
          subdomains?: string[]
        });

        getTileURL(baseURL: string, tile: TileCoordinate): string;
      }

      class WMSTileSetModel extends UrlTileSetModel {
        backgroundColor: string;
        dimensions: any;
        layers: string[];
        queryable: boolean;
        queryLayers: string[];
        requestParameters: any;
        sld: string;
        sldBody: string;
        styles: string[];
        transparent: boolean;

        constructor(options: {
          getMapRoot: string,
          layers: string[],
          version?: string,
          imageFormat?: string,
          transparent?: boolean,
          backgroundColor?: string,
          bounds?: Bounds,
          reference?: CoordinateReference,
          queryLayers?: string[],
          styles?: string[],
          infoFormat?: string,
          levelCount?: number,
          level0Columns?: number,
          level0Rows?: number,
          tileWidth?: number,
          tileHeight?: number,
          sld?: string,
          sldBody?: string,
          requestParameters?: any,
          dimensions?: any,
          credentials?: boolean
        });
      }

      class OGC3DTilesModelDescriptor extends luciad.model.ModelDescriptor {
        asset?: {
          version?: string,
          tilesetVersion?: string
        };
        properties?: {
          [propertyName: string]: {
            minimum?: number;
            maximum?: number;
          }
        };
      }

      class OGC3DTilesModel implements Model, Bounded {
        url: string;
        urlParams: string;
        coordinateType: luciad.reference.CoordinateType;
        reference: luciad.reference.CoordinateReference;
        modelDescriptor: OGC3DTilesModelDescriptor;
        bounds: luciad.shape.Bounds;

        constructor(options: {
          url: string;
          bounds: luciad.shape.Bounds;
        });

        static create(url: string): Promise<OGC3DTilesModel>;
      }
    }
  }

  namespace ogc {
    namespace filter {
      interface Expression {
      }

      interface OGCExpression extends Expression {
      }

      interface OGCCondition extends Expression {
      }

      interface Identifiers extends Expression {
      }

      // OGCExpressions
      interface OGCFunction extends OGCExpression {
      }

      interface Literal extends OGCExpression {
      }

      interface PropertyName extends OGCExpression {
      }

      interface BinaryOperator extends OGCExpression {
      }

      // OGCConditions
      interface NullOperator extends OGCCondition {
      }

      interface BboxOperator extends OGCCondition {
      }

      interface BetweenOperator extends OGCCondition {
      }

      interface IsLikeOperator extends OGCCondition {
      }

      interface NotOperator extends OGCCondition {
      }

      interface BinaryComparisonOperator extends OGCCondition {
      }

      interface AndOperator extends BinaryComparisonOperator {
      }

      interface OrOperator extends BinaryComparisonOperator {
      }

      enum MatchAction {
        ALL, ANY, ONE
      }

      class FilterFactory {
        static add(expression1: OGCExpression, expression2: OGCExpression): BinaryOperator;

        static and(condition1: OGCCondition, condition2: OGCCondition, ...args: OGCCondition[]): AndOperator;

        static bbox(bounds: luciad.shape.Bounds, geometryName?: PropertyName): BboxOperator;
        static bbox(minX: number, minY: number, maxX: number, maxY: number, srsName?: string,
                    geometryName?: PropertyName): BboxOperator;

        static between(expression: OGCExpression, lowerBounds: OGCExpression,
                       upperBounds: OGCExpression): BetweenOperator;

        static div(expression1: OGCExpression, expression2: OGCExpression): BinaryOperator;

        static eq(firstExpression: Expression, secondExpression: Expression, matchCase?: boolean,
                  matchAction?: MatchAction): BinaryComparisonOperator;

        static func(name: string, args?: Expression): OGCFunction;

        static gt(expression1: Expression, expression2: Expression, matchCase?: boolean,
                  matchAction?: MatchAction): BinaryComparisonOperator;

        static gte(expression1: Expression, expression2: Expression, matchCase?: boolean,
                   matchAction?: MatchAction): BinaryComparisonOperator;

        static identifiers(objectIds: number[] | string[], featureIds?: number[] | string[]): Identifiers;

        static isNull(expression: Expression): NullOperator;

        static like(propertyName: PropertyName, pattern: Literal, wildcard: string, singleChar: string, escape: string,
                    matchCase?: boolean): IsLikeOperator;

        static literal(value: string | number | boolean): Literal;

        static lt(expression1: Expression, expression2: Expression, matchCase?: boolean,
                  matchAction?: MatchAction): BinaryComparisonOperator;

        static lte(expression1: Expression, expression2: Expression, matchCase?: boolean,
                   matchAction?: MatchAction): BinaryComparisonOperator;

        static mul(expression1: OGCExpression, expression2: OGCExpression): BinaryOperator;

        static neq(expression1: Expression, expression2: Expression, matchCase?: boolean,
                   matchAction?: MatchAction): BinaryComparisonOperator;

        static not(expression: Expression): NotOperator;

        static or(condition1: OGCCondition, condition2: OGCCondition, ...args: OGCCondition[]): OrOperator;

        static property(propertyName: string, namespace?: any): PropertyName; //TODO namespace should really be a map of some kind, in an object literal
        static sub(expression1: OGCExpression, expression2: OGCExpression): BinaryOperator;

        static toFeaturePredicate(condition: OGCCondition | Identifiers): (feature: luciad.model.feature.Feature) => boolean;
      }
    }

    namespace se {
      import Promise = luciad.util.Promise;
      import FeaturePainter = luciad.view.feature.FeaturePainter;

      class SEPainterFactory {
        static createPainterFromString(seString: string, options?: { strict?: boolean }): Promise<FeaturePainter>;

        static createPainterFromURL(url: string, options?: { strict?: boolean }): Promise<FeaturePainter>;
      }
    }
  }

  namespace reference {
    class Axis {
      abbreviation: string;
      direction: Axis.Direction;
      maximumValue: number;
      minimumValue: number;
      rangeMeaning: Axis.RangeMeaning;
      unitOfMeasure: luciad.uom.UnitOfMeasure
    }

    module Axis {
      export enum Direction {
        NORTH,
        NORTH_NORTH_EAST,
        NORTH_EAST,
        EAST_NORTH_EAST,
        EAST,
        EAST_SOUTH_EAST,
        SOUTH_EAST,
        SOUTH_SOUTH_EAST,
        SOUTH,
        SOUTH_SOUTH_WEST,
        SOUTH_WEST,
        WEST_SOUTH_WEST,
        WEST,
        WEST_NORTH_WEST,
        NORTH_WEST,
        NORTH_NORTH_WEST,
        UP,
        DOWN,
        GEOCENTRIC_X,
        GEOCENTRIC_Y,
        GEOCENTRIC_Z,
        COLUMN_POSITIVE,
        COLUMN_NEGATIVE,
        ROW_POSITIVE,
        ROW_NEGATIVE,
        DISPLAY_RIGHT,
        DISPLAY_LEFT,
        DISPLAY_UP,
        DISPLAY_DOWN
      }

      export enum Name {
        X,
        Y,
        Z
      }

      export enum RangeMeaning {
        EXACT,
        WRAPAROUND
      }
    }

    class CoordinateReference {
      coordinateType: CoordinateType;
      identifier: string;
      name: string;

      equals(otherReference: CoordinateReference): boolean;

      getAxis(axisName: Axis.Name): Axis;
    }

    interface CoordinateReferenced {
      coordinateType: CoordinateType,
      reference: CoordinateReference
    }

    enum CoordinateType {
      CARTESIAN,
      GEODETIC
    }

    class ReferenceProvider {
      static supportedReferenceIdentifierPatterns: RegExp[];

      static addReference(reference: CoordinateReference, referenceId?: string): void;

      static createCartesianReference(options: {
        xUnitOfMeasure: luciad.uom.UnitOfMeasure,
        yUnitOfMeasure: luciad.uom.UnitOfMeasure,
        name?: string,
        identifier?: string
      }): CoordinateReference;

      static getHeightAboveTerrainReference(referenceIdentifier: string): CoordinateReference;

      static getReference(referenceName: string): CoordinateReference;

      static isValidReferenceIdentifier(referenceIdentifier: string): boolean;

      static parseWellKnownText(wktText: string, authorityName?: string, authorityCode?: string): CoordinateReference;
    }
  }

  namespace shape {
    import CoordinateReferenced = luciad.reference.CoordinateReferenced;
    import CoordinateType = luciad.reference.CoordinateType;
    import CoordinateReference = luciad.reference.CoordinateReference;

    abstract class Arc extends Shape {
      a: number;
      b: number;
      center: Point;
      endPoint: Point;
      rotationAzimuth: number;
      startAzimuth: number;
      startPoint: Point;
      sweepAngle: number;

      move2DToCoordinates(x: number, y: number): void;

      move2DToPoint(point: Point): void;
    }

    abstract class ArcBand extends Shape {
      center: Point;
      maxRadius: number;
      minRadius: number;
      startAzimuth: number;
      sweepAngle: number;

      move2DToCoordinates(x: number, y: number): void;

      move2DToPoint(point: Point): void;
    }

    abstract class Sector extends Shape {
      center: Point;
      radius: number;
      startAzimuth: number;
      sweepAngle: number;

      move2DToCoordinates(x: number, y: number): void;

      move2DToPoint(point: Point): void;
    }

    interface Bounded {
      bounds: Bounds;
    }

    abstract class Bounds extends Shape {
      depth: number;
      height: number;
      width: number;
      x: number;
      y: number;
      z: number;

      contains2DBounds(bounds: Bounds): boolean;

      contains3DBounds(bounds: Bounds): boolean;

      contains3DPoint(point: Point): boolean;

      interacts2D(bounds: Bounds): boolean;

      move2D(x: number, y: number): boolean;

      move2D(point: Point): void;

      move2DToCoordinates(x: number, y: number): void;

      move2DToPoint(point: Point): void;

      move3D(x: number, y: number, z: number): void;

      move3D(point: Point): void;

      move3DToCoordinates(x: number, y: number, z: number): void;

      move3DToPoint(point: Point): void;

      setTo2D(x: number, width: number, y: number, height: number): void;

      setTo2DIntersection(bounds: Bounds): void;

      setTo2DUnion(bounds: Bounds): void;

      setTo3D(x: number, width: number, y: number, height: number, z: number, depth: number): void;

      setTo3DIntersection(bounds: Bounds): void;

      setTo3DUnion(bounds: Bounds): void;

      setToBounds2D(bounds: Bounds): void;

      setToBounds3D(bounds: Bounds): void;

      setToIncludePoint2D(point: Point): void;

      setToIncludePoint3D(point: Point): void;

      translate(x: number, y: number, z?: number): void;

      translate3D(x: number, y: number, z: number): void;
    }

    abstract class Circle extends Shape {
      center: Point;
      radius: number;

      move2DToCoordinates(x: number, y: number): void;

      move2DToPoint(point: Point): void;
    }

    abstract class CircleBy3Points extends Circle {
      firstPoint: Point;
      radius: number;
      secondPoint: Point;
      thirdPoint: Point;

      moveFirstPoint2DToCoordinates(x: number, y: number): void;

      moveFirstPoint2DToPoint(point: Point): void;

      moveSecondPoint2DToCoordinates(x: number, y: number): void;

      moveSecondPoint2DToPoint(point: Point): void;

      moveThirdPoint2DToCoordinates(x: number, y: number): void;

      moveThirdPoint2DToPoint(point: Point): void;

      translateFirstPoint2D(x: number, y: number): void;

      translateSecondPoint2D(x: number, y: number): void;

      translateThirdPoint2D(x: number, y: number): void;
    }

    abstract class CircleByCenterPoint extends Circle {
      radius: number;
    }

    abstract class CircularArc extends Shape {
      center: Point;
      endPoint: Point;
      radius: number;
      startAzimuth: number;
      startPoint: Point;
      sweepAngle: number;

      move2DToCoordinates(x: number, y: number): void;

      move2DToPoint(point: Point): void;
    }

    abstract class CircularArcBy3Points extends CircularArc {
      intermediatePoint: Point;

      moveEndPoint2DToCoordinates(x: number, y: number): void;

      moveEndPoint2DToPoint(point: Point): void;

      moveIntermediatePoint2DToCoordinates(x: number, y: number): void;

      moveIntermediatePoint2DToPoint(point: Point): void;

      moveStartPoint2DToCoordinates(x: number, y: number): void;

      moveStartPoint2DToPoint(point: Point): void;

      translateEndPoint2D(aDeltaX: number, aDeltaY: number): void;

      translateIntermediatePoint2D(aDeltaX: number, aDeltaY: number): void;

      translateStartPoint(aDeltaX: number, aDeltaY: number): void;
    }

    abstract class CircularArcByBulge extends CircularArc {
      bulge: number;

      moveEndPoint2DToCoordinates(x: number, y: number): void;

      moveEndPoint2DToPoint(point: Point): void;

      moveStartPoint2DToCoordinates(x: number, y: number): void;

      maveStartPoint2DToPoint(point: Point): void;

      translateEndPoint2D(aDeltaX: number, aDeltaY: number): void;

      translateStartPoint2D(aDeltaX: number, aDeltaY: number): void;
    }

    abstract class CircularArcByCenterPoint extends CircularArc {

    }

    abstract class ComplexPolygon extends Shape {
      polygonCount: number;

      addPolygon(index: number, polygon: Polygon): void;
      addPolygon(polygon: Polygon): void;

      addPolygons(polygons: Polygon[]): void;

      clearPolygons(): void;

      equals(otherComplexPolygon: ComplexPolygon): boolean;

      getPolygon(index: number): Polygon;

      polygonChanged(polygonOrIndex: Polygon | number): void;

      removePolygon(polygonOrIndex: Polygon | number): void;

      setPolygon(index: number, polygon: Polygon): void;

      translate2D(x: number, y: number): void;
    }

    abstract class Ellipse extends Shape {
      a: number;
      b: number;
      center: Point;
      rotationAzimuth: number;

      move2DToCoordinates(x: number, y: number): void;

      move2DToPoint(point: Point): void;
    }

    enum EndCapStyle {
      CAP_BUTT,
      CAP_ROUND
    }

    abstract class ExtrudedShape extends Shape {
      static isSupportedBaseShape(shape: Shape): boolean;

      baseShape: Shape;
      maximumHeight: number;
      minimumHeight: number;
    }

    abstract class GeoBuffer extends Shape {
      static isSupportedBaseShape(shape: Shape): boolean;

      baseShape: Shape;
      maximumHeight: number;
      minimumHeight: number;
    }

    abstract class Point extends Shape {
      x: number;
      y: number;
      z: number;

      move2D(x: number, y: number): void;
      move2D(point: Point): void;

      move2DToCoordinates(x: number, y: number): void;

      move2DToPoint(point: Point): void;

      move3D(x: number, y: number, z: number): void;
      move3D(point: Point): void;

      move3DToCoordinates(x: number, y: number, z: number): void;

      move3DToPoint(point: Point): void;

      translate(x: number, y: number, z?: number): void;

      translate3D(x: number, y: number, z: number): void;
    }

    abstract class Polygon extends Shape {
      pointCount: number;

      getPoint(index: number): Point;

      insertPoint(index: number, point: Point): void;

      isValid(): boolean;

      move2DPoint(index: number, x: number, y: number): void;

      move3DPoint(index: number, x: number, y: number, z: number): void;

      removePoint(index: number): void;

      translate(x: number, y: number, z?: number): void;

      translate3D(x: number, y: number, z: number): void;

      translatePoint(index: number, x: number, y: number, z?: number): void;
    }

    abstract class Polyline extends Shape {
      pointCount: number;

      getPoint(index: number): Point;

      insertPoint(index: number, point: Point): void;

      move2DPoint(index: number, x: number, y: number): void;

      move3DPoint(index: number, x: number, y: number, z: number): void;

      removePoint(index: number): void;

      translate(x: number, y: number, z?: number): void;

      translate3D(x: number, y: number, z: number): void;

      translatePoint(index: number, x: number, y: number, z?: number): void;
    }

    abstract class Shape implements Bounded, CoordinateReferenced {
      bounds: Bounds;
      coordinateType: CoordinateType;
      focusPoint: Point;
      reference: CoordinateReference;
      type: ShapeType;

      contains2DCoordinates(x: number, y: number): boolean;

      contains2DPoint(point: Point): boolean;

      copy(): Shape;

      equals(otherShape: Shape): boolean;

      toString(): string;

      translate2D(x: number, y: number): void;
    }

    class ShapeFactory {
      static createArc(reference: CoordinateReference, center: Point, a: number, b: number, rotationAzimuth: number,
                       startAzimuth: number, sweepAngle: number): Arc;

      static createArcBand(reference: CoordinateReference, center: Point, minRadius: number, maxRadius: number,
                           startAzimuth: number, sweepAngle: number): ArcBand;

      static createSector(reference: CoordinateReference, center: Point, radius: number,
                          startAzimuth: number, sweepAngle: number): Sector;

      static createBounds(reference: CoordinateReference, coords: number[]): Bounds;

      static createCircleBy3Points(reference: CoordinateReference, point1: Point, point2: Point,
                                   point3: Point): CircleBy3Points;

      static createCircleByCenterPoint(reference: CoordinateReference, center: Point,
                                       radius: number): CircleByCenterPoint;

      static createCircularArcBy3Points(reference: CoordinateReference, startPoint: Point, intermediatePoint: Point,
                                        endPoint: Point): CircularArcBy3Points;

      static createCircularArcByBulge(reference: CoordinateReference, startPoint: Point, endPoint: Point,
                                      bulge: number): CircularArcByBulge;

      static createCircularArcByCenterPoint(reference: CoordinateReference, center: Point, radius: number,
                                            startAzimuth: number, sweepAngle: number): CircularArcByCenterPoint;

      static createComplexPolygon(reference: CoordinateReference, polygons: Polygon[]): ComplexPolygon;

      static createExtrudedShape(ref: CoordinateReference, shape: Shape, min: number, max: number): ExtrudedShape;

      static createEllipse(reference: CoordinateReference, center: Point, a: number, b: number,
                           rotationAzimuth: number): Ellipse;

      static createGeoBuffer(reference: CoordinateReference, baseShape: Shape, width: number): GeoBuffer;

      static createPoint(ref: CoordinateReference, coords: number[]): Point;

      static createPolygon(ref: CoordinateReference, points: Point[]): Polygon;

      static createPolyline(ref: CoordinateReference, points: Point[]): Polyline;

      static createShape(shapeType: ShapeType, reference: CoordinateReference): Shape;

      static createShapeList(ref: CoordinateReference, shapeList: Shape[]): ShapeList;
    }

    abstract class ShapeList extends Shape {
      shapeCount: number;

      addShape(index: number, shape: Shape): void;
      addShape(shape: Shape): void;

      equals(shapelist: ShapeList): boolean;

      getShape(index: number): Shape;

      removeShape(index: number): void;

      translate2D(x: number, y: number): void;
    }

    enum ShapeType {
      ARC,
      ARC_BAND,
      BOUNDS,
      CIRCLE,
      CIRCLE_BY_3_POINTS,
      CIRCLE_BY_CENTER_POINT,
      CIRCULAR_ARC,
      CIRCULAR_ARC_BY_3_POINTS,
      CIRCULAR_ARC_BY_BULGE,
      CIRCULAR_ARC_BY_CENTER_POINT,
      COMPLEX_POLYGON,
      ELLIPSE,
      EXTRUDED_SHAPE,
      GEO_BUFFER,
      POINT,
      POLYGON,
      POLYLINE,
      SECTOR,
      SHAPE_LIST
    }

    module ShapeType {
      export function contains(shapeType: ShapeType, expectedType: ShapeType): boolean;
    }

    namespace format {

      class LonLatPointFormat {
        constructor(options?: { pattern?: string, decimalSeparator?: string });

        format(longitude: number, latitude: number): string;
        format(point: Point): string;

        formatLat(latitude: number): string;

        formatLon(longitude: number): string;
      }

      class MGRSPointFormat {
        constructor(options?: {
          precision?: MGRSPointFormat.Precision,
          coordinateSeparator?: string,
          zoneSeparator?: string,
          formatType: MGRSPointFormat.Type
        });

        format(point: Point): string;
        format(longitude: number, latitude: number): string;
      }

      module MGRSPointFormat {
        export enum Precision {
          PRECISION_1000KM,
          PRECISION_100KM,
          PRECISION_100M,
          PRECISION_10KM,
          PRECISION_10M,
          PRECISION_1KM,
          PRECISION_1M,
          PRECISION_GRID_ZONE
        }

        export enum Type {
          MGRS,
          UTM_UPS
        }
      }
    }
  }

  namespace symbology {
    import CoordinateReference = luciad.reference.CoordinateReference;
    import Shape = luciad.shape.Shape;
    import ShapeType = luciad.shape.ShapeType;
    import Promise = luciad.util.Promise;

    interface HierarchicalSymbology {
      name: string;
      symbologyRoot: SymbologyNode;

      getSymbologyNode(code: string): SymbologyNode;
    }

    interface SymbologyNode {
      children: SymbologyNode[];
      code: string;
      maximumPointCount: number;
      minimumPointCount: number;
      name: string;
      parent: SymbologyNode;

      createTemplate(reference: CoordinateReference, x: number, y: number, size: number): Shape;

      supportsShapeType(shapeType: ShapeType): boolean;
    }

    class SymbologyProvider {
      static getSymbology(identifier: string): Promise<HierarchicalSymbology>;
    }

    namespace military {
      import Feature = luciad.model.feature.Feature;
      import FeaturePainter = luciad.view.feature.FeaturePainter;

      interface TextModifiers {
        additionalInformation?: string,
        altitudeDepth?: string,
        capacity?: string,
        combatEffectiveness?: string,
        commonIdentifier?: string,
        country?: string,
        dateTimeGroup?: string,
        effectiveTime?: string,
        evaluationRating?: string,
        headquartersElement?: string,
        higherFormation?: string,
        hostile?: string,
        iFFSIF?: string,
        installationComposition?: string,
        locationLabel?: string,
        movementDirection?: string,
        name?: string,
        namedHeadquarters?: string,
        platformType?: string,
        positionAndMovement?: string,
        quantity?: string,
        quantityOfEquipment?: string,
        reinforcedOrReduced?: string,
        signatureEquipment?: string,
        speedLabel?: string,
        staffComments?: string,
        teardownTime?: string,
        trackNumber?: string,
        typeLabel?: string,
        typeOfEquipment?: string,
        uniqueDesignation?: string
      }

      interface Modifiers {
        affiliation?: string;
        country?: string;
        echelon?: string;
        orderOfBattle?: string;
        sector1?: string;
        sector2?: string;
        standardIdentity1?: string;
        standardIdentity2?: string;
        status?: string;
      }

      type AllModifiers = Modifiers & TextModifiers;

      class MilitarySymbol implements Modifiers, TextModifiers {
        constructor(symbology: HierarchicalSymbology, code: string, textModifiers?: TextModifiers);

        //textmodifiers
        additionalInformation: string;
        altitudeDepth: string;
        capacity: string;
        combatEffectiveness: string;
        commonIdentifier: string;
        dateTimeGroup: string;
        effectiveTime: string;
        evaluationRating: string;
        headquartersElement: string;
        higherFormation: string;
        hostile: string;
        iFFSIF: string;
        installationComposition: string;
        locationLabel: string;
        movementDirection: string;
        name: string;
        namedHeadquarters: string;
        platformType: string;
        positionAndMovement: string;
        quantity: string;
        quantityOfEquipment: string;
        reinforcedOrReduced: string;
        signatureEquipment: string;
        speedLabel: string;
        staffComments: string;
        teardownTime: string;
        trackNumber: string;
        typeLabel: string;
        typeOfEquipment: string;
        uniqueDesignation: string;

        code: string;
        textModifiers: TextModifiers;

        affiliation: string;
        country: string;
        echelon: string;
        orderOfBattle: string;
        sector1: string;
        sector2: string;
        standardIdentity1: string;
        standardIdentity2: string;
        status: string;

        copyAndChangeCode(code: string): MilitarySymbol;

        possibleValues(modifier: string): string[];
      }

      type AffiliationColorMap = {
        Undefined?: string,
        Pending?: string,
        Unknown?: string,
        "Assumed Friend"?: string,
        Friend?: string,
        Neutral?: string,
        Suspect?: string,
        Hostile?: string,
        "Exercise Pending"?: string,
        "Exercise Unknown"?: string,
        "Exercise Assumed Friend"?: string,
        "Exercise Friend"?: string,
        "Exercise Neutral"?: string,
        Joker?: string,
        Faker?: string,
        "Assumed Neutral"?: string,
        "Exercise Assumed Neutral"?: string
      };

      type MilSymStyle = {
        iconSize?: number,
        selectionColor?: string,
        affiliationColor?: AffiliationColorMap,
        lineWidth?: number,
        draped?: boolean
      }

      class MilitarySymbologyPainter extends FeaturePainter {
        constructor(symbology: HierarchicalSymbology, options: {
          codeFunction?: ((f: Feature) => string) | string,
          modifiers?: ((f: Feature) => AllModifiers) | AllModifiers,
          style?: (f: Feature) => MilSymStyle,
          width?: number,
          symbologyServicePath?: string,
          symbologyServiceOptions?: {
            credentials?: boolean
          }
        });
      }
    }
  }

  namespace transformation {
    import Point = luciad.shape.Point;
    import Bounds = luciad.shape.Bounds;
    import CoordinateReference = luciad.reference.CoordinateReference;

    class Transformation {
      transform(inputPoint: Point, outputPointSFCT?: Point): Point;

      transformBounds(inputBounds: Bounds, outputBoundsSFCT?: Bounds): Bounds;
    }

    enum LocationMode {
      TERRAIN,
      CLOSEST_SURFACE
    }

    class TransformationFactory {
      static createTransformation(sourceReference: CoordinateReference,
                                  destinationReference: CoordinateReference): Transformation;

      static isTransformationRequired(sourceReference: CoordinateReference,
                                      destinationReference: CoordinateReference): boolean
    }
  }

  namespace uom {
    class QuantityKind {
      name: string;
      baseQuantityKind: QuantityKind;
      generalization: QuantityKind;

      isSubTypeOf(quantityKind: QuantityKind): boolean;
    }

    class QuantityKindRegistry {
      static getQuantityKind(name: string): QuantityKind;

      static registerQuantityKind(name: string, generalization: string): QuantityKind;
    }

    class UnitOfMeasure {
      conversionMultiplier: number;
      conversionOffset: number;
      name: string;
      quantityKind: QuantityKind;
      standardUnitOfMeasure: UnitOfMeasure;
      symbol: string;

      convertFromStandard(value: number): number;

      convertToStandard(value: number): number;

      convertToUnit(value: number, unit: UnitOfMeasure): number;
    }

    class UnitOfMeasureRegistry {
      static getUnitOfMeasure(name: string): UnitOfMeasure;

      static registerConversionUnit(name: string, symbol: string, quantityKindName: string,
                                    conversionMultiplier: number, conversionOffset: number): UnitOfMeasure;

      static registerStandardUnit(name: string, symbol: string, quantityKindName: string): UnitOfMeasure;
    }
  }

  namespace util {
    class ColorMap {
      static createGradientColorMap(levelsToColorMapping: { level: number, color: string }[]): ColorMap;

      static createPiecewiseConstantColorMap(levelsToColorMapping: { level: number, color: string }[]): ColorMap;
    }

    class Evented {
      emit(event: string, ...args: any[]): void;

      on(event: string, callback: (...args: any[]) => any, context?: any, options?: any): RemoveHandle;

      static on(target: Evented, event: string, callback: (...args: any[]) => any, context?: any,
                options?: any): RemoveHandle;

      static emit(target: Evented, event: string, ...args: any[]): void;
    }

    class License {
      static setLicenseText(licenseText: string): void;

      static loadLicenseFromUrl(url: string): Promise<string>;
    }

    interface RemoveHandle {
      remove(): void;
    }

    interface Thenable<T> {
      then<U>(onFulfilled?: (value: T) => U | Thenable<U>, onRejected?: (error: any) => U | Thenable<U>): Thenable<U>;

      then<U>(onFulfilled?: (value: T) => U | Thenable<U>, onRejected?: (error: any) => void): Thenable<U>;

      catch<U>(onRejected?: (error: any) => U | Thenable<U>): Thenable<U>;
    }

    class Promise<T> implements Thenable<T> {
      constructor(callback: (resolve: (value?: T | Thenable<T>) => void, reject: (error?: any) => void) => void);

      cancel(): void;

      catch<U>(onRejected?: (error: any) => U | Thenable<U>): Promise<U>;

      static all(array: Promise<any>[]): Promise<any>;

      static race(array: Promise<any>[]): Promise<any>;

      static resolve<V>(value: V): Promise<V>;

      static reject(reason: any): Promise<any>;

      static isPromise(promiseOrValue: any): boolean;

      then<U>(resolvedCallback?: (value: T) => U | Thenable<U>, errorCallback?: (error: any) => U | Thenable<U>,
              progressCallback?: (value: any) => any): Promise<U>;
      then<U>(resolvedCallback?: (value: T) => U | Thenable<U>, errorCallback?: (error: any) => void,
              progressCallback?: (value: any) => any): Promise<U>;

      static when<T, U>(promiseOrValue: T | Thenable<T>, resolvedCallback?: (value: T) => U | Thenable<U>,
                        errorCallback?: (error: any) => U | Thenable<U>,
                        progressCallback?: (progress: any) => any): Promise<U>;
      static when<T, U>(promiseOrValue: T | Thenable<T>, resolvedCallback?: (value: T) => U | Thenable<U>,
                        errorCallback?: (error: any) => any, progressCallback?: (progress: any) => any): Promise<U>;

      static all<T>(promises: Promise<T>[]): Promise<T>;

      static isPromise(promiseOrValue: any): boolean;

      static race<T>(promises: Promise<T>[]): Promise<T>;

      static resolve<T>(value?: T): Promise<T>;

      static reject<T>(reason?: any): Promise<T>;
    }

    namespace expression {
      import ParameterizedPointStyle = luciad.view.style.ParameterizedPointStyle;
      import Point = luciad.shape.Point;

      class Expression<T> {
        private resolve(): any;
      }

      class ParameterExpression<T> extends Expression<T> {
        value: T;
      }

      class CaseExpression<T> extends Expression<T> {
        when(test: Expression<boolean>): CaseTestExpression<T>;
      }

      class CaseTestExpression<T> extends Expression<T> {
        then(result: Expression<T>): CaseExpression<T>;
      }

      //simple place holder to be able to make Color Expressions
      type Color = string;

      interface PointType {
        x: number,
        y: number,
        z: number,
      }

      class ExpressionFactory {
        static acos(operand: Expression<number>): Expression<number>;
        static acos(operand: Expression<PointType>): Expression<PointType>;
        static acos(operand: Expression<Color>): Expression<Color>;

        static add(left: Expression<number>, right: Expression<number>): Expression<number>;
        static add(left: Expression<number>, right: Expression<PointType>): Expression<PointType>;
        static add(left: Expression<PointType>, right: Expression<number>): Expression<PointType>;
        static add(left: Expression<number>, right: Expression<Color>): Expression<Color>;
        static add(left: Expression<Color>, right: Expression<number>): Expression<Color>;

        static and(...args: Expression<boolean>[]): Expression<boolean>;

        static asin(operand: Expression<number>): Expression<number>;
        static asin(operand: Expression<PointType>): Expression<PointType>;
        static asin(operand: Expression<Color>): Expression<Color>;

        static atan(operand: Expression<number>): Expression<number>;
        static atan(operand: Expression<PointType>): Expression<PointType>;
        static atan(operand: Expression<Color>): Expression<Color>;

        static attribute(name: string): Expression<number>;

        static between(operand: Expression<number>, lowerBound: Expression<number>,
                       upperBound: Expression<number>): Expression<boolean>;

        static boolean(value: boolean): Expression<boolean>;

        static booleanParameter(value: boolean): ParameterExpression<boolean>;

        static cases(defaultExpression: Expression<number>): CaseExpression<number>;
        static cases(defaultExpression: Expression<PointType>): CaseExpression<PointType>;
        static cases(defaultExpression: Expression<Color>): CaseExpression<Color>;
        static cases(defaultExpression: Expression<boolean>): CaseExpression<boolean>;

        static clamp(operand: Expression<number>, lowerBound: Expression<number>,
                     upperBound: Expression<number>): Expression<number>;
        static clamp(operand: Expression<PointType>, lowerBound: Expression<PointType>,
                     upperBound: Expression<PointType>): Expression<PointType>;
        static clamp(operand: Expression<PointType>, lowerBound: Expression<number>,
                     upperBound: Expression<number>): Expression<PointType>;
        static clamp(operand: Expression<Color>, lowerBound: Expression<Color>,
                     upperBound: Expression<Color>): Expression<Color>;
        static clamp(operand: Expression<Color>, lowerBound: Expression<number>,
                     upperBound: Expression<number>): Expression<Color>;

        static color(value: string): Expression<Color>;

        static colorParameter(value: Color): ParameterExpression<Color>;

        static cos(operand: Expression<number>): Expression<number>;
        static cos(operand: Expression<PointType>): Expression<PointType>;
        static cos(operand: Expression<Color>): Expression<Color>;

        static crossProduct(first: Expression<PointType>, second: Expression<PointType>): Expression<PointType>;

        static distance(first: Expression<number>, second: Expression<number>): Expression<number>;
        static distance(first: Expression<PointType>, second: Expression<PointType>): Expression<number>;
        static distance(first: Expression<Color>, second: Expression<Color>): Expression<number>;

        static divide(left: Expression<number>, right: Expression<number>): Expression<number>;
        static divide(left: Expression<number>, right: Expression<PointType>): Expression<PointType>;
        static divide(left: Expression<PointType>, right: Expression<number>): Expression<PointType>;
        static divide(left: Expression<number>, right: Expression<Color>): Expression<Color>;
        static divide(left: Expression<Color>, right: Expression<number>): Expression<Color>;

        static dotProduct(first: Expression<number>, second: Expression<number>): Expression<number>;
        static dotProduct(first: Expression<PointType>, second: Expression<PointType>): Expression<PointType>;
        static dotProduct(first: Expression<Color>, second: Expression<Color>): Expression<Color>;

        static eq(left: Expression<number>, right: Expression<number>): Expression<boolean>;
        static eq(left: Expression<PointType>, right: Expression<PointType>): Expression<boolean>;
        static eq(left: Expression<Color>, right: Expression<Color>): Expression<boolean>;
        static eq(left: Expression<boolean>, right: Expression<boolean>): Expression<boolean>;

        static false(): Expression<boolean>;

        static fraction(operand: Expression<PointType>, lowerBound: Expression<number>,
                        upperBound: Expression<number>): Expression<PointType>;
        static fraction(operand: Expression<PointType>, lowerBound: Expression<number>,
                        upperBound: Expression<PointType>): Expression<PointType>;
        static fraction(operand: Expression<PointType>, lowerBound: Expression<PointType>,
                        upperBound: Expression<number>): Expression<PointType>;
        static fraction(operand: Expression<Color>, lowerBound: Expression<number>,
                        upperBound: Expression<number>): Expression<Color>;
        static fraction(operand: Expression<Color>, lowerBound: Expression<number>,
                        upperBound: Expression<Color>): Expression<Color>;
        static fraction(operand: Expression<Color>, lowerBound: Expression<Color>,
                        upperBound: Expression<number>): Expression<Color>;
        static fraction(operand: Expression<number>, lowerBound: Expression<number>,
                        upperBound: Expression<number>): Expression<number>;
        static fraction(operand: Expression<number>, lowerBound: Expression<number>,
                        upperBound: Expression<PointType>): Expression<PointType>;
        static fraction(operand: Expression<number>, lowerBound: Expression<PointType>,
                        upperBound: Expression<number>): Expression<PointType>;
        static fraction(operand: Expression<number>, lowerBound: Expression<number>,
                        upperBound: Expression<Color>): Expression<Color>;
        static fraction(operand: Expression<number>, lowerBound: Expression<Color>,
                        upperBound: Expression<number>): Expression<Color>;

        static gt(left: Expression<number>, right: Expression<number>): Expression<boolean>;

        static gte(left: Expression<number>, right: Expression<number>): Expression<boolean>;

        static icon(parameterizedPointStyle: ParameterizedPointStyle): Expression<ParameterizedPointStyle>;

        static ifThenElse(ifExpression: Expression<boolean>, thenExpression: Expression<number>,
                          elseExpression: Expression<number>): Expression<number>;
        static ifThenElse(ifExpression: Expression<boolean>, thenExpression: Expression<PointType>,
                          elseExpression: Expression<PointType>): Expression<PointType>;
        static ifThenElse(ifExpression: Expression<boolean>, thenExpression: Expression<Color>,
                          elseExpression: Expression<Color>): Expression<Color>;
        static ifThenElse(ifExpression: Expression<boolean>, thenExpression: Expression<boolean>,
                          elseExpression: Expression<boolean>): Expression<boolean>;

        static lt(left: Expression<number>, right: Expression<number>): Expression<boolean>;

        static lte(left: Expression<number>, right: Expression<number>): Expression<boolean>;

        static map(indexExpression: Expression<number>, values: Expression<number>[],
                   defaultExpression: Expression<number>): Expression<number>;
        static map(indexExpression: Expression<number>, values: Expression<PointType>[],
                   defaultExpression: Expression<PointType>): Expression<PointType>;
        static map(indexExpression: Expression<number>, values: Expression<Color>[],
                   defaultExpression: Expression<Color>): Expression<Color>;
        static map(indexExpression: Expression<number>, values: Expression<boolean>[],
                   defaultExpression: Expression<boolean>): Expression<boolean>;

        static max(first: Expression<number>, second: Expression<number>): Expression<number>;
        static max(first: Expression<PointType>, second: Expression<number>): Expression<PointType>;
        static max(first: Expression<Color>, second: Expression<number>): Expression<Color>;

        static min(first: Expression<number>, second: Expression<number>): Expression<number>;
        static min(first: Expression<PointType>, second: Expression<number>): Expression<PointType>;
        static min(first: Expression<Color>, second: Expression<number>): Expression<Color>;

        static mix(first: Expression<number>, second: Expression<number>,
                   third: Expression<number>): Expression<number>;
        static mix(first: Expression<PointType>, second: Expression<PointType>,
                   third: Expression<PointType>): Expression<PointType>;
        static mix(first: Expression<PointType>, second: Expression<PointType>,
                   third: Expression<number>): Expression<PointType>;
        static mix(first: Expression<Color>, second: Expression<Color>, third: Expression<Color>): Expression<Color>;
        static mix(first: Expression<Color>, second: Expression<Color>, third: Expression<number>): Expression<Color>;

        static mixmap(fraction: Expression<number>, values: Expression<number>[]): Expression<number>;
        static mixmap(fraction: Expression<number>, values: Expression<PointType>[]): Expression<PointType>;
        static mixmap(fraction: Expression<number>, values: Expression<Color>[]): Expression<Color>;

        static multiply(left: Expression<number>, right: Expression<number>): Expression<number>;
        static multiply(left: Expression<number>, right: Expression<PointType>): Expression<PointType>;
        static multiply(left: Expression<PointType>, right: Expression<number>): Expression<PointType>;
        static multiply(left: Expression<number>, right: Expression<Color>): Expression<Color>;
        static multiply(left: Expression<Color>, right: Expression<number>): Expression<Color>;

        static neq(left: Expression<number>, right: Expression<number>): Expression<boolean>;
        static neq(left: Expression<PointType>, right: Expression<PointType>): Expression<boolean>;
        static neq(left: Expression<Color>, right: Expression<Color>): Expression<boolean>;
        static neq(left: Expression<boolean>, right: Expression<boolean>): Expression<boolean>;

        static not(operand: Expression<boolean>): Expression<boolean>;

        static number(value: number): Expression<number>;

        static numberParameter(value: number): ParameterExpression<number>;

        static or(...args: Expression<boolean>[]): Expression<boolean>;

        static point(value: PointType): Expression<PointType>;

        static pointParameter(value: PointType): ParameterExpression<PointType>;

        static positionAttribute(): Expression<PointType>;

        static pow(first: Expression<number>, second: Expression<number>): Expression<number>;
        static pow(first: Expression<PointType>, second: Expression<PointType>): Expression<PointType>;
        static pow(first: Expression<Color>, second: Expression<Color>): Expression<Color>;

        static sin(operand: Expression<number>): Expression<number>;
        static sin(operand: Expression<PointType>): Expression<PointType>;
        static sin(operand: Expression<Color>): Expression<Color>;

        static subtract(left: Expression<number>, right: Expression<number>): Expression<number>;
        static subtract(left: Expression<number>, right: Expression<PointType>): Expression<PointType>;
        static subtract(left: Expression<PointType>, right: Expression<number>): Expression<PointType>;
        static subtract(left: Expression<number>, right: Expression<Color>): Expression<Color>;
        static subtract(left: Expression<Color>, right: Expression<number>): Expression<Color>;

        static tan(operand: Expression<number>): Expression<number>;
        static tan(operand: Expression<PointType>): Expression<PointType>;
        static tan(operand: Expression<Color>): Expression<Color>;

        static true(): Expression<boolean>;
      }

    }
  }

  namespace view {
    import Evented = luciad.util.Evented;
    import RemoveHandle = luciad.util.RemoveHandle;
    import Point = luciad.shape.Point;
    import Bounds = luciad.shape.Bounds;
    import CoordinateReference = luciad.reference.CoordinateReference;
    import Bounded = luciad.shape.Bounded;
    import Model = luciad.model.Model;
    import Controller = luciad.view.controller.Controller;
    import Transformation = luciad.transformation.Transformation;
    import GestureEvent = luciad.view.input.GestureEvent;
    import Feature = luciad.model.feature.Feature;
    import Shape = luciad.shape.Shape;
    import FeatureLayer = luciad.view.feature.FeatureLayer;
    import Promise = luciad.util.Promise;
    import Expression = luciad.util.expression.Expression;
    import Color = luciad.util.expression.Color;
    import ParameterizedPointStyle = luciad.view.style.ParameterizedPointStyle;

    type BalloonContentProvider = (obj: any) => string | HTMLElement;

    type ContextMenuItem = {
      id?: ContextMenu.Identifier | string,
      label: string,
      action: () => void,
      iconClass?: string,
      checked?: boolean,
      separator?: boolean
    };

    interface ContextMenu {
      items: ContextMenuItem[];
      title: string,

      addItem(item: ContextMenuItem): void;

      addSeparator(): void;
    }

    module ContextMenu {
      export enum Identifier {
        CANCEL_ID,
        DELETE_POINT_ID
      }
    }

    interface GraphicsEffects {
      light: LightEffect,
      atmosphere: boolean,
      starfield: boolean
    }

    interface GetFeatureInfo {
      text: string;
      status: string;

      getHeader(name: string): string;
    }

    interface MapConfig {
      reference?: luciad.reference.CoordinateReference | string,
      axes?: {
        xAxis?: axis.AxisConfiguration,
        yAxis?: axis.AxisConfiguration
      },
      border?: {
        left?: number,
        bottom?: number
      }
    }

    type PickInfo = {
      objects: Feature[],
      layer: luciad.view.Layer
    };

    interface LayerConstructorOptions {
      id?: string,
      label?: string,
      layerType?: LayerType,
      visible?: boolean,
      editable?: boolean,
      minScale?: number,
      maxScale?: number,
    }

    type RasterStyle = {
      alpha?: number
    };

    class Layer extends LayerTreeNode {
      balloonContentProvider: BalloonContentProvider;
      editable: boolean;
      model: Model;
      scaleRange: { min: number, max: number };
      type: LayerType;
      getModelBoundsVisibleOnMap: Bounds;

      onClick(object: any): boolean;

      onCreateContextMenu(contextMenu: ContextMenu, map: Map, contextMenuInfo: any): void;
    }

    interface LayerGroupOptions {
      label?: string;
    }

    class LayerGroup extends LayerTreeNode {
      constructor(options?: LayerGroupOptions);

      addChild(node: LayerTreeNode, position?: "top" | "bottom" | "above" | "below", positionReference?: LayerTreeNode,
               noEvent?: boolean): void;

      canAddChild(node: LayerTreeNode, position?: "top" | "bottom" | "above" | "below",
                  positionReference?: LayerTreeNode): boolean;

      canMoveChild(node: LayerTreeNode, position?: "top" | "bottom" | "above" | "below",
                   positionReference?: LayerTreeNode): boolean;

      moveChild(node: LayerTreeNode, position?: "top" | "bottom" | "above" | "below", positionReference?: LayerTreeNode,
                noEvent?: boolean): void;

      removeAllChildren(): void;

      removeChild(layerTreeNode: LayerTreeNode, noEvent?: boolean): void;
    }

    class LayerTree extends LayerGroup {
    }

    class LayerTreeNode implements Evented {
      children: LayerTreeNode[];
      id: string;
      label: string;
      parent: LayerGroup;
      map: Map;
      supportedPaintRepresentations: PaintRepresentation[];
      visible: boolean;
      visibleInTree: boolean;
      treeNodeType: LayerTreeNodeType;

      accept(visitor: LayerTreeVisitor): LayerTreeVisitor.ReturnValue;

      isPaintRepresentationSupported(paintRepresentation: PaintRepresentation): boolean;

      isPaintRepresentationVisible(paintRepresentation: PaintRepresentation): boolean;

      isPaintRepresentationVisibleInTree(paintRepresentation: PaintRepresentation): boolean;

      setPaintRepresentationVisible(paintRepresentation: PaintRepresentation, visible: boolean): void;

      setPaintRepresentationVisibleInTree(paintRepresentation: PaintRepresentation, visible: boolean): void;

      visitChildren(visitor: LayerTreeVisitor, order: LayerTreeNode.VisitOrder): void;

      findLayerById(id: string): Layer | undefined;

      findLayerGroupById(id: string): LayerGroup | undefined;

      findLayerTreeNodeById(id: string): LayerTreeNode | undefined;

      whenReady(): Promise<void>;

      on(event: string, callback: (...args: any[]) => any, context?: any, options?: any): RemoveHandle;

      emit(event: string, ...args: any[]): void;
    }

    module LayerTreeNode {
      export enum VisitOrder {
        BOTTOM_UP,
        TOP_DOWN
      }
    }

    enum LayerTreeNodeType {
      LAYER,
      LAYER_GROUP
    }

    interface LayerTreeVisitor {
      visitLayer(layer: Layer): LayerTreeVisitor.ReturnValue

      visitLayerGroup(layerGroup: LayerGroup): LayerTreeVisitor.ReturnValue
    }

    module LayerTreeVisitor {
      export enum ReturnValue {
        ABORT,
        CONTINUE
      }
    }

    enum LayerType {
      BASE,
      DYNAMIC,
      STATIC,
    }

    class LightEffect {
      static createHeadLight(options?: {}): LightEffect;

      static createSunLight(options?: { time?: Date }): LightEffect;
    }

    class Map implements Evented {
      constructor(node: string | HTMLElement, mapConfig?: MapConfig);

      controller: Controller;
      domNode: HTMLElement;
      dotsPerCentimeter: number;
      dotsPerInch: number;
      effects: GraphicsEffects;
      layerTree: LayerTree;
      mapBounds: Bounds;
      mapNavigator: MapNavigator;
      mapScale: number[];
      mapToViewTransformation: Transformation;
      maxMapScale: number[];
      minMapScale: number[];
      reference: CoordinateReference;
      selectedObjects: { layer: Layer, selected: any[] }[];
      totalSize: number[];
      viewSize: number[];
      viewToMapTransformation: luciad.transformation.Transformation;

      getViewToMapTransformation(locationMode: luciad.transformation.LocationMode): luciad.transformation.Transformation;

      on(event: string, callback: (...args: any[]) => any, context?: any, options?: any): RemoveHandle;

      emit(event: string, ...args: any[]): void;

      clearSelection(): void;

      destroy(): void;

      getBoundsNavigationRestriction(): Bounds;

      hideBalloon(): void;

      isInBorder(border: Map.Border, x: number, y: number): boolean;

      isSelected(layer: Layer, object: Object): boolean;

      onClick(event: GestureEvent): void;

      onCreateContextMenu(contextMenu: ContextMenu, contextMenuInfo: any): void;

      onShowContextMenu(position: number[], contextMenu: ContextMenu): void;

      pickAt(x: number, y: number, aSensitivity: number, paintRepresentations?: PaintRepresentation[]): PickInfo[];

      pickAtRectangle(x: number, y: number, width: number, height: number,
                      paintRepresentations?: PaintRepresentation[]): PickInfo[];

      pickClosestObject(x: number, y: number, aSensitivity: number,
                        paintRepresentations?: PaintRepresentation[]): PickInfo;

      pickClosestObjectRectangle(x: number, y: number, width: number, height: number,
                                 paintRepresentations?: PaintRepresentation[]): PickInfo;

      resize(): void;

      restoreState(state: MapState, options?: { animate?: AnimationOptions | boolean }): Promise<void>;

      restrictNavigationToBounds(bounds: Bounds,
                                 options?: { padding?: { left?: number, right?: number, top?: number, bottom?: number } }): void;

      saveState(): MapState;

      selectObjects(selection: PickInfo[], options?: { editSelection?: SelectionType }): void;

      showBalloon(options: { object: Feature | Shape, layer?: FeatureLayer, contentProvider?: BalloonContentProvider, panTo?: boolean }): void;

      showContextMenu(position: number[], contextMenuInfo: any): boolean;
    }

    module Map {
      export enum Border {
        BOTTOM,
        LEFT
      }
    }

    type MapState = {};

    class MapNavigator {
      defaults: {
        pan: AnimationOptions,
        rotate: AnimationOptions,
        zoom: AnimationOptions,
        fit: {
          ease: (n: number) => number,
          duration: number,
          fitMargin: string
        },
        lookFrom: AnimationOptions,
        snapToScaleLevels: boolean
      };
      static ALL: number;
      static NONE: number;
      enabledOperations: number;

      fit(fitOptions: {
        bounds: Bounds,
        fitMargin?: string,
        allowWarpXYAxis?: boolean,
        animate?: AnimationOptions | boolean,
        snapToScaleLevels?: boolean
      }): Promise<void>;

      lookFrom(eyePoint: Point, yaw: number, pitch: number, roll: number,
               options?: { animate?: AnimationOptions | boolean }): Promise<void>;

      pan(panOptions: {
        targetLocation: Point,
        toViewLocation?: Point,
        animate?: AnimationOptions | boolean
      }): Promise<void>;

      rotate(rotateOptions: {
        targetRotation?: number,
        deltaRotation?: number,
        targetYaw?: number,
        targetPitch?: number,
        deltaYaw?: number,
        deltaPitch?: number,
        center?: Point,
        animate?: AnimationOptions | boolean
      }): Promise<void>;

      zoom(zoomOptions: {
        factor?: number | { x: number, y: number },
        targetScale?: number | { x: number, y: number },
        location?: Point,
        animate?: AnimationOptions | boolean;
        snapToScaleLevels?: boolean;
      }): Promise<void>;

      fit(bounds: Bounds, allowWarpXYAxis?: boolean): Promise<void>;

      panBy(deltaX: number, deltaY: number): void;

      panTo(bounded: Bounded): Promise<void>;

      setCenter(viewPoint: Point, spatialPoint: Point): void;

      setScale(scale: number): void;
      setScale(scale: number[]): void;

      setScaleFixing(scale: number, x: number, y: number): void;
      setScaleFixing(scale: number[], x: number, y: number): void;

      zoomIn(): Promise<void>;

      zoomInFixing(x: number, y: number): Promise<void>;

      zoomInFixingWithScaleFactor(x: number, y: number, xScaleFactor: number, yScaleFactor: number): Promise<void>;

      zoomOut(): Promise<void>;

      zoomOutFixing(x: number, y: number): Promise<void>;

      zoomOutFixingWithScaleFactor(x: number, y: number, xScaleFactor: number, yScaleFactor: number): Promise<void>;

      zoomTo(scale: number): Promise<void>;
      zoomTo(scale: number[]): Promise<void>;
    }

    type AnimationOptions = {
      duration?: number,
      ease?: (n: number) => number
    };

    enum PaintRepresentation {
      BODY,
      LABEL,
      BOTTOM_BORDER_BODY,
      BOTTOM_BORDER_LABEL,
      LEFT_BORDER_BODY,
      LEFT_BORDER_LABEL
    }

    enum SelectionType {
      ADD,
      NEW,
      REMOVE,
      TOGGLE
    }

    class WebGLMap extends Map {
      constructor(node: string | HTMLElement, mapConfig?: MapConfig);
    }

    namespace axis {
      type AxisConfiguration = {
        axisLineStyle?: luciad.view.style.LineStyle,
        gridLine?: boolean,
        labelFormatter?: (value: number) => string,
        labelRotation?: number,
        labelStyle?: luciad.view.style.TextStyle,
        spacing?: {
          minimumTickSpacing: number,
          mapSpacing: number[]
        },
        subTickLength?: number,
        subTicks?: number,
        tickLength?: number,
        tickLineStyle?: luciad.view.style.LineStyle
      }
    }

    namespace controller {
      import GeoCanvas = luciad.view.style.GeoCanvas;
      import ShapeStyle = luciad.view.style.ShapeStyle;
      import IconStyle = luciad.view.style.IconStyle;
      import ShapeType = luciad.shape.ShapeType;
      import LabelCanvas = luciad.view.style.LabelCanvas;

      type CreateControllerOptions = {
        helperStyle?: ShapeStyle,
        handleIconStyle?: IconStyle,
        finishOnSingleClick: boolean
      };

      class BasicCreateController extends CreateController {
        constructor(shapeType: ShapeType, defaultProperties?: any, createControllerOptions?: CreateControllerOptions);
      }

      abstract class Controller implements Evented {
        map: Map;

        invalidate(): void;

        onActivate(map: Map): void;

        onDeactivate(map: Map): any | Promise<void>;

        onDraw(geoCanvas: GeoCanvas): void;

        onDrawLabel(labelCanvas: LabelCanvas): void;

        onGestureEvent(event: luciad.view.input.GestureEvent): HandleEventResult;

        onKeyEvent(event: luciad.view.input.KeyEvent): HandleEventResult;

        emit(event: string, args: any): void;

        on(event: string, callback: (...args: any[]) => any, context?: any, options?: any): luciad.util.RemoveHandle;
      }

      class CreateController extends Controller {
        constructor(options?: CreateControllerOptions);

        getMaximumPointCount(): number;

        getMinimumPointCount(): number;

        onChooseLayer(aMapView: Map): Layer;

        onCreateNewObject(aMapView: Map, aLayer: Layer): Object;

        onObjectCreated(aMapView: Map, aLayer: Layer, aObject: Object): boolean | Promise<boolean>

        setPointCount(aMinimumPointCount: number, aMaximumPointCount: number): void;
      }

      class HandleEventResult {
        static EVENT_HANDLED: HandleEventResult;
        static EVENT_IGNORED: HandleEventResult;
        static REQUEST_DEACTIVATION: HandleEventResult;
        static REQUEST_FINISH: HandleEventResult;

        static clearHandled(result: HandleEventResult): HandleEventResult;

        static clearRequestDeactivation(result: HandleEventResult): HandleEventResult;

        static clearRequestFinish(result: HandleEventResult): HandleEventResult;

        static isHandled(result: HandleEventResult): boolean;

        static isRequestDeactivation(result: HandleEventResult): boolean;

        static isRequestFinish(result: HandleEventResult): boolean;

        static setHandled(result: HandleEventResult): HandleEventResult;

        static setRequestDeactivation(result: HandleEventResult): HandleEventResult;

        static setRequestFinish(result: HandleEventResult): HandleEventResult;
      }

      type EditControllerOptions = {
        helperStyle?: ShapeStyle,
        handleIconStyle?: IconStyle,
        finishOnSingleClick?: boolean
      }

      class EditController extends Controller {
        constructor(layer: Layer, object: any, options?: EditControllerOptions)
      }
    }

    namespace feature {
      import GeoCanvas = luciad.view.style.GeoCanvas;
      import Feature = luciad.model.feature.Feature;
      import Shape = luciad.shape.Shape;
      import BorderGeoCanvas = luciad.view.style.BorderGeoCanvas;
      import LabelCanvas = luciad.view.style.LabelCanvas;
      import BorderLabelCanvas = luciad.view.style.BorderLabelCanvas;
      import ShapeType = luciad.shape.ShapeType;
      import ShapeStyle = luciad.view.style.ShapeStyle;
      import CoordinateReference = luciad.reference.CoordinateReference;
      import LoadingStrategy = luciad.view.feature.loadingstrategy.LoadingStrategy;
      import ClusteringTransformer = luciad.view.feature.transformation.ClusteringTransformer;
      import FeatureModel = luciad.model.feature.FeatureModel;
      import Evented = luciad.util.Evented;
      import Bounds = luciad.shape.Bounds;
      import LineType = luciad.geodesy.LineType;
      import ColorMap = luciad.util.ColorMap;
      import Expression = luciad.util.expression.Expression;
      import Color = luciad.util.expression.Color;
      import ParameterizedPointStyle = luciad.view.style.ParameterizedPointStyle;

      interface PaintState {
        selected: boolean;
        level: number;
      }

      interface BorderPaintState extends PaintState {
        border: Map.Border
      }

      class BasicFeaturePainter extends FeaturePainter {
        constructor();

        setStyle(shapeType: ShapeType, state: { selected?: boolean }, shapeStyle: ShapeStyle): void;

        getStyle(shapeType: ShapeType, state: { selected?: boolean }): ShapeStyle;
      }

      interface FeatureLayerConstructorOptions extends LayerConstructorOptions {
        selectable?: boolean,
        isSnapTarget?: boolean,
        painter?: FeaturePainter,
        loadingStrategy?: LoadingStrategy,
        shapeProvider?: ShapeProvider,
        incrementalRendering?: boolean,
        transformer?: ClusteringTransformer,
        filter?: (feature: Feature) => boolean
      }

      class FeatureLayer extends Layer {
        bounds: Bounds;
        filter: (feature: Feature) => boolean;
        loadingStrategy: LoadingStrategy;
        painter: FeaturePainter;
        selectable: boolean;
        shapeProvider: ShapeProvider;
        transformer: ClusteringTransformer;
        workingSet: WorkingSet;

        constructor(model: FeatureModel, options?: FeatureLayerConstructorOptions);

        on(event: string, callback: (...args: any[]) => any, context?: any, options?: any): RemoveHandle;

        emit(event: string, ...args: any[]): void;
      }

      class FeaturePainter {
        constructor();

        density: { colorMap: ColorMap };

        getDetailLevelScales(layer: Layer, map: Map): number[];

        invalidate(feature: Feature): void;

        invalidateAll(): void;

        invalidateById(featureId: string | number): void;

        paintBody(geoCanvas: GeoCanvas, feature: Feature, shape: Shape, layer: Layer, map: Map,
                  paintState: PaintState): void;

        paintBorderBody(borderGeoCanvas: BorderGeoCanvas, feature: Feature, shape: Shape, layer: Layer, map: Map,
                        paintState: BorderPaintState): void;

        paintLabel(labelCanvas: LabelCanvas, feature: Feature, shape: Shape, layer: Layer, map: Map,
                   paintState: PaintState): void;

        paintBorderLabel(borderLabelCanvas: BorderLabelCanvas, feature: Feature, shape: Shape, layer: Layer, map: Map,
                         paintState: BorderPaintState): void;
      }

      class FeaturePainterUtil {
        static addSelection(painter: FeaturePainter, options?: {
          strokeColor?: string,
          strokeWidthScaleFactor?: number,
          fillColor?: string,
          iconScaleFactor?: number,
          textHaloColor?: number
        }): FeaturePainter;
      }

      class ParameterizedLinePainter extends FeaturePainter {
        constructor(options: {
          properties?: string[],
          propertyColorExpressions?: { property: string, value: any, color: string }[],
          rangePropertyProvider?: ((feature: luciad.model.feature.Feature, shape: luciad.shape.Shape,
                                    pointIndex: number) => void),
          rangeWindow?: number[],
          defaultColor?: string,
          selectionColor?: string,
          rangeColorMap?: ColorMap,
          lineWidth?: number,
          draped?: boolean,
          lineType?: LineType
        });

        defaultColor: string;
        propertyColorExpressions: { property: string, value: any, color: string }[];
        rangeColorMap: ColorMap;
        rangeWindow: number[];
        selectionColor: string;
      }

      class ParameterizedPointPainter extends FeaturePainter {
        constructor(options: {
          attributes?: {
            [attritubeName: string]: string | ((feature: luciad.model.feature.Feature) => any)
          },
          regular?: {
            colorExpression?: Expression<Color>,
            iconExpression?: Expression<ParameterizedPointStyle>,
            scaleExpression?: Expression<number>
          },
          selected?: {
            colorExpression?: Expression<Color>,
            iconExpression?: Expression<ParameterizedPointStyle>,
            scaleExpression?: Expression<number>
          },
          visibilityExpression?: Expression<boolean>,
          heading?: string | ((feature: luciad.model.feature.Feature) => number)
          draped?: boolean;
          zOrder?: number;
        });

        colorExpression: Expression<Color>;
        iconExpression: Expression<ParameterizedPointStyle>;
        scaleExpression: Expression<number>;
        selectedColorExpression: Expression<Color>;
        selectedIconExpression: Expression<ParameterizedPointStyle>;
        selectedScaleExpression: Expression<number>;
        visibilityExpression: Expression<boolean>;
      }

      class QueryProvider {
        static QUERY_NONE: Object;

        getQueryForLevel(level: number): Object;

        getQueryLevelScales(layer: Layer, map: Map): number[];

        invalidate(): void;
      }

      enum QueryStatus {
        QUERY_ERROR,
        QUERY_FINISHED,
        QUERY_INTERRUPTED,
        QUERY_PENDING,
        QUERY_STARTED,
        QUERY_SUCCESS
      }

      class ShapeProvider {
        constructor();

        reference: CoordinateReference;

        provideShape(feature: Feature): Shape;

        invalidate(feature: Feature): void;

        invalidateById(id: string | number): void;

        invalidateAll(): void;
      }

      class TrajectoryPainter extends FeaturePainter {
        defaultColor: string;
        propertyColorExpressions: { property: string, value: any, color: string }[];
        selectionColor: string;
        timeWindow: number[];

        constructor(options?: {
          properties?: string[],
          propertyColorExpressions?: { property: string, value: any, color: string }[],
          timeProvider?: (feature: Feature, shape: Shape, pointIndex: number) => number,
          timeWindow?: number[],
          defaultColor?: string,
          selectionColor?: string,
          lineWidth?: number,
          draped?: boolean,
          lineType?: LineType,
        })
      }

      class WorkingSet extends Evented {
        queryStatus: QueryStatus;

        add(feature: Feature, options: any): string | number | Promise<string> | Promise<number>;

        get(): Feature[];

        put(feature: Feature, options: any): string | number | Promise<string> | Promise<number>;

        remove(id: number | string): string | number | Promise<string> | Promise<number>;
      }

      namespace loadingstrategy {
        interface LoadingStrategy {
          queryProvider: QueryProvider;
        }

        class LoadEverything implements LoadingStrategy {
          queryProvider: QueryProvider;

          constructor(options?: { queryProvider?: QueryProvider, query?: any });
        }

        class LoadSpatially implements LoadingStrategy {
          queryProvider: QueryProvider;

          constructor(options?: { queryProvider?: QueryProvider });
        }
      }

      namespace transformation {
        class Classifier {
          getClassification(aElement: Feature): string;
        }

        type ClusteringParameters = {
          clusterShapeProvider?: ClusterShapeProvider,
          clusterSize?: number,
          minimumPoints?: number,
          noClustering?: boolean
        };

        type ClassificationConfig = {
          classification: string
        };

        type ClassMatcherConfig = {
          classMatcher: (classification: string) => boolean;
        };

        class ClusteringTransformer {
          static clusteredFeatures(cluster: Feature): Feature[];

          static create(options?: {
            classifier?: Classifier,
            defaultParameters?: ClusteringParameters,
            classParameters?: ClassificationConfig | ClassMatcherConfig
          }): ClusteringTransformer;

          static createScaleDependent(options: {
            levelScales: number[],
            clusteringTransformers: ClusteringTransformer[]
          }): ClusteringTransformer;

          static isCluster(feature: Feature): boolean;
        }

        class ClusterShapeProvider {
          getShape(composingElements: Feature[]): Shape;
        }
      }
    }

    namespace google {
      class GoogleLayer extends Layer {
        constructor(options?: {
          mapType: "roadmap" | "satellite" | "hybrid" | "terrain",
          styles: any[]
        });

        mapType: "roadmap" | "satellite" | "hybrid" | "terrain";
        styles: any[];
      }
    }

    namespace grid {
      class GridLayer extends Layer {
        constructor(model: LonLatGrid, options?: LayerConstructorOptions);
      }

      enum LabelPosition {
        ALL_SIDES,
        AUTO
      }

      class LonLatGrid {
        fallbackStyle: LonLatGrid.StyleSettings;
        originLat: number;
        originLon: number;
        scales: number[];

        constructor(gridSettings: (LonLatGrid.Settings)[], options?: { originLon: number, originLat: number });

        getDeltaLat(scaleIndex: number): number;

        getDeltaLon(scaleIndex: number): number;

        getStyle(scaleIndex: number): LonLatGrid.StyleSettings;

        setStyle(scaleIndex: number, style: LonLatGrid.StyleSettings): void;
      }

      module LonLatGrid {
        import LonLatPointFormat = luciad.shape.format.LonLatPointFormat;
        import TextStyle = luciad.view.style.TextStyle;
        import LineStyle = luciad.view.style.LineStyle;

        export type Settings = {
          deltaLat: number,
          deltaLon: number,
          scale: number
        };

        export type StyleSettings = {
          labeled?: boolean,
          labelFormat?: LonLatPointFormat,
          labelPosition?: LabelPosition,
          labelStyle?: TextStyle,
          lineStyle?: LineStyle,
          originLabelFormat?: LonLatPointFormat,
          originLabelStyle?: TextStyle,
          originLineStyle?: LineStyle
        }
      }
    }

    namespace image {
      import RasterImageModel = luciad.model.image.RasterImageModel;
      import WMSImageModel = luciad.model.image.WMSImageModel;

      class RasterImageLayer extends Layer {
        constructor(model: RasterImageModel, options?: LayerConstructorOptions);

        rasterStyle: RasterStyle;
      }

      class WMSImageLayer extends RasterImageLayer {
        constructor(model: WMSImageModel, options?: LayerConstructorOptions);

        queryable: boolean;

        getFeatureInfo(viewX: number, viewY: number,
                       options?: { infoFormat?: string, featureCount?: number | string }): Promise<GetFeatureInfo>;
      }
    }

    namespace input {
      class GestureEvent {
        clientPosition: number[];
        domEvent: Event;
        inputType: string;
        modifier: ModifierType;
        pagePosition: number[];
        type: GestureEventType;
        viewPosition: number[];
        viewPoint: luciad.shape.Point;
      }

      enum GestureEventType {
        CONTEXT_MENU,
        DOUBLE_CLICK,
        DOUBLE_CLICK_EVENT,
        DOWN,
        DRAG,
        DRAG_END,
        LONG_PRESS,
        MOVE,
        PINCH,
        PINCH_END,
        ROTATE,
        ROTATE_END,
        SCROLL,
        SHOW_PRESS,
        SINGLE_CLICK_CONFIRMED,
        SINGLE_CLICK_UP,
        TWO_FINGER_DRAG,
        TWO_FINGER_DRAG_END,
        UP
      }

      class KeyEvent {
        domEvent: Event;
        inputType: string;
        type: string;
      }

      enum KeyEventType {
        DOWN,
        UP
      }

      enum ModifierType {
        ALT,
        ALT_CTRL,
        ALT_CTRL_SHIFT,
        ALT_SHIFT,
        CTRL,
        CTRL_SHIFT,
        NO_MOD,
        SHIFT
      }
    }

    namespace kml {
      import KMLModel = luciad.model.kml.KMLModel;
      import FeatureLayerConstructorOptions = luciad.view.feature.FeatureLayerConstructorOptions;

      class KMLLayer extends FeatureLayer {
        constructor(model: KMLModel, options: FeatureLayerConstructorOptions);
      }
    }

    namespace style {
      import LineType = luciad.geodesy.LineType;
      import Mesh = luciad.geometry.mesh.Mesh;

      interface BorderGeoCanvas {
        drawIcon(shape: Shape | number[], style: BorderIconStyle): void;

        drawText(shape: Shape | number[], text: string, style: TextStyle): void;
      }

      interface GenericBorderIconStyle {
        anchorX?: string;
        anchorY?: string;
        height?: string;
        offsetX?: number;
        offsetY?: number;
        rotation?: number;
        stem?: LineStyle;
        width?: string;
        zOrder?: number;
      }

      interface ImageBorderIconStyle {
        image: HTMLImageElement | HTMLCanvasElement;
      }

      interface UrlBorderIconStyle extends GenericBorderIconStyle {
        url: string;
      }

      type BorderIconStyle = ImageBorderIconStyle | UrlBorderIconStyle;

      interface BorderLabelCanvas {
        drawLabel(html: string, shape: luciad.shape.Shape, labelStyle: PointLabelStyle): void;
      }

      type FillStyle = {
        color?: string;
        url?: string;
        image?: HTMLImageElement | HTMLCanvasElement;
      };

      interface GeoCanvas {
        drawIcon(shape: luciad.shape.Shape, iconStyle: IconStyle): void;

        drawIcon3D(shape: luciad.shape.Shape, iconStyle: Icon3DStyle): void;

        drawShape(shape: luciad.shape.Shape, style: ShapeStyle): void;

        drawText(shape: luciad.shape.Shape, text: string, style: TextStyle): void;
      }

      class HatchedImageBuilder {
        constructor();

        backgroundColor(backgroundColor: string): HatchedImageBuilder;

        build(): HTMLImageElement;

        lineColor(lineColor: string): HatchedImageBuilder;

        lineWidth(lineWidth: number): HatchedImageBuilder;

        patterns(patters: HatchedImageBuilder.Pattern[]): HatchedImageBuilder;

        patternSize(width: number, height: number): HatchedImageBuilder
      }

      module HatchedImageBuilder {
        export enum Pattern {
          BACK_SLASH,
          BACKGROUND,
          HORIZONTAL,
          SLASH,
          VERTICAL
        }
      }

      interface GenericIcon3DStyle {
        color?: string;
        orientation?: {
          roll?: number,
          pitch?: number,
          heading?: number
        };
        rotation?: {
          x: number,
          y: number,
          z: number
        };
        scale?: {
          x: number,
          y: number,
          z: number
        };
        translation?: {
          x: number,
          y: number,
          z: number
        };
        zOrder?: number
      }

      interface MeshIcon3DStyle extends GenericIcon3DStyle {
        mesh: Mesh;
      }

      interface MeshUrlIcon3DStyle extends GenericIcon3DStyle {
        meshUrl: string;
      }

      type Icon3DStyle = MeshUrlIcon3DStyle | MeshIcon3DStyle;

      interface GenericIconStyle {
        anchorX?: string;
        anchorY?: string;
        credentials?: boolean;
        draped?: boolean;
        heading?: number;
        height?: string;
        offsetX?: number;
        offsetY?: number;
        rotation?: number;
        stem?: LineStyle;
        width?: string;
        zOrder?: number;
      }

      interface UrlIconStyle extends GenericIconStyle {
        url: string;
      }

      interface ImageIconStyle extends GenericIconStyle {
        image: HTMLImageElement | HTMLCanvasElement
      }

      type IconStyle = UrlIconStyle | ImageIconStyle;

      interface InPathLabelStyle extends LabelStyle {
        inView?: boolean;
        restrictToBounds?: boolean;
      }

      interface LabelCanvas {
        drawLabel(html: string, shape: Shape, labelStyle: PointLabelStyle): void;

        drawLabelInPath(html: string, shape: Shape, labelStyle: InPathLabelStyle): void;

        drawLabelOnPath(html: string, shape: Shape, labelStyle: OnPathLabelStyle): void;
      }

      interface LabelStyle {
        group?: number | string;
        padding?: number;
        priority?: number;
      }

      type LineMarker = {
        size?: number,
        type?: LineMarkerType
      };

      enum LineMarkerType {
        ARROW
      }

      type LineStyle = {
        beginMarker?: LineMarker,
        color?: String,
        dash?: number[],
        dashOffset?: number,
        endMarker?: LineMarker,
        width?: Number,
      };

      interface OnPathLabelStyle extends LabelStyle {
        positions: PathLabelPosition | PathLabelPosition[];
        rotation: PathLabelRotation;
      }

      interface GenericParameterizedPointStyle {
        anchorX?: string;
        anchorY?: string;
        credentials?: boolean;
        height?: string;
        offsetX?: number;
        offsetY?: number;
        rotation?: number;
        width?: string;
        zOrder?: number;
      }

      interface UrlParameterizedPointStyle extends GenericParameterizedPointStyle {
        url: string;
      }

      interface ImageParameterizedPointStyle extends GenericParameterizedPointStyle {
        image: HTMLImageElement | HTMLCanvasElement
      }

      type ParameterizedPointStyle = UrlParameterizedPointStyle | ImageParameterizedPointStyle;

      enum PathLabelPosition {
        ABOVE,
        BELOW,
        CENTER
      }

      enum PathLabelRotation {
        FIXED_LINE_ANGLE,
        NO_ROTATION
      }

      enum PinEndPosition {
        BORDER,
        MIDDLE,
        MIDDLE_BORDER
      }

      type PinStyle = {
        color?: string,
        endPosition?: PinEndPosition,
        haloColor?: string,
        haloWidth?: string,
        width?: string
      };

      enum PointLabelPosition {
        ANY,
        CENTER,
        NORTH,
        NORTH_EAST,
        EAST,
        SOUTH_EAST,
        SOUTH,
        SOUTH_WEST,
        WEST,
        NORTH_WEST
      }

      interface PointLabelStyle extends LabelStyle {
        offset?: number | number[],
        pin?: PinStyle,
        positions?: PointLabelPosition
      }

      type ShapeStyle = {
        draped?: boolean,
        fill?: FillStyle,
        lineType?: LineType,
        stroke?: LineStyle,
        zOrder?: number
      };

      type TextStyle = {
        alignmentBaseline?: string,
        angle?: number,
        fill?: string,
        font?: string,
        halo?: string,
        haloWidth?: string,
        offsetX?: number,
        offsetY?: number,
        stroke?: string,
        strokeWidth?: string,
        textAnchor?: string,
        zOrder?: number
      };

      enum ScalingMode {
        ADAPTIVE_WORLD_SIZE,
        PIXEL_SIZE
      }

      type PointCloudStyle = {
        colorExpression?: Expression<Color>;
        scaleExpression?: Expression<number>;
        visibilityExpression?: Expression<boolean>;
        scalingMode?: ScalingMode;
      }
    }

    namespace tileset {
      import RasterTileSetModel = luciad.model.tileset.RasterTileSetModel;
      import WMSTileSetModel = luciad.model.tileset.WMSTileSetModel;
      import OGC3DTilesModel = luciad.model.tileset.OGC3DTilesModel;
      import PointCloudStyle = luciad.view.style.PointCloudStyle;

      class RasterTileSetLayer extends Layer {
        constructor(model: RasterTileSetModel, options?: LayerConstructorOptions);

        rasterStyle: RasterStyle;
      }

      class TileSetAttributionProvider implements Evented {
        constructor(map: Map);

        emit(event: string, args: any): void;

        on(event: string, callback: (...args: any[]) => any, context?: any, options?: any): RemoveHandle;

        dispose(): void;

        getAttributionLogos(): string[];

        getAttributionString(): string[];
      }

      class TileSetScaleUtil {
        static calculateScaleForTilesetLevel(tileSetModel: RasterTileSetModel, map: Map, level: number): number;
      }

      interface TileSet3DLayerOptions extends LayerConstructorOptions {
        qualityFactor?: number;
        offsetTerrain?: boolean;
        pointCloudStyle?: PointCloudStyle;
      }

      class WMSTileSetLayer extends RasterTileSetLayer {
        queryable: boolean;

        constructor(model: WMSTileSetModel, options: LayerConstructorOptions);

        getFeatureInfo(viewX: number, viewY: number,
                       options?: { infoFormat?: string, featureCount?: number | string }): Promise<GetFeatureInfo>;
      }

      class TileSet3DLayer extends Layer implements Bounded {
        pointCloudStyle: PointCloudStyle;
        model: OGC3DTilesModel;
        bounds: Bounds;
        qualityFactor: number;

        constructor(model: OGC3DTilesModel, options?: TileSet3DLayerOptions);
      }
    }
  }
}

declare module 'luciad/error/InvalidReferenceError' {
  import _InvalidReferenceError = luciad.error.InvalidReferenceError;
  export = _InvalidReferenceError;
}

declare module 'luciad/error/InvalidXMLError' {
  import _InvalidXMLError = luciad.error.InvalidReferenceError;
  export = _InvalidXMLError;
}

declare module 'luciad/error/NoBoundsError' {
  import _NoBoundsError = luciad.error.NoBoundsError;
  export = _NoBoundsError;
}

declare module 'luciad/error/NotImplementedError' {
  import _NotImplementedError = luciad.error.NotImplementedError;
  export = _NotImplementedError;
}

declare module 'luciad/error/OutOfBoundsError' {
  import _OutOfBoundsError = luciad.error.OutOfBoundsError;
  export = _OutOfBoundsError;
}

declare module 'luciad/error/ProgrammingError' {
  import _ProgrammingError = luciad.error.ProgrammingError;
  export = _ProgrammingError;
}

declare module 'luciad/geodesy/GeodesyFactory' {
  import _GeodesyFactory = luciad.geodesy.GeodesyFactory;
  export = _GeodesyFactory;
}

declare module 'luciad/geodesy/Geodesy' {
  import _Geodesy = luciad.geodesy.Geodesy;
  export = _Geodesy;
}

declare module 'luciad/geodesy/LineType' {
  import _LineType = luciad.geodesy.LineType;
  export = _LineType;
}

declare module 'luciad/geometry/Topology' {
  import _Topology = luciad.geometry.Topology;
  export = _Topology;
}

declare module 'luciad/geometry/TopologyFactory' {
  import _TopologyFactory = luciad.geometry.TopologyFactory;
  export = _TopologyFactory;
}

declare module 'luciad/geometry/mesh/MeshFactory' {
  import _MeshFactory = luciad.geometry.mesh.MeshFactory;
  export = _MeshFactory;
}

declare module 'luciad/geometry/constructive/ConstructiveGeometry' {
  import _ConstructiveGeometry = luciad.geometry.constructive.ConstructiveGeometry;
  export = _ConstructiveGeometry
}

declare module 'luciad/geometry/constructive/ConstructiveGeometryFactory' {
  import _ConstructiveGeometryFactory = luciad.geometry.constructive.ConstructiveGeometryFactory;
  export = _ConstructiveGeometryFactory
}

declare module 'luciad/model/Cursor' {
  import _Cursor = luciad.model.Cursor;
  export = _Cursor;
}

declare module 'luciad/model/Model' {
  import _Model = luciad.model.Model;
  export = _Model;
}

declare module 'luciad/model/ModelDescriptor' {
  import _ModelDescriptor = luciad.model.ModelDescriptor;
  export = _ModelDescriptor;
}

declare module 'luciad/model/codec/EncodeData' {
  import _EncodeData = luciad.model.codec.EncodeData;
  export = _EncodeData;
}

declare module 'luciad/model/codec/DecodeData' {
  import _DecodeData = luciad.model.codec.DecodeData;
  export = _DecodeData;
}

declare module 'luciad/model/codec/Codec' {
  import _Codec = luciad.model.codec.Codec;
  export = _Codec;
}

declare module 'luciad/model/codec/GeoJsonCodec' {
  import _GeoJsonCodec = luciad.model.codec.GeoJsonCodec;
  export = _GeoJsonCodec;
}

declare module 'luciad/model/codec/GMLCodec' {
  import _GMLCodec = luciad.model.codec.GMLCodec;
  export = _GMLCodec;
}

declare module 'luciad/model/feature/Feature' {
  import _Feature = luciad.model.feature.Feature;
  export = _Feature;
}

declare module 'luciad/model/feature/FeatureModel' {
  import _FeatureModel = luciad.model.feature.FeatureModel;
  export = _FeatureModel;
}

declare module 'luciad/model/image/GoogleImageModel' {
  import _GoogleImageModel = luciad.model.image.GoogleImageModel;
  export = _GoogleImageModel;
}

declare module 'luciad/model/image/RasterImageModel' {
  import _RasterImageModel = luciad.model.image.RasterImageModel;
  export = _RasterImageModel;
}

declare module 'luciad/model/image/WMSImageModel' {
  import _WMSImageModel = luciad.model.image.WMSImageModel;
  export = _WMSImageModel;
}

declare module 'luciad/model/kml/KMLModel' {
  import _KMLModel = luciad.model.kml.KMLModel;
  export = _KMLModel;
}

declare module 'luciad/model/store/Store' {
  import _Store = luciad.model.store.Store;
  export = _Store;
}

declare module 'luciad/model/store/MemoryStore' {
  import _MemoryStore = luciad.model.store.MemoryStore;
  export = _MemoryStore;
}

declare module 'luciad/model/store/UrlStore' {
  import _UrlStore = luciad.model.store.UrlStore;
  export = _UrlStore;
}

declare module 'luciad/model/store/WFSFeatureStore' {
  import _WFSFeatureStore = luciad.model.store.WFSFeatureStore;
  export = _WFSFeatureStore;
}

declare module 'luciad/model/tileset/AttributedTileSet' {
  import _AttributedTileSet = luciad.model.tileset.AttributedTileSet;
  export = _AttributedTileSet;
}

declare module 'luciad/model/tileset/BingMapsTileSetModel' {
  import _BingMapsTileSetModel = luciad.model.tileset.BingMapsTileSetModel;
  export = _BingMapsTileSetModel;
}

declare module 'luciad/model/tileset/FusionTileSetModel' {
  import _FusionTileSetModel = luciad.model.tileset.FusionTileSetModel;
  export = _FusionTileSetModel;
}

declare module 'luciad/model/tileset/RasterDataType' {
  import _RasterDataType = luciad.model.tileset.RasterDataType;
  export = _RasterDataType;
}

declare module 'luciad/model/tileset/RasterSamplingMode' {
  import _RasterSamplingMode = luciad.model.tileset.RasterSamplingMode;
  export = _RasterSamplingMode;
}

declare module 'luciad/model/tileset/RasterTileSetModel' {
  import _RasterTileSetModel = luciad.model.tileset.RasterTileSetModel;
  export = _RasterTileSetModel;
}

declare module 'luciad/model/tileset/UrlTileSetModel' {
  import _UrlTileSetModel = luciad.model.tileset.UrlTileSetModel;
  export = _UrlTileSetModel;
}

declare module 'luciad/model/tileset/WMSTileSetModel' {
  import _WMSTileSetModel = luciad.model.tileset.WMSTileSetModel;
  export = _WMSTileSetModel;
}

declare module 'luciad/model/tileset/OGC3DTilesModel' {
  import _OGC3DTilesModel = luciad.model.tileset.OGC3DTilesModel;
  export = _OGC3DTilesModel;
}

declare module 'luciad/ogc/filter/FilterFactory' {
  import _FilterFactory = luciad.ogc.filter.FilterFactory;
  export = _FilterFactory;
}

declare module 'luciad/ogc/se/SEPainterFactory' {
  import _SEPainterFactory = luciad.ogc.se.SEPainterFactory;
  export = _SEPainterFactory;
}

declare module 'luciad/reference/Axis' {
  import _Axis = luciad.reference.Axis;
  export = _Axis;
}

declare module 'luciad/reference/CoordinateReference' {
  import _CoordinateReference = luciad.reference.CoordinateReference;
  export = _CoordinateReference;
}

declare module 'luciad/reference/CoordinateReferenced' {
  import _CoordinateReferenced = luciad.reference.CoordinateReferenced;
  export = _CoordinateReferenced;
}

declare module 'luciad/reference/CoordinateType' {
  import _CoordinateType = luciad.reference.CoordinateType;
  export = _CoordinateType;
}

declare module 'luciad/reference/ReferenceProvider' {
  import _ReferenceProvider = luciad.reference.ReferenceProvider;
  export = _ReferenceProvider;
}

declare module 'luciad/shape/Arc' {
  import _Arc = luciad.shape.Arc;
  export = _Arc;
}

declare module 'luciad/shape/ArcBand' {
  import _ArcBand = luciad.shape.ArcBand;
  export = _ArcBand;
}

declare module 'luciad/shape/Sector' {
  import _Sector = luciad.shape.Sector;
  export = _Sector;
}

declare module 'luciad/shape/Bounded' {
  import _Bounded = luciad.shape.Bounded;
  export = _Bounded;
}

declare module 'luciad/shape/Bounds' {
  import _Bounds = luciad.shape.Bounds;
  export = _Bounds;
}

declare module 'luciad/shape/Circle' {
  import _Circle = luciad.shape.Circle;
  export = _Circle;
}

declare module 'luciad/shape/CircleBy3Points' {
  import _CircleBy3Points = luciad.shape.CircleBy3Points;
  export = _CircleBy3Points;
}

declare module 'luciad/shape/CircleByCenterPoint' {
  import _CircleByCenterPoint = luciad.shape.CircleByCenterPoint;
  export = _CircleByCenterPoint;
}

declare module 'luciad/shape/CircularArc' {
  import _CircularArc = luciad.shape.CircularArc;
  export = _CircularArc
}

declare module 'luciad/shape/CircularArcBy3Points' {
  import _CircularArcBy3Points = luciad.shape.CircularArcBy3Points;
  export = _CircularArcBy3Points;
}

declare module 'luciad/shape/CircularArcByBulge' {
  import _CircularArcByBulge = luciad.shape.CircularArcByBulge;
  export = _CircularArcByBulge;
}

declare module 'luciad/shape/CircularArcByCenterPoint' {
  import _CircularArcByCenterPoint = luciad.shape.CircularArcByCenterPoint;
  export = _CircularArcByCenterPoint;
}

declare module 'luciad/shape/ComplexPolygon' {
  import _ComplexPolygon = luciad.shape.ComplexPolygon;
  export = _ComplexPolygon;
}

declare module 'luciad/shape/Ellipse' {
  import _Ellipse = luciad.shape.Ellipse;
  export = _Ellipse;
}

declare module 'luciad/shape/EndCapStyle' {
  import _EndCapStyle = luciad.shape.EndCapStyle;
  export = _EndCapStyle;
}

declare module 'luciad/shape/ExtrudedShape' {
  import _ExtrudedShape = luciad.shape.ExtrudedShape;
  export = _ExtrudedShape;
}

declare module 'luciad/shape/GeoBuffer' {
  import _GeoBuffer = luciad.shape.GeoBuffer;
  export = _GeoBuffer;
}

declare module 'luciad/shape/Point' {
  import _Point = luciad.shape.Point;
  export = _Point;
}

declare module 'luciad/shape/Polygon' {
  import _Polygon = luciad.shape.Polygon;
  export = _Polygon;
}

declare module 'luciad/shape/Polyline' {
  import _Polyline = luciad.shape.Polyline;
  export = _Polyline;
}

declare module 'luciad/shape/Shape' {
  import _Shape = luciad.shape.Shape;
  export = _Shape;
}

declare module 'luciad/shape/ShapeFactory' {
  import _ShapeFactory = luciad.shape.ShapeFactory;
  export = _ShapeFactory;
}

declare module 'luciad/shape/ShapeList' {
  import _ShapeList = luciad.shape.ShapeList;
  export = _ShapeList;
}

declare module 'luciad/shape/ShapeType' {
  import _ShapeType = luciad.shape.ShapeType;
  export = _ShapeType;
}

declare module 'luciad/shape/format/LonLatPointFormat' {
  import _LonLatPointFormat = luciad.shape.format.LonLatPointFormat;
  export = _LonLatPointFormat;
}

declare module 'luciad/shape/format/MGRSPointFormat' {
  import _MGRSPointFormat = luciad.shape.format.MGRSPointFormat;
  export = _MGRSPointFormat;
}

declare module 'luciad/symbology/HierarchicalSymbology' {
  import _HierarchicalSymbology = luciad.symbology.HierarchicalSymbology;
  export = _HierarchicalSymbology;
}

declare module 'luciad/symbology/SymbologyNode' {
  import _SymbologyNode = luciad.symbology.SymbologyNode;
  export = _SymbologyNode
}

declare module 'luciad/symbology/SymbologyProvider' {
  import _SymbologyProvider = luciad.symbology.SymbologyProvider;
  export = _SymbologyProvider;
}

declare module 'luciad/symbology/military/MilitarySymbol' {
  import _MilitarySymbol = luciad.symbology.military.MilitarySymbol;
  export = _MilitarySymbol;
}

declare module 'luciad/symbology/military/MilitarySymbologyPainter' {
  import _MilitarySymbologyPainter = luciad.symbology.military.MilitarySymbologyPainter;
  export = _MilitarySymbologyPainter;
}

declare module 'luciad/transformation/Transformation' {
  import _Transformation = luciad.transformation.Transformation;
  export = _Transformation
}

declare module 'luciad/transformation/TransformationFactory' {
  import _TransformationFactory = luciad.transformation.TransformationFactory;
  export = _TransformationFactory;
}

declare module 'luciad/uom/QuantityKindRegistry' {
  import _QuantityKindRegistry = luciad.uom.QuantityKindRegistry;
  export = _QuantityKindRegistry;
}

declare module 'luciad/uom/UnitOfMeasureRegistry' {
  import _UnitOfMeasureRegistry = luciad.uom.UnitOfMeasureRegistry;
  export = _UnitOfMeasureRegistry;
}

declare module 'luciad/util/ColorMap' {
  import _ColorMap = luciad.util.ColorMap;
  export = _ColorMap;
}

declare module 'luciad/util/Evented' {
  import _Evented = luciad.util.Evented;
  export = _Evented;
}

declare module 'luciad/util/License' {
  import _License = luciad.util.License;
  export = _License;
}

declare module 'luciad/util/Promise' {
  import _Promise = luciad.util.Promise;
  export = _Promise;
}

declare module 'luciad/util/expression/Expression' {
  import _Expression = luciad.util.expression.Expression
  export = _Expression;
}

declare module 'luciad/util/expression/ParameterExpression' {
  import _ParameterExpression = luciad.util.expression.ParameterExpression;
  export = _ParameterExpression;
}

declare module 'luciad/util/expression/CaseExpression' {
  import _CaseExpression = luciad.util.expression.CaseExpression;
  export = _CaseExpression;
}

declare module 'luciad/util/expression/CaseTestExpression' {
  import _CaseTestExpression = luciad.util.expression.CaseTestExpression;
  export = _CaseTestExpression;
}

declare module 'luciad/util/expression/Color' {
  import _Color = luciad.util.expression.Color;
  export = _Color;
}

declare module 'luciad/util/expression/PointType' {
  import _PointType = luciad.util.expression.PointType;
  export = _PointType;
}

declare module 'luciad/util/expression/ExpressionFactory' {
  import _ExpressionFactory = luciad.util.expression.ExpressionFactory;
  export = _ExpressionFactory;
}

declare module 'luciad/view/Layer' {
  import _Layer = luciad.view.Layer;
  export = _Layer;
}

declare module 'luciad/view/LayerGroup' {
  import _LayerGroup = luciad.view.LayerGroup;
  export = _LayerGroup;
}

declare module 'luciad/view/LayerTree' {
  import _LayerTree = luciad.view.LayerTree;
  export = _LayerTree;
}

declare module 'luciad/view/LayerTreeNode' {
  import _LayerTreeNode = luciad.view.LayerTreeNode;
  export = _LayerTreeNode;
}

declare module 'luciad/view/LayerTreeNodeType' {
  import _LayerTreeNodeType = luciad.view.LayerTreeNodeType;
  export = _LayerTreeNodeType;
}

declare module 'luciad/view/LayerTreeVisitor' {
  import _LayerTreeVisitor = luciad.view.LayerTreeVisitor;
  export = _LayerTreeVisitor;
}

declare module 'luciad/view/LayerType' {
  import _LayerType = luciad.view.LayerType;
  export = _LayerType;
}

declare module 'luciad/view/LightEffect' {
  import _LightEffect = luciad.view.LightEffect;
  export = _LightEffect;
}

declare module 'luciad/view/Map' {
  import _Map = luciad.view.Map;
  export = _Map;
}

declare module 'luciad/view/MapNavigator' {
  import _MapNavigator = luciad.view.MapNavigator;
  export = _MapNavigator;
}

declare module 'luciad/view/PaintRepresentation' {
  import _PaintRepresentation = luciad.view.PaintRepresentation;
  export = _PaintRepresentation;
}

declare module 'luciad/view/SelectionType' {
  import _SelectionType = luciad.view.SelectionType;
  export = _SelectionType;
}
declare module 'luciad/view/WebGLMap' {
  import _WebGLMap = luciad.view.WebGLMap;
  export = _WebGLMap;
}

declare module 'luciad/view/axis/AxisConfiguration' {
  import _AxisConfiguration = luciad.view.axis.AxisConfiguration;
  export = _AxisConfiguration;
}

declare module 'luciad/view/controller/BasicCreateController' {
  import _BasicCreateController = luciad.view.controller.BasicCreateController;
  export = _BasicCreateController;
}

declare module 'luciad/view/controller/Controller' {
  import _Controller = luciad.view.controller.Controller;
  export = _Controller;
}

declare module 'luciad/view/controller/CreateController' {
  import _CreateController = luciad.view.controller.CreateController;
  export = _CreateController;
}

declare module 'luciad/view/controller/HandleEventResult' {
  import _HandleEventResult = luciad.view.controller.HandleEventResult;
  export = _HandleEventResult;
}

declare module 'luciad/view/controller/EditController' {
  import _EditController = luciad.view.controller.EditController;
  export = _EditController;
}

declare module 'luciad/view/feature/BasicFeaturePainter' {
  import _BasicFeaturePainter = luciad.view.feature.BasicFeaturePainter;
  export = _BasicFeaturePainter;
}

declare module 'luciad/view/feature/FeatureLayer' {
  import _FeatureLayer = luciad.view.feature.FeatureLayer;
  export = _FeatureLayer;
}

declare module 'luciad/view/feature/FeaturePainter' {
  import _FeaturePainter = luciad.view.feature.FeaturePainter;
  export = _FeaturePainter;
}

declare module 'luciad/view/feature/FeaturePainterUtil' {
  import _FeaturePainterUtil = luciad.view.feature.FeaturePainterUtil;
  export = _FeaturePainterUtil;
}

declare module 'luciad/view/feature/ParameterizedLinePainter' {
  import _ParameterizedLinePainter = luciad.view.feature.ParameterizedLinePainter;
  export = _ParameterizedLinePainter;
}

declare module 'luciad/view/feature/ParameterizedPointPainter' {
  import _ParameterizedPointPainter = luciad.view.feature.ParameterizedPointPainter;
  export = _ParameterizedPointPainter;
}

declare module 'luciad/view/feature/QueryProvider' {
  import _QueryProvider = luciad.view.feature.QueryProvider;
  export = _QueryProvider;
}

declare module 'luciad/view/feature/QueryStatus' {
  import _QueryStatus = luciad.view.feature.QueryStatus;
  export = _QueryStatus;
}

declare module 'luciad/view/feature/ShapeProvider' {
  import _ShapeProvider = luciad.view.feature.ShapeProvider;
  export = _ShapeProvider;
}

declare module 'luciad/view/feature/TrajectoryPainter' {
  import _TrajectoryPainter = luciad.view.feature.TrajectoryPainter;
  export = _TrajectoryPainter;
}

declare module 'luciad/view/feature/WorkingSet' {
  import _WorkingSet = luciad.view.feature.WorkingSet;
  export = _WorkingSet;
}

declare module 'luciad/view/feature/loadingstrategy/LoadEverything' {
  import _LoadEverything = luciad.view.feature.loadingstrategy.LoadEverything;
  export = _LoadEverything;
}

declare module 'luciad/view/feature/loadingstrategy/LoadingStrategy' {
  import _LoadingStrategy = luciad.view.feature.loadingstrategy.LoadingStrategy;
  export = _LoadingStrategy;
}

declare module 'luciad/view/feature/loadingstrategy/LoadSpatially' {
  import _LoadSpatially = luciad.view.feature.loadingstrategy.LoadSpatially;
  export = _LoadSpatially;
}

declare module 'luciad/view/feature/transformation/Classifier' {
  import _Classifier = luciad.view.feature.transformation.Classifier;
  export = _Classifier;
}

declare module 'luciad/view/feature/transformation/ClusteringParameters' {
  import _ClusteringParameters = luciad.view.feature.transformation.ClusteringParameters;
  export = _ClusteringParameters;
}

declare module 'luciad/view/feature/transformation/ClusteringTransformer' {
  import _ClusteringTransformer = luciad.view.feature.transformation.ClusteringTransformer;
  export = _ClusteringTransformer;
}

declare module 'luciad/view/feature/transformation/ClusterShapeProvider' {
  import _ClusterShapeProvider = luciad.view.feature.transformation.ClusterShapeProvider;
  export = _ClusterShapeProvider;
}

declare module 'luciad/view/google/GoogleLayer' {
  import _GoogleLayer = luciad.view.google.GoogleLayer;
  export = _GoogleLayer;
}

declare module 'luciad/view/grid/LonLatGrid' {
  import _LonLatGrid = luciad.view.grid.LonLatGrid;
  export = _LonLatGrid;
}

declare module 'luciad/view/grid/GridLayer' {
  import _GridLayer = luciad.view.grid.GridLayer;
  export = _GridLayer;
}

declare module 'luciad/view/grid/LabelPosition' {
  import _LabelPosition = luciad.view.grid.LabelPosition;
  export = _LabelPosition;
}

declare module 'luciad/view/image/RasterImageLayer' {
  import _RasterImageLayer = luciad.view.image.RasterImageLayer;
  export = _RasterImageLayer;
}

declare module 'luciad/view/image/WMSImageLayer' {
  import _WMSImageLayer = luciad.view.image.WMSImageLayer;
  export = _WMSImageLayer;
}

declare module 'luciad/view/input/GestureEvent' {
  import _GestureEvent = luciad.view.input.GestureEvent;
  export = _GestureEvent;
}

declare module 'luciad/view/input/GestureEventType' {
  import _GestureEventType = luciad.view.input.GestureEventType;
  export = _GestureEventType;
}

declare module 'luciad/view/input/KeyEvent' {
  import _KeyEvent = luciad.view.input.KeyEvent;
  export = _KeyEvent;
}

declare module 'luciad/view/input/KeyEventType' {
  import _KeyEventType = luciad.view.input.KeyEventType;
  export = _KeyEventType
}

declare module 'luciad/view/input/ModifierType' {
  import _ModifierType = luciad.view.input.ModifierType;
  export = _ModifierType;
}

declare module 'luciad/view/kml/KMLLayer' {
  import _KMLLayer = luciad.view.kml.KMLLayer;
  export = _KMLLayer
}

declare module 'luciad/view/style/BorderGeoCanvas' {
  import _BorderGeoCanvas = luciad.view.style.BorderGeoCanvas;
  export = _BorderGeoCanvas;
}

declare module 'luciad/view/style/BorderIconStyle' {
  import _BorderIconStyle = luciad.view.style.BorderIconStyle;
  export = _BorderIconStyle;
}

declare module 'luciad/view/style/BorderLabelCanvas' {
  import _BorderLabelCanvas = luciad.view.style.BorderLabelCanvas;
  export = _BorderLabelCanvas;
}

declare module 'luciad/view/style/FillStyle' {
  import _FillStyle = luciad.view.style.FillStyle;
  export = _FillStyle;
}

declare module 'luciad/view/style/GeoCanvas' {
  import _GeoCanvas = luciad.view.style.GeoCanvas;
  export = _GeoCanvas;
}

declare module 'luciad/view/style/HatchedImageBuilder' {
  import _HatchedImageBuilder = luciad.view.style.HatchedImageBuilder;
  export = _HatchedImageBuilder;
}

declare module 'luciad/view/style/Icon3DStyle' {
  import _Icon3DStyle = luciad.view.style.Icon3DStyle;
  export = _Icon3DStyle;
}

declare module 'luciad/view/style/IconStyle' {
  import _IconStyle = luciad.view.style.IconStyle;
  export = _IconStyle;
}

declare module 'luciad/view/style/InPathLabelStyle' {
  import _InPathLabelStyle = luciad.view.style.InPathLabelStyle;
  export = _InPathLabelStyle;
}

declare module 'luciad/view/style/LabelCanvas' {
  import _LabelCanvas = luciad.view.style.LabelCanvas;
  export = _LabelCanvas;
}

declare module 'luciad/view/style/LabelStyle' {
  import _LabelStyle = luciad.view.style.LabelStyle;
  export = _LabelStyle;
}

declare module 'luciad/view/style/LineMarker' {
  import _LineMarker = luciad.view.style.LineMarker;
  export = _LineMarker;
}

declare module 'luciad/view/style/LineMarkerType' {
  import _LineMarkerType = luciad.view.style.LineMarkerType;
  export = _LineMarkerType;
}

declare module 'luciad/view/style/LineStyle' {
  import _LineStyle = luciad.view.style.LineStyle;
  export = _LineStyle;
}

declare module 'luciad/view/style/OnPathLabelStyle' {
  import _OnPathLabelStyle = luciad.view.style.OnPathLabelStyle;
  export = _OnPathLabelStyle;
}

declare module 'luciad/view/style/ParameterizedPointStyle' {
  import _ParameterizedPointStyle = luciad.view.style.ParameterizedPointStyle;
  export = _ParameterizedPointStyle;
}

declare module 'luciad/view/style/PathLabelPosition' {
  import _PathLabelPosition = luciad.view.style.PathLabelPosition;
  export = _PathLabelPosition;
}

declare module 'luciad/view/style/PathLabelRotation' {
  import _PathLabelRotation = luciad.view.style.PathLabelRotation;
  export = _PathLabelRotation;
}

declare module 'luciad/view/style/PinEndPosition' {
  import _PinEndPosition = luciad.view.style.PinEndPosition;
  export = _PinEndPosition;
}

declare module 'luciad/view/style/PinStyle' {
  import _PinStyle = luciad.view.style.PinStyle;
  export = _PinStyle;
}

declare module 'luciad/view/style/PointLabelPosition' {
  import _PointLabelPosition = luciad.view.style.PointLabelPosition;
  export = _PointLabelPosition;
}

declare module 'luciad/view/style/PointLabelStyle' {
  import _PointLabelStyle = luciad.view.style.PointLabelStyle;
  export = _PointLabelStyle;
}

declare module 'luciad/view/style/ShapeStyle' {
  import _ShapeStyle = luciad.view.style.ShapeStyle;
  export = _ShapeStyle;
}

declare module 'luciad/view/style/ScalingMode' {
  import _ScalingMode = luciad.view.style.ScalingMode;
  export = _ScalingMode;
}

declare module 'luciad/view/style/PointCloudStyle' {
  import _PointCloudStyle = luciad.view.style.PointCloudStyle;
  export = _PointCloudStyle;
}

declare module 'luciad/view/style/TextStyle' {
  import _TextStyle = luciad.view.style.TextStyle;
  export = _TextStyle;
}

declare module 'luciad/view/tileset/RasterTileSetLayer' {
  import _RasterTileSetLayer = luciad.view.tileset.RasterTileSetLayer;
  export = _RasterTileSetLayer;
}

declare module 'luciad/view/tileset/TileSetAttributionProvider' {
  import _TileSetAttributionProvider = luciad.view.tileset.TileSetAttributionProvider;
  export = _TileSetAttributionProvider;
}

declare module 'luciad/view/tileset/TileSetScaleUtil' {
  import _TileSetScaleUtil = luciad.view.tileset.TileSetScaleUtil;
  export = _TileSetScaleUtil;
}

declare module 'luciad/view/tileset/WMSTileSetLayer' {
  import _WMSTileSetLayer = luciad.view.tileset.WMSTileSetLayer;
  export = _WMSTileSetLayer;
}

declare module 'luciad/view/tileset/TileSet3DLayer' {
  import _TileSet3DLayer = luciad.view.tileset.TileSet3DLayer;
  export = _TileSet3DLayer;
}
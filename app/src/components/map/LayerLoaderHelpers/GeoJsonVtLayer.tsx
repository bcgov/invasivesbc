import L, { TileLayer as LeafletTileLayer, TileLayerOptions } from 'leaflet';
import { createTileLayerComponent, LayerProps, updateGridLayer, withPane } from '@react-leaflet/core';
import geojsonvt from 'geojson-vt';
(window as any).geojsonvt = geojsonvt;
// eslint-disable-next-line import/first
import {} from 'leaflet-geojson-vt/src/leaflet-geojson-vt.js';

export const isFilterSatisfied = (filter, featureProps): boolean => {
  let filterProp = filter[1].toString();
  switch (filter[0]) {
    case '>':
      console.log('>');
      return parseInt(filter[2]) > parseInt(featureProps[filterProp]);

    case '<':
      console.log('<');
      return parseInt(filter[2]) < parseInt(featureProps[filterProp]);

    case '==':
      return filter[2].toString() === featureProps[filterProp].toString();
  }
};

export interface TileLayerProps extends TileLayerOptions, LayerProps {
  geoJSON: any;
  options: any;
}

(String.prototype as any).iscolorHex = function () {
  var sColor = this.toLowerCase();
  var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
  return reg.test(sColor);
};

(String.prototype as any).colorRgb = function (): number[] {
  var sColor = this.toLowerCase();
  if (sColor.length === 4) {
    var sColorNew = '#';
    for (var i = 1; i < 4; i += 1) {
      sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
    }
    sColor = sColorNew;
  }
  var sColorChange = [];
  for (var i = 1; i < 7; i += 2) {
    sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)));
  }
  return sColorChange as number[];
};

(L.GridLayer as any).GeoJSON = L.GridLayer.extend({
  options: {
    async: false
  },

  initialize: function (geojson, options) {
    L.setOptions(this, options.options);
    (L.GridLayer.prototype as any).initialize.call(this, options);
    this.tileIndex = geojsonvt(geojson, this.options);
  },

  createTile: function (coords) {
    // create a <canvas> element for drawing
    var tile = L.DomUtil.create('canvas', 'leaflet-tile');
    // setup tile width and height according to the options
    var size = this.getTileSize();
    tile.width = size.x;
    tile.height = size.y;
    // get a canvas context and draw something on it using coords.x, coords.y and coords.z
    var ctx = tile.getContext('2d');
    // return the tile so it can be rendered on screen
    var tileInfo = this.tileIndex.getTile(coords.z, coords.x, coords.y);
    var features = tileInfo ? tileInfo.features : [];
    for (var i = 0; i < features.length; i++) {
      var feature = features[i];
      this.drawFeature(ctx, feature);
    }
    return tile;
  },

  drawFeature: function (ctx, feature) {
    const type = feature.type;
    ctx.beginPath();
    this.options.layerStyles?.output.rules.forEach((rule) => {
      if (rule.filter) {
        if (isFilterSatisfied(rule?.filter, feature.tags)) {
          this.options.style.color = rule.symbolizers[0].color;
          this.options.style.fillColor = rule.symbolizers[0].color;
        }
      }
    });
    if (this.options.style) {
      this.setStyle(ctx, this.options.style);
    }
    if (type === 2 || type === 3) {
      for (var j = 0; j < feature.geometry.length; j++) {
        var ring = feature.geometry[j];
        for (var k = 0; k < ring.length; k++) {
          var p = ring[k];
          if (k) ctx.lineTo(p[0] / 16.0, p[1] / 16.0);
          else ctx.moveTo(p[0] / 16.0, p[1] / 16.0);
        }
      }
    } else if (type === 1) {
      for (var j = 0; j < feature.geometry.length; j++) {
        var p = feature.geometry[j];
        ctx.arc(p[0] / 16.0, p[1] / 16.0, 2, 0, Math.PI * 2, true);
      }
    }
    if (type === 3) {
      ctx.fill('evenodd');
    }

    ctx.stroke();
  },

  setStyle: function (ctx, style) {
    var stroke = style.stroke || true;
    if (stroke) {
      ctx.lineWidth = style.weight || 5;
      var color = this.setOpacity(style.color, style.opacity);
      ctx.strokeStyle = color;
    } else {
      ctx.lineWidth = 0;
      ctx.strokeStyle = {};
    }
    var fill = style.fill || true;
    if (fill) {
      ctx.fillStyle = style.fillColor || '#03f';
      var color = this.setOpacity(style.fillColor, style.fillOpacity);
      ctx.fillStyle = color;
    } else {
      ctx.fillStyle = {};
    }
  },

  setOpacity: function (color, opacity) {
    if (opacity) {
      var color = color || '#03f';
      if (color.iscolorHex()) {
        var colorRgb = color.colorRgb();
        return 'rgba(' + colorRgb[0] + ',' + colorRgb[1] + ',' + colorRgb[2] + ',' + opacity + ')';
      } else {
        return color;
      }
    } else {
      return color;
    }
  }
});

(L.gridLayer as any).geoJson = function (geojson, options) {
  return new (L.GridLayer as any).GeoJSON(geojson, options);
};

export const GeoJSONVtLayer = createTileLayerComponent<LeafletTileLayer, TileLayerProps>(function createGridLayer(
  { geoJSON, ...options },
  context
) {
  return {
    instance: (L.gridLayer as any).geoJson(geoJSON, withPane(options, context)),
    context
  };
},
updateGridLayer);

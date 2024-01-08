import * as protomaps from 'protomaps';
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useLeafletContext } from '@react-leaflet/core';
import { useSelector } from 'util/use_selector';
import { selectConfiguration } from 'state/reducers/configuration';

export const VectorOverviewLayer = (props) => {
  const map = useMap();
  const context = useLeafletContext();
  const container = context.layerContainer || context.map;
  const CONFIG = useSelector(selectConfiguration);

  const isAuthenticated = useSelector((state: any) => state.Auth.authenticated)


  useEffect(() => {
      if(isAuthenticated === true) return;
      let PAINT_RULES = [
        {
          dataLayer: 'iapp',
          symbolizer: new InvasivesGeoSymbolizer({
            colour: 'rgb(0, 238, 0)'
          })
        },
        {
          dataLayer: 'invasives',
          symbolizer: new InvasivesGeoSymbolizer({
            colour: 'rgb(20, 188, 220)'
          })
        }
      ];
      let LABEL_RULES = [
        {
          dataLayer: 'iapp',
          symbolizer: new InvasivesGeoSymbolizer({
            labeler: (layout, geom, feature) => {
              try {
                return `IAPP Site - ${feature.props.site_id}: ${feature.props.species}`;
              } catch {
                return '';
              }
            }
          })
        },
        {
          dataLayer: 'invasives',
          symbolizer: new InvasivesGeoSymbolizer({
            labeler: (layout, geom, feature) => {
              try {
                let details = '';
                if (feature.props.speciesPositive) {
                  details += 'Species Positive: ' + feature.props.speciesPositive;
                }
                if (feature.props.speciesNegative) {
                  details += 'Species Negative: ' + feature.props.speciesNegative;
                }
                return `${feature.props.id}: ${details}`;
              } catch {
                return '';
              }
            }
          })
        }
      ];

      // noinspection TypeScriptValidateTypes
      var layer = protomaps.leafletLayer({
        url: CONFIG.PUBLIC_MAP_URL,
        paint_rules: PAINT_RULES,
        label_rules: LABEL_RULES,
        maxZoom: 30,
        maxNativeZoom: 23,
        maxDataZoom: 15
      });

      layer.options.zIndex = 9999;

      if (!map.hasLayer(layer)  ) {
        container.addLayer(layer);
      }

      return () => {
        container.removeLayer(layer);
      };
    },
    [JSON.stringify(isAuthenticated)]
  );

  return null;
};

type Labeler = (layout, geom, feature) => string;

interface InvasivesSymbolizerOptions {
  colour?: string,
  labeler?: Labeler
}

class InvasivesGeoSymbolizer {
  colour: string = 'rgb(128, 128, 128)';
  labeler: Labeler = () => ('Unlabeled Feature');

  constructor(options: InvasivesSymbolizerOptions) {
    if (options.colour) {
      this.colour = options.colour;
    }
    if (options.labeler) {
      this.labeler = options.labeler;
    }
  }

  fontForZoom(z: number) {
    let size = 12;

    const sizeMap = {
      13: 12,
      14: 12,
      15: 12,
      16: 12,
      17: 12,
      18: 13,
      19: 13,
      20: 13,
      21: 13,
      22: 14
    };

    if (sizeMap[z]) {
      size = sizeMap[z];
    }

    return `${size}px Tahoma`;
  }

  _drawPoint(context, geom, z, feature) {
    context.globalAlpha = 1;

    let radius = 3;
    let width = 3;

    if (context.zoom > 15) {
      radius = 5;
      width = 5;
    } if (context.zoom > 20) {
      radius = 10;
      width = 10;
    } if (context.zoom > 23) {
      radius = 15;
      width = 15;
    }

    context.lineWidth = 1;
    context.beginPath();
    context.arc(geom[0][0].x, geom[0][0].y, radius + width / 2, 0, 2 * Math.PI);
    context.stroke();

    context.fillStyle = this.colour;
    context.beginPath();
    context.arc(geom[0][0].x, geom[0][0].y, radius, 0, 2 * Math.PI);
    context.fill();
  }

  _drawPoly(context, geom, z, feature) {

    context.fillStyle = this.colour;
    context.beginPath();
    for (var poly of geom) {
      for (var p = 0; p < poly.length - 1; p++) {
        let pt = poly[p];
        if (p == 0) context.moveTo(pt.x, pt.y);
        else context.lineTo(pt.x, pt.y);
      }
    }
    context.fill();
  }

  draw(context, geom, z, feature) {
    if (geom.length > 1) {
      // it's a poly
      if (z < 10) {
        // but draw it as a point at low zoom levels
        this._drawPoint(context, geom, z, feature);
      } else {
        this._drawPoly(context, geom, z, feature);
      }
    } else {
      this._drawPoint(context, geom, z, feature);
    }
  }

  place(layout, geom, feature) {
    if (layout.zoom < 13) return;

    let pt = geom[0][0];
    let name = this.labeler(layout, geom, feature);

    const font = this.fontForZoom(layout.zoom);
    const outlineColor = 'black';

    layout.scratch.font = font;
    let metrics = layout.scratch.measureText(name);
    let width = metrics.width;
    let ascent = metrics.actualBoundingBoxAscent;
    let descent = metrics.actualBoundingBoxDescent;
    let bbox = { minX: pt.x - width / 2, minY: pt.y - ascent, maxX: pt.x + width / 2, maxY: pt.y + descent };

    let draw = (ctx) => {
      ctx.font = font;
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 1;
      ctx.strokeText(name, -width / 2, 20);
      ctx.fillStyle = 'white';
      ctx.fillText(name, -width / 2, 20);
    };

    return [{ anchor: pt, bboxes: [bbox], draw: draw }];
  }
}

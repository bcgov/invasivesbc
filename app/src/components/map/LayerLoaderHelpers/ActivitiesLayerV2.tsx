import L from 'leaflet';
import React, { useEffect, useMemo, useState } from 'react';
import { Marker, useMap, useMapEvent, GeoJSON, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { GeoJSONVtLayer } from './GeoJsonVtLayer';
import center from '@turf/center';
import SLDParser from 'geostyler-sld-parser';
import { InvasivesBCSLD } from '../SldStyles/invasivesbc_sld';
import { renderToStaticMarkup } from 'react-dom/server';
import { DonutSVG } from '../Donut';
import mapIcon from '../Icons/mapicon.png';

enum ZoomTypes {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

const Dummy = (props) => {
  return <></>;
};

export const ActivitiesLayerV2 = (props: any) => {
  // use this use state var to only rerender when necessary
  const map = useMap();
  const [zoomType, setZoomType] = useState(ZoomTypes.LOW);
  const initialOptions = {
    maxZoom: 24,
    tolerance: 100,
    debug: 0,
    extent: 4096, // tile extent (both width and height)
    buffer: 128, // tile buffer on each side
    indexMaxPoints: 100000, // max number of points per tile in the index
    solidChildren: false,
    layerStyles: {},
    style: {
      //      fillColor: props.color,
      //     color: props.color,
      //    strokeColor: props.color,
      stroke: true,
      strokeOpacity: 1,
      strokeWidth: 10,
      opacity: props.opacity,
      fillOpacity: props.opacity / 2,
      weight: 3,
      zIndex: props.zIndex
    }
  };
  const [options, setOptions] = useState(initialOptions);

  /*&
  const initialPalette = {
      Biocontrol : 'white',
      FREP: '#939393',
      Monitoring: 'purple',
      Observation: 'pink',
      Treatment: 'lime'
  };*/
  const [palette, setPalette] = useState(null);

  useEffect(() => {
    getActivitiesSLD();
  }, [props.color]);

  useMapEvent('zoomend', () => {
    const zoom = map.getZoom();
    //    getActivitiesSLD();
    if (zoom < 8) {
      setZoomType(ZoomTypes.LOW);
      return;
    }
    if (zoom >= 8 && zoom < 15) {
      setZoomType(ZoomTypes.MEDIUM);
      return;
    }
    if (zoom >= 15) {
      setZoomType(ZoomTypes.HIGH);
    }
  });

  const getSldStylesFromLocalFile = async () => {
    const sldParser = new SLDParser();
    let styles = await sldParser.readStyle(InvasivesBCSLD);
    return styles;
  };

  const getActivitiesSLD = () => {
    getSldStylesFromLocalFile().then((res) => {
      const Biocontrol = res?.output.rules.find((o) =>
        [
          'Activity_Biocontrol_Collection',
          'Activity_Biocontrol_Release',
          'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant',
          'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant'
        ].includes(o.name)
      );
      const FREP = res?.output.rules.find((o) => ['Activity_FREP_FormC'].includes(o.name));
      const Monitoring = res?.output.rules.find((o) =>
        [
          'Activity_Monitoring_ChemicalTerrestrialAquaticPlant',
          'Activity_Monitoring_ChemicalTerrestrialAquaticPlant'
        ].includes(o.name)
      );
      const Observation = res?.output.rules.find((o) =>
        ['Activity_Observation_PlantAquatic', 'Activity_Observation_PlantTerrestrial'].includes(o.name)
      );
      const Treatment = res?.output.rules.find((o) =>
        [
          'Activity_Treatment_ChemicalPlantAquatic',
          'Activity_Treatment_ChemicalPlantTerrestrial',
          'Activity_Treatment_MechanicalPlantAquatic',
          'Activity_Treatment_MechanicalPlantTerrestrial'
        ].includes(o.name)
      );

      let sldPalette: any = {}; //palette;
      if (props.layerKey <= 2) {
        sldPalette.Biocontrol = Biocontrol?.symbolizers[0].color ?? sldPalette.Biocontrol;
        sldPalette.FREP = FREP?.symbolizers[0].color ?? sldPalette.FREP;
        sldPalette.Monitoring = Monitoring?.symbolizers[0].color ?? sldPalette.Monitoring;
        sldPalette.Observation = Observation?.symbolizers[0].color ?? sldPalette.Observation;
        sldPalette.Treatment = Treatment?.symbolizers[0].color ?? sldPalette.Treatment;
      } else {
        sldPalette.Biocontrol = props.color;
        sldPalette.FREP = props.color;
        sldPalette.Monitoring = props.color;
        sldPalette.Observation = props.color;
        sldPalette.Treatment = props.color;
      }
      setPalette(sldPalette);

      const rule = {
        name: 'iapp_ids_filter',
        filter: ['in', 'site_id', props.ids],
        scaleDenominator: {
          min: 1,
          max: 10000000000
        },
        symbolizers: [
          {
            kind: 'Fill',
            color: '#ed2f49',
            outlineColor: '#232323',
            outlineOpacity: 0.85,
            outlineWidth: 1
          }
        ]
      };
      const rule2 = {
        name: 'iapp_ids_filter2',
        filter: ['not_in', 'site_id', []],
        scaleDenominator: {
          min: 1,
          max: 10000000000
        },
        symbolizers: [
          {
            kind: 'Fill',
            color: '#eb9e34',
            outlineColor: '#232323',
            outlineOpacity: 0.85,
            outlineWidth: 1
          }
        ]
      };
      let updatedOptions: any = {
        ...initialOptions
      };

      if (props.layerKey > 2) {
        updatedOptions.style = {
          ...initialOptions.style,
          fillColor: props.color,
          color: props.color,
          strokeColor: props.color
        };
      } else {
        updatedOptions.layerStyles = { output: { ...res.output, rules: [...res.output.rules, rule, rule2] } };
      }

      setOptions({
        ...updatedOptions
      });
      /*} else {
        setOptions({ ...initialOptions, layerStyles: { output: { ...res.output, rules: [...res.output.rules] } } });
      }*/
    });
  };

  const MarkerMemo = useMemo(() => {
    if (props.activities && props.activities.features && props.color && palette && props.enabled) {
      const createClusterCustomIcon = (cluster) => {
        const markers = cluster.getAllChildMarkers();
        const data = [];
        markers.forEach((obj) => {
          const marker = obj.options.children.props.bufferedGeo.features[0];
          if (data.length === 0) {
            data.push({
              name: marker?.properties?.type,
              count: 1,
              fillColour: palette[marker?.properties?.type]
            });
          } else {
            let flag = 0;
            for (let i of data) {
              if (marker?.properties?.type === i.name) {
                flag = 1;
                i.count += 1;
                i.fillColour = palette[i.name];
                break;
              }
            }
            if (flag === 0) {
              data.push({
                name: marker?.properties?.type,
                count: 1,
                fillColour: palette[marker?.properties?.type]
              });
            }
          }
        });
        return L.divIcon({
          html: renderToStaticMarkup(<DonutSVG bins={200} data={data} />),
          className: '',
          iconSize: [64, 64],
          iconAnchor: [32, 32]
        });
      };
      return (
        <MarkerClusterGroup key={Math.random()} iconCreateFunction={createClusterCustomIcon}>
          {props.activities?.features?.map((a) => {
            if (a?.geometry?.type) {
              const position = center(a)?.geometry?.coordinates;
              const bufferedGeo = {
                type: 'FeatureCollection',
                features: [a]
              };
              if (a?.properties?.id && a?.properties?.type && a?.properties.type !== null && palette)
                return (
                  <Marker
                    icon={L.divIcon({
                      html: `
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 100 100"
                          version="1.1"
                          preserveAspectRatio="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M45 0C27.677 0 13.584 14.093 13.584 31.416a31.13 31.13 0 0 0 3.175 13.773c2.905 5.831 11.409 20.208 20.412 35.428l4.385 7.417a4 4 0 0 0 6.888 0l4.382-7.413c8.942-15.116 17.392-29.4 20.353-35.309.027-.051.055-.103.08-.155a31.131 31.131 0 0 0 3.157-13.741C76.416 14.093 62.323 0 45 0zm0 42.81c-6.892 0-12.5-5.607-12.5-12.5s5.608-12.5 12.5-12.5 12.5 5.608 12.5 12.5-5.608 12.5-12.5 12.5z"
                            style="stroke:none;stroke-width:1;stroke-dasharray:none;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;
                            fill:${
                              palette[a?.properties?.type]
                            };fill-rule:nonzero;opacity:1" transform="matrix(1 0 0 1 0 0)"
                          />
                        </svg>`,
                      className: '',
                      iconSize: [10, 17.5],
                      iconAnchor: [18, 35]
                    })}
                    position={[position[1], position[0]]}
                    key={'activity_marker' + a.properties.id}>
                    <Dummy bufferedGeo={bufferedGeo} />
                  </Marker>
                );
            }
          })}
        </MarkerClusterGroup>
      );
    } else return <></>;
  }, [props.color, props.activities?.features, palette, props.enabled]);

  /*  return (
    <>
      <GeoJSON key={Math.random()} data={props.activities} style={options.style} />
    </>
  );
  */

  const GeoJSONMemo = useMemo(() => {
    return <GeoJSONVtLayer zIndex={props.zIndex} key={Math.random()} geoJSON={props.activities} options={options} />;
  }, [props.activities, options, props.ids]);

  return useMemo(() => {
    if (props.isIAPP) {
      return GeoJSONMemo;
    }
    if (props.activities && props.activities.features && props.color && props.enabled) {
      switch (zoomType) {
        case ZoomTypes.HIGH:
          return GeoJSONMemo;
        case ZoomTypes.MEDIUM:
          return MarkerMemo;
        //return GeoJSONMemo;
        case ZoomTypes.LOW:
          return MarkerMemo;
        //return GeoJSONMemo;
      }
    } else return <></>;
  }, [
    JSON.stringify(props.color),
    JSON.stringify(props.enabled),
    JSON.stringify(props.activities),
    props.zIndex,
    JSON.stringify(zoomType),
    palette,
    options,
    props.ids
  ]);
};

import { MouseEvent, useEffect, useState } from 'react';
import { SourceSpecification } from 'maplibre-gl';
import { shallowEqual } from 'react-redux';
import { useDispatch, useSelector } from './use_selector';
import UserSettings from 'state/actions/userSettings/UserSettings';
import Prompt from 'state/actions/prompts/Prompt';
import {
  InvasivesMapLayerDefinitionWithState,
  LayerSpecificationWithStackingOrder
} from 'UI/Features/LegacyMap/helpers/functional/layers-hook';
import { buildCompleteRecordsetMapSpecificationFromRecordsets } from 'UI/Features/LegacyMap/helpers/functional/recordset-layers';
import { LAYER_Z_FOREGROUND } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/types';
import { selectGlobalRecordsetFilters } from 'state/reducers/map';

/**
 * @desc Custom Hook for getting Recordset Control actions in one unified location.
 * @param id Recordset identifier
 */
const useRecordSetControls = (id?: string) => {
  const ERROR_MESSAGE = 'ID not provided for this function';

  const dispatch = useDispatch();

  const [recordsetLayers, setRecordsetLayers] = useState<LayerSpecificationWithStackingOrder[]>([]);
  const [recordsetSources, setRecordsetSources] = useState<{ [_: string]: SourceSpecification }>({});
  const recordsets = useSelector((state) => state.UserSettings.recordSets, shallowEqual);

  // Predicate variables.
  const MOBILE = useSelector((state) => state.Configuration.current.build.MOBILE);
  const DEBUG = useSelector((state) => state.Configuration.current.build.DEBUG);
  const platform = useSelector((state) => state.Configuration.current.build.PLATFORM);
  const features = useSelector((state) => state.Configuration.current.features);
  const loggedInOrWorkingOffline = useSelector((state) => state.Auth.loggedInOrWorkingOffline);
  const connected = useSelector((state) => state.Network.connected);
  const globalMapFilters = useSelector(selectGlobalRecordsetFilters);

  /**
   * Rebuild Recordset layers when recordsets/auth/online status changes.
   */
  useEffect(() => {
    const recordSetData = buildCompleteRecordsetMapSpecificationFromRecordsets(recordsets, globalMapFilters);
    const filteredRecordDefinitions: Array<InvasivesMapLayerDefinitionWithState> = [];

    for (const l of recordSetData.definitions) {
      const pass = (() => {
        switch (true) {
          case !l.predicates.directlySelectable:
          case l.predicates.mobileOnly && !MOBILE:
          case l.predicates.webOnly && MOBILE:
          case l.predicates.requiresDebug && !DEBUG:
          case l.predicates.requiresPlatform !== undefined && l.predicates.requiresPlatform !== platform:
          case l.predicates.requiresFeature !== undefined && !features[l.predicates.requiresFeature].enabled:
          case l.predicates.requiresAuthentication && !loggedInOrWorkingOffline:
          case l.predicates.requiresAnonymous && loggedInOrWorkingOffline:
          case l.predicates.requiresNetwork && !connected:
          case l.predicates.requiresOffline && connected:
            return false;
          default:
            return true;
        }
      })();

      if (pass) {
        filteredRecordDefinitions.push({
          active: recordsets[l.name].mapToggle,
          ...l
        });
      }
    }
    const newLayers: LayerSpecificationWithStackingOrder[] = [];
    const requiredSources: Array<keyof typeof recordSetData.sources | string> = [];

    filteredRecordDefinitions.forEach((l) => {
      if (l.active) {
        for (const subLayer of l.layers) {
          newLayers.push({
            stackLayer: LAYER_Z_FOREGROUND,
            ...subLayer
          });
          if (subLayer.source && !requiredSources.includes(subLayer.source)) {
            requiredSources.push(subLayer.source);
          }
        }
      }
    });

    setRecordsetSources(recordSetData.sources);
    setRecordsetLayers(newLayers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordsets, connected, loggedInOrWorkingOffline, globalMapFilters]);

  const toggleRecordsetLabel = (e?: MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    if (!id) throw new Error(ERROR_MESSAGE);
    dispatch(UserSettings.RecordSet.toggleLabelVisibility(id));
  };

  const toggleRecordsetLayer = (e?: MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    if (!id) throw new Error(ERROR_MESSAGE);
    dispatch(UserSettings.RecordSet.toggleVisibility(id));
  };
  const deleteRecordSet = (e?: MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    if (!id) throw new Error(ERROR_MESSAGE);
    const callback = (userConfirmation: boolean) => {
      if (userConfirmation) {
        dispatch(UserSettings.RecordSet.requestRemoval({ setId: id }));
      }
    };
    dispatch(
      Prompt.confirmation({
        title: 'Deleting Record Set',
        prompt: [
          'Are you sure you want to remove this record set?',
          'The data will persist but you will no longer have this set of filters or the map layer.'
        ],
        callback
      })
    );
  };
  const cycleRecordsetColour = (e?: MouseEvent<HTMLButtonElement>) => {
    if (!id) throw new Error(ERROR_MESSAGE);
    e?.stopPropagation();
    dispatch(UserSettings.RecordSet.cycleColourById(id));
  };

  return {
    cycleRecordsetColour,
    toggleRecordsetLabel,
    toggleRecordsetLayer,
    deleteRecordSet,
    recordsetLayers,
    recordsetSources
  };
};

export { useRecordSetControls };

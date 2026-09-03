import FormCode from 'interfaces/FormCode';
import IOfflineActivityRow from 'interfaces/TableRows/IOfflineActivityRow';
import moment from 'moment';
import { useMemo } from 'react';
import { ActivitySubtypesShortLabels, ActivitySubtypesToType } from 'sharedAPI';
import { OfflineActivityRecord, OfflineActivitySyncState } from 'state/reducers/offlineActivity';
import { useSelector } from 'utils/use_selector';

type Options = {
  startIndex: number;
  endIndex: number;
  filterUnsynced?: boolean;
};

const useOfflineRecordsetEntries = (options: Options) => {
  /**
   * @desc convert a form code to a full code.
   * @param code Code to translate
   * @param codes List of possible codes
   * @returns
   */
  const codeToFull = (code: string, codes: Array<FormCode>) => codes.find((c) => c.code === code)?.full_name;

  /**
   * @desc Scans a record for plant codes and returns a stringified list of all plants in record.
   * @param {OfflineActivityRecord} data Record entry
   * @returns String of full plant codes
   */
  const drillForPlants = (data): string => {
    const { entries, treatment_context } = data.subtype_data;
    const plants = new Set<string | undefined>();
    entries?.forEach((e) => {
      plants.add(e?.invasive_plant_aquatic);
      plants.add(e?.invasive_plant);
    });
    treatment_context?.plants_treated?.forEach((pt) => plants.add(pt.invasive_plant));
    plants.delete(undefined); // Remove undefined (if exists)
    return Array.from(plants)
      .map(
        (p) =>
          codeToFull(p as string, codes.TerrestrialPlantCode) ?? codeToFull(p as string, codes.AquaticPlantCode) ?? p
      )
      .join(', ');
  };

  const codes = useSelector((state) => state.ActivityPage.formCodes);
  const serial = useSelector((state) => state.OfflineActivity.serial);
  const serializedActivities: Record<PropertyKey, OfflineActivityRecord> = useSelector(
    (state) => state.OfflineActivity.serializedActivities
  );

  /**
   * @desc formatted serializedActivities for Recordset rows
   */
  const serializedEntries: Array<IOfflineActivityRow> = useMemo(
    () =>
      Object.values(serializedActivities)
        .map((s) => {
          const data = JSON.parse((s as { data: string }).data);
          // TODO: remove early return as part of Issue #4638 - 'Remove RJSF from frontend'
          if (!data?.subtype_data) return null;
          const plants = drillForPlants(data);
          const jurisdictions = data?.jurisdictions
            .map((e) =>
              e.jurisdiction ? codeToFull(e.jurisdiction, codes.JurisdictionCode) + ` (${e?.percent_covered}%)` : ''
            )
            .join(', ');
          const fundingAgency = data?.funding_agencies
            .map((a) => codeToFull(a.invasive_species_agency_code, codes.FundingAgencyCode))
            .join(', ');

          return {
            activity_id: data?.id,
            short_id: data?.short_id,
            type: ActivitySubtypesToType[data?.subtype],
            saved_at: moment(s.saved_at).fromNow(),
            saved_stamp: s.saved_at,
            subtype: ActivitySubtypesShortLabels[data?.subtype],
            date: data?.date,
            geom: data?.shape,
            area_m: `${data?.area_m?.toLocaleString()}m²`,
            jurisdictions: jurisdictions,
            invasive_plants: plants,
            created_by: data?.created_by,
            funding_agencies: fundingAgency,
            status: s?.sync_state
          };
        }) // TODO: remove null filter as part of Issue #4638 - 'Remove RJSF from frontend'.
        .filter(Boolean)
        .sort((a, b) => b!.saved_stamp - a!.saved_stamp) as Array<IOfflineActivityRow>,

    [serializedActivities, serial, options?.filterUnsynced]
  );

  /**
   * Subset of all Serialized Activities
   */
  const returnedEntries = useMemo(() => {
    if (options?.filterUnsynced) {
      return serializedEntries
        .filter((r) => r?.status !== OfflineActivitySyncState.SYNCHRONIZED)
        .slice(options?.startIndex, options?.endIndex);
    }
    return serializedEntries.slice(options?.startIndex, options?.endIndex);
  }, [serializedEntries, options?.startIndex, options?.endIndex]);

  return {
    drillForPlants,
    offlineRows: returnedEntries
  };
};

export default useOfflineRecordsetEntries;

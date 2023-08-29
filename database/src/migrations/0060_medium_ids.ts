import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `


    set search_path='invasivesbc';



    with new_formula_columns as 
    
    (
      select 23::text as year_code,
    
         case
      when activity_subtype = 'Activity_Observation_PlantTerrestrial' then 'PTO'
      when activity_subtype = 'Activity_Observation_PlantTerrestrial_BulkEdit' then 'PTO'
      when activity_subtype = 'Activity_Observation_PlantAquatic' then 'PAO'
      when activity_subtype = 'Activity_AnimalActivity_AnimalTerrestrial' then 'ATO'
      when activity_subtype = 'Activity_AnimalActivity_AnimalAquatic' then 'AAO'
      when activity_subtype = 'Activity_Treatment_ChemicalPlantTerrestrial' then 'PTC'
      when activity_subtype = 'Activity_Treatment_ChemicalPlant_BulkEdit' then 'PTC'
      when activity_subtype = 'Activity_Treatment_ChemicalPlantAquatic' then 'PAC'
      when activity_subtype = 'Activity_Treatment_MechanicalPlantTerrestrial' then 'PTM'
      when activity_subtype = 'Activity_Treatment_MechanicalPlant_BulkEdit' then 'PTM'
      when activity_subtype = 'Activity_Treatment_MechanicalPlantAquatic' then 'PAM'
      when activity_subtype = 'Activity_Biocontrol_Release' then 'PBR'
      when activity_subtype = 'Activity_Treatment_BiologicalPlant_BulkEdit' then 'PBR'
      when activity_subtype = 'Activity_Treatment_ChemicalAnimalTerrestrial' then 'ATC'
      when activity_subtype = 'Activity_Treatment_MechanicalAnimalTerrestrial' then 'ATM'
      when activity_subtype = 'Activity_Treatment_MechanicalAnimalAquatic' then 'AAM'
      when activity_subtype = 'Activity_Treatment_ChemicalAnimalAquatic' then 'AAC'
      when activity_subtype = 'Activity_Monitoring_ChemicalTerrestrialAquaticPlant' then 'PMC'
      when activity_subtype = 'Activity_Monitoring_MechanicalTerrestrialAquaticPlant' then 'PMM'
      when activity_subtype = 'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant' then 'PBM'
      when activity_subtype = 'Activity_Monitoring_ChemicalAnimalTerrestrial' then 'AMC'
      when activity_subtype = 'Activity_Monitoring_MechanicalAnimalTerrestrial' then 'AMM'
      when activity_subtype = 'Activity_Transect_FireMonitoring' then 'PXW'
      when activity_subtype = 'Activity_Transect_Vegetation' then 'PXV'
      when activity_subtype = 'Activity_Transect_BiocontrolEfficacy' then 'PXB'
      when activity_subtype = 'Activity_Biocontrol_Collection' then 'PBC'
      when activity_subtype = 'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant' then 'PBD'
      when activity_subtype = 'Activity_FREP_FormA' then 'PFA'
      when activity_subtype = 'Activity_FREP_FormB' then 'PFB'
      when activity_subtype = 'Activity_FREP_FormC' then 'PFC'
      else 'FUC' end as next_3,
    
      substring(aid.activity_id::text, 0, 9) as not_really_unique_last_10,
      aid.activity_id ,
      aid.activity_incoming_data_id
      from activity_incoming_data aid
     
      
    ),
    new_formula_columns_conc as 
    
    (
      
      select UPPER(year_code || next_3 || not_really_unique_last_10) as new_code_rebuilt,
      activity_id, activity_incoming_data_id
      from new_formula_columns)
      
      
    
      
      update activity_incoming_data a 
      
      set activity_payload = jsonb_set(
        a.activity_payload,
        '{short_id}',
        to_jsonb(n.new_code_rebuilt),
        false)
        
        ,
        short_id = n.new_code_rebuilt
        
       from new_formula_columns_conc n
       
          
         where n.activity_id = a.activity_id;
    
`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  set search_path='invasivesbc';



  with new_formula_columns as 
  
  (
    select 23::text as year_code,
  
       case
    when activity_subtype = 'Activity_Observation_PlantTerrestrial' then 'PTO'
    when activity_subtype = 'Activity_Observation_PlantTerrestrial_BulkEdit' then 'PTO'
    when activity_subtype = 'Activity_Observation_PlantAquatic' then 'PAO'
    when activity_subtype = 'Activity_AnimalActivity_AnimalTerrestrial' then 'ATO'
    when activity_subtype = 'Activity_AnimalActivity_AnimalAquatic' then 'AAO'
    when activity_subtype = 'Activity_Treatment_ChemicalPlantTerrestrial' then 'PTC'
    when activity_subtype = 'Activity_Treatment_ChemicalPlant_BulkEdit' then 'PTC'
    when activity_subtype = 'Activity_Treatment_ChemicalPlantAquatic' then 'PAC'
    when activity_subtype = 'Activity_Treatment_MechanicalPlantTerrestrial' then 'PTM'
    when activity_subtype = 'Activity_Treatment_MechanicalPlant_BulkEdit' then 'PTM'
    when activity_subtype = 'Activity_Treatment_MechanicalPlantAquatic' then 'PAM'
    when activity_subtype = 'Activity_Biocontrol_Release' then 'PBR'
    when activity_subtype = 'Activity_Treatment_BiologicalPlant_BulkEdit' then 'PBR'
    when activity_subtype = 'Activity_Treatment_ChemicalAnimalTerrestrial' then 'ATC'
    when activity_subtype = 'Activity_Treatment_MechanicalAnimalTerrestrial' then 'ATM'
    when activity_subtype = 'Activity_Treatment_MechanicalAnimalAquatic' then 'AAM'
    when activity_subtype = 'Activity_Treatment_ChemicalAnimalAquatic' then 'AAC'
    when activity_subtype = 'Activity_Monitoring_ChemicalTerrestrialAquaticPlant' then 'PMC'
    when activity_subtype = 'Activity_Monitoring_MechanicalTerrestrialAquaticPlant' then 'PMM'
    when activity_subtype = 'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant' then 'PBM'
    when activity_subtype = 'Activity_Monitoring_ChemicalAnimalTerrestrial' then 'AMC'
    when activity_subtype = 'Activity_Monitoring_MechanicalAnimalTerrestrial' then 'AMM'
    when activity_subtype = 'Activity_Transect_FireMonitoring' then 'PXW'
    when activity_subtype = 'Activity_Transect_Vegetation' then 'PXV'
    when activity_subtype = 'Activity_Transect_BiocontrolEfficacy' then 'PXB'
    when activity_subtype = 'Activity_Biocontrol_Collection' then 'PBC'
    when activity_subtype = 'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant' then 'PBD'
    when activity_subtype = 'Activity_FREP_FormA' then 'PFA'
    when activity_subtype = 'Activity_FREP_FormB' then 'PFB'
    when activity_subtype = 'Activity_FREP_FormC' then 'PFC'
    else 'FUC' end as next_3,
  
    substring(aid.activity_id::text, 0, 5) as not_really_unique_last_10,
    aid.activity_id ,
    aid.activity_incoming_data_id
    from activity_incoming_data aid
   
    
  ),
  new_formula_columns_conc as 
  
  (
    
    select UPPER(year_code || next_3 || not_really_unique_last_10) as new_code_rebuilt,
    activity_id, activity_incoming_data_id
    from new_formula_columns)
    
    
  
    
    update activity_incoming_data a 
    
    set activity_payload = jsonb_set(
      a.activity_payload,
      '{short_id}',
      to_jsonb(n.new_code_rebuilt),
      false)
      
      ,
      short_id = n.new_code_rebuilt
      
     from new_formula_columns_conc n
     
        
       where n.activity_id = a.activity_id;

  `);
}

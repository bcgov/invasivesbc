from django.db import migrations

"""
Django isn't a fan of our "schema"."table" syntax, so it doesn't always catch when foreign keys change.
In this case, moving from 'TerrestrialPlantCode' -> 'PlantsWithBiocontrol' didn't update the constraints.
This causes plants that fall under 'Aquatic' to fail on submission. e.g.: 'Flowering Rush'.
This manually patches the constraints to correct them to the correct foreign lookup table.
"""


class Migration(migrations.Migration):
    dependencies = [("api", "0044_team_dates_use_local_today")]

    operations = [
        migrations.RunSQL(
            sql="""
                -- Release Modifications
                ALTER TABLE activity.biocontrol_release_pt
                    DROP CONSTRAINT IF EXISTS biocontrol_release_p_invasive_plant_id_7fb35a76_fk_terrestri,
                    DROP CONSTRAINT IF EXISTS biocontrol_release_p_plant_collected_from_9ea2e01e_fk_terrestri,
                    DROP CONSTRAINT IF EXISTS biocontrol_release_pt_invasive_plant_fk,
                    DROP CONSTRAINT IF EXISTS biocontrol_release_pt_plant_collected_from_fk;

                ALTER TABLE activity.biocontrol_release_pt
                    ADD CONSTRAINT biocontrol_release_pt_invasive_plant_fk
                        FOREIGN KEY (invasive_plant_id)
                        REFERENCES codes.plants_with_biocontrol (code)
                        DEFERRABLE INITIALLY DEFERRED,
                    ADD CONSTRAINT biocontrol_release_pt_plant_collected_from_fk
                        FOREIGN KEY (plant_collected_from_id)
                        REFERENCES codes.plants_with_biocontrol (code)
                        DEFERRABLE INITIALLY DEFERRED;

                -- Dispersal Modifications
                ALTER TABLE activity.monitoring_biocontrol_dispersal_entries_pt
                    DROP CONSTRAINT IF EXISTS monitoring_biocontro_invasive_plant_id_245e5338_fk_terrestri,
                    DROP CONSTRAINT IF EXISTS biocontrol_dispersal_entries_pt_invasive_plant_fk;

                ALTER TABLE activity.monitoring_biocontrol_dispersal_entries_pt
                    ADD CONSTRAINT biocontrol_dispersal_entries_pt_invasive_plant_fk
                        FOREIGN KEY (invasive_plant_id)
                        REFERENCES codes.plants_with_biocontrol (code)
                        DEFERRABLE INITIALLY DEFERRED;

                -- Collection Modifications
                ALTER TABLE activity.biocontrol_collection_entries_pt
                    DROP CONSTRAINT IF EXISTS biocontrol_collectio_invasive_plant_id_e8c141ed_fk_terrestri,
                    DROP CONSTRAINT IF EXISTS biocontrol_collection_entries_pt_invasive_plant_fk;

                ALTER TABLE activity.biocontrol_collection_entries_pt
                    ADD CONSTRAINT biocontrol_collection_entries_pt_invasive_plant_fk
                        FOREIGN KEY (invasive_plant_id)
                        REFERENCES codes.plants_with_biocontrol (code)
                        DEFERRABLE INITIALLY DEFERRED;
            """,
            reverse_sql="""
                ALTER TABLE activity.biocontrol_release_pt
                    DROP CONSTRAINT IF EXISTS biocontrol_release_pt_invasive_plant_fk,
                    DROP CONSTRAINT IF EXISTS biocontrol_release_pt_plant_collected_from_fk,
                    DROP CONSTRAINT IF EXISTS biocontrol_release_p_invasive_plant_id_7fb35a76_fk_terrestri,
                    DROP CONSTRAINT IF EXISTS biocontrol_release_p_plant_collected_from_9ea2e01e_fk_terrestri;

                ALTER TABLE activity.biocontrol_release_pt
                    ADD CONSTRAINT biocontrol_release_p_invasive_plant_id_7fb35a76_fk_terrestri
                        FOREIGN KEY (invasive_plant_id)
                        REFERENCES codes.terrestrial_plant_code (code)
                        DEFERRABLE INITIALLY DEFERRED,
                    ADD CONSTRAINT biocontrol_release_p_plant_collected_from_9ea2e01e_fk_terrestri
                        FOREIGN KEY (plant_collected_from_id)
                        REFERENCES codes.terrestrial_plant_code (code)
                        DEFERRABLE INITIALLY DEFERRED;


                -- Dispersal Modifications
                ALTER TABLE activity.monitoring_biocontrol_dispersal_entries_pt
                    DROP CONSTRAINT IF EXISTS biocontrol_dispersal_entries_pt_invasive_plant_fk,
                    DROP CONSTRAINT IF EXISTS monitoring_biocontro_invasive_plant_id_245e5338_fk_terrestri;

                ALTER TABLE activity.monitoring_biocontrol_dispersal_entries_pt
                    ADD CONSTRAINT monitoring_biocontro_invasive_plant_id_245e5338_fk_terrestri
                        FOREIGN KEY (invasive_plant_id)
                        REFERENCES codes.terrestrial_plant_code (code)
                        DEFERRABLE INITIALLY DEFERRED;

                -- Collection Modifications
                ALTER TABLE activity.biocontrol_collection_entries_pt
                    DROP CONSTRAINT IF EXISTS biocontrol_collection_entries_pt_invasive_plant_fk,
                    DROP CONSTRAINT IF EXISTS biocontrol_collectio_invasive_plant_id_e8c141ed_fk_terrestri;

                ALTER TABLE activity.biocontrol_collection_entries_pt
                    ADD CONSTRAINT biocontrol_collectio_invasive_plant_id_e8c141ed_fk_terrestri
                        FOREIGN KEY (invasive_plant_id)
                        REFERENCES codes.terrestrial_plant_code (code)
                        DEFERRABLE INITIALLY DEFERRED;
            """,
        ),
    ]

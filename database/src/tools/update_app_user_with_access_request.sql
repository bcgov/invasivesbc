    update invasivesbc.application_user a
        set
            first_name=b.first_name,
            last_name=b.last_name,
            email=b.primary_email,
            preferred_username=b.idir_account_name,
            account_status=1,
            expiry_date=current_timestamp + interval '1 year',
            activation_status=1,
            updated_at=current_timestamp,            idir_account_name=b.idir_account_name,
            work_phone_number=b.work_phone_number,
            funding_agencies=b.funding_agencies,
            employer=b.employer,
            pac_number=b.pac_number,
            pac_service_number_1=b.pac_service_number_1,
            pac_service_number_2=b.pac_service_number_2
        from invasivesbc.access_request b
            where a.idir_userid = b.idir_userid; 


    update invasivesbc.application_user a
        set
            first_name=b.first_name,
            last_name=b.last_name,
            email=b.primary_email,
            preferred_username=b.bceid_account_name,
            account_status=1,
            expiry_date=current_timestamp + interval '1 year',
            activation_status=1,
            updated_at=current_timestamp,
            bceid_account_name=b.bceid_account_name,
            work_phone_number=b.work_phone_number,
            funding_agencies=b.funding_agencies,
            employer=b.employer,
            pac_number=b.pac_number,
            pac_service_number_1=b.pac_service_number_1,
            pac_service_number_2=b.pac_service_number_2
        from invasivesbc.access_request b
            where b.bceid_userid = a.bceid_userid;



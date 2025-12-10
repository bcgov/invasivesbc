from django.contrib import admin
from .db_models import codes, activity

admin.site.register(codes.ActivitySubtypeCode)
admin.site.register(activity.ActivityBasic)
admin.site.register(codes.AdjacentLandUseCode)
admin.site.register(codes.AquaticPlantCode)
admin.site.register(codes.BioAgentCollectionMethodCode)
admin.site.register(codes.JurisdictionCode)
admin.site.register(codes.EmployerCode)
admin.site.register(codes.FundingAgencyCode)
admin.site.register(activity.Employer)
admin.site.register(activity.Jurisdiction)
admin.site.register(activity.LinkedRecord)
admin.site.register(activity.Participant)
admin.site.register(activity.ProjectCode)
admin.site.register(activity.FundingAgency)

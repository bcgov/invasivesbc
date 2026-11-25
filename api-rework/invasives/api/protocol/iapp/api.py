from ninja import Router
from api.ninja_authentication import NinjaAnyRoleRequired
from django.shortcuts import get_object_or_404
from api.protocol.recordset import FilterObjectsIn
from api.models.iapp import IAPPSite
from api.utils.filtered_iapp_queryset import FilteredIappQueryset
from . import IAPPRowResponse, IappSiteOut, BIOCONTROL_ROLES

ROOT_PATH = "/iapp"
router = Router(auth=NinjaAnyRoleRequired())
# router = Router(auth=None)


@router.post("/rows", response=IAPPRowResponse)
def get_iapp_rows(request, data: FilterObjectsIn):
    req = data.model_dump(mode="json", exclude_unset=True)
    filter_objects = req.get("filterObjects", [])

    iapp = FilteredIappQueryset(filter_objects=filter_objects, user=request.auth)
    total_records = iapp.queryset.count()
    entries = iapp.paginate().queryset

    return {"count": total_records, "entries": entries}


@router.get("/site/{id}", response=IappSiteOut)
def get_iapp_site(request, id: int):
    kwargs = {"site_id": id}
    # if not request.auth.has_any_role(list(BIOCONTROL_ROLES)):
    #     kwargs["protected"] = False

    return get_object_or_404(IAPPSite, **kwargs)

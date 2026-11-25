from ninja import Router
from api.ninja_authentication import NinjaAnyRoleRequired
from api.models.iapp import IAPPSite
from api.protocol.recordset import FilterObjectsIn
from api.utils.filtered_iapp_queryset import FilteredIappQueryset
from . import IAPPRowResponse

ROOT_PATH = "/iapp"
router = Router(auth=NinjaAnyRoleRequired())


@router.post("/rows", response=IAPPRowResponse)
def get_iapp_rows(request, data: FilterObjectsIn):
    req = data.model_dump(mode="json", exclude_unset=True)
    filter_objects = req.get("filterObjects", [])

    iapp = FilteredIappQueryset(filter_objects=filter_objects, user=request.auth)
    total_records = iapp.queryset.count()
    entries = iapp.paginate().queryset

    return {"count": total_records, "entries": entries}

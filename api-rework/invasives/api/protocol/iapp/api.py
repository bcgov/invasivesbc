from ninja import Router
from api.ninja_authentication import NinjaAnyRoleRequired
from api.models.iapp import IAPPSite
from . import IAPPRowResponse

ROOT_PATH = "/iapp"
router = Router(auth=NinjaAnyRoleRequired())
router = Router(auth=None)


@router.post("/rows", response=IAPPRowResponse)
def get_iapp_rows(request):
    qs = IAPPSite.objects.all()
    return {"count": qs.count(), "entries": qs[0:20]}

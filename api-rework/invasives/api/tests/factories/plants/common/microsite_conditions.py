from api.tests.factories.helpers import rand_code
from api.models.codes import MesoslopePositionCode, SiteSurfaceShapeCode


def build_microsite_conditions():
    return {
        "mesoslope_position": rand_code(model=MesoslopePositionCode),
        "site_surface_shape": rand_code(model=SiteSurfaceShapeCode),
    }

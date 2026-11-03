import uuid
import random
from api.tests.factories.helpers import rand_code, rand_code_list
from api.tests.factories.common import build_user, build_postal_code, build_date_str
from api.models.codes import EmployerCode, FundingAgencyCode, JurisdictionCode
from api.models.activity import ActivitySubtypes, FormStatus
from api.models.auth import User


def build_jurisdictions(min: int = 1, max: int = 3):
    num_entries = random.randint(min, max)

    codes = set()
    while len(codes) < num_entries:
        codes.add(rand_code(JurisdictionCode))
    cuts = sorted(random.sample(range(1, 100), num_entries - 1))
    bounds = [0, *cuts, 100]
    percents = [hi - lo for lo, hi in zip(bounds, bounds[1:])]

    return [
        {"jurisdiction": code, "percent_covered": percent}
        for code, percent in zip(codes, percents)
    ]


def build_project_codes(min: int = 0, max: int = 3):
    codes = set()
    for _ in range(random.randint(min, max)):
        codes.add(build_postal_code())
    return [{"description": code} for code in codes]


def build_shape() -> dict:
    """TODO: Randomize"""
    return {
        "area_m": 4,
        "latitude": 48.412051,
        "longitude": -123.36242,
        "utm_zone": 10,
        "utm_easting": 473181,
        "utm_northing": 5362163,
        "linked_activities": [],
        "shape": {
            "type": "Feature",
            "properties": {"error": "false"},
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [-123.36242038371847, 48.41206179409837],
                        [-123.36243177677059, 48.41205866166875],
                        [-123.36243649592491, 48.41205109931549],
                        [-123.36243177676721, 48.41204353696336],
                        [-123.36242038371847, 48.41204040453487],
                        [-123.36240899066973, 48.41204353696336],
                        [-123.36240427151202, 48.41205109931549],
                        [-123.36240899066635, 48.41205866166875],
                        [-123.36242038371847, 48.41206179409837],
                    ]
                ],
            },
        },
    }


def build_participants(subtype: ActivitySubtypes, min: int = 1, max: int = 3):
    codes = set()
    for _ in range(random.randrange(min, max)):
        codes.add(build_user())
    if subtype in [
        ActivitySubtypes.Treatment_Chemical_Plant_Aquatic.name,
        ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial.name,
    ]:
        return [
            {"name": code, "pac_number": random.randrange(1, 99999)} for code in codes
        ]
    return [{"name": code} for code in codes]


def build_mock_base(subject, subtype: ActivitySubtypes, form_id: uuid = uuid.uuid4()):
    user, _ = User.objects.get_or_create(
        subject=subject, defaults={"display_name": build_user()}
    )
    print(subtype.typeOfActivity.value)
    return {
        "id": str(form_id),
        "short_id": None,  # Activity model will handle it
        "subtype": subtype.name,
        "type": subtype.typeOfActivity.value,
        "employer": rand_code_list(model=EmployerCode, key="employer"),
        "funding_agencies": rand_code_list(
            model=FundingAgencyCode, key="invasive_species_agency_code"
        ),
        "jurisdictions": build_jurisdictions(),
        "projects": build_project_codes(),
        "subtype_data": None,
        "location_description": str(uuid.uuid4()),
        "access_description": str(uuid.uuid4()),
        "form_status": FormStatus.Submitted.value,
        "date": build_date_str(),
        "comment": str(uuid.uuid4()),
        "participants": build_participants(subtype),
        "creating_user": user,
        "media": [],
        "created_by": build_user(),
        **build_shape(),
    }

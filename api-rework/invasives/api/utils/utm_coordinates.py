import logging
import re
from dataclasses import dataclass

import pyproj
import shapely
from pyproj.aoi import AreaOfInterest
from pyproj.database import CRSInfo, query_utm_crs_info
from shapely import Point


@dataclass
class UTMCoordinates:
    zone: str
    easting: int
    northing: int
    point: shapely.Point  # we don't use this, but we should
    CRS: CRSInfo  # we don't use this, but we should


def point_to_utm(p: Point) -> UTMCoordinates:

    # We need to figure out which UTM CRS the point falls in. It's probably 32609, 32610, or 32611. Query the CRS DB.

    utm_codes = query_utm_crs_info(
        datum_name="WGS 84",
        area_of_interest=AreaOfInterest(
            p.x,
            p.y,
            p.x,
            p.y,
        ),
    )

    if len(utm_codes) != 1:
        logging.error(f"Unexpected number of utm codes found {len(utm_codes)} != 1")
        raise ValueError(f"Unable to determine UTM zone for point {p}")

    to_utm_crs = pyproj.Transformer.from_crs(
        "EPSG:4326", utm_codes[0].code, always_xy=True
    ).transform

    # reproject
    as_utm = shapely.transform(p, to_utm_crs, interleaved=False)

    # new crs expected to have name like `WGS 84 / UTM zone 10N`, but for historical reasons we don't track either the EPSG code or the full name, only the `10`
    matched = re.match("WGS 84 / UTM zone (\\d+)N", utm_codes[0].name)

    if matched is None:
        raise ValueError(
            f"Unable to determine UTM zone for point {p} -- zone {utm_codes[0].name} name does not match expected pattern"
        )

    extracted_utm_zone = matched.group(1)

    return UTMCoordinates(
        point=as_utm,
        easting=int(as_utm.x),  # drop decimal portion
        northing=int(as_utm.y),  # drop decimal portion
        CRS=utm_codes[0],
        zone=extracted_utm_zone,
    )

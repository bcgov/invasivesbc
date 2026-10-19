from ninja import Schema
from typing import Literal, List, Optional
from pydantic import field_validator, Field


class TableFilterIn(Schema):
    field: Optional[str] = None
    filter: Optional[str] = None
    operator: Literal["CONTAINS"] | Literal["NOT CONTAINS"]
    operator2: Literal["AND"] | Literal["OR"]
    geojson: Optional[dict] = None
    filterType: (
        Literal["spatialFilterDrawn"]
        | Literal["spatialFilterUploaded"]
        | Literal["tableFilter"]
        | Literal["mostRecentObservation"]
    )


class FilterObjects(Schema):
    limit: Optional[int] = None
    page: Optional[int] = None
    sortColumn: Optional[str] = None
    sortOrder: Optional[str] = None
    tableFilters: List[TableFilterIn]
    selectColumns: List[str]
    CSVType: Optional[str]


class FilterObjectsIn(Schema):
    filterObjects: List[FilterObjects] = Field(..., min_length=1)


class IdListIn(Schema):
    idList: List[str]

    @field_validator("idList", mode="before")
    @classmethod
    def split_id_list(cls, v):
        # If it's a list, look inside and parse its items
        if isinstance(v, list):
            result = []
            for item in v:
                if isinstance(item, str):
                    # Split comma strings and extend
                    result.extend([id.strip() for id in item.split(",") if id.strip()])
                else:
                    result.append(item)
            return result

        # if it arrives directly as a raw string
        if isinstance(v, str):
            return [id.strip() for id in v.split(",") if id.strip()]

        return v

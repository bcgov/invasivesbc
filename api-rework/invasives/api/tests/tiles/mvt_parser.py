"""
AI Generated parser for Vector tiles.
Parses the Vector tile binaries from the API Tile requests and translates them into their feature data
Used for testing Property keys and feature types (explicitly declares Polygon, Point, Linestring)

Example (from 'test_activities.json' fixture data):
{
    'data': [
        {
        'id': None,
        'type': 'Feature',
        'geometry_type': 'Point',
        'properties':
            {
                'id': '6bba2749-ee3d-41b6-a9f1-4a0cb37029f7',
                'short_id': '26PTO6BBA2749',
                'type': 'Observation',
                'subtype': 'Observation_Plant_Terrestrial',
                'map_symbol': 'ACT, A'
            }
        }
    ]
}
"""


def parse_mvt_with_geometry(data: bytes) -> dict:
    """Safely extracts features, metadata, and geometry types from raw MVT bytes."""

    def read_varint(b, pos):
        val, shift = 0, 0
        while pos < len(b):
            byte = b[pos]
            pos += 1
            val |= (byte & 0x7F) << shift
            if not (byte & 0x80):
                break
            shift += 7
        return val, pos

    def skip_field(b, pos, wire):
        if wire == 0:
            _, pos = read_varint(b, pos)
        elif wire == 1:
            pos += 8
        elif wire == 2:
            length, pos = read_varint(b, pos)
            pos += length
        elif wire == 5:
            pos += 4
        return pos

    # Map MVT Geometry Type IDs to human-readable strings
    GEOM_TYPES = {0: "Unknown", 1: "Point", 2: "LineString", 3: "Polygon"}

    layers = {}
    idx, data_len = 0, len(data)

    while idx < data_len:
        tag, idx = read_varint(data, idx)
        if idx >= data_len:
            break
        wire, field = tag & 0x07, tag >> 3

        if field == 3 and wire == 2:  # Layer block
            layer_len, idx = read_varint(data, idx)
            l_end = min(idx + layer_len, data_len)
            lyr_name, keys, values, raw_features = "", [], [], []

            while idx < l_end:
                l_tag, idx = read_varint(data, idx)
                if idx >= l_end:
                    break
                l_wire, l_field = l_tag & 0x07, l_tag >> 3

                if l_field == 1 and l_wire == 2:
                    s_len, idx = read_varint(data, idx)
                    lyr_name = data[idx : min(idx + s_len, l_end)].decode(
                        "utf-8", errors="replace"
                    )
                    idx += s_len
                elif l_field == 2 and l_wire == 2:
                    f_len, idx = read_varint(data, idx)
                    raw_features.append(data[idx : min(idx + f_len, l_end)])
                    idx += f_len
                elif l_field == 3 and l_wire == 2:
                    s_len, idx = read_varint(data, idx)
                    keys.append(
                        data[idx : min(idx + s_len, l_end)].decode(
                            "utf-8", errors="replace"
                        )
                    )
                    idx += s_len
                elif l_field == 4 and l_wire == 2:
                    v_len, idx = read_varint(data, idx)
                    v_end = min(idx + v_len, l_end)
                    val = None
                    while idx < v_end:
                        v_tag, idx = read_varint(data, idx)
                        if idx >= v_end:
                            break
                        vw, vf = v_tag & 0x07, v_tag >> 3
                        if vf == 1 and vw == 2:
                            sl, idx = read_varint(data, idx)
                            val = data[idx : min(idx + sl, v_end)].decode(
                                "utf-8", errors="replace"
                            )
                            idx += sl
                        elif vf == 2:
                            import struct

                            val = (
                                struct.unpack("<f", data[idx : idx + 4])
                                if idx + 4 <= v_end
                                else None
                            )
                            idx += 4
                        elif vf == 3:
                            import struct

                            val = (
                                struct.unpack("<d", data[idx : idx + 8])
                                if idx + 8 <= v_end
                                else None
                            )
                            idx += 8
                        elif vf in (4, 5, 6):
                            val, idx = read_varint(data, idx)
                        elif vf == 7:
                            val = data[idx] != 0 if idx < v_end else None
                            idx += 1
                        else:
                            idx = skip_field(data, idx, vw)
                    values.append(val)
                    idx = v_end
                else:
                    idx = skip_field(data, idx, l_wire)

            parsed_features = []
            for f_bytes in raw_features:
                f_idx, f_end = 0, len(f_bytes)
                f_id, tags, geom_type_id = None, [], 0

                while f_idx < f_end:
                    f_tag, f_idx = read_varint(f_bytes, f_idx)
                    if f_idx >= f_end:
                        break
                    fw, ff = f_tag & 0x07, f_tag >> 3

                    if ff == 1:
                        f_id, f_idx = read_varint(f_bytes, f_idx)
                    elif ff == 2 and fw == 2:  # Tags array
                        t_len, f_idx = read_varint(f_bytes, f_idx)
                        t_end = min(f_idx + t_len, f_end)
                        while f_idx < t_end:
                            t_val, f_idx = read_varint(f_bytes, f_idx)
                            tags.append(t_val)
                    elif ff == 3:  # Geometry Type Field Identifier
                        geom_type_id, f_idx = read_varint(f_bytes, f_idx)
                    else:
                        f_idx = skip_field(f_bytes, f_idx, fw)

                props = {}
                for k_i, v_i in zip(tags[0::2], tags[1::2]):
                    if k_i < len(keys) and v_i < len(values):
                        props[keys[k_i]] = values[v_i]

                parsed_features.append(
                    {
                        "id": f_id,
                        "type": "Feature",
                        "geometry_type": GEOM_TYPES.get(geom_type_id, "Unknown"),
                        "properties": props,
                    }
                )

            if lyr_name:
                layers[lyr_name] = parsed_features
            idx = l_end
        else:
            idx = skip_field(data, idx, wire)

    return layers

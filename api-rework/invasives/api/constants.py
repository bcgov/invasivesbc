import re

uuid_regex = re.compile(
    r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
)

short_id_regex = re.compile(r"^[0-9]{2}[A-Za-z]{2,3}[0-9A-F]{8}$")

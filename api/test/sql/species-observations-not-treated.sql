/*
  Query observations that have not been treated this year.
*/
select
  c.code_description "Species",
  round(sum(public.st_area(p.geom))) "Area"
from
  public.activities_by_species p,
  code c
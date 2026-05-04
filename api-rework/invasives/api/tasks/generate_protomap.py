from api.models import RasterMapGenerationRequest
from api.services.map_tile_generator.tile_downloader import TileDownloader
from invasivesbc import celery_app


@celery_app.task
def generate_protomap(map_generation_request_id: int):
    mgr = RasterMapGenerationRequest.objects.get(id=map_generation_request_id)
    TileDownloader.process_map_generation_request(mgr)

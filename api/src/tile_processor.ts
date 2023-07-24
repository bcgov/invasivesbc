import { getLatestProcessingRequestID, processVectorTileRequest } from './utils/vector-tiles';
import { getLogger } from './utils/logger';
import { getDBConnection } from './database/db';

const LOOP_DELAY = 3000;

const defaultLog = getLogger('tile_processor');

function mainLoop() {
  setTimeout(async () => {
    const connection = await getDBConnection();
    const id = await getLatestProcessingRequestID(connection);
    if (id !== null) {
      defaultLog.debug({ message: `processing tile generation request ${id}` });
      try {
        await processVectorTileRequest(connection, id);
      } catch (e) {
        defaultLog.error({ message: `error processing ${id}`, error: e });
      }
    }
    await connection.release();

    mainLoop();
  }, LOOP_DELAY);
}

mainLoop();

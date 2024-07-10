import { sqliteSingleton } from 'utils/sqlite_interface';

function createDriver() {
  sqliteSingleton.init();

  return {
    getItem: async (key: string): Promise<string | null> => {
      const conn = await sqliteSingleton.getConnection();

      const result = await conn.query(
        `SELECT value
         from persisted_store
         where k = ?`,
        [key]
      );

      console.dir(result?.values);
      if (!result.values || result.values.length == 0) {
        return null;
      }
      return result.values[0]?.value || null;
    },
    setItem: async (key: string, item: string): Promise<void> => {
      const conn = await sqliteSingleton.getConnection();
      console.error('persisting...');
      try {
        await conn.query(
          `INSERT INTO persisted_store(k, value)
           values (?, ?)
           ON CONFLICT(k) DO UPDATE SET value = ?`,
          [key, item, item]
        );

        console.log('current contents:');
        console.dir(
          await conn.query(
            `select *
             from persisted_store`
          )
        );
      } finally {
        await sqliteSingleton.flush();
      }
    },
    removeItem: async (key: string): Promise<void> => {
      const conn = await sqliteSingleton.getConnection();
      try {
        await conn.query(
          `DELETE
           FROM persisted_store
           where k = ?`,
          [key]
        );
      } finally {
        await sqliteSingleton.flush();
      }
    }
  };
}

export { createDriver };

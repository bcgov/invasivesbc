import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';

const sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);

export { sqlite };

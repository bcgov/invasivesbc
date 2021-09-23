import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .withSchema(DB_SCHEMA)
    .createTable('code_category', function (table) {
      table.increments('code_category_id').primary();
      table.string('code_category_name', 100).notNullable();
      table.string('code_category_title', 40);
      table.string('code_category_description', 4096);
      table.timestamp('valid_from').defaultTo(knex.fn.now()).notNullable();
      table.timestamp('valid_to');
      table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.integer('created_by_user_id').notNullable();
      table.integer('updated_by_user_id').notNullable();
    })
    .createTable('code_header', function (table) {
      table.increments('code_header_id').primary();
      table.integer('code_category_id').references('code_category_id').inTable(`${DB_SCHEMA}.code_category`);
      table.string('code_header_name', 100).notNullable();
      table.string('code_header_title', 40);
      table.string('code_header_description', 4096);
      table.timestamp('valid_from').defaultTo(knex.fn.now()).notNullable();
      table.timestamp('valid_to');
      table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.integer('created_by_user_id').notNullable();
      table.integer('updated_by_user_id').notNullable();
    })
    .createTable('code', function (table) {
      table.increments('code_id').primary();
      table.integer('code_header_id').references('code_header_id').inTable(`${DB_SCHEMA}.code_header`);
      table.string('code_name', 40).notNullable();
      table.string('code_description', 300).notNullable();
      table.integer('code_sort_order');
      table.timestamp('valid_from').defaultTo(knex.fn.now()).notNullable();
      table.timestamp('valid_to');
      table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.integer('created_by_user_id').notNullable();
      table.integer('updated_by_user_id').notNullable();
    })
    .alterTable('code_category', function (t) {
      t.unique(['code_category_name', 'valid_from']);
    })
    .alterTable('code_header', function (t) {
      t.unique(['code_category_id', 'code_header_name', 'valid_from']);
    })
    .alterTable('code', function (t) {
      t.unique(['code_header_id', 'code_name', 'valid_from']);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.withSchema(DB_SCHEMA).dropTable('code').dropTable('code_header').dropTable('code_category');
}

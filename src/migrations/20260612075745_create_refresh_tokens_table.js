exports.up = function(knex) {
  return knex.schema.createTable('refresh_tokens', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('token').notNullable().unique();
    table.boolean('is_revoked').defaultTo(false);
    table.timestamp('expires_at').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('refresh_tokens');
};
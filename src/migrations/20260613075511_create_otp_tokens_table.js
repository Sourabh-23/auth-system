exports.up = function(knex) {
  return knex.schema.createTable('otp_tokens', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('otp_code').notNullable();
    table.boolean('is_used').defaultTo(false);
    table.timestamp('expires_at').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('otp_tokens');
};
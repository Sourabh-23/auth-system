exports.up = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.enum('role', ['user', 'admin', 'superadmin']).defaultTo('user');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.dropColumn('role');
  });
};
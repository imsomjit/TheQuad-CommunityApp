const { Client } = require('pg');
const client = new Client('postgresql://neondb_owner:npg_g0SZlvTYsOA2@ep-orange-pine-aqjuaesn.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require');
client.connect().then(() => {
  return client.query('insert into refresh_tokens (user_id, token_hash, expires_at) values ($1, $2, $3)', [8, '3e8e6c99f6d4b9b5e381b3a7b042b1dfceeed420b7d78e359886ca2f8864a909', '2026-06-09T20:47:25.218Z']);
}).then(res => {
  console.log('success');
  client.end();
}).catch(err => {
  console.error(err);
  client.end();
});

const pool = require('../config/db');

exports.create = async (ride) => {
  const query = `
    INSERT INTO rides (
      id, user_id, pickup, dropoff, status, created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  const values = [
    ride.id,
    ride.user_id,
    ride.pickup,
    ride.dropoff,
    ride.status,
    ride.created_at
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

exports.findById = async (id) => {
  const query = `SELECT * FROM rides WHERE id = $1`;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

exports.update = async (id, data) => {
  const query = `
    UPDATE rides
    SET status = $1, updated_at = $2
    WHERE id = $3
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [
    data.status,
    data.updated_at,
    id
  ]);

  return rows[0];
};

const db = require('../config/db');

module.exports = {
  createDriver: async (userId, name, phone, vehicleType, vehiclePlate) => {
    const query = `
      INSERT INTO drivers (user_id, name, phone, vehicle_type, vehicle_plate, status)
      VALUES ($1, $2, $3, $4, $5, 'available')
      RETURNING *;
    `;
    const values = [userId, name, phone, vehicleType, vehiclePlate];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  getDriverById: async (id) => {
    const { rows } = await db.query('SELECT * FROM drivers WHERE id = $1', [id]);
    return rows[0];
  },

  updateDriver: async (id, updates) => {
    const fields = Object.keys(updates).map((key, idx) => `${key} = $${idx + 2}`).join(', ');
    const values = [id, ...Object.values(updates)];
    const query = `UPDATE drivers SET ${fields} WHERE id = $1 RETURNING *;`;
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  updateLocation: async (id, latitude, longitude) => {
    const query = `
      UPDATE drivers 
      SET latitude = $2, longitude = $3, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1 
      RETURNING *;
    `;
    const { rows } = await db.query(query, [id, latitude, longitude]);
    return rows[0];
  },
};
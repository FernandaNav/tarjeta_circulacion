import pool from '../db.js'

export const getPropietarios = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        p.id_propietario, p.nombre_completo, p.nit, p.cui,
        p.direccion, p.telefono,
        m.nombre AS municipio,
        d.nombre AS departamento
      FROM tarjeta_circulacion.propietario p
      JOIN tarjeta_circulacion.municipio m ON p.id_municipio = m.id_municipio
      JOIN tarjeta_circulacion.departamento d ON m.id_departamento = d.id_departamento
      ORDER BY p.nombre_completo
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const createPropietario = async (req, res) => {
  const { nombre_completo, nit, cui, direccion, telefono, id_municipio } = req.body
  try {
    const { rows } = await pool.query(`
      INSERT INTO tarjeta_circulacion.propietario
        (nombre_completo, nit, cui, direccion, telefono, id_municipio)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [nombre_completo, nit, cui, direccion, telefono, id_municipio])
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
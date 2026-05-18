import pool from '../db.js'
import { validarCertificado } from '../validaciones.js'

export const getPropietarios = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        p.id_propietario,
        p.nombres,
        p.apellidos,
        p.nombres || ' ' || p.apellidos AS nombre_completo,
        p.nit, p.cui, p.direccion, p.telefono,
        m.nombre AS municipio,
        d.nombre AS departamento
      FROM tarjeta_circulacion.propietario p
      JOIN tarjeta_circulacion.municipio m ON p.id_municipio = m.id_municipio
      JOIN tarjeta_circulacion.departamento d ON m.id_departamento = d.id_departamento
      ORDER BY p.apellidos
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const createPropietario = async (req, res) => {
  const { nombres, apellidos, nit, cui, direccion, telefono, id_municipio } = req.body
  try {
    const { rows } = await pool.query(`
      INSERT INTO tarjeta_circulacion.propietario
        (nombres, apellidos, nit, cui, direccion, telefono, id_municipio)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [nombres, apellidos, nit, cui, direccion, telefono, id_municipio])
    res.status(201).json(rows[0])
  } catch (err) {
    manejarErrorDB(err, res)
  }
}

export const updatePropietario = async (req, res) => {
  const { id } = req.params
  const { nombres, apellidos, nit, cui, direccion, telefono, id_municipio } = req.body
  try {
    const { rows } = await pool.query(`
      UPDATE tarjeta_circulacion.propietario
      SET nombres = $1, apellidos = $2, nit = $3, cui = $4, direccion = $5, telefono = $6, id_municipio = $7
      WHERE id_propietario = $8
      RETURNING *
    `, [nombres, apellidos, nit, cui, direccion, telefono, id_municipio, id])
    if (!rows.length) return res.status(404).json({ error: 'Propietario no encontrado' })
    res.json(rows[0])
  } catch (err) {
    manejarErrorDB(err, res)
  }
}

const manejarErrorDB = (err, res) => {
  if (err.code === '23505') {
    if (err.constraint?.includes('nit'))
      return res.status(400).json({ error: 'Ya existe un propietario con ese NIT.' })
    if (err.constraint?.includes('cui'))
      return res.status(400).json({ error: 'Ya existe un propietario con ese CUI.' })
  }
  return res.status(500).json({ error: err.message })
}
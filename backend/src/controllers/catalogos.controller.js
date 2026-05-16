import pool from '../db.js'

export const getDepartamentos = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id_departamento, nombre
      FROM tarjeta_circulacion.departamento
      ORDER BY nombre
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getMunicipios = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id_municipio, nombre, id_departamento
      FROM tarjeta_circulacion.municipio
      ORDER BY nombre
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getMarcas = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id_marca, nombre_marca, pais_origen
      FROM tarjeta_circulacion.marca
      ORDER BY nombre_marca
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getLineas = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id_linea, nombre_linea, id_marca
      FROM tarjeta_circulacion.linea
      ORDER BY nombre_linea
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getTiposVehiculo = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id_tipo_vehiculo, descripcion
      FROM tarjeta_circulacion.tipo_vehiculo
      ORDER BY descripcion
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getTiposUso = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id_tipo_uso, descripcion, requiere_seguro
      FROM tarjeta_circulacion.tipo_uso
      ORDER BY descripcion
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
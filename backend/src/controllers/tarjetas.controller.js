import pool from '../db.js'

export const getTarjetas = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        tc.num_tarjeta,
        tc.fecha_emision,
        tc.fecha_vencimiento,
        tc.estado,
        tc.motivo_desactivacion,
        p.nombre_completo AS propietario,
        p.id_propietario,
        v.placa,
        v.id_vehiculo,
        l.nombre_linea AS linea,
        m.nombre_marca AS marca
      FROM tarjeta_circulacion.tarjeta_circulacion tc
      JOIN tarjeta_circulacion.propietario p ON tc.id_propietario = p.id_propietario
      JOIN tarjeta_circulacion.vehiculo v ON tc.id_vehiculo = v.id_vehiculo
      JOIN tarjeta_circulacion.linea l ON v.id_linea = l.id_linea
      JOIN tarjeta_circulacion.marca m ON l.id_marca = m.id_marca
      ORDER BY tc.fecha_emision DESC
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getTarjetaByNum = async (req, res) => {
  try {
    const { num } = req.params
    const { rows } = await pool.query(`
      SELECT
        tc.*,
        p.nombre_completo AS propietario,
        p.nit, p.cui, p.telefono, p.direccion,
        v.placa, v.vin, v.num_motor, v.num_chasis, v.modelo_anio,
        l.nombre_linea, m.nombre_marca,
        tv.descripcion AS tipo_vehiculo,
        tu.descripcion AS tipo_uso
      FROM tarjeta_circulacion.tarjeta_circulacion tc
      JOIN tarjeta_circulacion.propietario p ON tc.id_propietario = p.id_propietario
      JOIN tarjeta_circulacion.vehiculo v ON tc.id_vehiculo = v.id_vehiculo
      JOIN tarjeta_circulacion.linea l ON v.id_linea = l.id_linea
      JOIN tarjeta_circulacion.marca m ON l.id_marca = m.id_marca
      JOIN tarjeta_circulacion.tipo_vehiculo tv ON v.id_tipo_vehiculo = tv.id_tipo_vehiculo
      JOIN tarjeta_circulacion.tipo_uso tu ON v.id_tipo_uso = tu.id_tipo_uso
      WHERE tc.num_tarjeta = $1
    `, [num])
    if (!rows.length) return res.status(404).json({ error: 'Tarjeta no encontrada' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const createTarjeta = async (req, res) => {
  const { num_tarjeta, id_propietario, id_vehiculo, num_certificado_propiedad, fecha_emision, fecha_vencimiento } = req.body
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows } = await client.query(`
      INSERT INTO tarjeta_circulacion.tarjeta_circulacion
        (num_tarjeta, id_propietario, id_vehiculo, num_certificado_propiedad, fecha_emision, fecha_vencimiento)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [num_tarjeta, id_propietario, id_vehiculo, num_certificado_propiedad, fecha_emision, fecha_vencimiento])

    await client.query(`
      INSERT INTO tarjeta_circulacion.historial_propietario
        (num_tarjeta, id_propietario, fecha_inicio)
      VALUES ($1, $2, $3)
    `, [num_tarjeta, id_propietario, fecha_emision])

    await client.query('COMMIT')
    res.status(201).json(rows[0])
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
}

export const updateEstado = async (req, res) => {
  const { num } = req.params
  const { estado, motivo_desactivacion } = req.body
  try {
    const { rows } = await pool.query(`
      UPDATE tarjeta_circulacion.tarjeta_circulacion
      SET estado = $1, motivo_desactivacion = $2
      WHERE num_tarjeta = $3
      RETURNING *
    `, [estado, motivo_desactivacion, num])
    if (!rows.length) return res.status(404).json({ error: 'Tarjeta no encontrada' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const cambiarPropietario = async (req, res) => {
  const { num } = req.params
  const { id_propietario_nuevo, motivo_cambio } = req.body
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await client.query(`
      UPDATE tarjeta_circulacion.historial_propietario
      SET fecha_fin = CURRENT_DATE
      WHERE num_tarjeta = $1 AND fecha_fin IS NULL
    `, [num])

    await client.query(`
      UPDATE tarjeta_circulacion.tarjeta_circulacion
      SET id_propietario = $1
      WHERE num_tarjeta = $2
    `, [id_propietario_nuevo, num])

    await client.query(`
      INSERT INTO tarjeta_circulacion.historial_propietario
        (num_tarjeta, id_propietario, fecha_inicio, motivo_cambio)
      VALUES ($1, $2, CURRENT_DATE, $3)
    `, [num, id_propietario_nuevo, motivo_cambio])

    await client.query('COMMIT')
    res.json({ message: 'Propietario actualizado correctamente' })
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
}

export const getHistorial = async (req, res) => {
  const { num } = req.params
  try {
    const { rows } = await pool.query(`
      SELECT
        hp.id_historial,
        hp.fecha_inicio,
        hp.fecha_fin,
        hp.motivo_cambio,
        p.nombre_completo AS propietario,
        p.nit, p.cui, p.telefono
      FROM tarjeta_circulacion.historial_propietario hp
      JOIN tarjeta_circulacion.propietario p ON hp.id_propietario = p.id_propietario
      WHERE hp.num_tarjeta = $1
      ORDER BY hp.fecha_inicio DESC
    `, [num])
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getEstadisticas = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE estado = 'Activa') AS activas,
        COUNT(*) FILTER (WHERE estado = 'Vencida') AS vencidas,
        COUNT(*) FILTER (WHERE estado = 'Desactivada') AS desactivadas,
        COUNT(*) FILTER (WHERE estado = 'Desactivada por impago') AS desactivadas_impago,
        COUNT(*) FILTER (
          WHERE estado = 'Activa' 
          AND fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
        ) AS por_vencer,
        COUNT(*) AS total
      FROM tarjeta_circulacion.tarjeta_circulacion
    `)

    const { rows: proximas } = await pool.query(`
      SELECT
        tc.num_tarjeta,
        tc.fecha_vencimiento,
        tc.estado,
        p.nombre_completo AS propietario,
        v.placa,
        l.nombre_linea AS linea,
        m.nombre_marca AS marca
      FROM tarjeta_circulacion.tarjeta_circulacion tc
      JOIN tarjeta_circulacion.propietario p ON tc.id_propietario = p.id_propietario
      JOIN tarjeta_circulacion.vehiculo v ON tc.id_vehiculo = v.id_vehiculo
      JOIN tarjeta_circulacion.linea l ON v.id_linea = l.id_linea
      JOIN tarjeta_circulacion.marca m ON l.id_marca = m.id_marca
      WHERE tc.estado = 'Activa'
      AND tc.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '60 days'
      ORDER BY tc.fecha_vencimiento ASC
      LIMIT 5
    `)

    res.json({ estadisticas: rows[0], proximas_a_vencer: proximas })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
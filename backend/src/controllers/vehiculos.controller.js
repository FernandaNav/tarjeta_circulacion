import pool from '../db.js'

export const getVehiculos = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        v.id_vehiculo, v.placa, v.vin, v.num_motor,
        v.num_chasis, v.modelo_anio,
        l.nombre_linea, m.nombre_marca,
        tv.descripcion AS tipo_vehiculo,
        tu.descripcion AS tipo_uso
      FROM tarjeta_circulacion.vehiculo v
      JOIN tarjeta_circulacion.linea l ON v.id_linea = l.id_linea
      JOIN tarjeta_circulacion.marca m ON l.id_marca = m.id_marca
      JOIN tarjeta_circulacion.tipo_vehiculo tv ON v.id_tipo_vehiculo = tv.id_tipo_vehiculo
      JOIN tarjeta_circulacion.tipo_uso tu ON v.id_tipo_uso = tu.id_tipo_uso
      ORDER BY v.id_vehiculo DESC
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const cambiarMotor = async (req, res) => {
  const { id } = req.params
  const { num_motor_nuevo, motivo } = req.body
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows: vehiculo } = await client.query(`
      SELECT num_motor FROM tarjeta_circulacion.vehiculo WHERE id_vehiculo = $1
    `, [id])
    if (!vehiculo.length) return res.status(404).json({ error: 'Vehículo no encontrado' })

    await client.query(`
      INSERT INTO tarjeta_circulacion.historial_motor
        (id_vehiculo, num_motor_anterior, num_motor_nuevo, motivo)
      VALUES ($1, $2, $3, $4)
    `, [id, vehiculo[0].num_motor, num_motor_nuevo, motivo])

    await client.query(`
      UPDATE tarjeta_circulacion.vehiculo
      SET num_motor = $1
      WHERE id_vehiculo = $2
    `, [num_motor_nuevo, id])

    await client.query('COMMIT')
    res.json({ message: 'Motor actualizado correctamente' })
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
}

export const getColores = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(
      `SELECT color, es_principal FROM tarjeta_circulacion.color_vehiculo WHERE id_vehiculo = $1 ORDER BY es_principal DESC`,
      [id]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const cambiarColor = async (req, res) => {
  const { id } = req.params
  const { color_anterior, color_nuevo, es_principal, motivo } = req.body
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await client.query(`
      INSERT INTO tarjeta_circulacion.historial_color
        (id_vehiculo, color_anterior, color_nuevo, es_principal, motivo)
      VALUES ($1, $2, $3, $4, $5)
    `, [id, color_anterior, color_nuevo, es_principal, motivo])

    if (color_anterior) {
      await client.query(`
        UPDATE tarjeta_circulacion.color_vehiculo
        SET color = $1, es_principal = $2
        WHERE id_vehiculo = $3 AND color = $4
      `, [color_nuevo, es_principal, id, color_anterior])
    } else {
      await client.query(`
        INSERT INTO tarjeta_circulacion.color_vehiculo (id_vehiculo, color, es_principal)
        VALUES ($1, $2, $3)
      `, [id, color_nuevo, es_principal])
    }

    await client.query('COMMIT')
    res.json({ message: 'Color actualizado correctamente' })
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
}

export const getHistorialMotor = async (req, res) => {
  const { id } = req.params
  try {
    const { rows } = await pool.query(`
      SELECT
        id_historial_motor,
        num_motor_anterior,
        num_motor_nuevo,
        fecha_cambio,
        motivo
      FROM tarjeta_circulacion.historial_motor
      WHERE id_vehiculo = $1
      ORDER BY fecha_cambio DESC
    `, [id])
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getHistorialColor = async (req, res) => {
  const { id } = req.params
  try {
    const { rows } = await pool.query(`
      SELECT
        id_historial_color,
        color_anterior,
        color_nuevo,
        es_principal,
        fecha_cambio,
        motivo
      FROM tarjeta_circulacion.historial_color
      WHERE id_vehiculo = $1
      ORDER BY fecha_cambio DESC
    `, [id])
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const createVehiculo = async (req, res) => {
  const { placa, vin, num_chasis, num_serie, num_motor, modelo_anio, id_linea, id_tipo_vehiculo, id_tipo_uso, colores } = req.body
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows } = await client.query(`
      INSERT INTO tarjeta_circulacion.vehiculo
        (placa, vin, num_chasis, num_serie, num_motor, modelo_anio, id_linea, id_tipo_vehiculo, id_tipo_uso)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [placa, vin, num_chasis, num_serie, num_motor, modelo_anio, id_linea, id_tipo_vehiculo, id_tipo_uso])

    const id = rows[0].id_vehiculo

    // insertar colores
    if (colores && colores.length > 0) {
      for (const c of colores) {
        await client.query(`
          INSERT INTO tarjeta_circulacion.color_vehiculo (id_vehiculo, color, es_principal)
          VALUES ($1, $2, $3)
        `, [id, c.color, c.es_principal])
      }
    }

    await client.query('COMMIT')
    res.status(201).json(rows[0])
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
}

export const updateVehiculo = async (req, res) => {
  const { id } = req.params
  const { placa, vin, num_chasis, num_serie, modelo_anio, id_linea, id_tipo_vehiculo, id_tipo_uso } = req.body
  try {
    const { rows } = await pool.query(`
      UPDATE tarjeta_circulacion.vehiculo
      SET placa = $1, vin = $2, num_chasis = $3, num_serie = $4,
          modelo_anio = $5, id_linea = $6, id_tipo_vehiculo = $7, id_tipo_uso = $8
      WHERE id_vehiculo = $9
      RETURNING *
    `, [placa, vin, num_chasis, num_serie, modelo_anio, id_linea, id_tipo_vehiculo, id_tipo_uso, id])
    if (!rows.length) return res.status(404).json({ error: 'Vehículo no encontrado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
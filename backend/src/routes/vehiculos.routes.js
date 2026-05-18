import { Router } from 'express'
import {
  getVehiculos, createVehiculo, updateVehiculo,
  cambiarMotor, cambiarColor,
  getHistorialMotor, getHistorialColor,
  getColores, getVehiculosSinTarjeta
} from '../controllers/vehiculos.controller.js'

const router = Router()

router.get('/', getVehiculos)
router.post('/', createVehiculo)
router.patch('/:id', updateVehiculo)
router.get('/:id/colores', getColores)
router.get('/:id/historial-motor', getHistorialMotor)
router.get('/:id/historial-color', getHistorialColor)
router.post('/:id/cambio-motor', cambiarMotor)
router.post('/:id/cambio-color', cambiarColor)
router.get('/sin-tarjeta', getVehiculosSinTarjeta)

export default router
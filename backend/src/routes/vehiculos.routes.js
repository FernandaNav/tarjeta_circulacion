import { Router } from 'express'
import {
  getVehiculos,
  createVehiculo,
  cambiarMotor,
  cambiarColor,
  getHistorialMotor,
  getHistorialColor,
  getColores
} from '../controllers/vehiculos.controller.js'

const router = Router()

router.get('/', getVehiculos)
router.post('/', createVehiculo)
router.get('/:id/historial-motor', getHistorialMotor)
router.get('/:id/historial-color', getHistorialColor)
router.post('/:id/cambio-motor', cambiarMotor)
router.post('/:id/cambio-color', cambiarColor)
router.get('/:id/colores', getColores)
export default router
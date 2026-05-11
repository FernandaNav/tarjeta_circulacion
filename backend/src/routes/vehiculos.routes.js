import { Router } from 'express'
import { getVehiculos, cambiarMotor, cambiarColor } from '../controllers/vehiculos.controller.js'

const router = Router()

router.get('/', getVehiculos)
router.post('/:id/cambio-motor', cambiarMotor)
router.post('/:id/cambio-color', cambiarColor)

export default router
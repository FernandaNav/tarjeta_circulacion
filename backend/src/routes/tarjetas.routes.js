import { Router } from 'express'
import {
  getTarjetas,
  getTarjetaByNum,
  createTarjeta,
  updateEstado,
  cambiarPropietario,
  getHistorial,
  getEstadisticas
} from '../controllers/tarjetas.controller.js'

const router = Router()

router.get('/estadisticas', getEstadisticas)
router.get('/', getTarjetas)
router.get('/:num', getTarjetaByNum)
router.get('/:num/historial', getHistorial)
router.post('/', createTarjeta)
router.patch('/:num/estado', updateEstado)
router.post('/:num/cambio-propietario', cambiarPropietario)

export default router
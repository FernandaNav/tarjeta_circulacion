import { Router } from 'express'
import {
  getTarjetas,
  getTarjetaByNum,
  createTarjeta,
  updateEstado,
  cambiarPropietario,
  getHistorial,
  getEstadisticas,
  renovarTarjeta
} from '../controllers/tarjetas.controller.js'

const router = Router()

router.get('/estadisticas', getEstadisticas)
router.get('/', getTarjetas)
router.get('/:num', getTarjetaByNum)
router.get('/:num/historial', getHistorial)
router.post('/', createTarjeta)
router.patch('/:num/estado', updateEstado)
router.post('/:num/cambio-propietario', cambiarPropietario)
router.patch('/:num/renovar', renovarTarjeta)

export default router
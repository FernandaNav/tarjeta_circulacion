import { Router } from 'express'
import { getPropietarios, createPropietario, updatePropietario } from '../controllers/propietarios.controller.js'

const router = Router()

router.get('/', getPropietarios)
router.post('/', createPropietario)
router.patch('/:id', updatePropietario)

export default router
import { Router } from 'express'
import { getPropietarios, createPropietario } from '../controllers/propietarios.controller.js'

const router = Router()

router.get('/', getPropietarios)
router.post('/', createPropietario)

export default router
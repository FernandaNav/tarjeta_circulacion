import { Router } from 'express'
import { getDepartamentos, getMunicipios, getMarcas, getLineas, getTiposVehiculo, getTiposUso } from '../controllers/catalogos.controller.js'

const router = Router()

router.get('/departamentos', getDepartamentos)
router.get('/municipios', getMunicipios)
router.get('/marcas', getMarcas)
router.get('/lineas', getLineas)
router.get('/tipos-vehiculo', getTiposVehiculo)
router.get('/tipos-uso', getTiposUso)

export default router
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import tarjetasRouter from './routes/tarjetas.routes.js'
import vehiculosRouter from './routes/vehiculos.routes.js'
import propietariosRouter from './routes/propietarios.routes.js'
import catalogosRouter from './routes/catalogos.routes.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api', catalogosRouter)

app.use('/api/tarjetas', tarjetasRouter)
app.use('/api/vehiculos', vehiculosRouter)
app.use('/api/propietarios', propietariosRouter)

app.get('/', (req, res) => res.json({ message: 'API Tarjeta Circulación OK' }))

app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT}`)
})
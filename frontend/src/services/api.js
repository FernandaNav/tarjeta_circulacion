import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
})

export const tarjetasService = {
  getAll: ()                      => api.get('/tarjetas'),
  getOne: (num)                   => api.get(`/tarjetas/${num}`),
  getEstadisticas: ()             => api.get('/tarjetas/estadisticas'),
  getHistorial: (num)             => api.get(`/tarjetas/${num}/historial`),
  create: (data)                  => api.post('/tarjetas', data),
  updateEstado: (num, data)       => api.patch(`/tarjetas/${num}/estado`, data),
  cambiarPropietario: (num, data) => api.post(`/tarjetas/${num}/cambio-propietario`, data),
}

export const vehiculosService = {
  getAll: ()                   => api.get('/vehiculos'),
  create: (data)               => api.post('/vehiculos', data),
  cambiarMotor: (id, data)     => api.post(`/vehiculos/${id}/cambio-motor`, data),
  cambiarColor: (id, data)     => api.post(`/vehiculos/${id}/cambio-color`, data),
  getHistorialMotor: (id)      => api.get(`/vehiculos/${id}/historial-motor`),
  getHistorialColor: (id)      => api.get(`/vehiculos/${id}/historial-color`),
}

export const propietariosService = {
  getAll: ()       => api.get('/propietarios'),
  create: (data)   => api.post('/propietarios', data),
}

export default api
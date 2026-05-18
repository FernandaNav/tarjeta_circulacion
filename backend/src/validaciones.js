export const validarPlaca = (placa) => {
  // Formato guatemalteco: P-123ABC, C-456DEF, M-789GHI, etc.
  return /^[A-Z]{1,3}-\d{2,4}[A-Z]{2,4}$/.test(placa.toUpperCase())
}

export const validarVIN = (vin) => {
  // 17 caracteres, sin I, O ni Q
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin.toUpperCase())
}

export const validarAlfanumerico = (valor) => {
  // Para motor, chasis, serie: letras, números y guiones
  return /^[A-Z0-9\-]{3,50}$/i.test(valor)
}

export const validarCertificado = (cert) => {
  // Letras, números, guiones — mínimo 5 caracteres
  return /^[A-Z0-9\-]{5,30}$/i.test(cert)
}
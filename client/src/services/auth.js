import { apiRequest } from './api'

export function loginRequest(correo, contrasena) {
  return apiRequest('/login', {
    method: 'POST',
    auth: false,
    body: { correo, contrasena },
  })
}

// Status: 'available' | 'occupied' | 'selected'
const desks = [
  // ISA/IT Area (IC3001–IC3005)
  { id: 'IC3001', cluster: 'isa', status: 'available' },
  { id: 'IC3002', cluster: 'isa', status: 'available' },
  { id: 'IC3003', cluster: 'isa', status: 'occupied' },
  { id: 'IC3004', cluster: 'isa', status: 'available' },
  { id: 'IC3005', cluster: 'isa', status: 'occupied' },

  // Cluster IC3006–IC3013
  { id: 'IC3006', cluster: 'c06_13', status: 'available' },
  { id: 'IC3007', cluster: 'c06_13', status: 'occupied' },
  { id: 'IC3008', cluster: 'c06_13', status: 'available' },
  { id: 'IC3009', cluster: 'c06_13', status: 'available' },
  { id: 'IC3010', cluster: 'c06_13', status: 'occupied' },
  { id: 'IC3011', cluster: 'c06_13', status: 'available' },
  { id: 'IC3012', cluster: 'c06_13', status: 'available' },
  { id: 'IC3013', cluster: 'c06_13', status: 'occupied' },

  // Cluster IC3014–IC3021
  { id: 'IC3014', cluster: 'c14_21', status: 'available' },
  { id: 'IC3015', cluster: 'c14_21', status: 'available' },
  { id: 'IC3016', cluster: 'c14_21', status: 'occupied' },
  { id: 'IC3017', cluster: 'c14_21', status: 'available' },
  { id: 'IC3018', cluster: 'c14_21', status: 'available' },
  { id: 'IC3019', cluster: 'c14_21', status: 'occupied' },
  { id: 'IC3020', cluster: 'c14_21', status: 'available' },
  { id: 'IC3021', cluster: 'c14_21', status: 'available' },

  // Cluster IC3022–IC3029
  { id: 'IC3022', cluster: 'c22_29', status: 'available' },
  { id: 'IC3023', cluster: 'c22_29', status: 'available' },
  { id: 'IC3024', cluster: 'c22_29', status: 'occupied' },
  { id: 'IC3025', cluster: 'c22_29', status: 'available' },
  { id: 'IC3026', cluster: 'c22_29', status: 'occupied' },
  { id: 'IC3027', cluster: 'c22_29', status: 'available' },
  { id: 'IC3028', cluster: 'c22_29', status: 'available' },
  { id: 'IC3029', cluster: 'c22_29', status: 'occupied' },

  // Cluster IC3030–IC3035
  { id: 'IC3030', cluster: 'c30_35', status: 'occupied' },
  { id: 'IC3031', cluster: 'c30_35', status: 'available' },
  { id: 'IC3032', cluster: 'c30_35', status: 'available' },
  { id: 'IC3033', cluster: 'c30_35', status: 'available' },
  { id: 'IC3034', cluster: 'c30_35', status: 'occupied' },
  { id: 'IC3035', cluster: 'c30_35', status: 'available' },

  // Cluster IC3036–IC3039
  { id: 'IC3036', cluster: 'c36_39', status: 'available' },
  { id: 'IC3037', cluster: 'c36_39', status: 'available' },
  { id: 'IC3038', cluster: 'c36_39', status: 'occupied' },
  { id: 'IC3039', cluster: 'c36_39', status: 'available' },
]

export const rooms = [
  { id: 'isa-it', name: 'ISA/IT', code: null, type: 'area', status: 'available' },
  { id: 'comedor-1', name: 'Comedor 1', code: 'ICC-3045', type: 'comedor', status: 'available' },
  { id: 'comedor-2', name: 'Comedor 2', code: 'ICC-3046', type: 'comedor', status: 'available' },
  { id: 'sala-lectura', name: 'Sala Lectura', code: 'ICSL-3044', type: 'sala', status: 'available' },
  { id: 'data-center', name: 'Data Center', code: null, type: 'restricted', status: 'restricted' },
  { id: 'sierra-madre', name: 'Sierra Madre', code: 'ICSJ-3040', type: 'sala-juntas', status: 'available' },
  { id: 'bunker', name: 'Bunker', code: null, type: 'sala', status: 'available' },
  { id: 'lounge', name: 'Lounge', code: 'ICL-3047', type: 'lounge', status: 'available' },
  { id: 'touch-point', name: 'Touch Point', code: 'ICTP-3042', type: 'touch-point', status: 'available' },
  { id: 'la-silla', name: 'La Silla', code: 'ICSJ-3041', type: 'sala-juntas', status: 'available' },
]

export const floorStats = {
  available: 25,
  occupied: 14,
  total: 39,
}

export default desks

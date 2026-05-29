// Floor 9 - Desks and Rooms Data
// Status: 'available' | 'occupied' | 'selected'

const desks = [
  // Cluster IC9001–IC9008 (4 cols × 2 rows)
  { id: 'IC9001', cluster: 'c01_08', status: 'available' },
  { id: 'IC9002', cluster: 'c01_08', status: 'available' },
  { id: 'IC9003', cluster: 'c01_08', status: 'occupied' },
  { id: 'IC9004', cluster: 'c01_08', status: 'available' },
  { id: 'IC9005', cluster: 'c01_08', status: 'available' },
  { id: 'IC9006', cluster: 'c01_08', status: 'occupied' },
  { id: 'IC9007', cluster: 'c01_08', status: 'available' },
  { id: 'IC9008', cluster: 'c01_08', status: 'available' },

  // Cluster IC9009–IC9016 (4 cols × 2 rows)
  { id: 'IC9009', cluster: 'c09_16', status: 'available' },
  { id: 'IC9010', cluster: 'c09_16', status: 'occupied' },
  { id: 'IC9011', cluster: 'c09_16', status: 'available' },
  { id: 'IC9012', cluster: 'c09_16', status: 'available' },
  { id: 'IC9013', cluster: 'c09_16', status: 'occupied' },
  { id: 'IC9014', cluster: 'c09_16', status: 'available' },
  { id: 'IC9015', cluster: 'c09_16', status: 'available' },
  { id: 'IC9016', cluster: 'c09_16', status: 'occupied' },

  // Cluster IC9017–IC9024 (4 cols × 2 rows)
  { id: 'IC9017', cluster: 'c17_24', status: 'available' },
  { id: 'IC9018', cluster: 'c17_24', status: 'available' },
  { id: 'IC9019', cluster: 'c17_24', status: 'occupied' },
  { id: 'IC9020', cluster: 'c17_24', status: 'available' },
  { id: 'IC9021', cluster: 'c17_24', status: 'available' },
  { id: 'IC9022', cluster: 'c17_24', status: 'occupied' },
  { id: 'IC9023', cluster: 'c17_24', status: 'available' },
  { id: 'IC9024', cluster: 'c17_24', status: 'available' },

  // Cluster IC9025–IC9032 (4 cols × 2 rows)
  { id: 'IC9025', cluster: 'c25_32', status: 'available' },
  { id: 'IC9026', cluster: 'c25_32', status: 'occupied' },
  { id: 'IC9027', cluster: 'c25_32', status: 'available' },
  { id: 'IC9028', cluster: 'c25_32', status: 'available' },
  { id: 'IC9029', cluster: 'c25_32', status: 'available' },
  { id: 'IC9030', cluster: 'c25_32', status: 'occupied' },
  { id: 'IC9031', cluster: 'c25_32', status: 'available' },
  { id: 'IC9032', cluster: 'c25_32', status: 'occupied' },

  // Cluster IC9033–IC9040 (4 cols × 2 rows)
  { id: 'IC9033', cluster: 'c33_40', status: 'available' },
  { id: 'IC9034', cluster: 'c33_40', status: 'occupied' },
  { id: 'IC9035', cluster: 'c33_40', status: 'available' },
  { id: 'IC9036', cluster: 'c33_40', status: 'available' },
  { id: 'IC9037', cluster: 'c33_40', status: 'occupied' },
  { id: 'IC9038', cluster: 'c33_40', status: 'available' },
  { id: 'IC9039', cluster: 'c33_40', status: 'available' },
  { id: 'IC9040', cluster: 'c33_40', status: 'available' },

  // Cluster IC9041–IC9048 (4 cols × 2 rows)
  { id: 'IC9041', cluster: 'c41_48', status: 'available' },
  { id: 'IC9042', cluster: 'c41_48', status: 'available' },
  { id: 'IC9043', cluster: 'c41_48', status: 'occupied' },
  { id: 'IC9044', cluster: 'c41_48', status: 'available' },
  { id: 'IC9045', cluster: 'c41_48', status: 'available' },
  { id: 'IC9046', cluster: 'c41_48', status: 'occupied' },
  { id: 'IC9047', cluster: 'c41_48', status: 'available' },
  { id: 'IC9048', cluster: 'c41_48', status: 'available' },

  // Cluster IC9049–IC9056 (4 cols × 2 rows)
  { id: 'IC9049', cluster: 'c49_56', status: 'available' },
  { id: 'IC9050', cluster: 'c49_56', status: 'occupied' },
  { id: 'IC9051', cluster: 'c49_56', status: 'available' },
  { id: 'IC9052', cluster: 'c49_56', status: 'available' },
  { id: 'IC9053', cluster: 'c49_56', status: 'occupied' },
  { id: 'IC9054', cluster: 'c49_56', status: 'available' },
  { id: 'IC9055', cluster: 'c49_56', status: 'available' },
  { id: 'IC9056', cluster: 'c49_56', status: 'available' },
]

export const rooms = [
  { id: 'comedor', name: 'Comedor', code: 'ICC-9001', type: 'comedor', status: 'available' },
  { id: 'sala-lectura', name: 'Sala Lectura', code: 'ICSL-9002', type: 'sala', status: 'available' },
  { id: 'data-center', name: 'Data Center', code: null, type: 'restricted', status: 'restricted' },
  { id: 'sala-juntas-1', name: 'Sala Juntas 1', code: 'ICSJ-9003', type: 'sala-juntas', status: 'available' },
  { id: 'sala-juntas-2', name: 'Sala Juntas 2', code: 'ICSJ-9004', type: 'sala-juntas', status: 'available' },
  { id: 'lounge', name: 'Lounge', code: 'ICL-9005', type: 'lounge', status: 'available' },
  { id: 'sala-colaborativa', name: 'Sala Colaborativa', code: 'ICSC-9006', type: 'colaborativa', status: 'available' },
  { id: 'sanitarios', name: 'Sanitarios', code: null, type: 'sanitarios', status: 'restricted' },
  { id: 'escaleras-emergencia', name: 'Escaleras de Emergencia', code: null, type: 'emergencia', status: 'restricted' },
  { id: 'garaje-techado', name: 'Área de Garaje Techado', code: null, type: 'garaje', status: 'available' },
]

export const floorStats = {
  available: 42,
  occupied: 14,
  total: 56,
}

export default desks

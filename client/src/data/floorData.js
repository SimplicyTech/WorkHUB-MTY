// Status: 'available' | 'occupied' | 'selected'
const desks = [
  // Cluster 1 (top-left)
  { id: 'D-301', cluster: 1, status: 'occupied' },
  { id: 'D-302', cluster: 1, status: 'available' },
  { id: 'D-303', cluster: 1, status: 'available' },
  { id: 'D-304', cluster: 1, status: 'occupied' },
  { id: 'D-305', cluster: 1, status: 'available' },
  { id: 'D-306', cluster: 1, status: 'occupied' },

  // Cluster 2 (top-right)
  { id: 'D-307', cluster: 2, status: 'available' },
  { id: 'D-308', cluster: 2, status: 'available' },
  { id: 'D-309', cluster: 2, status: 'occupied' },
  { id: 'D-310', cluster: 2, status: 'available' },
  { id: 'D-311', cluster: 2, status: 'occupied' },
  { id: 'D-312', cluster: 2, status: 'available' },

  // Cluster 3 (mid-left)
  { id: 'D-313', cluster: 3, status: 'available' },
  { id: 'D-314', cluster: 3, status: 'occupied' },
  { id: 'D-315', cluster: 3, status: 'available' },
  { id: 'D-316', cluster: 3, status: 'available' },

  // Cluster 5 (mid-right)
  { id: 'D-317', cluster: 5, status: 'occupied' },
  { id: 'D-318', cluster: 5, status: 'available' },
  { id: 'D-319', cluster: 5, status: 'occupied' },
  { id: 'D-320', cluster: 5, status: 'available' },

  // Cluster 7 (mid-far-right)
  { id: 'D-321', cluster: 7, status: 'available' },
  { id: 'D-322', cluster: 7, status: 'occupied' },
  { id: 'D-323', cluster: 7, status: 'available' },
  { id: 'D-324', cluster: 7, status: 'occupied' },

  // Cluster 6 (bottom)
  { id: 'D-325', cluster: 6, status: 'available' },
  { id: 'D-326', cluster: 6, status: 'available' },
  { id: 'D-327', cluster: 6, status: 'occupied' },
  { id: 'D-328', cluster: 6, status: 'available' },
  { id: 'D-329', cluster: 6, status: 'occupied' },
  { id: 'D-330', cluster: 6, status: 'available' },

  // Cubículos A (bottom row)
  { id: 'C-01', cluster: 'cubA', status: 'available' },
  { id: 'C-02', cluster: 'cubA', status: 'occupied' },
  { id: 'C-03', cluster: 'cubA', status: 'available' },
  { id: 'C-04', cluster: 'cubA', status: 'occupied' },
]

export const rooms = [
  { id: 'sala-a', name: 'Sala Juntas A', status: 'occupied' },
  { id: 'sala-b', name: 'Sala Juntas B', status: 'available' },
  { id: 'media', name: 'Media Scape', status: 'available' },
]

export const floorStats = {
  available: 20,
  occupied: 14,
  total: 34,
}

export default desks

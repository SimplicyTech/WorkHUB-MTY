const statusStyles = {
  available: 'bg-accent/80 hover:bg-accent cursor-pointer',
  occupied: 'bg-[#ff3246] cursor-not-allowed',
  selected: 'bg-primary ring-2 ring-white cursor-pointer',
}

export default function DeskCell({ id, status, onSelect }) {
  return (
    <button
      onClick={() => status !== 'occupied' && onSelect(id)}
      className={`w-[52px] h-[28px] rounded text-[9px] font-mono font-semibold text-white border-none transition-all ${statusStyles[status]}`}
      title={`${id} — ${status}`}
    >
      {id}
    </button>
  )
}

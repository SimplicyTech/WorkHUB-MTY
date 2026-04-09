const statusStyles = {
  available: 'bg-accent/80 hover:bg-accent cursor-pointer text-black',
  occupied: 'bg-[#ff3246] cursor-not-allowed text-white',
  selected: 'bg-primary ring-2 ring-white cursor-pointer text-white',
}

export default function DeskCell({ id, status, onSelect }) {
  return (
    <button
      onClick={() => status !== 'occupied' && onSelect(id)}
      className={`w-[50px] h-[25px] rounded-sm font-mono font-bold border-none transition-all ${statusStyles[status]}`}
      style={{ fontSize: 10 }}
      title={`${id} — ${status}`}
    >
      {id}
    </button>
  )
}

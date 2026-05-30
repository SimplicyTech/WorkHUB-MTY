const statusStyles = {
  available: 'bg-accent/80 hover:bg-accent cursor-pointer text-black',
  occupied: 'bg-[#ff3246] cursor-not-allowed text-white',
  blocked: 'bg-[#77707f] cursor-not-allowed text-white opacity-70',
  selected: 'bg-primary ring-2 ring-white cursor-pointer text-white',
}

export default function DeskCell({ id, status, onSelect }) {
  const isDisabled = status === 'occupied' || status === 'blocked'

  return (
    <button
      onClick={() => !isDisabled && onSelect(id)}
      className={`w-[50px] h-[25px] rounded-sm font-mono font-bold border-none transition-all ${statusStyles[status]}`}
      style={{ fontSize: 10 }}
      title={`${id} — ${status}`}
    >
      {id}
    </button>
  )
}

import stLogo from '../../assets/SimplicyTechLogoCompleto.png'

export default function Footer() {
  return (
    <footer className="bg-surface px-5 md:px-12 pt-10 pb-10">
      <div className="h-px bg-surface-badge w-full mb-8" />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <span className="font-mono text-[9px] text-text-muted">
          © 2026 Accenture — WorkHub MTY. ATC Monterrey. Uso interno.
        </span>
        <span className="font-mono text-[9px] text-text-muted">
          v1.0.0 // beta
        </span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[9px] text-text-muted">Desarrollado por</span>
          <img src={stLogo} alt="SimplicyTech" className="h-[37px] w-auto" />
        </div>
      </div>
    </footer>
  )
}

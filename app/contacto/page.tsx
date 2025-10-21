export default function ContactPage() {
  return (
    <div className="container py-10 space-y-4">
      <h1 className="text-3xl font-semibold text-white">Contacto</h1>
      <p className="text-muted">
        WhatsApp:{" "}
        <a className="text-accent transition hover:text-white" href="https://wa.me/18492617328" target="_blank" rel="noreferrer">
          +1 (849) 261-7328
        </a>
      </p>
      <p className="text-muted">
        Instagram:{" "}
        <a className="text-accent transition hover:text-white" href="https://www.instagram.com/foxsportscards1of1" target="_blank" rel="noreferrer">
          @foxsportscards1of1
        </a>
      </p>
    </div>
  );
}

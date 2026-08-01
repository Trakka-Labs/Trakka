import Container from '../ui/Container'

const BOTTLENECKS = [
  {
    number: '01',
    title: 'Order details copied by hand',
    body: 'Addresses and phone numbers move from chat to paper to a spreadsheet. Every re-entry creates another chance for an expensive mistake.',
  },
  {
    number: '02',
    title: 'Riders double back across town',
    body: 'Unbatched orders send riders across the same roads twice, burning fuel and making every ETA harder to defend.',
  },
  {
    number: '03',
    title: 'Customers call for every update',
    body: 'Without a live view, the dispatch line becomes a tracking desk instead of a place to run the business.',
  },
]

export default function ProblemStatement() {
  return (
    <section id="product" className="border-y border-[var(--color-border-subtle)] bg-[var(--color-surface)] py-24 md:py-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
          <div>
            <p className="landing-kicker">The operational problem</p>
            <h2 className="mt-5 max-w-lg text-4xl font-medium leading-[1.02] tracking-[-0.05em] text-[var(--color-paper)] sm:text-5xl">
              Dispatch breaks down in the handoffs.
            </h2>
            <p className="mt-6 max-w-md leading-7 text-[var(--color-paper-dim)]">
              Trakka focuses Phase 1 on the three bottlenecks fleet owners in Benin City feel every day.
            </p>
          </div>

          <ol className="border-t border-[var(--color-border-subtle)]">
            {BOTTLENECKS.map((item) => (
              <li key={item.number} className="grid gap-4 border-b border-[var(--color-border-subtle)] py-7 sm:grid-cols-[3.5rem_0.75fr_1fr] sm:items-start">
                <span className="text-xs font-medium text-[var(--color-route-cyan)]">{item.number}</span>
                <h3 className="text-lg font-medium text-[var(--color-paper)]">{item.title}</h3>
                <p className="text-sm leading-6 text-[var(--color-paper-dim)]">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  )
}

import Container from '../ui/Container'

const FAQS = [
  ['Do customers need an account or app?', 'No. The order form and secure tracking page open in a mobile browser. Trakka sends the tracking link through WhatsApp.'],
  ['What does a rider need?', 'A smartphone with a modern browser and location access. Riders use a lightweight web portal instead of installing a native app.'],
  ['Can we still collect payment on delivery?', 'Yes. A delivery can be sender-paid, paid online by the receiver before dispatch, or collected on delivery by cash or transfer.'],
  ['Can a customer negotiate the delivery fee?', 'Yes, but Trakka checks every counter-offer against the minimum price floor set by the business and blocks any amount below it.'],
  ['How does route batching work?', 'Orders are grouped by area and proximity. The owner can reorder the suggested stops before sending the exact sequence to a rider.'],
  ['What proves the package was delivered?', 'The handoff can be verified with a one-time password or QR code. Trakka records the completion time, location, and final status.'],
]

export default function FAQ() {
  return (
    <section id="faq" className="border-y border-[var(--color-border-subtle)] bg-[var(--color-ink-deep)] py-24 md:py-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.6fr_1.4fr] lg:gap-24">
          <div>
            <p className="landing-kicker">Questions</p>
            <h2 className="mt-5 text-4xl font-medium leading-[1.02] tracking-[-0.05em] text-[var(--color-paper)] sm:text-5xl">The practical details, without the pitch.</h2>
          </div>
          <div className="grid gap-x-10 border-t border-[var(--color-border-subtle)] sm:grid-cols-2">
            {FAQS.map(([question, answer]) => (
              <article key={question} className="border-b border-[var(--color-border-subtle)] py-7">
                <h3 className="text-base font-medium leading-6 text-[var(--color-paper)]">{question}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--color-paper-dim)]">{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

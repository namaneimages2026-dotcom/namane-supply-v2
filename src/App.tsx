import "./App.css";

function App() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-10">
        <nav className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-lime-400">
              Namane Supply OS
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">
              QR-Powered Customer + Operations Platform
            </h1>
          </div>

          <a
            href="#quote"
            className="rounded-full bg-lime-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-lime-300"
          >
            Start Quote
          </a>
        </nav>

        <section className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-lime-400/40 px-4 py-2 text-sm text-lime-300">
              Built for CO₂ laser cutting, engraving, branding, and short-run manufacturing.
            </p>

            <h2 className="max-w-4xl text-5xl font-black leading-tight md:text-7xl">
              From client request to production-ready job card.
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-300">
              Namane Supply OS helps customers submit clear job specs, upload
              artwork, receive quotes, approve production, and track jobs through
              a precision CO₂ laser workflow.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#quote"
                className="rounded-xl bg-white px-6 py-4 font-bold text-black transition hover:bg-neutral-200"
              >
                Create Client Intake
              </a>
              <a
                href="#workflow"
                className="rounded-xl border border-white/20 px-6 py-4 font-bold text-white transition hover:bg-white/10"
              >
                View Workflow
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
            <div className="rounded-2xl bg-black p-5">
              <p className="text-sm text-neutral-400">Live Job Status</p>
              <h3 className="mt-2 text-2xl font-black">Leather Tags Batch</h3>

              <div className="mt-6 space-y-4">
                {[
                  "Client specs received",
                  "Artwork checked",
                  "Quote generated",
                  "Deposit pending",
                  "Production scheduled",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"
                  >
                    <span>{item}</span>
                    <span className={index < 3 ? "text-lime-400" : "text-neutral-500"}>
                      {index < 3 ? "Done" : "Next"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="workflow"
          className="grid gap-4 border-t border-white/10 py-10 md:grid-cols-4"
        >
          {[
            {
              title: "1. Scan QR",
              text: "Customer opens a branded intake form from a poster, tag, or WhatsApp link.",
            },
            {
              title: "2. Submit Specs",
              text: "Material, size, quantity, artwork, deadline, and delivery details are captured.",
            },
            {
              title: "3. Quote + Deposit",
              text: "System prepares quote logic and marks 60% deposit before production.",
            },
            {
              title: "4. Produce + Track",
              text: "Job card moves through design, cut test, production, QC, and collection.",
            },
          ].map((card) => (
            <article
              key={card.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <h3 className="text-xl font-black">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-300">{card.text}</p>
            </article>
          ))}
        </section>

        <section
          id="quote"
          className="rounded-3xl border border-lime-400/20 bg-lime-400/10 p-8"
        >
          <h3 className="text-3xl font-black">Next build module</h3>
          <p className="mt-3 max-w-3xl text-neutral-200">
            Add the quote form, job calculator, image upload, admin dashboard,
            and CO₂ laser simulation module as separate React components.
          </p>
        </section>
      </section>
    </main>
  );
}

export default App;

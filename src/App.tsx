import { FormEvent, useMemo, useState } from "react";
import { connectors } from "./connectors";
import {
  automationConnectors,
  automationFlow,
  educationTopics,
  pricingRules,
  services,
  simulationJobs,
  supportedMaterials,
  unsupportedMaterials
} from "./data/content";
import { toQrDataUrl } from "./lib/qr";
import {
  addInternshipApplication,
  addQuoteRequest,
  addSimulationRun,
  applyScan,
  clearExperienceData,
  clearQueue,
  readSnapshot,
  saveTraining,
  upsertItem,
  upsertOrder,
  writeSnapshot
} from "./lib/store";
import { Snapshot, TrainingStats } from "./types";
import "./styles.css";

type PublicPage = "home" | "what" | "quote" | "process" | "learn" | "internship" | "ai" | "simulation";
type InternalPage = "inventory" | "orders" | "scan" | "sync" | "dashboard";

const publicNav: PublicPage[] = ["home", "what", "quote", "learn", "internship", "ai", "simulation", "process"];
const internalNav: InternalPage[] = ["inventory", "orders", "scan", "sync", "dashboard"];

const timeline = [
  "Hand tools → slow, manual, inconsistent",
  "Mechanical cutting → faster but tooling heavy",
  "Digital design (CAD/vector) → precise file preparation",
  "CO2 laser cutting → focused beam for non-metal materials",
  "Modern micro-manufacturing → fast small-batch production"
];

const gameOutcome = (power: number, speed: number, focus: number, passes: number, airAssist: boolean) => {
  let score = 100;
  const ideal = { power: [38, 70], speed: [20, 70], focus: [-1, 1] };
  if (power > 80) score -= 35;
  if (power < 25) score -= 40;
  if (speed > 82) score -= 25;
  if (speed < 12) score -= 18;
  if (focus < ideal.focus[0] || focus > ideal.focus[1]) score -= 22;
  if (passes > 3) score -= 10;
  if (!airAssist) score -= 15;
  if (score >= 78) return { outcome: "clean" as const, score };
  if (score >= 50) return { outcome: "burn" as const, score };
  return { outcome: "failed" as const, score: Math.max(8, score) };
};

export default function App() {
  const [snapshot, setSnapshot] = useState<Snapshot>(() => readSnapshot());
  const [publicPage, setPublicPage] = useState<PublicPage>("home");
  const [internalPage, setInternalPage] = useState<InternalPage>("dashboard");

  const [selectedItem, setSelectedItem] = useState(snapshot.items[0]?.id ?? "");
  const [scanDelta, setScanDelta] = useState(1);
  const [qr, setQr] = useState("");
  const [syncLog, setSyncLog] = useState("No sync yet.");

  const [quote, setQuote] = useState({
    customerName: "",
    phone: "",
    email: "",
    productType: "Leather tags",
    material: "Leather",
    thickness: "2mm",
    widthMm: 60,
    heightMm: 30,
    quantity: 100,
    artworkStatus: "image" as "vector" | "image" | "design_help",
    deadline: "",
    notes: ""
  });

  const [internship, setInternship] = useState({
    name: "",
    phone: "",
    email: "",
    area: "",
    motivation: "",
    existingSkills: "",
    availability: ""
  });

  const [gameState, setGameState] = useState({
    jobIndex: 0,
    material: simulationJobs[0].material,
    power: 50,
    speed: 40,
    focus: 0,
    passes: 1,
    airAssist: true,
    price: simulationJobs[0].minPrice
  });

  const commit = (next: Snapshot) => {
    setSnapshot(next);
    writeSnapshot(next);
  };

  const quoteOutput = useMemo(() => {
    const areaFactor = (quote.widthMm * quote.heightMm) / 2000;
    const qtyDiscount = quote.quantity >= 500 ? 0.75 : quote.quantity >= 200 ? 0.82 : quote.quantity >= 100 ? 0.9 : 1;
    const setup = quote.artworkStatus === "vector" ? pricingRules.setupLow : pricingRules.setupHigh;
    const unitBase = quote.productType.includes("Leather") ? 18 : 24;
    const unit = Math.max(12, unitBase * qtyDiscount + areaFactor * 0.3);
    const machine = Math.max(0.3, quote.quantity / 140) * pricingRules.machineHourly;
    const subtotal = unit * quote.quantity + setup + machine;
    const minimum = quote.quantity >= 80 ? pricingRules.b2bMinimum : pricingRules.retailMinimum;
    const low = Math.max(minimum, Math.round(subtotal * 0.92));
    const high = Math.max(minimum, Math.round(subtotal * 1.2));

    const flags: string[] = [];
    if (quote.artworkStatus !== "vector") flags.push("Artwork not vector-ready");
    if (!quote.thickness || quote.thickness.toLowerCase().includes("unknown")) flags.push("Unknown material thickness");
    if (quote.widthMm > 700 || quote.heightMm > 500) flags.push("Large size may need material confirmation");
    if (quote.quantity < 20) flags.push("Low quantity may trigger minimum charge");
    if (quote.deadline) {
      const d = Math.ceil((new Date(quote.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (d <= 2) flags.push("Very urgent deadline");
    }

    const readiness = Math.max(20, Math.min(100, 88 - flags.length * 14 + (quote.artworkStatus === "vector" ? 16 : 0)));
    const nextStep = flags.length ? "Send files for technical check before final quote." : "Ready for deposit and production scheduling.";
    return { low, high, readiness, flags, nextStep };
  }, [quote]);

  const learningMaterial = useMemo(() => {
    if (quote.material === "Glass engraving only") return "Glass can be engraved, not cut, on CO2 workflows.";
    return "CO2 laser uses a focused beam guided by digital vector paths for controlled cutting/engraving.";
  }, [quote.material]);

  const submitQuote = (event: FormEvent) => {
    event.preventDefault();
    commit(
      addQuoteRequest(snapshot, {
        ...quote,
        estimateLow: quoteOutput.low,
        estimateHigh: quoteOutput.high,
        readinessScore: quoteOutput.readiness,
        riskFlags: quoteOutput.flags,
        recommendedNextStep: quoteOutput.nextStep
      })
    );
  };

  const submitInternship = (event: FormEvent) => {
    event.preventDefault();
    commit(addInternshipApplication(snapshot, internship));
  };

  const runGame = () => {
    const result = gameOutcome(gameState.power, gameState.speed, gameState.focus, gameState.passes, gameState.airAssist);
    const job = simulationJobs[gameState.jobIndex];
    const fairPrice = gameState.price >= job.minPrice;
    const current = snapshot.training;
    const nextStats: TrainingStats = {
      cash: Math.max(0, current.cash + (fairPrice ? 550 : 250) + (result.outcome === "clean" ? 240 : -80)),
      reputation: Math.max(0, Math.min(100, current.reputation + (result.outcome === "clean" ? 5 : result.outcome === "burn" ? -2 : -6))),
      machineHealth: Math.max(0, Math.min(100, current.machineHealth + (result.outcome === "clean" ? -1 : -5) + (fairPrice ? 2 : -2))),
      clientTrust: Math.max(0, Math.min(100, current.clientTrust + (fairPrice && result.outcome === "clean" ? 4 : -3))),
      skill: Math.max(0, Math.min(100, current.skill + (result.outcome === "clean" ? 3 : 1)))
    };

    const withRun = addSimulationRun(snapshot, {
      jobTitle: job.title,
      material: gameState.material,
      power: gameState.power,
      speed: gameState.speed,
      focus: gameState.focus,
      passes: gameState.passes,
      airAssist: gameState.airAssist,
      price: gameState.price,
      outcome: result.outcome,
      score: result.score
    });

    commit(saveTraining(withRun, nextStats));
    const nextJob = (gameState.jobIndex + 1) % simulationJobs.length;
    setGameState({ ...gameState, jobIndex: nextJob, material: simulationJobs[nextJob].material, price: simulationJobs[nextJob].minPrice });
  };

  const exportCsv = (rows: string[][], filename: string) => {
    const csv = rows.map((row) => row.map((v) => `"${v.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onAddItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    commit(
      upsertItem(snapshot, {
        id: `item-${crypto.randomUUID().slice(0, 8)}`,
        sku: String(form.get("sku")),
        name: String(form.get("name")),
        unit: "pcs",
        onHand: Number(form.get("onHand")),
        reorderPoint: Number(form.get("reorder"))
      })
    );
  };

  const onAddOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    commit(
      upsertOrder(snapshot, {
        id: `wo-${crypto.randomUUID().slice(0, 8)}`,
        code: String(form.get("code")),
        client: String(form.get("client")),
        itemId: String(form.get("itemId")),
        quantity: Number(form.get("qty")),
        dueDate: String(form.get("dueDate")),
        status: "queued"
      })
    );
  };

  const applyStock = () => selectedItem && commit(applyScan(snapshot, selectedItem, scanDelta, "manual"));
  const makeQr = async () => {
    const item = snapshot.items.find((it) => it.id === selectedItem);
    if (!item) return;
    setQr(await toQrDataUrl(JSON.stringify({ itemId: item.id, sku: item.sku })));
  };

  const syncQueue = async () => {
    if (!snapshot.queue.length) return setSyncLog("Queue is empty.");
    const out = await connectors[0].send(snapshot.queue);
    commit(clearQueue(snapshot));
    setSyncLog(`Synced ${out.sent} ops to ${out.remoteRef}`);
  };

  return (
    <main className="app-shell">
      <section className="top-zone">
        <h1>Namane Supply OS</h1>
        <p>Johannesburg CO2 Laser Studio · Precision builds scale.</p>
      </section>

      <section className="nav-wrap">
        <h3>Public</h3>
        <div className="btn-row">{publicNav.map((p) => <button key={p} className={publicPage === p ? "active" : ""} onClick={() => setPublicPage(p)}>{p}</button>)}</div>
        <h3>Internal</h3>
        <div className="btn-row">{internalNav.map((p) => <button key={p} className={internalPage === p ? "active" : ""} onClick={() => setInternalPage(p)}>{p}</button>)}</div>
      </section>

      {publicPage === "home" && (
        <section className="panel landing">
          <div className="laser" />
          <p className="kicker">Evolution of Cutting</p>
          <h2>From hand tools to focused light.</h2>
          <p>
            CO2 laser cutting uses a focused beam controlled by digital vector design files for non-metal fabrication.
            It excels on wood, MDF, plywood, acrylic, leather, paper, cardboard, fabric, glass engraving and slate engraving.
            Metal cutting needs fiber laser or other industrial metal-cutting systems.
          </p>
          <div className="timeline">
            {timeline.map((step, i) => <div className="step" key={step}><span>{i + 1}</span>{step}</div>)}
          </div>
          <div className="products">Outputs: leather tag · acrylic sign · MDF signage · trophy plate · branded product run</div>
          <div className="btn-row">
            <button onClick={() => setPublicPage("quote")}>Get a quote</button>
            <button onClick={() => setPublicPage("what")}>See what we make</button>
            <button onClick={() => setPublicPage("simulation")}>Try the laser simulator</button>
          </div>
        </section>
      )}

      {publicPage === "what" && (
        <section className="panel">
          <h2>What is Namane Supply?</h2>
          <p>
            Namane Supply is the production and fabrication direction of Namane Images: a Johannesburg-based CO2 laser studio focused on non-metal precision cutting and engraving for short-run manufacturing, branding and practical production.
          </p>
          <p className="gold">Supplying the streets with precision-made branded products.</p>
          <div className="card-grid">{services.map((s) => <article className="card" key={s}>{s}</article>)}</div>
          <h3>Materials we work with</h3>
          <div className="two-col">
            <div><strong>Supported</strong><ul>{supportedMaterials.map((m) => <li key={m}>{m}</li>)}</ul></div>
            <div><strong>Not offered</strong><ul>{unsupportedMaterials.map((m) => <li key={m}>{m}</li>)}</ul></div>
          </div>
        </section>
      )}

      {publicPage === "quote" && (
        <section className="panel">
          <h2>Customer Quote Builder</h2>
          <form className="form-grid" onSubmit={submitQuote}>
            <input placeholder="Customer name" value={quote.customerName} onChange={(e) => setQuote({ ...quote, customerName: e.target.value })} required />
            <input placeholder="Phone / WhatsApp" value={quote.phone} onChange={(e) => setQuote({ ...quote, phone: e.target.value })} required />
            <input placeholder="Email (optional)" value={quote.email} onChange={(e) => setQuote({ ...quote, email: e.target.value })} />
            <input placeholder="Product type" value={quote.productType} onChange={(e) => setQuote({ ...quote, productType: e.target.value })} required />
            <select value={quote.material} onChange={(e) => setQuote({ ...quote, material: e.target.value })}>{supportedMaterials.map((m) => <option key={m}>{m}</option>)}</select>
            <input placeholder="Thickness" value={quote.thickness} onChange={(e) => setQuote({ ...quote, thickness: e.target.value })} required />
            <input type="number" placeholder="Width (mm)" value={quote.widthMm} onChange={(e) => setQuote({ ...quote, widthMm: Number(e.target.value) })} required />
            <input type="number" placeholder="Height (mm)" value={quote.heightMm} onChange={(e) => setQuote({ ...quote, heightMm: Number(e.target.value) })} required />
            <input type="number" placeholder="Quantity" value={quote.quantity} onChange={(e) => setQuote({ ...quote, quantity: Number(e.target.value) })} required />
            <select value={quote.artworkStatus} onChange={(e) => setQuote({ ...quote, artworkStatus: e.target.value as "vector" | "image" | "design_help" })}>
              <option value="vector">I have a vector file</option>
              <option value="image">I have an image/logo only</option>
              <option value="design_help">I need design help</option>
            </select>
            <input type="date" value={quote.deadline} onChange={(e) => setQuote({ ...quote, deadline: e.target.value })} />
            <input placeholder="Notes" value={quote.notes} onChange={(e) => setQuote({ ...quote, notes: e.target.value })} />
            <div className="upload-placeholder">Upload artwork (placeholder UI)</div>
            <button type="submit">Save quote request</button>
          </form>
          <div className="metrics">
            <div><small>Estimated low</small><strong>R{quoteOutput.low}</strong></div>
            <div><small>Estimated high</small><strong>R{quoteOutput.high}</strong></div>
            <div><small>Readiness</small><strong>{quoteOutput.readiness}%</strong></div>
            <div><small>Next step</small><strong>{quoteOutput.nextStep}</strong></div>
          </div>
          <p className="muted">Risk flags: {quoteOutput.flags.length ? quoteOutput.flags.join(" · ") : "None"}</p>
        </section>
      )}

      {publicPage === "process" && (
        <section className="panel">
          <h2>Automation Process</h2>
          <ol>{automationFlow.map((step) => <li key={step}>{step}</li>)}</ol>
          <div className="card-grid">{automationConnectors.map((c) => <article className="card" key={c}>{c}<div className="muted">Connector-ready local mock</div></article>)}</div>
        </section>
      )}

      {publicPage === "learn" && (
        <section className="panel">
          <h2>Educational Section</h2>
          <div className="two-col">
            <div>
              <h4>Topics</h4>
              <ul>{educationTopics.map((topic) => <li key={topic}>{topic}</li>)}</ul>
            </div>
            <div>
              <h4>Interactive material selector</h4>
              <select value={quote.material} onChange={(e) => setQuote({ ...quote, material: e.target.value })}>{supportedMaterials.map((m) => <option key={m}>{m}</option>)}</select>
              <p>{learningMaterial}</p>
              <div className="file-compare"><span>Good file: clean vectors (SVG, DXF, AI)</span><span>Bad file: low-res screenshot/logo only</span></div>
              <div className="file-compare"><span>Good settings: balanced power/speed/focus + air assist</span><span>Bad settings: high heat + wrong focus + no air assist</span></div>
            </div>
          </div>
        </section>
      )}

      {publicPage === "internship" && (
        <section className="panel">
          <h2>Internship / Internal Platform</h2>
          <p>Serious training pipeline: file prep, material handling, laser safety, machine basics, planning, intake, quality control, packaging, pricing logic.</p>
          <p className="muted">Skills required: reliability, willingness to learn, attention to detail, basic computer literacy.</p>
          <form className="form-grid" onSubmit={submitInternship}>
            <input placeholder="Name" value={internship.name} onChange={(e) => setInternship({ ...internship, name: e.target.value })} required />
            <input placeholder="Phone" value={internship.phone} onChange={(e) => setInternship({ ...internship, phone: e.target.value })} required />
            <input placeholder="Email" value={internship.email} onChange={(e) => setInternship({ ...internship, email: e.target.value })} required />
            <input placeholder="Area / location" value={internship.area} onChange={(e) => setInternship({ ...internship, area: e.target.value })} required />
            <input placeholder="Why do you want to join?" value={internship.motivation} onChange={(e) => setInternship({ ...internship, motivation: e.target.value })} required />
            <input placeholder="Skills you already have" value={internship.existingSkills} onChange={(e) => setInternship({ ...internship, existingSkills: e.target.value })} required />
            <input placeholder="Availability" value={internship.availability} onChange={(e) => setInternship({ ...internship, availability: e.target.value })} required />
            <button type="submit">Submit application</button>
          </form>
        </section>
      )}

      {publicPage === "ai" && (
        <section className="panel">
          <h2>AI Production / Fabrication</h2>
          <ul>
            <li>AI-assisted design preparation</li>
            <li>Quote estimation</li>
            <li>Production planning</li>
            <li>Material optimization</li>
            <li>Client communication</li>
            <li>Job tracking</li>
            <li>Educational simulation</li>
            <li>Future connector integrations</li>
          </ul>
          <p className="muted">Important: AI supports planning, quoting, training, and admin. It does not directly control the physical laser machine.</p>
        </section>
      )}

      {publicPage === "simulation" && (
        <section className="panel">
          <h2>Cut Master: Namane Supply Training Mode</h2>
          <p>Job: {simulationJobs[gameState.jobIndex].title}</p>
          <div className="form-grid">
            <select value={gameState.material} onChange={(e) => setGameState({ ...gameState, material: e.target.value })}>{supportedMaterials.map((m) => <option key={m}>{m}</option>)}</select>
            <label>Power {gameState.power}<input type="range" min={0} max={100} value={gameState.power} onChange={(e) => setGameState({ ...gameState, power: Number(e.target.value) })} /></label>
            <label>Speed {gameState.speed}<input type="range" min={0} max={100} value={gameState.speed} onChange={(e) => setGameState({ ...gameState, speed: Number(e.target.value) })} /></label>
            <label>Focus {gameState.focus}<input type="range" min={-10} max={10} value={gameState.focus} onChange={(e) => setGameState({ ...gameState, focus: Number(e.target.value) })} /></label>
            <input type="number" value={gameState.passes} onChange={(e) => setGameState({ ...gameState, passes: Number(e.target.value) })} />
            <label><input type="checkbox" checked={gameState.airAssist} onChange={(e) => setGameState({ ...gameState, airAssist: e.target.checked })} /> Air assist</label>
            <input type="number" value={gameState.price} onChange={(e) => setGameState({ ...gameState, price: Number(e.target.value) })} />
            <button onClick={runGame}>Run production simulation</button>
          </div>
          <div className="metrics">
            <div><small>Cash</small><strong>R{snapshot.training.cash}</strong></div>
            <div><small>Reputation</small><strong>{snapshot.training.reputation}%</strong></div>
            <div><small>Machine health</small><strong>{snapshot.training.machineHealth}%</strong></div>
            <div><small>Client trust</small><strong>{snapshot.training.clientTrust}%</strong></div>
            <div><small>Skill</small><strong>{snapshot.training.skill}%</strong></div>
          </div>
        </section>
      )}

      <section className="panel">
        <h2>Internal Operations</h2>
        {internalPage === "inventory" && (
          <>
            <div className="card-grid">{snapshot.items.map((item) => <article className="card" key={item.id}>{item.name} · {item.onHand}{item.unit}</article>)}</div>
            <form className="form-grid" onSubmit={onAddItem}>
              <input name="sku" placeholder="SKU" required /><input name="name" placeholder="Item" required />
              <input name="onHand" type="number" placeholder="On hand" required /><input name="reorder" type="number" placeholder="Reorder" required />
              <button type="submit">Add item</button>
            </form>
          </>
        )}
        {internalPage === "orders" && (
          <>
            <div className="card-grid">{snapshot.orders.map((o) => <article className="card" key={o.id}>{o.code} · {o.client} · Qty {o.quantity}</article>)}</div>
            <form className="form-grid" onSubmit={onAddOrder}>
              <input name="code" placeholder="Code" required /><input name="client" placeholder="Client" required />
              <select name="itemId">{snapshot.items.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select>
              <input name="qty" type="number" placeholder="Qty" required /><input name="dueDate" type="date" required />
              <button type="submit">Create order</button>
            </form>
          </>
        )}
        {internalPage === "scan" && (
          <>
            <div className="form-grid">
              <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}>{snapshot.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
              <input type="number" value={scanDelta} onChange={(e) => setScanDelta(Number(e.target.value))} />
              <button onClick={applyStock}>Apply stock movement</button><button onClick={makeQr}>Generate QR</button>
            </div>
            {qr && <img src={qr} className="qr" alt="Generated inventory qr" />}
          </>
        )}
        {internalPage === "sync" && (
          <>
            <p>{snapshot.queue.length} queued operations.</p>
            <ul>{connectors.map((c) => <li key={c.key}>{c.label}</li>)}</ul>
            <button onClick={syncQueue}>Push sync queue</button>
            <p className="muted">{syncLog}</p>
          </>
        )}
        {internalPage === "dashboard" && (
          <>
            <div className="metrics">
              <div><small>Quote requests</small><strong>{snapshot.quoteRequests.length}</strong></div>
              <div><small>Internships</small><strong>{snapshot.internshipApplications.length}</strong></div>
              <div><small>Simulation runs</small><strong>{snapshot.simulationRuns.length}</strong></div>
              <div><small>Connectors</small><strong>{connectors.length} ready</strong></div>
            </div>
            <div className="btn-row">
              <button onClick={() => exportCsv([["name", "phone", "product", "low", "high"], ...snapshot.quoteRequests.map((q) => [q.customerName, q.phone, q.productType, String(q.estimateLow), String(q.estimateHigh)])], "quote-requests.csv")}>Export quote CSV</button>
              <button onClick={() => exportCsv([["name", "phone", "area", "availability"], ...snapshot.internshipApplications.map((i) => [i.name, i.phone, i.area, i.availability])], "internships.csv")}>Export internship CSV</button>
              <button onClick={() => exportCsv([["job", "outcome", "score", "price"], ...snapshot.simulationRuns.map((s) => [s.jobTitle, s.outcome, String(s.score), String(s.price)])], "simulation-runs.csv")}>Export simulation CSV</button>
              <button onClick={() => commit(clearExperienceData(snapshot))}>Clear local public data</button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

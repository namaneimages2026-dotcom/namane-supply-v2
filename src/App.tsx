import React, { FormEvent, useMemo, useState } from "react";
import { connectors } from "./connectors";
import "./styles.css";
import { toQrDataUrl } from "./lib/qr";
import { applyScan, clearQueue, readSnapshot, upsertItem, upsertOrder, writeSnapshot } from "./lib/store";
import { Snapshot } from "./types";

const tabs = ["inventory", "orders", "scan", "sync"] as const;

export default function App() {
  const [snapshot, setSnapshot] = useState<Snapshot>(() => readSnapshot());
  const [active, setActive] = useState<(typeof tabs)[number]>("inventory");
  const [selectedItem, setSelectedItem] = useState(snapshot.items[0]?.id ?? "");
  const [scanDelta, setScanDelta] = useState(1);
  const [qr, setQr] = useState<string>("");
  const [syncLog, setSyncLog] = useState("Not synced yet");

  const commit = (next: Snapshot) => {
    setSnapshot(next);
    writeSnapshot(next);
  };

  const stockAlerts = useMemo(() => snapshot.items.filter((i) => i.onHand <= i.reorderPoint), [snapshot.items]);

  const onAddItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = `item-${crypto.randomUUID().slice(0, 8)}`;
    commit(
      upsertItem(snapshot, {
        id,
        sku: String(form.get("sku") || "NEW-SKU"),
        name: String(form.get("name") || "New Item"),
        unit: "pcs",
        onHand: Number(form.get("onHand") || 0),
        reorderPoint: Number(form.get("reorder") || 0)
      })
    );
    event.currentTarget.reset();
  };

  const onAddOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = `wo-${crypto.randomUUID().slice(0, 8)}`;
    commit(
      upsertOrder(snapshot, {
        id,
        code: String(form.get("code") || "NS-NEW"),
        client: String(form.get("client") || "Unknown"),
        itemId: String(form.get("itemId") || selectedItem),
        quantity: Number(form.get("qty") || 1),
        dueDate: String(form.get("dueDate") || new Date().toISOString().slice(0, 10)),
        status: "queued"
      })
    );
    event.currentTarget.reset();
  };

  const handleManualScan = () => {
    if (!selectedItem) return;
    commit(applyScan(snapshot, selectedItem, scanDelta, "manual"));
  };

  const generateQr = async () => {
    if (!selectedItem) return;
    const item = snapshot.items.find((i) => i.id === selectedItem);
    if (!item) return;
    const payload = JSON.stringify({ type: "inventory", itemId: item.id, sku: item.sku });
    setQr(await toQrDataUrl(payload));
  };

  const pushQueue = async () => {
    if (!snapshot.queue.length) {
      setSyncLog("Queue empty. Nothing to sync.");
      return;
    }
    const connector = connectors[0];
    const result = await connector.send(snapshot.queue);
    commit(clearQueue(snapshot));
    setSyncLog(`Synced ${result.sent} operations to ${connector.label} (${result.remoteRef}).`);
  };

  return (
    <main className="app">
      <header>
        <h1>Namane Supply OS</h1>
        <p>Local-first • QR-ready • Connector-ready • Offline-capable</p>
      </header>
      <nav>
        {tabs.map((tab) => (
          <button key={tab} className={active === tab ? "active" : ""} onClick={() => setActive(tab)}>
            {tab}
          </button>
        ))}
      </nav>

      {active === "inventory" && (
        <section className="panel">
          <h2>Inventory</h2>
          <p className="muted">{stockAlerts.length} low-stock alert(s).</p>
          <div className="grid">
            {snapshot.items.map((item) => (
              <article className="card" key={item.id}>
                <strong>{item.name}</strong>
                <p>{item.sku}</p>
                <p>
                  {item.onHand} {item.unit} on hand
                </p>
              </article>
            ))}
          </div>
          <form className="form" onSubmit={onAddItem}>
            <input name="sku" placeholder="SKU" required />
            <input name="name" placeholder="Item name" required />
            <input name="onHand" placeholder="On hand" type="number" min={0} required />
            <input name="reorder" placeholder="Reorder point" type="number" min={0} required />
            <button type="submit">Add item</button>
          </form>
        </section>
      )}

      {active === "orders" && (
        <section className="panel">
          <h2>Work Orders</h2>
          <div className="grid">
            {snapshot.orders.map((order) => (
              <article className="card" key={order.id}>
                <strong>{order.code}</strong>
                <p>{order.client}</p>
                <p>
                  Qty {order.quantity} • Due {order.dueDate}
                </p>
              </article>
            ))}
          </div>
          <form className="form" onSubmit={onAddOrder}>
            <input name="code" placeholder="Order code" required />
            <input name="client" placeholder="Client" required />
            <select name="itemId" defaultValue={snapshot.items[0]?.id}>
              {snapshot.items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <input name="qty" type="number" min={1} placeholder="Quantity" required />
            <input name="dueDate" type="date" required />
            <button type="submit">Create order</button>
          </form>
        </section>
      )}

      {active === "scan" && (
        <section className="panel">
          <h2>QR & Scan Station</h2>
          <div className="form">
            <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}>
              {snapshot.items.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <input type="number" value={scanDelta} onChange={(e) => setScanDelta(Number(e.target.value))} />
            <button onClick={handleManualScan}>Apply stock movement</button>
            <button onClick={generateQr}>Generate QR label</button>
          </div>
          {qr && <img className="qr" src={qr} alt="Inventory QR code" />}
          <h3>Recent movements</h3>
          <ul>
            {snapshot.scans.slice(0, 6).map((scan) => (
              <li key={scan.id}>
                {scan.itemId}: {scan.delta > 0 ? "+" : ""}
                {scan.delta} ({scan.source})
              </li>
            ))}
          </ul>
        </section>
      )}

      {active === "sync" && (
        <section className="panel">
          <h2>Connectors & Sync Queue</h2>
          <p>{snapshot.queue.length} operation(s) queued offline.</p>
          <ul>
            {connectors.map((connector) => (
              <li key={connector.key}>{connector.label}</li>
            ))}
          </ul>
          <button onClick={pushQueue}>Push queued changes</button>
          <p className="muted">{syncLog}</p>
        </section>
      )}
    </main>
  );
}

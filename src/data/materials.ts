import { InventoryItem, WorkOrder } from "../types";

const now = new Date().toISOString();

export const seedItems: InventoryItem[] = [
  { id: "item-mdf-3", sku: "MDF-3MM", name: "MDF 3mm Sheet", unit: "sheet", onHand: 28, reorderPoint: 10, updatedAt: now },
  { id: "item-acry-3", sku: "ACRY-3MM", name: "Acrylic 3mm Clear", unit: "sheet", onHand: 16, reorderPoint: 8, updatedAt: now },
  { id: "item-leat", sku: "LEATHER-STD", name: "Genuine Leather Patch", unit: "pcs", onHand: 320, reorderPoint: 120, updatedAt: now }
];

export const seedOrders: WorkOrder[] = [
  { id: "wo-001", code: "NS-001", client: "Fashion House ZA", itemId: "item-leat", quantity: 100, dueDate: "2026-04-30", status: "queued", updatedAt: now },
  { id: "wo-002", code: "NS-002", client: "Retail Group", itemId: "item-acry-3", quantity: 4, dueDate: "2026-05-02", status: "in_progress", updatedAt: now }
];

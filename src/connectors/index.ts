import { Connector } from "../types";

const fakeNetworkDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const connectors: Connector[] = [
  {
    key: "github-dispatch",
    label: "GitHub Actions Dispatch",
    send: async (ops) => {
      await fakeNetworkDelay(500);
      return { sent: ops.length, remoteRef: `gh-${Date.now()}` };
    }
  },
  {
    key: "erp-webhook",
    label: "ERP Webhook",
    send: async (ops) => {
      await fakeNetworkDelay(350);
      return { sent: ops.length, remoteRef: `erp-${Date.now()}` };
    }
  }
];

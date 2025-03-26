import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { BrowserHistory, createBrowserHistory } from "history";
import { createContext, provide } from "@lit/context";

export const historyContext = createContext<BrowserHistory>(
  {} as BrowserHistory
);

// lit-router didn't work for me, so I'm using this custom-made router implementation instead
// https://github.com/remix-run/history/blob/dev/docs/getting-started.md
@customElement("history-provider")
export class HistoryProvider extends LitElement {
  @provide({ context: historyContext })
  history = createBrowserHistory();

  render() {
    return html`<slot></slot>`;
  }
}

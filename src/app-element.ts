import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import "./pokeshop-element";
import "./history-provider";

@customElement("app-element")
export class AppElement extends LitElement {
  @property({ type: String })
  shopTitle: string = "";

  render() {
    return html`<main>
      <history-provider>
        <pokeshop-element shopTitle=${this.shopTitle}></pokeshop-element>
      </history-provider>
    </main>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-element": AppElement;
  }
}

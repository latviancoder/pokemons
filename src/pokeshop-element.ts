import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { BrowserHistory } from "history";
import { historyContext } from "./history-provider";
import { consume } from "@lit/context";
import "./filters-element";
import "./list-element";

@customElement("pokeshop-element")
export class Pokeshop extends LitElement {
  @property({ type: String })
  shopTitle: string = "Default Shop Title";

  @state()
  private _types: string[] = [];

  @consume({ context: historyContext })
  public history?: BrowserHistory;

  private _unlisten?: () => void;

  private _getTypesFromSearchParams(search?: string) {
    const types = new URLSearchParams(search).get("types");
    return types ? types.split(",") : [];
  }

  // listen to history changes and update pokemon types, which are passed to children to force re-render
  connectedCallback() {
    super.connectedCallback();

    this._types = this._getTypesFromSearchParams(this.history?.location.search);

    console.log(this._types);

    this._unlisten = this.history?.listen(({ location }) => {
      this._types = this._getTypesFromSearchParams(location.search);
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unlisten?.();
  }

  render() {
    if (
      this.history?.location.pathname === "/" ||
      // for storybook
      this.history?.location.pathname === "/iframe.html"
    ) {
      return html`<div class="wrapper">
        <h1>${this.shopTitle}</h1>

        <div class="content-container">
          <filters-element .types=${this._types}></filters-element>
          <list-element .types=${this._types}></list-element>
        </div>
      </div>`;
    }

    // very naive details route implementation using regex
    const detailsPageMatch =
      this.history?.location.pathname.match(/pokemon\/(.+)/);

    if (detailsPageMatch) {
      return html`<div class="wrapper">
        <h1>${detailsPageMatch[1]}</h1>
      </div>`;
    }
  }

  static styles = css`
    .content-container {
      display: flex;
      flex-direction: row;
      gap: 2rem;
    }
  `;
}

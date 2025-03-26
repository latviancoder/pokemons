import { css, LitElement } from "lit";
import { property } from "lit/decorators.js";

import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { stringToColour } from "./utils";

@customElement("pokemon-type-color")
export class PokemonTypeColor extends LitElement {
  @property({ type: String })
  type: string = "";

  render() {
    return html`
      <div
        aria-description="Type: ${this.type}"
        style="background-color: ${stringToColour(this.type)}"
        class="type-color"
      ></div>
    `;
  }

  static styles = css`
    .type-color {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
  `;
}

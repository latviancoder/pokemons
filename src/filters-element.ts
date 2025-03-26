import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Task } from "@lit/task";
import { historyContext } from "./history-provider";
import { consume } from "@lit/context";
import { BrowserHistory } from "history";
import { capitalizeFirstLetter, stringToColour } from "./utils";
import "./pokemon-type-color";

const fetchPokemonTypes = async (): Promise<{
  results: { name: string }[];
}> => {
  const response = await fetch("https://pokeapi.co/api/v2/type?limit=100");

  if (!response.ok) {
    throw new Error(response.status.toString());
  }

  return response.json();
};

@customElement("filters-element")
export class FiltersElement extends LitElement {
  private _fetchPokemonTypes = new Task(this, {
    task: async () => await fetchPokemonTypes(),
    args: () => [],
  });

  @consume({ context: historyContext })
  public history?: BrowserHistory;

  @property({ type: Array })
  types: string[] = [];

  // push/remove types from url search params, then update history
  private _handleTypeChange(checked: boolean, type: string) {
    if (checked) {
      this.types.push(type);
    } else {
      this.types = this.types.filter((t) => t !== type);
    }

    this.history?.push({
      pathname: this.history?.location.pathname,
      search: `types=${this.types.join(",")}`,
    });
  }

  private _renderResults(value: { results: { name: string }[] }) {
    return html` <ul>
      ${value.results.map(
        (type) => html`<li>
          <label>
            <input
              type="checkbox"
              .checked=${this.types.includes(type.name)}
              @change=${(e: Event) =>
                this._handleTypeChange(
                  (e.target as HTMLInputElement).checked,
                  type.name
                )}
            />
            ${capitalizeFirstLetter(type.name)}
            <pokemon-type-color type=${type.name}></pokemon-type-color>
          </label>
        </li>`
      )}
    </ul>`;
  }

  render() {
    return this._fetchPokemonTypes.render({
      pending: () => html`Loading...`,
      error: () => html`Oops, something went wrong`,
      complete: (value) => this._renderResults(value),
    });
  }

  static styles = css`
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      border: 2px solid #000;
      padding: 1rem;
      position: sticky;
      top: 0.5rem;
    }

    label {
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .type-color {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
  `;
}

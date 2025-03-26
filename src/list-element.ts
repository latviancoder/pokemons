import { consume } from "@lit/context";
import { BrowserHistory } from "history";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { historyContext } from "./history-provider";
import { Task } from "@lit/task";
import { capitalizeFirstLetter } from "./utils";

type Pokemon = {
  name: string;
  sprites: {
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
  types: {
    type: {
      name: string;
    };
  }[];
};

const fetchPokemon = async (types: string[]): Promise<Pokemon[]> => {
  // ideally should be paginated, but as this api doesn't allow filtering
  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=100");

  if (!response.ok) {
    throw new Error(response.status.toString());
  }

  const data = (await response.json()) as {
    results: { name: string; url: string }[];
  };

  // fetch all pokemon details in two steps because API doesn't return all data in the initial request
  const allPokemon = await Promise.all<Pokemon>(
    data.results.map(async ({ url }) => (await fetch(url)).json())
  );

  // oif there are types, filter the pokemon by the types (AND logic!)
  return types.length
    ? allPokemon.filter((pokemon) =>
        types.every((type) => pokemon.types.some((t) => t.type.name === type))
      )
    : allPokemon;
};

@customElement("list-element")
export class ListElement extends LitElement {
  @property({ type: Array })
  types: string[] = [];

  @consume({ context: historyContext })
  public history?: BrowserHistory;

  private _fetchPokemon = new Task(this, {
    task: async ([types]) => await fetchPokemon(types),
    args: () => [this.types],
  });

  private _onPokemonClick(e: MouseEvent, name: string) {
    e.preventDefault();
    this.history?.push(`/pokemon/${name}`);
  }

  private _renderResults(results: Pokemon[]) {
    return results.map(
      ({ name, types, sprites }) =>
        html`<li class="card">
          <div
            role="img"
            aria-label="${name} official artwork"
            class="card-image"
            style="background-image: url(${sprites.other["official-artwork"]
              .front_default})"
          ></div>

          <footer class="card-footer">
            <a
              class="card-link"
              href="/pokemon/${name}"
              @click=${(e: MouseEvent) => this._onPokemonClick(e, name)}
              aria-label="View details for ${name}"
            >
              ${capitalizeFirstLetter(name)}
            </a>

            <div class="card-types">
              ${types.map(
                ({ type }) =>
                  html`<pokemon-type-color
                    type=${type.name}
                  ></pokemon-type-color>`
              )}
            </div>
          </footer>
        </li>`
    );
  }

  render() {
    return this._fetchPokemon.render({
      pending: () =>
        html`<div role="region" aria-live="polite" aria-busy="true">
          Loading...
        </div>`,
      error: () => html`<div role="alert">Oops, something went wrong</div>`,
      complete: (value) => html`
        <div role="region" aria-live="polite">
          ${value.length
            ? html`<ul class="pokemon-list">
                ${this._renderResults(value)}
              </ul>`
            : html`No pokemons found`}
        </div>
      `,
    });
  }

  static styles = css`
    .pokemon-list {
      display: grid;
      grid-template-columns: auto auto auto auto;
      gap: 2rem;
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .card {
      width: 150px;
      height: 150px;
      background-size: cover;
      border: 2px solid #000;
      display: flex;
      flex-direction: column;
    }

    .card-image {
      width: 100%;
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
      flex: 1;
    }

    .card-footer {
      border-top: 2px solid #000;
      padding: 0.3rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .card-types {
      display: flex;
      gap: 0.3rem;
    }

    .card-link {
      text-decoration: none;
      color: #000;

      &:hover {
        text-decoration: underline;
      }
    }
  `;
}

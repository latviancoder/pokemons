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

  private _onPokermonClick(name: string) {
    this.history?.push(`/pokemon/${name}`);
  }

  private _renderResults(results: Pokemon[]) {
    if (!results.length) {
      return html`<div class="pokemon-list">No pokemons found</div>`;
    }

    return html` <div class="pokemon-list">
      ${results.map(
        (result) =>
          html`<article
            class="pokemon-card"
            @click=${() => this._onPokermonClick(result.name)}
          >
            <div
              class="pokemon-card-image"
              style="background-image: url(${result.sprites.other[
                "official-artwork"
              ].front_default})"
            ></div>

            <div class="pokemon-card-footer">
              ${capitalizeFirstLetter(result.name)}

              <div class="pokemon-card-types">
                ${result.types.map(
                  ({ type }) =>
                    html`<pokemon-type-color
                      type=${type.name}
                    ></pokemon-type-color>`
                )}
              </div>
            </div>
          </article>`
      )}
    </div>`;
  }

  render() {
    return this._fetchPokemon.render({
      pending: () => html`Loading...`,
      error: () => html`Oops, something went wrong`,
      complete: (value) => this._renderResults(value),
    });
  }

  static styles = css`
    .pokemon-list {
      display: grid;
      grid-template-columns: auto auto auto auto;
      gap: 2rem;
    }

    .pokemon-card {
      cursor: pointer;
      width: 150px;
      height: 150px;
      background-size: cover;
      border: 2px solid #000;
      display: flex;
      flex-direction: column;

      &:hover {
        background-color: #f0f0f0;
      }
    }

    .pokemon-card-image {
      width: 100%;
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
      flex: 1;
    }

    .pokemon-card-footer {
      border-top: 2px solid #000;
      padding: 0.3rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .pokemon-card-types {
      display: flex;
      gap: 0.3rem;
    }
  `;
}

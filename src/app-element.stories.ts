import { html } from "lit";
import "./app-element";

// write default storybook story
export default {
  title: "Pokeshop",
  component: "app-element",
  args: {
    shopTitle: "Pokemon Shop!",
  },
  argTypes: {
    shopTitle: { control: "text" },
  },
};

export const Default = (args: { shopTitle: string }) => html`
  <app-element .shopTitle=${args.shopTitle}></app-element>
`;

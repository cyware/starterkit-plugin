import type { Cyware } from "@cyware/sdk-frontend";

import type { PluginStorage } from "./types";

const Page = "/my-plugin" as const;
const Commands = {
  increment: "my-plugin.increment",
  decrement: "my-plugin.decrement",
} as const;

const getCount = (cyware: Cyware) => {
  const storage = cyware.storage.get() as PluginStorage | undefined;

  if (storage) {
    return storage.count;
  }

  return 0;
}

const increment = (cyware: Cyware) => {
  const count = getCount(cyware);
  cyware.storage.set({ count: count + 1 });
}

const decrement = (cyware: Cyware) => {
  const count = getCount(cyware);
  cyware.storage.set({ count: count - 1 });
}

const addPage = (cyware: Cyware) => {

  const count = getCount(cyware);

  const body = document.createElement("div");
  body.className = "my-plugin";
  body.innerHTML = `
    <div class="my-plugin__count">
      <span>Count:</span>
      <span class="my-plugin__value">${count}</span>
    </div>
    <div>
      <button class="c-button" data-command="${Commands.increment}">Increment</button>
      <button class="c-button" data-command="${Commands.decrement}">Decrement</button>
    </div>
  `;

  const countElement = body.querySelector(".my-plugin__value") as HTMLElement;
  const incrementButton = body.querySelector(`[data-command="${Commands.increment}"]`) as HTMLElement;
  const decrementButton = body.querySelector(`[data-command="${Commands.decrement}"]`) as HTMLElement;

  cyware.storage.onChange((newStorage) => {
    const storage = newStorage as PluginStorage | undefined;

    if (storage) {
      countElement.innerHTML = `${storage.count}`;
      return;
    }
  });

  incrementButton.addEventListener("click", () => {
    increment(cyware);
  });

  decrementButton.addEventListener("click", () => {
    decrement(cyware);
  });

  cyware.navigation.addPage(Page, {
    body,
  });
}


export const init = (cyware: Cyware) => {

  // Register commands
  // Commands are registered with a unique identifier and a handler function
  // The run function is called when the command is executed
  // These commands can be registered in various places like command palette, context menu, etc.
  cyware.commands.register(Commands.increment, {
    name: "Increment",
    run: () => increment(cyware),
  });

  cyware.commands.register(Commands.decrement, {
    name: "Decrement",
    run: () => decrement(cyware),
  });

  // Register command palette items
  cyware.commandPalette.register(Commands.increment);
  cyware.commandPalette.register(Commands.decrement);

  // Register page
  addPage(cyware);

  // Register sidebar
  cyware.sidebar.registerItem("My plugin", Page, {
    icon: "fas fa-rocket",
  });
}


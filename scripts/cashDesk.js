class CashDesk {
  static ID = "cash-desk";
  static TEMPLATE = "modules/drop-a-coin/templates/cash-desk.hbs";

  static pay(cp, sp, ep, gp, pp) {
    const actorCurrency = game.user?.character.system.currency;
    if (!actorCurrency) return false;
    const check = [cp, sp, ep, gp, pp];
    const wallet = [
      actorCurrency.cp,
      actorCurrency.sp,
      actorCurrency.ep,
      actorCurrency.gp,
      actorCurrency.pp,
    ];
    for (const i in check) {
      if (check[i] > wallet[i]) return false;
    }
    actorCurrency.cp -= cp;
    actorCurrency.sp -= sp;
    actorCurrency.ep -= ep;
    actorCurrency.gp -= gp;
    actorCurrency.pp -= pp;
    return true;
  }

  /**
   * A small helper function which leverages developer mode flags to gate debug logs.
   *
   * @param {boolean} force - forces the log even if the debug flag is not on
   * @param  {...any} args - what to log
   */
  static log(force, ...args) {
    const shouldLog =
      force ||
      game.modules.get("_dev-mode")?.api?.getPackageDebugValue(this.ID);

    if (shouldLog) {
      console.log(this.ID, "|", ...args);
    }
  }
}

Hooks.on("renderSidebarTab", (app, html, data) => {
  if (app.tabName !== "chat") return;
  const chat_log = html.find("#chat-log");

  renderTemplate("modules/drop-a-coin/templates/cashDesk.hbs").then((c) =>
    chat_log.after(c)
  );
});

/**
 * A single ToDo in our list of Todos.
 * @typedef {Object} ToDo
 * @property {string} id - A unique ID to identify this todo.
 * @property {string} label - The text of the todo.
 * @property {boolean} isDone - Marks whether the todo is done.
 * @property {string} userId - The user who owns this todo.
 *

/**
 * A class which holds some constants for todo-list
 *
class ToDoList {
  static ID = "drop-a-coin";

  static FLAGS = {
    TODOS: "todos",
  };

  static TEMPLATES = {
    TODOLIST: "modules/drop-a-coin/templates/todo-list.hbs",
  };

  static initialize() {
    this.toDoListConfig = new ToDoListConfig();
  }

  /**
   * A small helper function which leverages developer mode flags to gate debug logs.
   *
   * @param {boolean} force - forces the log even if the debug flag is not on
   * @param  {...any} args - what to log
   *
  static log(force, ...args) {
    const shouldLog =
      force ||
      game.modules.get("_dev-mode")?.api?.getPackageDebugValue(this.ID);

    if (shouldLog) {
      console.log(this.ID, "|", ...args);
    }
  }
}

Hooks.once("init", () => {
  ToDoList.initialize();
});

Hooks.on("renderPlayerList", (playerList, html) => {
  // find the element which has our logged in user's id
  const loggedInUserListItem = html.find(`[data-user-id="${game.userId}"]`);

  // create localized tooltip
  const tooltip = game.i18n.localize("TODO-LIST.button-title");

  // insert a button at the end of this element
  loggedInUserListItem.append(
    `<button type='button' class='todo-list-icon-button flex0' title="${tooltip}">
      <i class='fas fa-tasks'></i>
    </button>`
  );

  // register an event listener for this button
  html.on("click", ".todo-list-icon-button", (event) => {
    const userId = $(event.currentTarget)
      .parents("[data-user-id]")
      ?.data()?.userId;
    ToDoList.toDoListConfig.render(true, { userId });
  });
});

/**
 * Register our module's debug flag with developer mode's custom hook
 /
Hooks.once("devModeReady", ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(ToDoList.ID);
});

/**
 * The data layer for our todo-list module
 /
class ToDoListData {
  /**
   * get all toDos for all users indexed by the todo's id
   /
  static get allToDos() {
    const allToDos = game.users.reduce((accumulator, user) => {
      const userTodos = this.getToDosForUser(user.id);

      return {
        ...accumulator,
        ...userTodos,
      };
    }, {});

    return allToDos;
  }

  /**
   * Gets all of a given user's ToDos
   *
   * @param {string} userId - id of the user whose ToDos to return
   * @returns {Record<string, ToDo> | undefined}
   /
  static getToDosForUser(userId) {
    return game.users.get(userId)?.getFlag(ToDoList.ID, ToDoList.FLAGS.TODOS);
  }

  /**
   *
   * @param {string} userId - id of the user to add this ToDo to
   * @param {Partial<ToDo>} toDoData - the ToDo data to use
   /
  static createToDo(userId, toDoData) {
    // generate a random id for this new ToDo and populate the userId
    const newToDo = {
      isDone: false,
      label: "",
      ...toDoData,
      id: foundry.utils.randomID(16),
      userId,
    };

    // construct the update to insert the new ToDo
    const newToDos = {
      [newToDo.id]: newToDo,
    };

    // update the database with the new ToDos
    return game.users
      .get(userId)
      ?.setFlag(ToDoList.ID, ToDoList.FLAGS.TODOS, newToDos);
  }

  /**
   * Updates a given ToDo with the provided data.
   *
   * @param {string} toDoId - id of the ToDo to update
   * @param {Partial<ToDo>} updateData - changes to be persisted
   /
  static updateToDo(toDoId, updateData) {
    const relevantToDo = this.allToDos[toDoId];

    // construct the update to send
    const update = {
      [toDoId]: updateData,
    };

    // update the database with the updated ToDo list
    return game.users
      .get(relevantToDo.userId)
      ?.setFlag(ToDoList.ID, ToDoList.FLAGS.TODOS, update);
  }

  /**
   * Deletes a given ToDo
   *
   * @param {string} toDoId - id of the ToDo to delete
   /
  static deleteToDo(toDoId) {
    const relevantToDo = this.allToDos[toDoId];

    // Foundry specific syntax required to delete a key from a persisted object in the database
    const keyDeletion = {
      [`-=${toDoId}`]: null,
    };

    // update the database with the updated ToDo list
    return game.users
      .get(relevantToDo.userId)
      ?.setFlag(ToDoList.ID, ToDoList.FLAGS.TODOS, keyDeletion);
  }

  /**
   * Updates the given user's ToDos with the provided updateData. This is
   * useful for updating a single user's ToDos in bulk.
   *
   * @param {string} userId - user whose todos we are updating
   * @param {object} updateData - data passed to setFlag
   * @returns
   /
  static updateUserToDos(userId, updateData) {
    return game.users
      .get(userId)
      ?.setFlag(ToDoList.ID, ToDoList.FLAGS.TODOS, updateData);
  }
}

class ToDoListConfig extends FormApplication {
  static get defaultOptions() {
    const defaults = super.defaultOptions;

    const overrides = {
      height: "auto",
      id: "drop-a-coin",
      template: ToDoList.TEMPLATES.TODOLIST,
      title: "To Do List",
      userId: game.userId,
      closeOnSubmit: false, // do not close when submitted
      submitOnChange: true, // submit when any input changes
    };

    const mergedOptions = foundry.utils.mergeObject(defaults, overrides);

    return mergedOptions;
  }

  getData(options) {
    return {
      todos: ToDoListData.getToDosForUser(options.userId),
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.on("click", "[data-action]", this._handleButtonClick);
  }

  async _updateObject(event, formData) {
    const expandedData = foundry.utils.expandObject(formData);
    ToDoList.log(false, "saving", {
      formData,
    });

    await ToDoListData.updateUserToDos(this.options.userId, expandedData);

    this.render();
  }

  async _handleButtonClick(event) {
    const clickedElement = $(event.currentTarget);
    const action = clickedElement.data().action;
    const toDoId = clickedElement.parents("[data-todo-id]")?.data()?.todoId;

    ToDoList.log(false, "Button Clicked!", { action, toDoId });
  }
}
*/

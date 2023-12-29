class CashDesk {
  //static ID = "drop-a-coin";
  //static TEMPLATE = "modules/drop-a-coin/templates/cashDesk.hbs";

  currentCheck = {
    pp: 0,
    gp: 0,
    ep: 0,
    sp: 0,
    cp: 0,
  };

  setCurrentCheck(check) {
    this.currentCheck = check;
  }

  resetCheck() {
    this.setCurrentCheck({
      pp: 0,
      gp: 0,
      ep: 0,
      sp: 0,
      cp: 0,
    });
    CashDesk.resetInputValues();
  }

  updateCheck(newCheck) {
    for (value in this.currentCheck) {
      this.currentCheck[value] += newCheck[value];
    }
  }

  static resetInputValues() {
    const check = document.getElementsByClassName("cash-desk-input");
    for (const elem of check) {
      elem.value = "";
    }
  }

  gain() {
    const wallet = game.user?.character.system.currency;
    wallet.cp += this.currentCheck.cp;
    wallet.sp += this.currentCheck.sp;
    wallet.ep += this.currentCheck.ep;
    wallet.gp += this.currentCheck.gp;
    wallet.pp += this.currentCheck.pp;
    this.resetCheck();
  }

  pay() {
    const wallet = game.user?.character.system.currency;
    for (const value of Object.keys(this.currentCheck)) {
      if (
        wallet[value] == undefined ||
        this.currentCheck[value] > wallet[value]
      )
        return;
    }
    wallet.cp -= this.currentCheck.cp;
    wallet.sp -= this.currentCheck.sp;
    wallet.ep -= this.currentCheck.ep;
    wallet.gp -= this.currentCheck.gp;
    wallet.pp -= this.currentCheck.pp;
    this.resetCheck();
  }

  printCheckout(operation, error) {
    let message = {
      content: "",
    };
    if (error) {
      message.content = game.i18n.localize("CASH-DESK.messages.cantAfford");
    } else {
      switch (operation) {
        case "gain":
          message.content = game.i18n.localize("CASH-DESK.messages.gain");
          break;
      }
      message.content = message.content.replace(
        "{NAME_PLACEHOLDER}",
        game.user?.character.name
      );
      message.content = message.content.replace(
        "{PP_PLACEHOLDER}",
        "" + this.currentCheck.pp
      );
      message.content = message.content.replace(
        "{GP_PLACEHOLDER}",
        "" + this.currentCheck.gp
      );
      message.content = message.content.replace(
        "{EP_PLACEHOLDER}",
        "" + this.currentCheck.ep
      );
      message.content = message.content.replace(
        "{SP_PLACEHOLDER}",
        "" + this.currentCheck.sp
      );
      message.content = message.content.replace(
        "{CP_PLACEHOLDER}",
        "" + this.currentCheck.cp
      );
    }
    ChatMessage.create(message);
  }
}

Hooks.on("renderSidebarTab", async (app, html, data) => {
  const cashDesk = new CashDesk();
  if (app.tabName !== "chat") return;
  const chat_log = html.find("#chat-log");

  const content = await renderTemplate(
    "modules/drop-a-coin/templates/cashDesk.hbs"
  );
  let $content = $(content);
  chat_log.after($content);
  // At left click on the button, add a coin to the check
  $content.find(".cash-desk-money-button").on("click", (event) => {
    event.preventDefault();
    const selector = event.currentTarget.id.slice(-2);
    const input = $content.find("#cash-desk-input-" + selector)[0];
    input.value = Number(input.value || 0) + 1;
    input.dispatchEvent(new Event("change"));
  });
  // At right click on the button, subtract a coin to the check
  $content.find(".cash-desk-money-button").on("contextmenu", (event) => {
    event.preventDefault();
    const selector = event.currentTarget.id.slice(-2);
    const input = $content.find("#cash-desk-input-" + selector)[0];
    input.value = (input.value || 0) > 1 ? Number(input.value) - 1 : "";
    input.dispatchEvent(new Event("change"));
  });
  // Reset the check
  $content.find(".cash-desk-reset").on("click", (event) => {
    event.preventDefault();
    cashDesk.resetCheck();
  });
  // Add the check to the wallet
  $content.find(".cash-desk-gain").on("click", (event) => {
    event.preventDefault();
    cashDesk.printCheckout("gain");
    cashDesk.gain();
  });
  // Subtract the check from the wallet
  $content.find(".cash-desk-pay").on("click", (event) => {
    event.preventDefault();
    cashDesk.printCheckout("gain");
    cashDesk.pay();
  });
  // Internally update the check
  $content.find(".cash-desk-input").on("change", (event) => {
    event.preventDefault();
    const check = {
      pp: Number($content.find("#cash-desk-input-pp")[0].value) || 0,
      gp: Number($content.find("#cash-desk-input-gp")[0].value) || 0,
      ep: Number($content.find("#cash-desk-input-ep")[0].value) || 0,
      sp: Number($content.find("#cash-desk-input-sp")[0].value) || 0,
      cp: Number($content.find("#cash-desk-input-cp")[0].value) || 0,
    };
    cashDesk.setCurrentCheck(check);
  });
});

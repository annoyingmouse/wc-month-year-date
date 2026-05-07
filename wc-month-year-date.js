class MonthYearDate extends HTMLElement {
  static formAssociated = true;

  static get observedAttributes() {
    return ["disabled", "readonly", "required"];
  }

  constructor() {
    super();
    this.internals = this.attachInternals();
    this.attachShadow({ mode: "open" });
    this.setAttribute("role", "group");
    this._formDisabled = false;
    this._hasWebAwesome = false;
  }

  connectedCallback() {
    const raw = this.getAttribute("value");
    const dflt = this.getAttribute("default");

    let yearValue, monthValue;
    if (raw) {
      [yearValue, monthValue] = raw.split("-");
    } else if (dflt === "now") {
      const now = new Date();
      yearValue = String(now.getFullYear());
      monthValue = String(now.getMonth() + 1).padStart(2, "0");
    } else {
      yearValue = null;
      monthValue = null;
    }

    if (
      !this.hasAttribute("aria-label") &&
      !this.hasAttribute("aria-labelledby")
    ) {
      this.setAttribute("aria-label", "Month and year");
    }

    this._hasWebAwesome =
      !!customElements.get("wa-select") && !!customElements.get("wa-input");

    if (this._hasWebAwesome) {
      this._renderWebAwesome(monthValue, yearValue);
    } else {
      this._renderNative(monthValue, yearValue);
    }

    this._applyStates();

    this.monthInput.addEventListener(
      this._hasWebAwesome ? "wa-change" : "change",
      () => this.updateValue(),
    );
    this.yearInput.addEventListener(
      this._hasWebAwesome ? "wa-input" : "input",
      () => this.updateValue(),
    );

    this.updateValue();
  }

  _monthOptions(tag) {
    return Array.from({ length: 12 }, (_, i) => {
      const month = String(i + 1).padStart(2, "0");
      const label = new Date(2000, i).toLocaleString(undefined, {
        month: "long",
      });
      return `<${tag} value="${month}">${label}</${tag}>`;
    }).join("");
  }

  _renderNative(monthValue, yearValue) {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          gap: 0.5rem;
          align-items: center;
          font-family: system-ui, sans-serif;
        }

        select,
        input {
          font: inherit;
          padding: 0.35rem 0.45rem;
        }

        input {
          width: 5.5rem;
        }
      </style>

      <select part="month" aria-label="Month">
        <option value="" disabled selected>Month</option>
        ${this._monthOptions("option")}
      </select>

      <input
        part="year"
        type="number"
        min="1"
        max="9999"
        step="1"
        placeholder="Year"
        aria-label="Year"
      >
    `;

    this.monthInput = this.shadowRoot.querySelector("select");
    this.yearInput = this.shadowRoot.querySelector("input");

    if (monthValue) this.monthInput.value = monthValue;
    if (yearValue) this.yearInput.value = yearValue;
  }

  _renderWebAwesome(monthValue, yearValue) {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          gap: 0.5rem;
          align-items: center;
        }

        wa-input {
          width: 8rem;
        }
      </style>

      <wa-select
        part="month"
        aria-label="Month"
        placeholder="Month"
        ${monthValue ? `value="${monthValue}"` : ""}
      >
        ${this._monthOptions("wa-option")}
      </wa-select>

      <wa-input
        part="year"
        type="number"
        min="1"
        max="9999"
        step="1"
        placeholder="Year"
        aria-label="Year"
        ${yearValue ? `value="${yearValue}"` : ""}
      ></wa-input>
    `;

    this.monthInput = this.shadowRoot.querySelector("wa-select");
    this.yearInput = this.shadowRoot.querySelector("wa-input");
  }

  attributeChangedCallback(name) {
    if (!this.monthInput) return;
    this._applyStates();
    if (name === "required") this.updateValue();
  }

  formDisabledCallback(disabled) {
    this._formDisabled = disabled;
    this._applyStates();
  }

  _applyStates() {
    if (!this.monthInput) return;
    const disabled = this.hasAttribute("disabled") || this._formDisabled;
    const readonly = this.hasAttribute("readonly");
    const required = this.hasAttribute("required");

    if (this._hasWebAwesome) {
      // wa-select supports readonly natively; no workaround needed
      this.monthInput.disabled = disabled;
      this.yearInput.disabled = disabled;
      this.monthInput.readonly = readonly;
      this.yearInput.readonly = !disabled && readonly;
    } else {
      // <select> has no readonly; disable it to prevent interaction when readonly
      this.monthInput.disabled = disabled || readonly;
      this.yearInput.disabled = disabled;
      this.yearInput.readOnly = !disabled && readonly;
    }

    if (required) {
      this.monthInput.setAttribute("aria-required", "true");
      this.yearInput.setAttribute("aria-required", "true");
    } else {
      this.monthInput.removeAttribute("aria-required");
      this.yearInput.removeAttribute("aria-required");
    }
  }

  updateValue() {
    const month = this.monthInput.value;
    const year = this.yearInput.value;
    const required = this.hasAttribute("required");

    if (month && year && Number(year) >= 1) {
      this.value = `${year.padStart(4, "0")}-${month}-01`;
      this.internals.setFormValue(this.value);
      this.internals.setValidity({});
    } else {
      this.value = "";
      this.internals.setFormValue("");

      const bothEmpty = !month && !year;
      if (bothEmpty && !required) {
        this.internals.setValidity({});
      } else if (bothEmpty) {
        this.internals.setValidity(
          { valueMissing: true },
          "Please select a month and enter a year",
          this.monthInput,
        );
      } else {
        this.internals.setValidity(
          { badInput: true },
          "Please complete both the month and the year",
          month ? this.yearInput : this.monthInput,
        );
      }
    }
  }

  get form() {
    return this.internals.form;
  }

  get name() {
    return this.getAttribute("name");
  }

  get type() {
    return "wc-month-year-date";
  }

  get value() {
    return this.getAttribute("value") || "";
  }

  set value(val) {
    this.setAttribute("value", val);
  }
}

customElements.define("wc-month-year-date", MonthYearDate);

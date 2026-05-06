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
  }

  connectedCallback() {
    const now = new Date();
    const raw = this.getAttribute("value");
    const [yearValue, monthValue] = raw
      ? raw.split("-")
      : [String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, "0")];

    if (!this.hasAttribute("aria-label") && !this.hasAttribute("aria-labelledby")) {
      this.setAttribute("aria-label", "Month and year");
    }

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
        ${Array.from({ length: 12 }, (_, i) => {
      const month = String(i + 1).padStart(2, "0");
      const label = new Date(2000, i).toLocaleString(undefined, {
        month: "long",
      });
      return `<option value="${month}">${label}</option>`;
    }).join("")}
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

    this._applyStates();

    this.monthInput.addEventListener("change", () => this.updateValue());
    this.yearInput.addEventListener("input", () => this.updateValue());

    this.updateValue();
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

    // <select> has no readonly; disable it to prevent interaction when readonly
    this.monthInput.disabled = disabled || readonly;
    this.yearInput.disabled = disabled;
    this.yearInput.readOnly = !disabled && readonly;

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
          !month ? this.monthInput : this.yearInput,
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

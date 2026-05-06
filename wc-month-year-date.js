class MonthYearDate extends HTMLElement {
  static formAssociated = true;

  constructor() {
    super();
    this.internals = this.attachInternals();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const value = this.getAttribute("value") || "";
    const [yearValue, monthValue] = value.split("-");

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
        <option value="">Month</option>
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

    this.monthInput.addEventListener("change", () => this.updateValue());
    this.yearInput.addEventListener("input", () => this.updateValue());

    this.updateValue();
  }

  updateValue() {
    const month = this.monthInput.value;
    const year = this.yearInput.value.padStart(4, "0");

    if (month && year && Number(this.yearInput.value) >= 1) {
      this.value = `${year}-${month}-01`;
      this.internals.setFormValue(this.value);
    } else {
      this.value = "";
      this.internals.setFormValue("");
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

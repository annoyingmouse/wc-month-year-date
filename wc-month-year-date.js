class MonthYearDate extends HTMLElement {
  static formAssociated = true;

  static get observedAttributes() {
    return ["disabled", "readonly", "required", "label", "autocomplete"];
  }

  constructor() {
    super();
    this.internals = this.attachInternals();
    this.attachShadow({ mode: "open" });
    this.setAttribute("role", "group");
    this._formDisabled = false;
    this._hasWebAwesome = false;
    this._interacted = false;
  }

  async connectedCallback() {
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
      !!document.querySelector('script[src*="webawesome"]');

    if (this._hasWebAwesome) {
      // WA autoloader observes light DOM only; insert hidden probes so it
      // discovers and fetches wa-select/wa-input before we render into shadow DOM
      const probes = ["wa-select", "wa-input"].map((tag) => {
        const el = document.createElement(tag);
        el.hidden = true;
        document.body.appendChild(el);
        return el;
      });
      await Promise.all([
        customElements.whenDefined("wa-select"),
        customElements.whenDefined("wa-input"),
      ]);
      for (const el of probes) el.remove();
      this._renderWebAwesome(monthValue, yearValue);
    } else {
      this._renderNative(monthValue, yearValue);
    }

    this._applyStates();
    this._applyAutocomplete();

    const markInteracted = () => {
      this._interacted = true;
      this.updateValue();
    };

    this.monthInput.addEventListener(
      this._hasWebAwesome ? "wa-change" : "change",
      markInteracted,
    );
    this.yearInput.addEventListener(
      this._hasWebAwesome ? "wa-input" : "input",
      markInteracted,
    );

    // Blur on either control also marks interaction so tabbing through a
    // required-but-untouched field announces the error to screen readers
    this.monthInput.addEventListener("blur", markInteracted);
    this.yearInput.addEventListener("blur", markInteracted);

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
    const labelText = this.getAttribute("label");
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

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      </style>

      <label part="label form-control-label" for="month" ${labelText ? "" : "hidden"}></label>

      <label for="month" class="sr-only">Month</label>
      <select id="month" part="month" aria-label="Month" aria-describedby="error">
        <option value="" disabled selected>Month</option>
        ${this._monthOptions("option")}
      </select>

      <label for="year" class="sr-only">Year</label>
      <input
        id="year"
        part="year"
        type="text"
        inputmode="numeric"
        maxlength="4"
        placeholder="YYYY"
        aria-label="Year"
        aria-describedby="error"
      >

      <p id="error" aria-live="polite" class="sr-only"></p>
    `;

    this.labelEl = this.shadowRoot.querySelector('[part~="label"]');
    if (labelText) this.labelEl.textContent = labelText;

    this.monthInput = this.shadowRoot.querySelector("select");
    this.yearInput = this.shadowRoot.querySelector("input");
    this.errorEl = this.shadowRoot.querySelector("#error");

    if (monthValue) this.monthInput.value = monthValue;
    if (yearValue) this.yearInput.value = yearValue;
  }

  _renderWebAwesome(monthValue, yearValue) {
    const labelText = this.getAttribute("label");
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        wa-select {
          flex: 2;
        }

        wa-input {
          flex: 1;
          min-width: 0;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      </style>

      <label part="label form-control-label" ${labelText ? "" : "hidden"}></label>

      <wa-select
        part="month"
        aria-label="Month"
        aria-describedby="error"
        placeholder="Month"
        ${monthValue ? `value="${monthValue}"` : ""}
      >
        ${this._monthOptions("wa-option")}
      </wa-select>

      <wa-input
        part="year"
        type="text"
        inputmode="numeric"
        maxlength="4"
        placeholder="YYYY"
        aria-label="Year"
        aria-describedby="error"
        ${yearValue ? `value="${yearValue}"` : ""}
      ></wa-input>

      <p id="error" aria-live="polite" class="sr-only"></p>
    `;

    this.labelEl = this.shadowRoot.querySelector('[part~="label"]');
    if (labelText) this.labelEl.textContent = labelText;
    this.labelEl.addEventListener("click", () => this.monthInput.focus());

    this.monthInput = this.shadowRoot.querySelector("wa-select");
    this.yearInput = this.shadowRoot.querySelector("wa-input");
    this.errorEl = this.shadowRoot.querySelector("#error");
  }

  attributeChangedCallback(name) {
    if (!this.monthInput) return;
    if (name === "label") {
      const text = this.getAttribute("label");
      this.labelEl.textContent = text || "";
      this.labelEl.hidden = !text;
      return;
    }
    if (name === "autocomplete") {
      this._applyAutocomplete();
      return;
    }
    this._applyStates();
    if (name === "required") this.updateValue();
  }

  formDisabledCallback(disabled) {
    this._formDisabled = disabled;
    this._applyStates();
  }

  formResetCallback() {
    this._interacted = false;

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

    this.monthInput.value = monthValue ?? "";
    this.yearInput.value = yearValue ?? "";

    this.monthInput.removeAttribute("aria-invalid");
    this.yearInput.removeAttribute("aria-invalid");
    this.errorEl.textContent = "";

    this.updateValue();
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

  _applyAutocomplete() {
    if (!this.monthInput) return;
    const raw = this.getAttribute("autocomplete");
    if (!raw) return;

    const compound = {
      "cc-exp": ["cc-exp-month", "cc-exp-year"],
      bday: ["bday-month", "bday-year"],
    };

    const [monthToken, yearToken] = compound[raw] ?? [raw, raw];
    this.monthInput.setAttribute("autocomplete", monthToken);
    this.yearInput.setAttribute("autocomplete", yearToken);
  }

  updateValue() {
    const month = this.monthInput.value;
    const year = this.yearInput.value;
    const required = this.hasAttribute("required");

    if (month && year && Number(year) >= 1) {
      this.value = `${year.padStart(4, "0")}-${month}-01`;
      this.internals.setFormValue(this.value);
      this.internals.setValidity({});
      if (this._interacted) {
        this.monthInput.removeAttribute("aria-invalid");
        this.yearInput.removeAttribute("aria-invalid");
        this.errorEl.textContent = "";
      }
    } else {
      this.value = "";
      this.internals.setFormValue("");

      const bothEmpty = !month && !year;
      if (bothEmpty && !required) {
        this.internals.setValidity({});
        if (this._interacted) {
          this.monthInput.removeAttribute("aria-invalid");
          this.yearInput.removeAttribute("aria-invalid");
          this.errorEl.textContent = "";
        }
      } else if (bothEmpty) {
        this.internals.setValidity(
          { valueMissing: true },
          "Please select a month and enter a year",
          this.monthInput,
        );
        if (this._interacted) {
          this.monthInput.setAttribute("aria-invalid", "true");
          this.yearInput.setAttribute("aria-invalid", "true");
          this.errorEl.textContent = "Please select a month and enter a year";
        }
      } else {
        const message = "Please complete both the month and the year";
        this.internals.setValidity(
          { badInput: true },
          message,
          month ? this.yearInput : this.monthInput,
        );
        if (this._interacted) {
          if (month) {
            this.monthInput.removeAttribute("aria-invalid");
            this.yearInput.setAttribute("aria-invalid", "true");
          } else {
            this.monthInput.setAttribute("aria-invalid", "true");
            this.yearInput.removeAttribute("aria-invalid");
          }
          this.errorEl.textContent = message;
        }
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

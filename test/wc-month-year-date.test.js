import { fixture, html, expect } from "@open-wc/testing";
import "../wc-month-year-date.js";

// ─── Rendering ────────────────────────────────────────────────────────────────

describe("rendering", () => {
  it("renders a month select in the shadow root", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    expect(el.shadowRoot.querySelector("select")).to.exist;
  });

  it("renders a year input in the shadow root", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    expect(el.shadowRoot.querySelector("input")).to.exist;
  });

  it("renders 13 month options (placeholder + 12 months)", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    const options = el.shadowRoot.querySelectorAll("select option");
    expect(options.length).to.equal(13);
  });

  it("first option is the empty placeholder", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    const first = el.shadowRoot.querySelector("select option");
    expect(first.value).to.equal("");
  });
});

// ─── Default state ────────────────────────────────────────────────────────────

describe("default state", () => {
  it("has an empty value by default", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    expect(el.value).to.equal("");
  });

  it("has an unselected month by default", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    expect(el.shadowRoot.querySelector("select").value).to.equal("");
  });

  it("has an empty year by default", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    expect(el.shadowRoot.querySelector("input").value).to.equal("");
  });
});

// ─── Value attribute ──────────────────────────────────────────────────────────

describe("value attribute", () => {
  it("populates the month select from a YYYY-MM value attribute", async () => {
    const el = await fixture(
      html`<wc-month-year-date value="2024-03"></wc-month-year-date>`,
    );
    expect(el.shadowRoot.querySelector("select").value).to.equal("03");
  });

  it("populates the year input from a YYYY-MM value attribute", async () => {
    const el = await fixture(
      html`<wc-month-year-date value="2024-03"></wc-month-year-date>`,
    );
    expect(el.shadowRoot.querySelector("input").value).to.equal("2024");
  });

  it("sets el.value to YYYY-MM-01 when both fields are filled", async () => {
    const el = await fixture(
      html`<wc-month-year-date value="2024-03"></wc-month-year-date>`,
    );
    expect(el.value).to.equal("2024-03-01");
  });

  it("keeps value empty when only month is provided without year", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    el.shadowRoot.querySelector("select").value = "05";
    el.shadowRoot.querySelector("select").dispatchEvent(new Event("change"));
    expect(el.value).to.equal("");
  });

  it("keeps value empty when only year is provided without month", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    el.shadowRoot.querySelector("input").value = "2024";
    el.shadowRoot.querySelector("input").dispatchEvent(new Event("input"));
    expect(el.value).to.equal("");
  });

  it("produces a valid date string for all 12 months", async () => {
    for (let m = 1; m <= 12; m++) {
      const month = String(m).padStart(2, "0");
      const el = await fixture(
        html`<wc-month-year-date value="2024-${month}"></wc-month-year-date>`,
      );
      expect(el.value).to.equal(`2024-${month}-01`);
    }
  });
});

// ─── default="now" attribute ──────────────────────────────────────────────────

describe('default="now" attribute', () => {
  it("pre-fills the month with the current month", async () => {
    const el = await fixture(
      html`<wc-month-year-date default="now"></wc-month-year-date>`,
    );
    const expected = String(new Date().getMonth() + 1).padStart(2, "0");
    expect(el.shadowRoot.querySelector("select").value).to.equal(expected);
  });

  it("pre-fills the year with the current year", async () => {
    const el = await fixture(
      html`<wc-month-year-date default="now"></wc-month-year-date>`,
    );
    expect(el.shadowRoot.querySelector("input").value).to.equal(
      String(new Date().getFullYear()),
    );
  });

  it("sets el.value to the current YYYY-MM-01", async () => {
    const el = await fixture(
      html`<wc-month-year-date default="now"></wc-month-year-date>`,
    );
    const now = new Date();
    const year = String(now.getFullYear()).padStart(4, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    expect(el.value).to.equal(`${year}-${month}-01`);
  });

  it("value attribute takes precedence over default='now'", async () => {
    const el = await fixture(
      html`<wc-month-year-date
        default="now"
        value="2020-01"
      ></wc-month-year-date>`,
    );
    expect(el.value).to.equal("2020-01-01");
  });
});

// ─── Public API ───────────────────────────────────────────────────────────────

describe("public API", () => {
  it("type getter returns 'wc-month-year-date'", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    expect(el.type).to.equal("wc-month-year-date");
  });

  it("name getter reflects the name attribute", async () => {
    const el = await fixture(
      html`<wc-month-year-date name="expires"></wc-month-year-date>`,
    );
    expect(el.name).to.equal("expires");
  });

  it("name getter returns null when no name attribute is set", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    expect(el.name).to.be.null;
  });
});

// ─── Form association ─────────────────────────────────────────────────────────

describe("form association", () => {
  it("is form-associated", () => {
    expect(customElements.get("wc-month-year-date").formAssociated).to.be.true;
  });

  it("reports the enclosing form via the form getter", async () => {
    const form = await fixture(
      html`<form><wc-month-year-date name="dob"></wc-month-year-date></form>`,
    );
    const el = form.querySelector("wc-month-year-date");
    expect(el.form).to.equal(form);
  });
});

import { fixture, html, expect } from "@open-wc/testing";
import "../wc-month-year-date.js";

// ─── Group semantics ──────────────────────────────────────────────────────────

describe("group semantics", () => {
  it('has role="group" on the host', async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    expect(el.getAttribute("role")).to.equal("group");
  });

  it('has a default aria-label of "Month and year"', async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    expect(el.getAttribute("aria-label")).to.equal("Month and year");
  });

  it("does not override an existing aria-label", async () => {
    const el = await fixture(
      html`<wc-month-year-date
        aria-label="Date of birth"
      ></wc-month-year-date>`,
    );
    expect(el.getAttribute("aria-label")).to.equal("Date of birth");
  });

  it("does not add aria-label when aria-labelledby is present", async () => {
    const el = await fixture(
      html`<wc-month-year-date
        aria-labelledby="my-label"
      ></wc-month-year-date>`,
    );
    expect(el.hasAttribute("aria-label")).to.be.false;
  });
});

// ─── Per-control labels ───────────────────────────────────────────────────────

describe("per-control labels", () => {
  it("renders an sr-only label associated with the month select", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    const label = el.shadowRoot.querySelector('label[for="month"].sr-only');
    expect(label).to.exist;
    expect(label.textContent.trim()).to.equal("Month");
  });

  it("renders an sr-only label associated with the year input", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    const label = el.shadowRoot.querySelector('label[for="year"].sr-only');
    expect(label).to.exist;
    expect(label.textContent.trim()).to.equal("Year");
  });

  it("the month select has id='month' matching its label", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    expect(el.shadowRoot.querySelector("select").id).to.equal("month");
  });

  it("the year input has id='year' matching its label", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    expect(el.shadowRoot.querySelector("input").id).to.equal("year");
  });
});

// ─── Overall label ────────────────────────────────────────────────────────────

describe("overall label", () => {
  it("is hidden by default when no label attribute is set", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    const label = el.shadowRoot.querySelector('[part~="label"]');
    expect(label.hidden).to.be.true;
  });

  it("is visible and shows the label attribute text", async () => {
    const el = await fixture(
      html`<wc-month-year-date label="Planted when"></wc-month-year-date>`,
    );
    const label = el.shadowRoot.querySelector('[part~="label"]');
    expect(label.hidden).to.be.false;
    expect(label.textContent.trim()).to.equal("Planted when");
  });

  it("has for='month' to associate it with the month select", async () => {
    const el = await fixture(
      html`<wc-month-year-date label="Pick a date"></wc-month-year-date>`,
    );
    const label = el.shadowRoot.querySelector('[part~="label"]');
    expect(label.getAttribute("for")).to.equal("month");
  });

  it("updates when the label attribute changes", async () => {
    const el = await fixture(
      html`<wc-month-year-date label="Before"></wc-month-year-date>`,
    );
    el.setAttribute("label", "After");
    const label = el.shadowRoot.querySelector('[part~="label"]');
    expect(label.textContent.trim()).to.equal("After");
  });

  it("becomes hidden when the label attribute is removed", async () => {
    const el = await fixture(
      html`<wc-month-year-date label="Remove me"></wc-month-year-date>`,
    );
    el.removeAttribute("label");
    const label = el.shadowRoot.querySelector('[part~="label"]');
    expect(label.hidden).to.be.true;
  });
});

// ─── Required / aria-required ─────────────────────────────────────────────────

describe("aria-required", () => {
  it("sets aria-required on both controls when required", async () => {
    const el = await fixture(
      html`<wc-month-year-date required></wc-month-year-date>`,
    );
    expect(
      el.shadowRoot.querySelector("select").getAttribute("aria-required"),
    ).to.equal("true");
    expect(
      el.shadowRoot.querySelector("input").getAttribute("aria-required"),
    ).to.equal("true");
  });

  it("removes aria-required from both controls when required is removed", async () => {
    const el = await fixture(
      html`<wc-month-year-date required></wc-month-year-date>`,
    );
    el.removeAttribute("required");
    expect(el.shadowRoot.querySelector("select").hasAttribute("aria-required"))
      .to.be.false;
    expect(el.shadowRoot.querySelector("input").hasAttribute("aria-required"))
      .to.be.false;
  });

  it("does not set aria-required when required attribute is absent", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    expect(el.shadowRoot.querySelector("select").hasAttribute("aria-required"))
      .to.be.false;
    expect(el.shadowRoot.querySelector("input").hasAttribute("aria-required"))
      .to.be.false;
  });
});

// ─── Year input type ──────────────────────────────────────────────────────────

describe("year input type", () => {
  it("uses type=text to avoid screen-reader spin-button noise", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    expect(el.shadowRoot.querySelector("input").type).to.equal("text");
  });

  it("has inputmode=numeric for a numeric keyboard on mobile", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    expect(
      el.shadowRoot.querySelector("input").getAttribute("inputmode"),
    ).to.equal("numeric");
  });

  it("limits input to 4 characters via maxlength", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    expect(el.shadowRoot.querySelector("input").maxLength).to.equal(4);
  });
});

// ─── Live error region ────────────────────────────────────────────────────────

describe("live error region", () => {
  it("renders a polite live region in the shadow root", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    const region = el.shadowRoot.querySelector("#error");
    expect(region).to.exist;
    expect(region.getAttribute("aria-live")).to.equal("polite");
  });

  it("month select references the error region via aria-describedby", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    expect(
      el.shadowRoot.querySelector("select").getAttribute("aria-describedby"),
    ).to.equal("error");
  });

  it("year input references the error region via aria-describedby", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    expect(
      el.shadowRoot.querySelector("input").getAttribute("aria-describedby"),
    ).to.equal("error");
  });

  it("error region is empty before any interaction", async () => {
    const el = await fixture(
      html`<wc-month-year-date required></wc-month-year-date>`,
    );
    expect(el.shadowRoot.querySelector("#error").textContent).to.equal("");
  });

  it("populates the error region after month is selected without year", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    const select = el.shadowRoot.querySelector("select");
    select.value = "03";
    select.dispatchEvent(new Event("change"));
    expect(el.shadowRoot.querySelector("#error").textContent).to.include(
      "month and the year",
    );
  });

  it("clears the error region once both fields are complete", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    const select = el.shadowRoot.querySelector("select");
    const input = el.shadowRoot.querySelector("input");
    select.value = "03";
    select.dispatchEvent(new Event("change"));
    input.value = "2025";
    input.dispatchEvent(new Event("input"));
    expect(el.shadowRoot.querySelector("#error").textContent).to.equal("");
  });
});

// ─── aria-invalid ─────────────────────────────────────────────────────────────

describe("aria-invalid", () => {
  it("is not set before the user interacts", async () => {
    const el = await fixture(
      html`<wc-month-year-date required></wc-month-year-date>`,
    );
    expect(el.shadowRoot.querySelector("select").hasAttribute("aria-invalid"))
      .to.be.false;
    expect(el.shadowRoot.querySelector("input").hasAttribute("aria-invalid"))
      .to.be.false;
  });

  it("sets aria-invalid on year only when month is selected but year is empty", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    const select = el.shadowRoot.querySelector("select");
    select.value = "03";
    select.dispatchEvent(new Event("change"));
    expect(select.hasAttribute("aria-invalid")).to.be.false;
    expect(
      el.shadowRoot.querySelector("input").getAttribute("aria-invalid"),
    ).to.equal("true");
  });

  it("sets aria-invalid on month only when year is entered but month is empty", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    const input = el.shadowRoot.querySelector("input");
    input.value = "2025";
    input.dispatchEvent(new Event("input"));
    expect(input.hasAttribute("aria-invalid")).to.be.false;
    expect(
      el.shadowRoot.querySelector("select").getAttribute("aria-invalid"),
    ).to.equal("true");
  });

  it("sets aria-invalid on both controls when required and both are empty after blur", async () => {
    const el = await fixture(
      html`<wc-month-year-date required></wc-month-year-date>`,
    );
    el.shadowRoot.querySelector("select").dispatchEvent(new Event("blur"));
    expect(
      el.shadowRoot.querySelector("select").getAttribute("aria-invalid"),
    ).to.equal("true");
    expect(
      el.shadowRoot.querySelector("input").getAttribute("aria-invalid"),
    ).to.equal("true");
  });

  it("removes aria-invalid from both controls once the value is complete", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    const select = el.shadowRoot.querySelector("select");
    const input = el.shadowRoot.querySelector("input");
    select.value = "03";
    select.dispatchEvent(new Event("change"));
    input.value = "2025";
    input.dispatchEvent(new Event("input"));
    expect(select.hasAttribute("aria-invalid")).to.be.false;
    expect(input.hasAttribute("aria-invalid")).to.be.false;
  });
});

// ─── autocomplete passthrough ─────────────────────────────────────────────────

describe("autocomplete", () => {
  it("splits cc-exp into cc-exp-month and cc-exp-year on the controls", async () => {
    const el = await fixture(
      html`<wc-month-year-date autocomplete="cc-exp"></wc-month-year-date>`,
    );
    expect(
      el.shadowRoot.querySelector("select").getAttribute("autocomplete"),
    ).to.equal("cc-exp-month");
    expect(
      el.shadowRoot.querySelector("input").getAttribute("autocomplete"),
    ).to.equal("cc-exp-year");
  });

  it("splits bday into bday-month and bday-year on the controls", async () => {
    const el = await fixture(
      html`<wc-month-year-date autocomplete="bday"></wc-month-year-date>`,
    );
    expect(
      el.shadowRoot.querySelector("select").getAttribute("autocomplete"),
    ).to.equal("bday-month");
    expect(
      el.shadowRoot.querySelector("input").getAttribute("autocomplete"),
    ).to.equal("bday-year");
  });

  it("passes an explicit token through to both controls unchanged", async () => {
    const el = await fixture(
      html`<wc-month-year-date autocomplete="off"></wc-month-year-date>`,
    );
    expect(
      el.shadowRoot.querySelector("select").getAttribute("autocomplete"),
    ).to.equal("off");
    expect(
      el.shadowRoot.querySelector("input").getAttribute("autocomplete"),
    ).to.equal("off");
  });

  it("applies autocomplete when the attribute is set after render", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    el.setAttribute("autocomplete", "cc-exp");
    expect(
      el.shadowRoot.querySelector("select").getAttribute("autocomplete"),
    ).to.equal("cc-exp-month");
    expect(
      el.shadowRoot.querySelector("input").getAttribute("autocomplete"),
    ).to.equal("cc-exp-year");
  });
});

// ─── Form reset ───────────────────────────────────────────────────────────────

describe("form reset", () => {
  it("clears aria-invalid and error message on form reset", async () => {
    const form = await fixture(
      html`<form>
        <wc-month-year-date name="expiry"></wc-month-year-date>
      </form>`,
    );
    const el = form.querySelector("wc-month-year-date");
    const select = el.shadowRoot.querySelector("select");
    select.value = "03";
    select.dispatchEvent(new Event("change"));
    expect(el.shadowRoot.querySelector("#error").textContent).to.not.equal("");

    form.reset();
    expect(el.shadowRoot.querySelector("#error").textContent).to.equal("");
    expect(select.hasAttribute("aria-invalid")).to.be.false;
    expect(
      el.shadowRoot.querySelector("input").hasAttribute("aria-invalid"),
    ).to.be.false;
  });

  it("suppresses aria-invalid after reset until the user interacts again", async () => {
    const form = await fixture(
      html`<form>
        <wc-month-year-date name="expiry" required></wc-month-year-date>
      </form>`,
    );
    const el = form.querySelector("wc-month-year-date");
    el.shadowRoot.querySelector("select").dispatchEvent(new Event("blur"));
    expect(
      el.shadowRoot.querySelector("select").getAttribute("aria-invalid"),
    ).to.equal("true");

    form.reset();
    expect(
      el.shadowRoot.querySelector("select").hasAttribute("aria-invalid"),
    ).to.be.false;
  });
});

// ─── axe-core ─────────────────────────────────────────────────────────────────

describe("axe-core", () => {
  it("passes with default state", async () => {
    const el = await fixture(html`<wc-month-year-date></wc-month-year-date>`);
    await expect(el).to.be.accessible();
  });

  it("passes with required attribute", async () => {
    const el = await fixture(
      html`<wc-month-year-date required></wc-month-year-date>`,
    );
    await expect(el).to.be.accessible();
  });

  it("passes with label attribute", async () => {
    const el = await fixture(
      html`<wc-month-year-date label="Card expiry"></wc-month-year-date>`,
    );
    await expect(el).to.be.accessible();
  });

  it("passes with disabled attribute", async () => {
    const el = await fixture(
      html`<wc-month-year-date disabled value="2024-03"></wc-month-year-date>`,
    );
    await expect(el).to.be.accessible();
  });

  it("passes when a value is pre-filled", async () => {
    const el = await fixture(
      html`<wc-month-year-date value="2024-03"></wc-month-year-date>`,
    );
    await expect(el).to.be.accessible();
  });

  it("passes with aria-invalid set after interaction", async () => {
    const el = await fixture(
      html`<wc-month-year-date required></wc-month-year-date>`,
    );
    el.shadowRoot.querySelector("select").dispatchEvent(new Event("blur"));
    await expect(el).to.be.accessible();
  });
});

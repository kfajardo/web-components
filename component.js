/**
 * A web component that captures operator information via stepper form
 * with necessary field validations. This serves as the simplified approach
 * in comparison to the Moov Onboarding Drop.
 *
 * Author @kfajardo
 */

class OperatorOnboarding extends HTMLElement {
  steps = [
    `
      <style>
        form {
          display: flex;
          flex-direction: column;
          width: 200px;
          gap: 8px;
          font-family: sans-serif;
        }
        input, button {
          padding: 8px;
          font-size: 14px;
        }
      </style>

      <form id="form">
        <input type="email" id="email" name="email" placeholder="Email" required />
        <input type="text" id="firstName" name="firstName" placeholder="First Name" required />
        <input type="text" name="lastName" placeholder="Last Name" required />
        <input type="text" name="phoneNumber" placeholder="Phone Number" required />
        <button type="submit">Next</button>
      </form>
    `,
    `
      <style>
        form {
          display: flex;
          flex-direction: column;
          width: 200px;
          gap: 8px;
          font-family: sans-serif;
        }
        input, button {
          padding: 8px;
          font-size: 14px;
        }
      </style>

      <form id="form">
      <input type="text" name="routingNumber" placeholder="Routing Number" required />
      <input type="text" name="accountNumber" placeholder="Account Number" required />
      <input type="text" name="accountName" placeholder="Account Name" required />
        <button type="submit">Next</button>
      </form>
    `,
    `
      <style>
        form {
          display: flex;
          flex-direction: column;
          width: 200px;
          gap: 8px;
          font-family: sans-serif;
        }
        input, button {
          padding: 8px;
          font-size: 14px;
        }
      </style>

      <form id="form">
        <input type="text" name="companyName" placeholder="Company Name" required />
        <input type="text" name="contactName" placeholder="Contact Name" required />
        <input type="email" name="contactEmail" placeholder="Contact Email" required />
        <input type="text" name="contactPhone" placeholder="Contact Phone" required />
        <button type="submit">Next</button>
      </form>
    `,
  ];

  operatorData = {};

  currentStep = 0;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.innerHTML = this.steps[this.currentStep];

    const form = shadow.querySelector("#form");
    form.addEventListener("submit", (e) => this.handleSubmit(e));
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = e.target; // use the form from the event
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // console.log("Step:", this.currentStep, "Data:", data); // ✅ now logs correctly
    this.operatorData = { ...this.operatorData, ...data };
    this.currentStep += 1;

    // move to next step if any
    if (this.currentStep < this.steps.length) {
      this.shadowRoot.innerHTML = this.steps[this.currentStep];
      const newForm = this.shadowRoot.querySelector("#form");
      newForm.addEventListener("submit", (e) => this.handleSubmit(e));
    } else {
      console.log("All steps completed.");
    }

    console.log(this.operatorData);

    this.dispatchEvent(new CustomEvent("formSubmit", { detail: data }));
  }

  // * IMPORTANT - gets called when inserted into the document
  connectedCallback() {
    const currentUrl = window.location.href;

    // You can even extract specific parts:
    const params = new URLSearchParams(window.location.search);
    // console.log("Query Params:", params.get("name"));

    const email = this.shadowRoot.querySelector("#firstName");

    email.value = params.get("name");
  }

  // * IMPORTANT - gets called when the element is removed from the document.
  disconnectedCallback() {}

  // * IMPORTANT - gets called when one of the observed attributes changes.
  attributeChangedCallback(name, oldValue, newValue) {}

  // * IMPORTANT - gets called when the element is moved to a new document
  adoptedCallback() {}
}

customElements.define("operator-onboarding", OperatorOnboarding);

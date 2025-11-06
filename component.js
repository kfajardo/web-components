class WebComponents extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.innerHTML = `
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
        <input type="text" name="name" placeholder="Enter name" required />
        <input type="email" name="email" placeholder="Enter email" required />
        <button type="submit">Submit</button>
      </form>
    `;

    const form = shadow.querySelector("#form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      this.dispatchEvent(new CustomEvent("formSubmit", { detail: data }));
    });
  }
}

customElements.define("my-form", MyForm);

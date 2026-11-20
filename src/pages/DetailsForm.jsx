import { useState } from "react";
import backIcon from "../assets/icons/back.svg";
import "./DetailsForm.css";

const empty = { fullName: "", email: "", contact: "", address: "", notes: "" };

const validEmail = (v) => /^\S+@\S+\.\S+$/.test(v.trim());
const validContact = (v) => /^(\+63|0)?9\d{2}[\s-]?\d{3}[\s-]?\d{4}$/.test(v.trim());

function validate(v) {
  const e = {};
  if (!v.fullName.trim()) e.fullName = "Enter your name.";
  if (!v.email.trim()) e.email = "Enter your email address.";
  else if (!validEmail(v.email)) e.email = "Enter a valid email address.";
  if (!v.contact.trim()) e.contact = "Enter your contact number.";
  else if (!validContact(v.contact)) e.contact = "Use a valid number, e.g. 0912 345 6789.";
  if (!v.address.trim()) e.address = "Enter your address.";
  return e; // notes are optional
}


function Field({ id, label, optional, error, children }) {
  return (
    <div className="details-field">
      <label htmlFor={id}>
        {label}
        {optional && <span className="details-field__optional"> (optional)</span>}
      </label>
      {children}
      <p className="details-field__error" aria-live="polite">{error}</p>
    </div>
  );
}


export default function DetailsForm({ initial = empty, onBack, onSubmit }) {
  const [values, setValues] = useState({ ...empty, ...initial });
  const [errors, setErrors] = useState({});

  const update = (e) => setValues({ ...values, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    onSubmit?.(Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()])));
  };

  return (
    <main className="details">
      <header className="details__top">
        {onBack && (
          <button type="button" className="details__back" onClick={onBack}>
            <img src={backIcon} alt="" width="20" height="20" /> Back
          </button>
        )}
        <h1 className="details__title">Add your details</h1>
        <p className="details__sub">These appear on your downloaded design.</p>
      </header>

      <form className="details__form" onSubmit={handleSubmit} noValidate>
        <div className="details__fields">
          <Field id="fullName" label="Full Name" error={errors.fullName}>
            <input id="fullName" name="fullName" type="text" placeholder="e.g. Fleur de Lis"
                   autoComplete="name" value={values.fullName} onChange={update} />
          </Field>

          <Field id="email" label="Email Address" error={errors.email}>
            <input id="email" name="email" type="email" placeholder="e.g. myemail@address.com"
                   autoComplete="email" value={values.email} onChange={update} />
          </Field>

          <Field id="contact" label="Contact Number" error={errors.contact}>
            <input id="contact" name="contact" type="tel" placeholder="e.g. 0912 345 6789"
                   autoComplete="tel" value={values.contact} onChange={update} />
          </Field>

          <Field id="address" label="Address" error={errors.address}>
            <textarea id="address" name="address" rows="2" placeholder="Street, city, province, ZIP"
                      autoComplete="street-address" value={values.address} onChange={update} />
          </Field>

          <Field id="notes" label="Additional Notes" optional error={errors.notes}>
            <textarea id="notes" name="notes" rows="3" placeholder="Anything the florist should know"
                      value={values.notes} onChange={update} />
          </Field>
        </div>

        <div className="details__footer">
          <button type="submit" className="btn details__submit">Continue</button>
        </div>
      </form>
    </main>
  );
}
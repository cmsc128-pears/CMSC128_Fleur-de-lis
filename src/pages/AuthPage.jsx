import { useState } from "react";
import "./AuthPage.css";

const emptyLogin = { email: "", password: "" };
const emptySignup = {
    firstName: "",
    lastName: "",
    contact: "",
    email: "",
    password: "",
    confirmPassword: "",
};

function friendlyError(err) {
    return err?.message || "Something went wrong. Please try again.";
}

function Field({ mode, label, name, error, children }) {
    return (
        <div className="field">
            <label htmlFor={`${mode}-${name}`}>{label}</label>
            {children}
            {error && <p className="field-error">{error}</p>}
        </div>
    );
}

export default function AuthPage ({
    onLogin,
    onSignup,
    onGuest,
    onResetPassword,
    onAuthSuccess,
}) {
    const [mode, setMode] = useState("login");
    const [login, setLogin] = useState(emptyLogin);
    const [signup, setSignup] = useState(emptySignup);
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetSent, setResetSent] = useState(false);

    const switchMode = (next) => {
        setMode(next);
        setErrors({});
        setFormError("");
        setResetSent(false);
        };

    const updateLogin = (e) => setLogin({ ...login, [e.target.name]: e.target.value });
    const updateSignup = (e) => setSignup({ ...signup, [e.target.name]: e.target.value });

    const validEmail = (value) => /^\S+@\S+\.\S+$/.test(value.trim());

    const validate = (values, isSignup) => {
    const next = {};
    if (isSignup) {
        if (!values.firstName.trim()) next.firstName = "Enter your first name.";
        if (!values.lastName.trim()) next.lastName = "Enter your last name.";
    }

    if (!values.email.trim()) next.email = "Enter your email address.";
    else if (!validEmail(values.email)) next.email = "Enter a valid email address.";

    if (isSignup && values.contact.trim() && !validContact(values.contact))
        next.contact = "Use a valid number, e.g. 0912 345 6789.";

    if (!values.password) next.password = "Enter your password.";
    else if (isSignup && values.password.length < 8)
        next.password = "Password must be at least 8 characters.";
    if (isSignup && values.confirmPassword !== values.password)
        next.confirmPassword = "Passwords do not match.";
    return next;
    };

    const run = async (action) => {
    setFormError("");
    setSubmitting(true);
    try {
      await action();
      onAuthSuccess?.();
    } catch (err) {
      setFormError(friendlyError(err));
    } finally {
      setSubmitting(false);
    }
  };

    const handleLogin = (e) => {
        e.preventDefault();
        const found = validate(login, false);
        setErrors(found);
        if (Object.keys(found).length === 0) run(() => onLogin?.(login));
    };

    const handleSignup = (e) => {
        e.preventDefault();
        const found = validate(signup, true);
        setErrors(found);
        if (Object.keys(found).length === 0) run(() => onSignup?.(signup));
    };

    const handleGuest = () => run(() => onGuest?.());
    const handleReset = async (e) => {
        e.preventDefault();
        const email = resetEmail.trim();

        if (!email) return setErrors({ email: "Enter your email address." });
        if (!validEmail(email)) return setErrors({ email: "Enter a valid email address." });

        setErrors({});
        setFormError("");
        setSubmitting(true);
        try {
            await onResetPassword?.(email);
            setResetSent(true);
        } catch (err) {
            setFormError(friendlyError(err));
        } finally {
            setSubmitting(false);
        }
        };

    return (
        <main className="auth">
        <div className="auth-logo" role="img" aria-label="fleur de lis logo" />
        <h1 className="auth-wordmark">fleur de lis</h1>

        {mode !== "forgot" && (
        <div className="auth-tabs" role="tablist">
            <button
                type="button"
                role="tab"
                aria-selected={mode === "login"}
                className={mode === "login" ? "tab active" : "tab"}
                onClick={() => switchMode("login")}
                >
                Log In
            </button>
            <button
                type="button"
                role="tab"
                aria-selected={mode === "signup"}
                className={mode === "signup" ? "tab active" : "tab"}
                onClick={() => switchMode("signup")}
                >
                Sign Up
            </button>
        </div>
        )}

        


        {mode === "login" ? (
        <form className="auth-form" onSubmit={handleLogin} noValidate>
            {formError && <p className="form-error" role="alert">{formError}</p>}
            <Field mode={mode} label="Email Address" name="email" error={errors.email}>
                <input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="e.g. myemail@address.com"
                    value={login.email}
                    onChange={updateLogin}
                    autoComplete="email"
                />
            </Field>

            <Field mode={mode} label="Password" name="password" error={errors.password}>
                <input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="Must be at least 8 characters"
                    value={login.password}
                    onChange={updateLogin}
                    autoComplete="current-password"
                />
            </Field>

            <button
                type="button"
                className="link-button"
                onClick={() => {
                    setResetEmail(login.email);
                    switchMode("forgot");
                }}
            >
                Forgot Password?
            </button>

            <div className="button-row">
                <button type="button" className="btn btn-secondary" onClick={handleGuest} disabled={submitting}>
                    <span className="guest-icon" aria-hidden="true" />
                    Log in as Guest
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                    Log In
                </button>
            </div>

            <p className="switch-text">
                Don't have an account?{" "}
                <button type="button" className="link-button" onClick={() => switchMode("signup")}>
                    Sign Up
                </button>
            </p>
        </form>
    ) : mode === "forgot" ? (
        <form className="auth-form" onSubmit={handleReset} noValidate>
            <h2 className="auth-subtitle">Reset your password</h2>

            {resetSent ? (
                <>
                    <p className="form-success" role="status">
                        If an account exists for {resetEmail.trim()}, we've sent a link to reset
                        your password. Check your spam folder if you don't see it.
                    </p>
                    <button
                        type="button"
                        className="btn btn-primary btn-full"
                        onClick={() => switchMode("login")}
                    >
                        Back to Log In
                    </button>
                </>
            ) : (
                <>
                    <p className="switch-text">
                        Enter the email you signed up with and we'll send you a reset link.
                    </p>
                    {formError && <p className="form-error" role="alert">{formError}</p>}

                    <Field mode={mode} label="Email Address" name="email" error={errors.email}>
                        <input
                            id="forgot-email"
                            name="email"
                            type="email"
                            placeholder="e.g. myemail@address.com"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            autoComplete="email"
                        />
                    </Field>

                    <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                        {submitting ? "Sending..." : "Send Reset Link"}
                    </button>

                    <p className="switch-text">
                        <button type="button" className="link-button" onClick={() => switchMode("login")}>
                            Back to Log In
                        </button>
                    </p>
                </>
            )}
        </form>
    ) : (
        <form className="auth-form" onSubmit={handleSignup} noValidate>
            {formError && <p className="form-error" role="alert">{formError}</p>}
            <div className="name-row">
                <Field mode={mode} label="First Name *" name="firstName" error={errors.firstName}>
                    <input
                        id="signup-firstName"
                        name="firstName"
                        type="text"
                        value={signup.firstName}
                        onChange={updateSignup}
                        autoComplete="given-name"
                    />
                </Field>
                <Field mode={mode} label="Last Name *" name="lastName" error={errors.lastName}>
                    <input
                        id="signup-lastName"
                        name="lastName"
                        type="text"
                        value={signup.lastName}
                        onChange={updateSignup}
                        autoComplete="family-name"
                    />
                </Field>
            </div>

            <Field mode={mode} label="Email Address *" name="email" error={errors.email}>
                <input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="e.g. myemail@address.com"
                    value={signup.email}
                    onChange={updateSignup}
                    autoComplete="email"
                />
            </Field>

            <Field mode={mode} label="Contact Number (optional)" name="contact" error={errors.contact}>
                <input
                    id="signup-contact"
                    name="contact"
                    type="tel"
                    placeholder="e.g. 0912 345 6789"
                    value={signup.contact}
                    onChange={updateSignup}
                    autoComplete="tel"
                />
            </Field>

            <Field mode={mode} label="Password *" name="password" error={errors.password}>
                <input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="Must be at least 8 characters"
                    value={signup.password}
                    onChange={updateSignup}
                    autoComplete="new-password"
                />
            </Field>

            <Field
                mode={mode}
                label="Confirm Password *"
                name="confirmPassword"
                error={errors.confirmPassword}
            >
                <input
                    id="signup-confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Repeat password"
                    value={signup.confirmPassword}
                    onChange={updateSignup}
                    autoComplete="new-password"
                />
            </Field>

            <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                Sign Up
            </button>

            <p className="switch-text">
                Already have an account?{" "}
                <button type="button" className="link-button" onClick={() => switchMode("login")}>
                    Log In
                </button>
            </p>
        </form>
        )}
        </main>
    );
        
}
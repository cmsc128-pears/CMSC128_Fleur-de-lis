import { useState } from "react";
import logoImage from "../assets/images/logo.png";
import watermarkImage from "../assets/images/flower-watermark.png";
import backIcon from "../assets/icons/back.svg";
import "./AuthPage.css";

const emptyLogin = { email: "", password: "" };
const emptySignup = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
};

const TITLES = {
    login: "Log in to your account",
    signup: "Create an account",
    forgot: "Reset your password",
};

function friendlyError(err) {
    return err?.message || "Something went wrong. Please try again.";
}

function Field({ mode, label, name, error, children, className = "", action }) {
    return (
        <div className={`auth-field ${className}`}>
            <label htmlFor={`${mode}-${name}`}>{label}</label>
            {children}
            {action ? (
                <div className="auth-field__foot">
                    <p className="auth-field__error" aria-live="polite">{error}</p>
                    {action}
                </div>
            ) : (
                <p className="auth-field__error" aria-live="polite">{error}</p>
            )}
        </div>
    );
}

export default function AuthPage({
    onLogin,
    onSignup,
    onGuest,
    onResetPassword,
    onAuthSuccess,
    onBack,                 // new: Back button on the login screen
    initialMode = "login",  // new: "login" or "signup", set by the onboarding buttons
}) {
    const [mode, setMode] = useState(initialMode);   // "login" | "signup" | "forgot"
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
            await onResetPassword(email);
            setResetSent(true);
        } catch (err) {
            setFormError(friendlyError(err));
        } finally {
            setSubmitting(false);
        }
    };

    // Back: login goes to the previous screen, forgot goes back to login, signup has none
    const backAction =
        mode === "login" ? onBack : mode === "forgot" ? () => switchMode("login") : null;

    return (
        <main className="auth">
            <img className="auth__backdrop" src={watermarkImage} alt="" aria-hidden="true" />

            <div className="auth__top">
                {backAction && (
                    <button type="button" className="auth__back" onClick={backAction}>
                        <img src={backIcon} alt="" width="16" height="16" /> Back
                    </button>
                )}
            </div>

            <div className="auth__logo">
                <img className="auth__logo-img" src={logoImage} alt="Fleur" />
            </div>

            <div className="auth__body">
                <h1 className={`auth__title auth__title--${mode}`}>{TITLES[mode]}</h1>

                {mode === "login" && (
                    <form className="auth-form" onSubmit={handleLogin} noValidate>

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

                        <Field
                            mode={mode}
                            label="Password"
                            name="password"
                            error={errors.password}
                            action={
                                <button
                            type="button"
                            className="link auth-form__forgot"
                            onClick={() => {
                                setResetEmail(login.email);
                                switchMode("forgot");
                            }}
                        >
                            Forgot Password?
                        </button>
                            }
                        >
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

                        <p className="auth-form__error" role="alert">{formError}</p>
                        <button type="submit" className="btn auth-form__submit" disabled={submitting}>
                            Log In
                        </button>

                        <button
                            type="button"
                            className="link auth-form__guest"
                            onClick={handleGuest}
                            disabled={submitting}
                        >
                            Continue as Guest
                        </button>

                        <p className="auth-form__switch">
                            Don't have an account?{" "}
                            <button type="button" className="link" onClick={() => switchMode("signup")}>
                                Sign Up
                            </button>
                        </p>
                    </form>
                )}

                {mode === "forgot" && (
                    <form className="auth-form" onSubmit={handleReset} noValidate>
                        {resetSent ? (
                            <>
                                <p className="auth-form__success" role="status">
                                    If an account exists for {resetEmail.trim()}, we've sent a link to
                                    reset your password. Check your spam folder if you don't see it.
                                </p>
                                <button
                                    type="button"
                                    className="btn auth-form__submit"
                                    onClick={() => switchMode("login")}
                                >
                                    Back to Log In
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="auth-form__hint">
                                    Enter the email you signed up with and we'll send you a reset link.
                                </p>

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

                                <p className="auth-form__error" role="alert">{formError}</p>
                                <button type="submit" className="btn auth-form__submit" disabled={submitting}>
                                    {submitting ? "Sending..." : "Send Reset Link"}
                                </button>
                            </>
                        )}
                    </form>
                )}

                {mode === "signup" && (
                    <form className="auth-form" onSubmit={handleSignup} noValidate>

                        <div className="auth-form__row">
                            <Field mode={mode} label="First Name" name="firstName" error={errors.firstName}>
                                <input
                                    id="signup-firstName"
                                    name="firstName"
                                    type="text"
                                    placeholder="Fleur"
                                    value={signup.firstName}
                                    onChange={updateSignup}
                                    autoComplete="given-name"
                                />
                            </Field>
                            <Field mode={mode} label="Last Name" name="lastName" error={errors.lastName}>
                                <input
                                    id="signup-lastName"
                                    name="lastName"
                                    type="text"
                                    placeholder="de lis"
                                    value={signup.lastName}
                                    onChange={updateSignup}
                                    autoComplete="family-name"
                                />
                            </Field>
                        </div>

                        <Field mode={mode} label="Email Address" name="email" error={errors.email}>
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

                        <Field mode={mode} label="Password" name="password" error={errors.password}>
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
                            label="Confirm Password"
                            name="confirmPassword"
                            error={errors.confirmPassword}
                        >
                            <input
                                id="signup-confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="Repeat Password"
                                value={signup.confirmPassword}
                                onChange={updateSignup}
                                autoComplete="new-password"
                            />
                        </Field>

                        <p className="auth-form__error" role="alert">{formError}</p>
                        <button type="submit" className="btn auth-form__submit" disabled={submitting}>
                            Sign Up
                        </button>

                        <p className="auth-form__switch">
                            Already have an account?{" "}
                            <button type="button" className="link" onClick={() => switchMode("login")}>
                                Log In
                            </button>
                        </p>
                    </form>
                )}
            </div>
        </main>
    );
}
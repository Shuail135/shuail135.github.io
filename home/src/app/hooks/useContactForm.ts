import {useState, type FormEvent} from "react";

import {CONTENT} from "../content";

const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined;

export function useContactForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [formSent, setFormSent] = useState(false);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormError("");

        if (!WEB3FORMS_ACCESS_KEY) {
            setFormError(CONTENT.contact.form.errors.missingAccessKey);
            return;
        }

        setFormSubmitting(true);

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    access_key: WEB3FORMS_ACCESS_KEY,
                    from_name: "Portfolio Contact Form",
                    subject: `New portfolio message from ${formData.name}`,
                    name: formData.name,
                    email: formData.email,
                    message: formData.message,
                }),
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || CONTENT.contact.form.errors.fallback);
            }

            setFormSent(true);
            setFormData({name: "", email: "", message: ""});
        } catch (error) {
            setFormError(error instanceof Error ? error.message : CONTENT.contact.form.errors.fallback);
        } finally {
            setFormSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormSent(false);
        setFormError("");
    };

    return {
        formData,
        setFormData,
        formSent,
        formSubmitting,
        formError,
        handleSubmit,
        resetForm,
    };
}

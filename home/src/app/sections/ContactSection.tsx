import type {Dispatch, FormEvent, SetStateAction} from "react";
import {Github, Linkedin, Mail, Send} from "lucide-react";

import {CONTENT} from "../content";

type ContactFormData = {
    name: string;
    email: string;
    message: string;
};

type ContactSectionProps = {
    formData: ContactFormData;
    setFormData: Dispatch<SetStateAction<ContactFormData>>;
    formSent: boolean;
    formSubmitting: boolean;
    formError: string;
    onSubmit: (event: FormEvent) => void;
    onReset: () => void;
};

export function ContactSection({
                                   formData,
                                   setFormData,
                                   formSent,
                                   formSubmitting,
                                   formError,
                                   onSubmit,
                                   onReset,
                               }: ContactSectionProps) {
    return (
        <section id="contact" className="py-32 border-t border-border">
            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-start">
                <div>
                    <p className="font-mono text-accent text-xs mb-4 tracking-[0.2em] uppercase">
                        {CONTENT.contact.eyebrow}
                    </p>
                    <h2 className="text-4xl lg:text-5xl font-display font-bold mb-6 leading-[1.1]">
                        {CONTENT.contact.heading.first}{" "}
                        <span className="text-primary">{CONTENT.contact.heading.primary}</span>
                    </h2>
                    <p className="text-muted-foreground leading-relaxed mb-10 max-w-sm">
                        {CONTENT.contact.description}
                    </p>

                    <div className="space-y-3">
                        {CONTENT.contact.links.map(({kind, label, href}) => {
                            const icon = kind === "email" ? <Mail size={16}/> : kind === "github" ? <Github size={16}/> : <Linkedin size={16}/>;
                            const isEmail = href.startsWith("mailto:");
                            return (
                                <div key={label} className="flex items-center gap-3.5 text-muted-foreground">
                                    <a href={href} target={isEmail ? undefined : "_blank"} rel={isEmail ? undefined : "noopener noreferrer"} className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center transition-all duration-200 hover:border-primary/40 hover:bg-primary/8 hover:text-foreground">
                                        {icon}
                                    </a>
                                    <a href={href} target={isEmail ? undefined : "_blank"} rel={isEmail ? undefined : "noopener noreferrer"} className="text-sm transition-colors hover:text-foreground">
                                        {label}
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div>
                    {formSent ? (
                        <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-accent/30 bg-card min-h-[360px]">
                            <div className="w-16 h-16 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center mb-5">
                                <Send size={24} className="text-accent"/>
                            </div>
                            <h3 className="font-display font-bold text-xl mb-2">
                                {CONTENT.contact.form.successTitle}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                                {CONTENT.contact.form.successMessage}
                            </p>
                            <button onClick={onReset} className="mt-6 text-sm text-primary hover:text-primary/75 transition-colors">
                                {CONTENT.contact.form.sendAnother}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-8">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                                    {CONTENT.contact.form.nameLabel}
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder={CONTENT.contact.form.namePlaceholder}
                                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                                    {CONTENT.contact.form.emailLabel}
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    placeholder={CONTENT.contact.form.emailPlaceholder}
                                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                                    {CONTENT.contact.form.messageLabel}
                                </label>
                                <textarea
                                    id="message"
                                    required
                                    rows={5}
                                    value={formData.message}
                                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                                    placeholder={CONTENT.contact.form.messagePlaceholder}
                                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all resize-none text-sm"
                                />
                            </div>

                            {formError && (
                                <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                    {formError}
                                </p>
                            )}

                            <button type="submit" disabled={formSubmitting} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-60">
                                <Send size={15}/> {formSubmitting ? CONTENT.contact.form.submitting : CONTENT.contact.form.submit}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}



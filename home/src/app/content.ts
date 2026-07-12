import type { Section } from "./types";

export const CONTENT = {
    // Site-wide brand text used in the navbar, hero, resume download name, and footer.
    site: {
        owner: "Sum Yan Wan",
        brandPrefix: "<",
        brandSuffix: "/>"
    },

    // Navbar labels. Change labels here; ids must match the Section type.
    nav: [
        {id: "home", label: "Home"},
        {id: "about", label: "About"},
        {id: "skills", label: "Skills"},
        {id: "projects", label: "Projects"},
        {id: "music", label: "Music Production for Dummies"},
        {id: "contact", label: "Contact Me"},
    ] satisfies { id: Section; label: string }[],

    // Hero section text and call-to-action button labels.
    hero: {
        links: {
            github: "https://github.com/Shuail135",
            linkedin: "https://www.linkedin.com/in/sum-yan-wan-600245283/",
        },
        status: "Open to opportunities",
        greetingPrefix: "Hi, I'm",
        description: "Most people call me Charmaine. " +
            "I'm a Computer Engineering graduate with a habit of exploring how things work " +
            "and turning that curiosity into projects, experiments, and creative digital things.",
        actions: {
            github: "GitHub",
            linkedin: "LinkedIn",
            resume: "Résumé",
            projects: "Projects",
            contact: "Contact Me",
        },
        scrollHint: "scroll",
    },

    // About section heading, paragraphs, and button text.
    about: {
        eyebrow: "About Me",
        heading: {
            first: "Curiosity, ",
            primary: "Creativity,",
            muted: "and ",
            accent: "Quacks",
        },
        paragraphs: ["Through my Computer Engineering degree, I developed a foundation across both hardware and software, " +
        "giving me a broader view of how computing systems work. I enjoy exploring technology with the belief that complexity " +
        "should serve a clear purpose. To me, strong solutions combine technical depth with practicality, clarity, " +
        "and real value for the people who use them.",
            "Beyond traditional tech projects, I also like creating in different digital spaces, from " +
            "music and 3D visuals to games and ideas that randomly catch my attention. " +
            "I like having a mix of technical and creative interests because they " +
            "often connect in unexpected ways. ",
            "Also, I have a soft spot for rubber ducks. You might notice one or two surprises around the site, especially " +
            "if you click on my avatar or switch between dark and light mode :)"
        ],
        cta: "Find me!",
    },

    // Skills section labels and category display names.
    skills: {
        eyebrow: "What I Work With",
        heading: "Skills & Tools",
        categoryLabels: {
            Language: "Languages",
            Frontend: "Frontend",
            "Backend & Databases": "Backend & Databases",
            "DevOps & Tools": "DevOps & Tools",
            "Game & Creative Tools": "Game & Creative Tools",
            "AI & ML": "AI & ML",
            "3D Art Skills": "3D Art Skills",
        },
    },

    // Projects section text. Add or edit project cards here.
    projects: {
        eyebrow: "What I've Built",
        heading: "Projects",
        githubLabel: "View on GitHub",
        demoLabel: "Demo",
        items: [
            {title: "ECOllector",
                description: "An embedded AI waste-sorting system that combines computer vision, sensor input, and " +
                    "hardware control to classify waste in real time, with each event recorded on a live dashboard. ",
                tech: ["Python", "Computer Vision", "Embedded AI", "Linux", "Hardware Integration"],
                github: "https://github.com/Shuail135/ECOllector",
                demo: "https://ecollector-rouge.vercel.app/"},
            {title: "Assistant",
                description: "A customizable CPU-only voice assistant that runs locally, switching between command " +
                    "handling and LLM-based conversation depending on the user's input. ",
                tech: ["Python", "Voice Assistant", "Local LLM", "Speech Recognition", "TTS"],
                github: "https://github.com/Shuail135/Assistant",
                demo: "https://drive.google.com/file/d/1Zaor5MYXxooZxW46IiVFF5FAoOYknaDL/view?usp=sharing"},
            {title: "e-Hotels",
                description: "A full-stack hotel booking and management portal with room search, booking flow, " +
                    "employee tools, and PostgreSQL-backed rules for bookings, rentings, and availability. ",
                tech: ["Full-Stack", "Database System", "UI/UX", "React", "PostgreSQL"],
                github: "https://github.com/AnjelikaBab/e-hotels",
                demo: "https://drive.google.com/file/d/1UYFX4lDDfDEjW1Hj73GivM15OCy5ACan/view?usp=sharing"},
            {title: "Tutron",
                description: "An Android tutoring platform featuring role-based flows for students, tutors, and " +
                    "administrators. Students can search for tutors, request lessons, track approval status, and submit " +
                    "reviews or complaints, while tutors and admins manage requests, topics, and reports. ",
                tech: ["Java", "Android Studio", "Role-Based System", "CI/CD", "UML"],
                github: "https://github.com/SEG2105-uottawa/ProjectGroupCapn",
                demo: "https://github.com/SEG2105-uottawa/ProjectGroupCapn/blob/main/README.md"
                },
        ],
    },

    // Music project section copy and feature cards.
    music: {
        eyebrow: "Featured Project",
        heading: {
            first: "Music Production",
            accent: "for Dummies",
        },
        description: "Tools and quick theory to produce music fast",
        cardTitle: "Music Production for Dummies",
        cardSubtitle: "in prepare",
        features: [
            {title: "Music Sheet/Keyboard to MIDI",
                desc: "An interactive digital piano and sheet music editor that lets you easily write music by either " +
                    "clicking directly on the musical staff or playing the on-screen keyboard. Allows you to record your" +
                    "melodies with an option to quantize your timing before downloading the final piece as a standard " +
                    "MIDI file. "},
            {title: "title2", desc: "temp"},
            {title: "title3", desc: "temp"},
        ],
        ctaTitle: "Ready to start making music?",
        ctaDescription: "Not done yet.",
        ctaLabel: "Visit the Site",
        ctaHref: "https://shuail135.github.io/music-production-for-dummies/",
    },

    // Contact section text, visible contact links, and form labels/placeholders.
    contact: {
        eyebrow: "Get in Touch",
        heading: {
            first: "Let's",
            primary: "Connect",
        },
        description: "Whether it's about a project, an opportunity, or just something interesting, " +
            "feel free to send me a message! ",
        links: [
            {kind: "email", label: "sumyanwan@gmail.com", href: "mailto:sumyanwan@gmail.com"},
            {kind: "github", label: "github.com/Shuail135", href: "https://github.com/Shuail135"},
            {kind: "linkedin", label: "linkedin.com/in/sum-yan-wan", href: "https://www.linkedin.com/in/sum-yan-wan-600245283/"},
        ],
        form: {
            successTitle: "Message sent!",
            successMessage: "Thanks for reaching out — I'll get back to you soon.",
            sendAnother: "Send another message",
            nameLabel: "Name",
            namePlaceholder: "Your name",
            emailLabel: "Email",
            emailPlaceholder: "example@email.com",
            messageLabel: "Enquiry / Message",
            messagePlaceholder: "Text Here",
            submit: "Send Message",
            submitting: "Sending...",
            errors: {
                missingAccessKey: "Contact form is missing its Web3Forms access key.",
                fallback: "Message could not be sent.",
            },
        },
    },

    // Footer text.
    footer: {
        note: "QuackQuack",
    },
} as const;
import { fontFamily } from 'tailwindcss/defaultTheme';

export const customColors = {
    background_dark: 'rgba(30, 30, 30, 1)',
    background_mid: 'rgba(37, 37, 38, 1)',
    background_light: 'rgba(42, 45, 46, 1)',

    grid_background: 'rgba(30, 30, 30, 1)',
    grid_minimap_mask: 'rgba(42, 45, 46, 0.5)',

    node_main: 'rgba(64, 64, 64, 1)',
    node_secondary: 'rgba(30, 30, 30, 1)',

    text_main: 'rgba(204, 204, 204, 1)',
    text_secondary: 'rgba(170, 170, 170, 1)',
};

/** @type {import('tailwindcss').Config} */
const config = {
    darkMode: ['class'],
    content: ['./src/**/*.{html,js,svelte,ts,css}'],
    safelist: ['dark'],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px',
            },
        },
        extend: {
            boxShadow: {
                node: '1px 1px 6px #000000',
            },
            transitionDuration: {
                35: '35ms',
            },
            colors: {
                ...customColors,
                border: 'hsl(var(--border) / <alpha-value>)',
                input: 'hsl(var(--input) / <alpha-value>)',
                ring: 'hsl(var(--ring) / <alpha-value>)',
                background: 'hsl(var(--background) / <alpha-value>)',
                foreground: 'hsl(var(--foreground) / <alpha-value>)',
                primary: {
                    DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
                    foreground:
                        'hsl(var(--primary-foreground) / <alpha-value>)',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
                    foreground:
                        'hsl(var(--secondary-foreground) / <alpha-value>)',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
                    foreground:
                        'hsl(var(--destructive-foreground) / <alpha-value>)',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
                    foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
                    foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
                    foreground:
                        'hsl(var(--popover-foreground) / <alpha-value>)',
                },
                card: {
                    DEFAULT: 'hsl(var(--card) / <alpha-value>)',
                    foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
                placeholderFrame: '80px / 50px',
                placeholderCore: '80px / 40px',
                expressionFrame: '100% 60px 60px 100% / 100% 50px 50px 100%',
                expressionCore: '4px 50px 50px 4px / 4px 50px 50px 4px',
            },
            fontFamily: {
                sans: [...fontFamily.sans],
            },
        },
    },
};

export default config;

import { fontFamily } from 'tailwindcss/defaultTheme';

export const colorPallet = {
    grid: {
        background: 'rgba(30, 30, 30, 1)',
        minimapMask: 'rgba(42, 45, 46, 0.5)',
        patternColor: 'rgba(255, 255, 255, 0)',
    },

    node: {
        normal: '#404040',
        dark: '#1E1E1E',
    },

    menu: {
        50: '#a7a7a8',
        100: '#7c7c7c',
        200: '#505051',
        300: '#3a3a3b',
        400: '#2a2d2e', // VsCode Light
        500: '#252526', // VsCode Mid
        600: '#212122',
        700: '#1E1E1E', // VsCode Dark
        800: '#161616',
        900: '#0f0f0f',
    },

    text: {
        highligh: '#DDDDDD',
        normal: '#CCCCCC',
        muted: '#AAAAAA',
    },
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
                node: '4px 7px 9px 2px #000000',
                highlight: '0px 0px 9px 3px #0AC6FF',
            },
            transitionDuration: {
                35: '35ms',
            },
            colors: {
                ...colorPallet,
                border: 'hsl(var(--border) / <alpha-value>)',
                input: 'hsl(var(--input) / <alpha-value>)',
                ring: 'hsl(var(--ring) / <alpha-value>)',
                background: 'hsl(var(--background) / <alpha-value>)',
                foreground: 'hsl(var(--foreground) / <alpha-value>)',
                primary: {
                    DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
                    foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
                    foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
                    foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
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
                    foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
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

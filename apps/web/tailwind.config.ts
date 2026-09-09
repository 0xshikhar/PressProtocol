import type { Config } from "tailwindcss"

const config = {
	darkMode: ["class"],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['var(--font-sans)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
				hero: ['var(--font-instrument-serif)', 'Instrument Serif', 'Georgia', 'serif'],
				display: ['var(--font-instrument-serif)', 'Instrument Serif', 'Georgia', 'serif'],
				editorial: ['var(--font-instrument-serif)', 'Instrument Serif', 'Georgia', 'serif'],
				reader: ['var(--font-source-serif)', 'Charter', 'Sitka Text', 'Cambria', 'Georgia', 'serif'],
				charter: ['Charter', 'Bitstream Charter', 'var(--font-source-serif)', 'Sitka Text', 'Cambria', 'Georgia', 'Times New Roman', 'serif'],
				serif: ['Charter', 'Bitstream Charter', 'var(--font-source-serif)', 'Sitka Text', 'Cambria', 'Georgia', 'Times New Roman', 'serif'],
				mono: ['var(--font-jetbrains)', 'Menlo', 'Monaco', 'Consolas', 'Courier New', 'monospace'],
			},
			colors: {
				// Design System v2 Surfaces (Warm-undertone matte charcoal) §2.1
				'bg-canvas': '#0B0A0C',
				'bg-surface': '#141216',
				'bg-elevated': '#1C181D',
				'bg-overlay': '#262024',
				'border-hairline': 'rgba(240, 232, 232, 0.07)',
				'border-focus': 'rgba(240, 232, 232, 0.16)',

				canvas: '#0B0A0C',
				surface: '#141216',
				elevated: '#1C181D',
				overlay: '#262024',
				hairline: 'rgba(240, 232, 232, 0.07)',
				focus: 'rgba(240, 232, 232, 0.16)',

				// Design System v2 Text (Warm ivory scale) §2.2
				// Separated from accent per §2.3 so headings and text NEVER inherit burgundy!
				'text-primary': '#EEE7E1',
				'text-secondary': '#A79E96',
				'text-muted': '#6F675F',

				primary: {
					DEFAULT: '#EEE7E1',
					foreground: '#0B0A0C',
				},
				secondary: {
					DEFAULT: '#A79E96',
					foreground: '#0B0A0C',
				},
				muted: {
					DEFAULT: '#6F675F',
					foreground: '#A79E96',
				},

				// Brand Accent — Press Burgundy §2.3 (Restricted strictly to the 4 allowlisted cases!)
				'accent-primary': '#7C2733',
				'accent-hover': '#98333F',
				'accent-deep': '#571A22',
				'accent-tint': 'rgba(124, 39, 51, 0.14)',
				'accent-ribbon': '#B44A54',

				accent: {
					DEFAULT: '#7C2733',
					hover: '#98333F',
					deep: '#571A22',
					tint: 'rgba(124, 39, 51, 0.14)',
					ribbon: '#B44A54',
					foreground: '#EEE7E1',
				},

				// Semantic Locks §2.4
				verified: {
					DEFAULT: '#3E9C72',
					bright: '#59B98C',
					tint: 'rgba(62, 156, 114, 0.14)',
				},
				warning: {
					DEFAULT: '#C97A2E',
					bright: '#DE9750',
					tint: 'rgba(201, 122, 46, 0.14)',
				},
				error: {
					DEFAULT: '#D65C4A',
					bright: '#E37B6B',
					tint: 'rgba(214, 92, 74, 0.14)',
				},
				anonymous: {
					DEFAULT: '#8770C4',
					bright: '#A18CDA',
					tint: 'rgba(135, 112, 196, 0.14)',
				},

				// Shadcn / Component tokens mapped to v2 variables
				border: 'rgba(240, 232, 232, 0.07)',
				input: 'rgba(240, 232, 232, 0.07)',
				ring: 'rgba(240, 232, 232, 0.16)',
				background: '#0B0A0C',
				foreground: '#EEE7E1',
				destructive: {
					DEFAULT: '#D65C4A',
					foreground: '#EEE7E1',
				},
				popover: {
					DEFAULT: '#1C181D',
					foreground: '#EEE7E1',
				},
				card: {
					DEFAULT: '#141216',
					foreground: '#EEE7E1',
				}
			},
			borderRadius: {
				none: '0px',
				flat: '0px',
				card: '6px',
				raised: '8px',
				sm: '4px',
				md: '6px',
				lg: '8px',
				pill: '9999px',
			},
			boxShadow: {
				card: '0 1px 2px rgba(0, 0, 0, 0.3)',
				raised: 'inset 0 1px 0 0 rgba(240, 232, 232, 0.06), 0 4px 16px rgba(0, 0, 0, 0.4)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			},
			backgroundImage: {
				'grid-pattern': "url('/grid.svg')",
				'grid-pattern-light': "url('/grid-light.svg')"
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
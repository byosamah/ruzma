
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
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
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			spacing: {
				'safe-top': 'env(safe-area-inset-top)',
				'safe-bottom': 'env(safe-area-inset-bottom)',
				'safe-left': 'env(safe-area-inset-left)',
				'safe-right': 'env(safe-area-inset-right)',
				'touch-target': '44px', // Minimum touch target size
				'mobile-padding': '1rem',
				'tablet-padding': '1.5rem',
				'desktop-padding': '2rem',
			},
			minHeight: {
				'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
				'touch-target': '44px',
			},
			minWidth: {
				'touch-target': '44px',
			},
			maxWidth: {
				'mobile': '100vw',
				'tablet': '768px',
				'desktop': '1024px',
			},
			screens: {
				'xs': '480px',
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1536px',
				// Touch-friendly breakpoints
				'touch': {'raw': '(hover: none) and (pointer: coarse)'},
				'no-touch': {'raw': '(hover: hover) and (pointer: fine)'},
				// Landscape orientation
				'landscape': {'raw': '(orientation: landscape)'},
				'portrait': {'raw': '(orientation: portrait)'},
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
				},
				'mobile-slide-in': {
					from: {
						transform: 'translateX(-100%)'
					},
					to: {
						transform: 'translateX(0)'
					}
				},
				'mobile-slide-out': {
					from: {
						transform: 'translateX(0)'
					},
					to: {
						transform: 'translateX(-100%)'
					}
				},
				'fadeIn': {
					from: {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'mobile-slide-in': 'mobile-slide-in 0.3s ease-out',
				'mobile-slide-out': 'mobile-slide-out 0.3s ease-out',
				'fadeIn': 'fadeIn 300ms ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate"), require("daisyui")],
	daisyui: {
		themes: [
			{
				light: {
					"primary": "#10B981", // emerald-500 for conversion
					"primary-content": "#ffffff", 
					"secondary": "#6B7280", // gray-500
					"secondary-content": "#ffffff",
					"accent": "#10B981", // same as primary 
					"accent-content": "#ffffff",
					"neutral": "#374151", // gray-700
					"neutral-content": "#ffffff",
					"base-100": "#ffffff", // white background
					"base-200": "#F9FAFB", // gray-50
					"base-300": "#F3F4F6", // gray-100
					"base-content": "#111827", // gray-900 for text
					"info": "#3B82F6", // blue-500
					"info-content": "#ffffff",
					"success": "#10B981", // emerald-500
					"success-content": "#ffffff",
					"warning": "#F59E0B", // amber-500
					"warning-content": "#ffffff",
					"error": "#EF4444", // red-500
					"error-content": "#ffffff",
				},
			},
		],
		base: true,
		styled: true,
		utils: true,
	},
} satisfies Config;

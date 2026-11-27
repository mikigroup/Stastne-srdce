/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				menuBg: '#929da5',
				green: {
					50: 'var(--brand-50, #f0fdf4)',
					100: 'var(--brand-100, #dcfce7)',
					200: 'var(--brand-200, #bbf7d0)',
					500: 'var(--brand-500, #22c55e)',
					600: 'var(--brand-600, #16a34a)',
					700: 'var(--brand-700, #15803d)',
					800: 'var(--brand-800, #166534)',
					900: 'var(--brand-900, #14532d)'
				}
			},
			spacing: {
				'footer-fix': '230px',
				'footer-fix2': '250px'
			}
		}
	},
	plugins: [require('@tailwindcss/forms'), require('daisyui')],
	daisyui: {
		themes: ['light']
	}
};

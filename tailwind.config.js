/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				menuBg: '#929da5'
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

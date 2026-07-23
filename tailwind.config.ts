import type { Config } from 'tailwindcss';
export default { content: ['./app/**/*.{js,ts,jsx,tsx}','./components/**/*.{js,ts,jsx,tsx}'], theme: { extend: { colors: { ink:'#18242B', mint:'#56D7AD', coral:'#FF8A69', cream:'#FFF9F1', navy:'#153047' }, boxShadow: { card:'0 8px 24px rgba(25, 42, 50, .08)' } } }, plugins: [] } satisfies Config;

/** @type {import('tailwindcss').Config} */
// 登录页配色（绿色主题，取自登录页设计稿）；首页仍使用导出稿原生 CSS，互不影响
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F4FCEB',
          100: '#E8F8D8',
          200: '#D8F8B8',
          300: '#C4F39A',
          400: '#B3EE84',
          500: '#9FE36A',
          600: '#7FC94B',
          700: '#4E9A34',
          800: '#2E7D32',
          900: '#1F5E28'
        },
        field: '#F1F3EF',
        line: '#E7ECE3',
        ink: {
          900: '#1F2A24',
          700: '#4A554B',
          500: '#7C8678',
          400: '#9AA394'
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', 'Arial', 'sans-serif']
      },
      boxShadow: {
        btn: '0 6px 16px rgba(127, 201, 75, 0.22)'
      }
    }
  },
  plugins: []
}

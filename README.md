# RentApp - Apartment Rental Platform

A modern web application for managing apartment rentals, built with React.js and JSON Server.

## Features

- User authentication (login/register)
- Browse available listings
- Make reservations
- Review system with ratings
- Admin dashboard for property management
- Responsive design

## Tech Stack

- React.js
- Formik & Yup for form handling and validation
- JSON Server for backend simulation
- Custom CSS with Bootstrap classes
- React Router for navigation
- React Context API for state management

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/rentapp.git
cd rentapp
```

2. Install dependencies:
```bash
npm install
```

3. Install JSON Server globally (if not already installed):
```bash
npm install -g json-server
```

4. Start the JSON Server (in a separate terminal):
```bash
json-server --watch db.json --port 3000
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
rentapp/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   ├── Listing/
│   │   └── Review/
│   ├── context/
│   ├── pages/
│   └── App.jsx
├── public/
├── db.json
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.


# RTV Geolocation Tracker

A full-stack vehicle tracking system built with a Node.js/Express backend, MySQL database via Sequelize ORM, and a React Native mobile frontend. This project extends the original [RTVGeolocationTracker](https://github.com/vilalali/RTVGeolocationTracker) with live ETA tracking, citizen-facing screens, and real-time map visualization.

**Live repo:** [github.com/KAMMAR-SHASHANK/rtv-geo-location-tracker](https://github.com/KAMMAR-SHASHANK/rtv-geo-location-tracker)

---

## Original Repository

Forked from: [github.com/vilalali/RTVGeolocationTracker](https://github.com/vilalali/RTVGeolocationTracker)

### What the original repo did

| Feature              | Status |
| -------------------- | ------ |
| Register truck       | ✅     |
| Login truck driver   | ✅     |
| Save GPS coordinates | ✅     |
| Retrieve coordinates | ✅     |

The original mobile app displayed only raw latitude and longitude as plain text. There was no map, no real-time updates, and no citizen-facing interface.

---

## What We Added

### 🗺️ Live Map Screen (Mobile — React Native)

Replaced the plain text coordinate display with a fully interactive map screen (`CitizenTrackerScreen`) using React Native Maps:

- Renders a live map with the vehicle's current position as a marker
- Updates in real time as GPS coordinates change
- Shows the vehicle's route history as a polyline on the map
- Displays ETA to destination

### 🚗 ETA Tracking

Added estimated time of arrival calculation based on the vehicle's current coordinates and speed, surfaced on both the citizen-facing screen and the driver screen.

### 👥 Citizen Tracking Screen

A new public-facing screen that allows citizens to monitor a tracked vehicle in real time — no login required. Shows live position on the map and ETA.

### 📁 Monorepo Structure

Integrated the React Native mobile app into the backend repository using `rsync` (excluding `node_modules` and `.expo`) so both backend and frontend live in one repo without the 349MB bloat.

---

## Bug Fix: `GET /api/locations/locations` — Sequelize Alias Error

### Description

The endpoint `GET /api/locations/locations` was failing with:

```
User is associated to LocationHistory using an alias.
You must use the 'as' keyword to specify the alias within your include statement.
```

### Environment

- **Node.js:** v25.2.1
- **Sequelize:** ^6.37.5
- **Database:** MySQL

### Steps to Reproduce

1. Start the backend server
2. Register a user/vehicle
3. Insert a location record
4. Call `GET /api/locations/locations`
5. Observe the error response

### Root Cause

In `models/location.js`, the association was defined **with** an alias:

```js
LocationHistory.belongsTo(User, {
  foreignKey: "vehicleId",
  targetKey: "vehicleId",
  as: "user", // ← alias defined here
});
```

But in `routes/locationRoutes.js`, the Sequelize query did **not** specify the alias:

```js
// ❌ Before (broken)
include: {
    model: User,
    attributes: ['vehicleId', 'vehicleType']
}
```

Sequelize requires the `as` value to match exactly when an alias is defined on the association. Without it, Sequelize throws because it cannot resolve which association to use.

### Fix

```js
// ✅ After (fixed)
include: {
    model: User,
    as: 'user',          // ← alias added to match the association
    attributes: ['vehicleId', 'vehicleType']
}
```

After applying this change, the endpoint returns location records successfully.

---

## Project Structure

```
rtv-geo-location-tracker/
├── geo-location-tracker-backend/     # Node.js + Express API
│   ├── models/
│   │   ├── user.js
│   │   └── location.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── locationRoutes.js
│   ├── mobile-app/                   # React Native app (node_modules excluded)
│   │   ├── screens/
│   │   │   └── CitizenTrackerScreen.js
│   │   ├── App.js
│   │   └── package.json
│   ├── .gitignore
│   └── server.js
```

---

## API Endpoints

| Method | Endpoint                   | Description                               |
| ------ | -------------------------- | ----------------------------------------- |
| POST   | `/api/auth/register`       | Register a new truck/driver               |
| POST   | `/api/auth/login`          | Login and receive JWT token               |
| POST   | `/api/locations`           | Save GPS coordinates                      |
| GET    | `/api/locations/locations` | Retrieve all location records (bug fixed) |

---

## Tech Stack

| Layer    | Technology               |
| -------- | ------------------------ |
| Backend  | Node.js v25.2.1, Express |
| ORM      | Sequelize ^6.37.5        |
| Database | MySQL                    |
| Mobile   | React Native, Expo       |
| Maps     | React Native Maps        |

---

## Setup

### Prerequisites

- Node.js v25+
- MySQL running locally
- Expo CLI (`npm install -g expo-cli`)

### Backend

```bash
cd geo-location-tracker-backend
npm install
# Add your DB credentials — see Environment Variables section below
npm start
```

### Mobile App

```bash
cd geo-location-tracker-backend/mobile-app
npm install
npx expo start
```

---

## Environment Variables

Create a `.env` file in the backend root:

```
DB_HOST=localhost
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=rtv_tracker
JWT_SECRET=your_jwt_secret
```

> ⚠️ Never commit `creds.js` or `.env` — both are listed in `.gitignore`.

---

## .gitignore

The following are excluded from version control:

```
# Dependencies
node_modules/

# Expo
.expo/

# Mobile app dependencies
mobile-app/node_modules/
mobile-app/.expo/

# Credentials
mobile-app/creds.js
.env
```

---

## Contributing

This repo is a fork and extension of the original group project. All added features and bug fixes are documented above. PRs welcome.

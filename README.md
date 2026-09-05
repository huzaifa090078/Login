# LOGIN Order Form (Mobile-First Web App)

A mobile-first wholesale order-taking web application for **LOGIN**, designed for sales representatives visiting retail mobile shops.

---

## 🎨 Visual Identity
- **Yellow (`#FFC700`)**: Brand highlights, active category indicators, primary actions
- **Black (`#111111` / `#1A1A1A`)**: Headers, navigation bar, model badges, bottom order bar
- **White (`#FFFFFF`)**: Clean product cards and clear readable typography

---

## 🚀 How to Run the Application

### Option 1: Double-Click Launcher (Windows)
Double-click `start.bat` in this folder. It will:
1. Open `http://localhost:3000` in your default browser
2. Start the lightweight local HTTP server

### Option 2: PowerShell
Run the following command in PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1 -Port 3000
```
Then visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Architecture

```
Login/
├── index.html                  # Mobile-first shell and semantic mount points
├── css/
│   ├── variables.css           # Design tokens (Yellow, Black, White, spacing, typography)
│   └── style.css               # Responsive mobile-first styling & layout
├── js/
│   ├── catalog-data.js         # Decoupled data model with 9 categories & product schema
│   ├── state.js                # Centralized state (customer info, cart, live totals)
│   ├── components/
│   │   ├── header.js           # Brand header & customer details (auto-date)
│   │   ├── categoryNav.js      # Horizontal scrollable category pill tabs
│   │   ├── productCard.js      # Product card with model, name, variant, rate & [-][0][+]
│   │   ├── productList.js      # Category product feed & empty state renderer
│   │   └── orderSummary.js     # Sticky bottom bar with totals & 'Send Order' preview
│   └── app.js                  # Main coordination module & event subscriptions
├── server.ps1                  # Built-in zero-dependency HTTP server
├── start.bat                   # Double-click launcher
└── README.md                   # Documentation
```

---

## 🏷️ Supported Categories (Phase 1)
1. **Chargers** (`⚡`)
2. **Data Cables** (`🔌`)
3. **Handsfree** (`🎧`)
4. **Power Banks** (`🔋`)
5. **Smart Watches** (`⌚`)
6. **TWS** (`🎵`)
7. **Neckband & Headphones** (`🎛️`)
8. **Speakers** (`🔊`)
9. **Batteries** (`🪫`)

---

## 🧩 Data-Driven Catalog Extensibility
Products are stored and exported in `js/catalog-data.js` and are **never** hardcoded into UI components. To add new products or import the complete catalog, update or call `registerProducts(items)`:
```javascript
{
  id: 'CHG-100',
  category: 'chargers',
  modelNumber: 'LG-100W-PRO',
  name: 'LOGIN 100W GaN Super Charger',
  variant: 'Triple Port (2x Type-C + 1x USB-A)',
  rate: 2950
}
```

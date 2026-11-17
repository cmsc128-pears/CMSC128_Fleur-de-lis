# Fleur de Lis — Data & Service Guide

## 1. Where Data Lives
- **Firebase Auth:** Handles login, sign-up, guest mode, email verification, and password resets (`src/services/Auth.js`).
- **Firestore `users/{uid}`:** Stores each user's profile info and their `yourDesigns` / `likedDesigns` IDs.
- **Firestore `designs/{designId}`:** Stores saved bouquet designs (shown in Profile & Feed).
- **Local JSONs (`src/data/*.json`):** Stores the shop catalog (`flowers`, `fillers`, `wrappers`, `ribbons`, `addons`, `bouquets`).

---

## 2. Quick Service Cheat Sheet

| Feature | File | Functions |
| :--- | :--- | :--- |
| **Auth** | `src/services/Auth.js` | `logIn`, `signUp`, `logInAsGuest`, `resetPassword`, `logOut`, `watchUser` |
| **Profile Hook** | `src/services/userUserProfile.js` | `useUserProfile()` → `{ profile, loading, error }` |
| **Edit Profile** | `src/services/userService.js` | `getUserProfile(uid)`, `updateUserProfile(uid, data)`, `watchAuth(cb)` |
| **Designs & Likes** | `src/services/designService.js` | `getUserDesigns(uid)`, `getLikedDesigns(uid)`, `saveDesign(uid, data)`, `toggleLikeDesign(uid, designId)` |
| **Shop Catalog** | `src/services/inventoryService.js` | `getFlowers()`, `getFillers()`, `getWrappers()`, `getRibbons()`, `getAddons()`, `getPresetBouquets()`, `getAllInventory()` |

---

## 3. Firestore Collections

### `users/{uid}`
- `firstName`, `lastName`, `email` (required)
- `contact` (optional string or `null`)
- `yourDesigns` (array of created `designId`s)
- `likedDesigns` (array of liked `designId`s)
- `createdAt`, `updatedAt` (timestamps)

### `designs/{designId}`
```json
{
  "ownerId": "firebase_uid_123",
  "name": "Custom Rose Bouquet",
  "imageUrl": "/images/bouquets/local-rose.png",
  "presetBouquetId": null,
  "items": {
    "flowers": [{ "id": "flower-001", "quantity": 6, "color": "pink" }],
    "fillers": [{ "id": "filler-002", "quantity": 1, "color": "white" }],
    "wrapperId": "wrapper-001",
    "ribbonId": "ribbon-004",
    "addOns": [{ "id": "addon-001", "quantity": 1 }]
  },
  "totalPrice": null,
  "isPublic": true,
  "likesCount": 1,
  "likedBy": ["firebase_uid_456"],
  "createdAt": "Timestamp"
}
```

---

## 4. Inventory JSONs (`src/data/*.json`)
- Each file has `_documentation` (notes) and `items` (list read by `inventoryService.js`).
- Prices are in **PHP**. `null` means unknown (not `0`—check `!== null` before math).
- `active: false` hides placeholders by default (except `getWrappers()`, which shows sample wrappers until real ones are added).
- **`flowers.json`** (`flower-###`): main flowers, `family`, `type`, `origin`, `stock`, `bundleSize`, `bundlePrice`, `seasonalPrices`, `price`, `occasion`, `mood`, `color`.
- **`fillers.json`** (`filler-###`): fillers & greenery, `stock` (`0` = out of stock), `type`, `origin`, `color`, `occasion`, `mood`, `bundleSize`, `bundlePrice`, `seasonalPrices`.
- **`wrappers.json`** (`wrapper-###`): `type` (`cloth` | `paper` | `mesh`), `color`.
- **`ribbons.json`** (`ribbon-###`): `type` (`plain` | `design` | `sheer`), `color`, `design`.
- **`addons.json`** (`addon-###`): `type` (`stuffed toy` | `chocolate`), `size`, `brand`, `price`.
- **`bouquets.json`** (`bouquet-###`): preset bouquets using `tierType` (`pcs` | `size` | `fixed`) and `tiers`.

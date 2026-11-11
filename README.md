# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


---

## AxxGo — Instant Classifieds Frontend

The AxxGo section provides an account-free, instant classifieds portal located at `/axxgo`.

### Routes
- `/axxgo`: Classifieds browse & search page (filters by category, county, price, and keywords).
- `/axxgo/post`: Public listing posting form (1 to 8 image uploads, dynamic category fields, bot protection).
- `/axxgo/listing/:id`: Detail view with photo gallery, category specs, one-click Call & WhatsApp contact buttons, Share modal, and "Report listing" button.
- `/axxgo/manage/:token`: Self-service management console using the secret link to edit, mark as Sold/Rented, renew (+30 days), or delete.
- `/axxgo/admin`: Cleanup dashboard for administrators (`admin` role) to review reports, unhide/hide posts, and ban abusive phone numbers or IPs.

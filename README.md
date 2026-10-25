# Smart Pantry & Price Comparator

## Problem Description

Food waste and unnecessary spending are common problems in households. People often forget about products in their pantry until they expire, buy duplicates, or end up purchasing groceries at the first store without comparing prices. 

**Smart Pantry & Price Comparator** aims to solve this by helping users keep track of their pantry inventory, automatically build a smart shopping list, and find the best place to buy their groceries based on real price comparisons.

## Goal

Build a full-stack application that helps users:
- Avoid food waste by tracking expiration dates
- Never run out of essentials by maintaining a smart shopping list
- Save money by comparing prices across stores via web search
- Optimize their next grocery trip by knowing exactly what to buy and where

## Core Features

- **Pantry Inventory**: Add, edit and remove products with quantity, unit, category, expiration date and minimum stock.
- **Mark as "Out of Stock"**: When a product runs out, it can be marked as finished and automatically added to the next shopping list with a suggested quantity to restock.
- **Smart Shopping List**: Auto-generated from low stock, expiring products or items marked as out of stock. Can also be edited manually.
- **Expiration Alerts**: Highlights products expiring soon (e.g. in the next 3 or 7 days) to prioritize consumption.
- **Web Price Search**: Search for product prices across different stores using web search and display a price comparison table.
- **"Buy Better" Suggestions**: Based on the shopping list, suggest which store offers the best overall price or the cheapest option per item.
- **Price History**: Keep a history of searched prices to track price changes over time.
- **Dashboard**: Quick overview of expiring items, out of stock items, urgent shopping list and potential savings.

## User Stories

- As a user, I want to see which products are about to expire so I can use them first.
- As a user, I want to mark a product as "out of stock" so it goes straight to my shopping list for the next purchase.
- As a user, I want to search prices for items in my shopping list so I can decide where to buy them for less.
- As a user, I want the app to tell me "where to buy better" based on the total of my shopping list.
- As a user, I want to restock by moving bought items from the shopping list back into my pantry inventory.

## Acceptance Criteria

- [ ] A user can fully manage their pantry inventory (CRUD).
- [ ] Marking an item as "out of stock" automatically adds it to the shopping list.
- [ ] The shopping list can be generated from low stock or near-expiry products.
- [ ] Expiration alerts are visible on the dashboard.
- [ ] The app can perform web price searches and show a comparison between at least two different stores.
- [ ] The system can suggest the best place to buy based on the shopping list.
- [ ] Items can be moved from "shopping list" to "pantry" after being purchased.
- [ ] The full stack (frontend, backend, database) runs locally with a single command.
- [ ] Unit and integration tests exist and run with a single command.

## How to Run (Planned)

The application will be containerized with Docker Compose. Once complete, it should be runnable with:

```bash
docker compose up --build
```

## Tech Stack (To Be Defined)

- **Frontend**: TBD (e.g. Vite + React + TypeScript)
- **Backend**: TBD (e.g. FastAPI)
- **Database**: TBD (e.g. PostgreSQL)
- **Price Search**: Web search API (configurable via environment variables)
- **Observability**: Logs, metrics, traces with trace IDs
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions

## Project Tracking

Tasks will be tracked publicly in **GitHub Issues** and organized using **GitHub Projects**. Each issue will include clear acceptance criteria and be used by the agent team throughout development.

## License

This project is being developed as part of the [AI Dev Tools Zoomcamp](https://github.com/DataTalksClub/ai-dev-tools-zoomcamp) final project.

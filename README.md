# Montgomery City Command Center - Comprehensive Documentation

Welcome to the **Montgomery City Command Center**, an advanced, AI-powered geospatial intelligence and urban planning platform. This application empowers city administrators, planners, and business owners to make data-driven decisions using real-time data, AI simulations, and advanced web scraping.

---

## Table of Contents
1. [System Overview](#1-system-overview)
2. [User Roles & Authentication Flow](#2-user-roles--authentication-flow)
3. [Core Functionalities](#3-core-functionalities)
4. [AI Agent Integration (Google Gemini)](#4-ai-agent-integration-google-gemini)
5. [Bright Data Integration (Scraping & APIs)](#5-bright-data-integration-scraping--apis)
6. [Scenario Simulations](#6-scenario-simulations)
7. [Technical Architecture](#7-technical-architecture)

---

## 1. System Overview
The Montgomery City Command Center is a React-based web application that visualizes urban data (traffic, zoning, demographics) on an interactive map. It integrates with **Google Gemini** for AI-driven insights and **Bright Data** for real-time web scraping (events, business data).

**Key Technologies:**
- **Frontend:** React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons
- **Mapping:** Mapbox GL JS (`react-map-gl`)
- **AI Engine:** Google Gemini API (`@google/genai`)
- **Data Scraping:** Bright Data Web Scraper API (Facebook, Google Maps)
- **Authentication & Database:** Supabase (with LocalStorage fallback for demo purposes)

---

## 2. User Roles & Authentication Flow
The system implements a robust Role-Based Access Control (RBAC) system.

### Roles:
- **Super Admin:** Full system access. Can approve or reject pending Admin registrations.
- **Admin (City Official):** Can run all simulations, view all data layers, and interact with the AI agent. Requires approval from the Super Admin upon signup.
- **Business User:** Can view public data, run specific business-oriented simulations, and access the AI agent.

### Authentication Flow:
1. **Signup:** Users register via the Login page. 
   - If they select "Admin", their status is set to `pending`.
   - If they select "Business", their status is set to `active`.
   - *Email Uniqueness Check:* The system checks Supabase (or the local fallback) to ensure the email is not already registered.
2. **Approval (Admin Only):** The Super Admin logs in, navigates to the "User Approvals" tab, and approves the pending Admin account.
3. **Login:** Users log in. The system verifies their credentials and active status before granting access to the dashboard.

---

## 3. Core Functionalities
- **Interactive Map:** A full-screen Mapbox interface centered on Montgomery, AL. Users can toggle different data layers (Traffic, Zoning, Demographics).
- **Data Sources Panel:** Allows users to connect and manage external data feeds (e.g., Traffic Cameras, Census Data).
- **System Map:** A visual representation of the application's architecture and data flow.
- **User Approvals:** A dedicated dashboard for the Super Admin to manage pending user registrations.

---

## 4. AI Agent Integration (Google Gemini)
The platform features an embedded AI assistant powered by the **Google Gemini API** (`gemini-3-flash-preview`).

### Capabilities:
- **Context-Aware Chat:** The AI is instructed to act as an expert urban planner and data analyst specifically for Montgomery, AL.
- **Data Interpretation:** It can explain complex urban metrics, suggest zoning changes, and interpret simulation results.
- **Implementation:** The AI chat interface is accessible via a floating action button. It maintains conversation history and uses a system instruction to ensure responses are tailored to the city's context.

---

## 5. Bright Data Integration (Scraping & APIs)
To provide real-time, actionable insights, the platform integrates with **Bright Data's Web Scraper APIs**.

### A. Public Events Scraper (Facebook)
- **Endpoint:** `https://api.brightdata.com/dca/trigger?collector=c_facebook_scraper`
- **Purpose:** Fetches live public events happening in Montgomery from Facebook Pages and Events.
- **Flow:** 
  1. User opens the "Public Event" scenario.
  2. The app triggers the Bright Data API to search for "Montgomery public events".
  3. The returned JSON data (Event Name, Location, Date, Attendees) populates the UI dropdown.
  4. The selected event's attendee count is fed into the simulation engine to predict traffic spikes and safety needs.

### B. New Business Opportunity Engine (Google Maps/Yelp)
- **Endpoint:** `https://api.brightdata.com/dca/trigger?collector=c_google_maps_scraper`
- **Purpose:** Analyzes a specific address in Montgomery to recommend the best new business type.
- **Flow:**
  1. User selects or enters a target address in Montgomery.
  2. The app triggers the Bright Data Deep Lookup & Web Scraper API to find businesses near that address.
  3. **Data Extracted:** Nearby competitors, business categories, star ratings, and review counts (used as a proxy for foot traffic).
  4. **Demographic Data:** The system also pulls local demographic indicators (Population Density, Median Income).
  5. **Scoring Algorithm:** The engine analyzes the business density and demographic demand to recommend the most viable business type (e.g., "Co-working Space" due to high young professional density and zero existing competitors).

*Note: The application includes a robust fallback mechanism that simulates the Bright Data API responses if the specific collector IDs are not fully configured in the production environment.*

---

## 6. Scenario Simulations
The command center allows users to run predictive simulations based on AI and scraped data.

1. **Road Closure:**
   - **Input:** Select a major road (e.g., Dexter Avenue).
   - **Output:** Predicts traffic increase percentages, identifies congestion areas, and suggests alternative routes.
2. **New Business (Powered by Bright Data):**
   - **Input:** Select or enter a vacant property address in Montgomery.
   - **Output:** Recommends the best business type, displays demographic data, maps business density, and lists nearby competitors with their ratings/reviews.
3. **Public Event (Powered by Bright Data):**
   - **Input:** Select a live scraped event or enter custom event details (Location, Expected Attendees).
   - **Output:** Calculates expected economic benefit, predicts traffic spikes, estimates public safety needs (e.g., number of officers required), and forecasts parking capacity.

---

## 7. Technical Architecture

### Directory Structure
- `/src/components/`: Reusable UI components (Sidebar, Header, ScenarioPanel, AIAssistant, Map).
- `/src/pages/`: Main application views (Login, Dashboard).
- `/src/services/`: External API integrations.
  - `geminiService.ts`: Handles communication with the Google Gemini API.
  - `brightDataService.ts`: Manages the Web Scraper API calls for events and business analysis.
- `/src/types/`: TypeScript interface definitions.

### State Management
- React `useState` and `useEffect` hooks are used for local component state.
- `localStorage` is utilized for persisting demo user profiles and authentication state when Supabase is not fully configured.

### Styling & Theming
- **Tailwind CSS:** Used for all styling, ensuring a responsive, mobile-first design.
- **Brand Colors:** The application strictly adheres to the Montgomery brand palette (Yellow `#FFD700`, Blue `#0055A4`, and Slate/Emerald accents for data visualization).
- **Animations:** `framer-motion` is used for smooth transitions, modal popups, and loading states.

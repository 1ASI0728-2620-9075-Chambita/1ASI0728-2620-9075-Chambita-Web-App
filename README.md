# Chambita · Web App

Web application of **Chambita** for clients (entrepreneurs and small businesses): they post projects, compare the
proposals of verified university students, pay through a protected (simulated) payment, approve the delivery and rate
the student, which issues an experience certificate on Ethereum Sepolia
(UPC · 1ASI0728 Arquitecturas de Software Emergentes).

## Screens and user stories (Sprint 1)

| Route | Screen | User stories |
|-------|--------|--------------|
| `/sign-in`, `/sign-up` | D01 · Sign in and client sign-up | US10, US11 |
| `/dashboard` | D02 · Dashboard with projects filtered by status | — |
| `/projects/new` | D03 · Post a project | US16 |
| `/projects/:projectId/proposals` | D04 · Proposals and acceptance | US21 |
| `/students/:studentId` | D05 · Student profile with portfolio, ratings and certificates | US15 |
| `/engagements/:id/payment` | D06 · Protected payment and cancellation | US27 |
| `/engagements`, `/engagements/:id` | D07 · Engagement status and deliveries | US27, US28 |
| `/engagements/:id/review` | D08 · Review the delivery and release the payment | US28 |
| `/engagements/:id/rating` | D09 · Rate the student | US31 |
| `/profile` | Client profile | — |

The AI assistant, proposal sorting, messages, progress reports and change requests shown in the mock-ups belong to Sprint 2.

## Architecture

Angular 22 with standalone components, signals and zoneless change detection; Angular Material for dialogs and snack bars.
Code is organized by bounded context, like the RESTful API:

```
src/app/
  iam/            session, sign-in/sign-up, route guards
  projects/       projects and proposals (D02, D03, D04)
  profiles/       student and client profiles (D05)
  engagements/    engagements and deliveries (D07, D08)
  payments/       protected payment (D06)
  reputation/     ratings (D09)
  certification/  certificates of a student
  shared/         i18n (es_419 / en_US), HTTP interceptor, layout and UI components
```

The interceptor adds the JWT and `Accept-Language` to every API call; a 401 ends the session. Texts change language at
runtime; `?lang=es|en` from the landing page is kept for later visits.

## Configuration

`src/environments/environment.ts` (production) and `environment.development.ts` hold the public URLs of the API, the
landing page and the verification portal. No secrets are stored in the front end.

## Run and test

```bash
npm install
npm start            # http://localhost:4200, uses the API at http://localhost:8080
npm run test:ci      # Jasmine + Karma in headless Chromium (set CHROME_BIN if needed)
npm run build        # production build in dist/chambita-web-app/browser
```

To run the API locally without PostgreSQL: `./mvnw spring-boot:test-run` in the Web Services repository.

## Tests

Jasmine/Karma specs cover the translation service, formatters, authentication service, HTTP interceptor, route guards,
dashboard rules and the pages D01, D03, D04 and D09 (validations, acceptance, rating and error messages).

## Deployment

Vercel builds the Angular application (`vercel.json`) and rewrites every route to `index.html`.

## Conventions

GitFlow (`main`, `develop`, `feature/*`, `release/*`, `hotfix/*`), Semantic Versioning, Conventional Commits and the
Angular style guide. Code in English; texts in es_419 and en_US.

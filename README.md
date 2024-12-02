# Watch Deviation Tracker

## Route Definitions

#### GET %/

- session: render site with watchselector
- unauth: render login form

#### POST %/login

- valid: render site, set session token
- invalid: render login form

#### GET %/watch/:id

- valid: render site including details
- invalid: 401 unauth or 403 forbidden or 404 not found

#### PUT %/watch/

- create a new watch, with comments
- valid: render details, update selector
- invalid: 401 unauth or 403 forbidden or 404 not found

#### PATCH %/watch/:id

- valid: render details
- invalid: 401 unauth or 403 forbidden or 404 not found

#### DELETE %/watch/:id

- valid: render details,
- invalid: 401 unauth or 403 forbidden or 404 not found

#### ALL %/watch/:watchId/measure/:measID

- manipulate measurements, always return them

## Changelog

- 2023-09-23

  - cleanup: colors
  - bugfix: catches in save & delete Method in Watchrecod do nothing
  - Fix: Selector does not need to be populated always

- 2023-09-15

  - fix: after deleting rows, the total calc is not correct
  - fix: fresh set to true in recalc even if not needed. (actually fresh
        _is_ true, but the table needs to decide whether its the first child,
        and only then re-render)

- 2023-09-10

  - done (bugfix): check if 0 is the last value calculation is still valid
  - bugfix: update selector when first record of new watch is saved
  - bugfix: error is raised if children had been present prior

- 2023-09-08

  - implement survey duration
  - saving of first record should update watchtable
  - Date Entries w/o seconds and millis

- 2023-09-07
  - save only lines
  - Kalkulation also over more stages!
  - immediately sort upon entry of a record

# Watch Deviation Tracker

Consumes a REST API Uses Vanilla Javascript

## Changelog

-   2023-09-23

    -   cleanup: colors
    -   bugfix: catches in save & delete Method in Watchrecod do nothing
    -   Fix: Selector does not need to be populated always

-   2023-09-15

    -   fix: after deleting rows, the total calc is not correct
    -   fix: fresh set to true in recalc even if not needed. (actually fresh
        _is_ true, but the table needs to decide whether its the first child,
        and only then re-render)

-   2023-09-10

    -   done (bugfix): check if 0 is the last value calculation is still valid
    -   bugfix: update selector when first record of new watch is saved
    -   bugfix: error is raised if children had been present prior

-   2023-09-08

    -   implement survey duration
    -   saving of first record should update watchtable
    -   Date Entries w/o seconds and millis

-   2023-09-07
    -   save only lines
    -   Kalkulation also over more stages!
    -   immediately sort upon entry of a record

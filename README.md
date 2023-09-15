# Uhren Abweichungstracker

Konsumiert ein REST Api  
Verwendet Vanilla Javascript

## Bugs

- catches in save & delete Method in Watchrecod do nothing

## TODO

-   login / creds
-   irgendwann mal mit react nachbauen

## Changelog

-   2023-09-15

    -   fix: after deleting rows, the total calc is not correct
    -   fix: fresh set to true in recalc even if not needed. (actually fresh
        _is_ true, but the table needs to decide whether its the first child,
        and only then re-render)

-   2023-09-10
    -   done (bugfix): checken wenn 0 der letzte Wert ist ob Berechnung stimmt
    -   bugfix: selector updaten wenn erster record neuer Uhr gespeichert wird
    -   bugfix: ebenso fliegt da ein Fehler wenn vorher children drin waren
-   2023-09-08
    -   Einbau von Beobachtungsdauer
    -   Erstes Speichern neuer Uhr muß Liste updaten
    -   Datumseingaben ohne sekunden und millis
-   2023-09-07
    -   save nur mehr auf Zeilen-Ebene
    -   Kalkulation auch über mehrere Etappen ermöglichen (mit Gewichtung) =>
        also gut rechnen!
    -   gleich neusortieren nach Eingabe

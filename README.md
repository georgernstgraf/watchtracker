# Uhren Abweichungstracker

Konsumiert ein REST Api  
Verwendet Vanilla Javascript

## Bugs

-   more to come!

## TODO

-   login / creds
-   irgendwann mal mit react nachbauen

## Changelog

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

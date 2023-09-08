# Uhren Abweichungstracker

Konsumiert ein REST Api  
Verwendet Vanilla Javascript

## Bugs

-   selector updaten wenn erster record neuer Uhr gespeichert wird
-   ebenso fliegt da ein Fehler wenn vorher children drin waren

## TODO

-   checken wenn 0 der letzte Wert ist ob Berechnung stimmt
-   login / creds
-   irgendwann mal mit react nachbauen

## Changelog

-   2023-09-08
    -   Einbau von Beobachtungsdauer
    -   Erstes Speichern neuer Uhr muß Liste updaten
    -   Datumseingaben ohne sekunden und millis
-   2023-09-07
    -   save nur mehr auf Zeilen-Ebene
    -   Kalkulation auch über mehrere Etappen ermöglichen (mit Gewichtung) =>
        also gut rechnen!
    -   gleich neusortieren nach Eingabe

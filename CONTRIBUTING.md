# Bijdragen aan NettoInzicht

Bijdragen zijn welkom via een issue of pull request.

## Uitgangspunten

1. Baseer rechtsregels eerst op primaire wetgeving.
2. Gebruik voor bedragen en tabellen alleen de geldende regeling of officiële bekendmaking.
3. Vermeld bij iedere gewijzigde parameter de bron, geldigheidsdatum en het relevante artikel of tabelonderdeel.
4. Houd berekeningen reproduceerbaar en voorkom dubbele formules.
5. Presenteer uitkomsten als indicatie en maak uitzonderingen of niet-ondersteunde situaties zichtbaar.

## Controleren

Voer vóór een pull request minimaal uit:

```bash
node --check app.js
git diff --check
```

Controleer daarnaast in de browser minimaal de scenario's `Starter`, `Gezin` en `Tweeverdieners`, zowel op desktop als mobiel.

## Wijzigingen in wet- en regelgeving

Leg in de pull request vast:

- welke bron is gebruikt;
- vanaf welke datum de wijziging geldt;
- welke formule, grens of tabel wijzigt;
- welke regressiescenario's zijn gecontroleerd.

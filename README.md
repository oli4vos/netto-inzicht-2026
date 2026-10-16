# NettoInzicht 2026

Open-source rekentool voor medewerkers van de Belastingdienst en andere onderdelen van de sector Rijk. De tool vertaalt salarisschaal, salarisnummer en arbeidsduur naar een netto huishoudbeeld, inclusief IKB, ABP-pensioen, belastingen en toeslagen.

## Wat de tool berekent

- CAO Rijk-salaris voor schaal 1 tot en met 19 en salarisnummer 0 tot en met 10;
- deeltijd naar rato van maximaal 36 uur per week;
- salariswijziging van 2,7% per 1 juli 2026;
- IKB van 16,50% en het geldende minimumbedrag;
- eenmalige cao-uitkering in augustus 2026;
- ABP-werknemerspremies OP/NP en AOP met franchises en deeltijdfactor;
- box-1-belasting, algemene heffingskorting en arbeidskorting;
- inkomensafhankelijke combinatiekorting;
- zorgtoeslag en huurtoeslag;
- kindgebonden budget en kinderbijslag;
- kinderopvangtoeslag;
- pensioeninhouding, fiscale bijtelling, netto vergoedingen en overige looninhoudingen;
- planning van extra uren per kalenderweek;
- betaald meer uren werken volgens CAO Rijk § 9.2, inclusief 16,50% IKB;
- overwerk volgens CAO Rijk § 7.7, met onderscheid tussen geldvergoeding en compensatieverlof;
- netto-opbrengst per extra uur na de correctie van jaarbelasting en toeslagen;
- een uitvouwbare jaarafrekening en uitleg over de gevolgen voor ABP-pensioen;
- een verwachte P-Direkt-bankbetaling per gekozen maand;
- de officiële witte maandtabel 2026 met de voorgeschreven €4,50-loonstappen en afronding;
- de witte tabel bijzondere beloningen op basis van het fiscale jaarloon van het vorige jaar;
- keuzes voor loonheffingskorting, maandelijkse of jaarlijkse IKB-uitbetaling en uitbetalingsmaanden;
- een vergelijking van ingehouden loonheffing met de definitieve jaarheffing;
- het effect van €100 extra bruto jaarloon.

De loonstrookberekening geldt voor de Nederlandse standaardsituatie, jonger dan de AOW-leeftijd. De jaaruitkomst blijft een onderbouwde indicatie en vervangt geen loonstrook, toeslagenbeschikking of persoonlijk fiscaal advies.

## Juridische grondslag

Primaire wetgeving is het uitgangspunt voor belasting en toeslagen. Voor arbeidsvoorwaarden en pensioen gebruikt de tool de officiële CAO Rijk 2026, het ABP-pensioenreglement en de ABP-premietabel 2026. De interface bevat directe links naar onder meer:

- Wet inkomstenbelasting 2001;
- Wet op de loonbelasting 1964;
- Algemene wet inkomensafhankelijke regelingen;
- Wet op de zorgtoeslag;
- Wet op de huurtoeslag;
- Wet kinderopvang;
- Wet op het kindgebonden budget;
- Algemene Kinderbijslagwet.
- CAO Rijk §§ 3.2, 6.3, 7.7, 9.1 en 9.2;
- onderhandelingsresultaat CAO Rijk 2026;
- Pensioenreglement ABP voor burgers 2026;
- ABP Premietabel 2026;
- Rekenvoorschriften voor de geautomatiseerde loonadministratie 2026, versie 2;
- witte maandtabel en witte tabel bijzondere beloningen 2026;
- officiële P-Direkt-uitleg van de salarisstrook.

## Lokaal starten

Er zijn geen dependencies of buildstappen nodig.

```bash
python3 -m http.server 4173
```

Open daarna `http://127.0.0.1:4173`.

Je kunt `index.html` ook rechtstreeks openen, maar een lokale HTTP-server geeft de meest betrouwbare browserervaring.

## Projectstructuur

```text
index.html   Paginastructuur en bronverwijzingen
styles.css   Vormgeving en responsive layout
app.js       Berekeningen, scenario's en interacties
```

## Bijdragen

Lees [CONTRIBUTING.md](CONTRIBUTING.md) voordat je rekenregels of wettelijke parameters aanpast. Een wijziging in een formule of bedrag moet herleidbaar zijn tot een primaire bron of de officiële gedelegeerde uitwerking daarvan.

## Licentie

Dit project is beschikbaar onder de [GNU Affero General Public License v3.0](LICENSE).

---
layout: post
title:  "Använda data för att välja mäklare (Swedish)"
date:   2017-07-08
---

Att välja en mäklare är att anförtro en annan person att förmedla en av de största affärerna man gör som privatperson. I mitt fall så hade jag en magkänsla av vilken mäklare som var bäst. Men då jag hade ett intresse av att lära mig Pandas och matplotlib som är verktyg för dataanalys, så bestämde jag mig för att bekräfta mitt val av mäklare med data.

Första steget var att samla in data som behövs för analysen. Den fanns hyfsat lättillgängligt och gav mig ett dataset på 90 000 bostadsförsäljningar i Stockholmsområdet med störst andel datapunkter i perioden 2012 - 2017.

Nästa steg var att filtrera relevanta objekt för att minska variationen, följande kriterier ställdes på urvalet:
* Plats: Blackeberg
* Antal rum: 2
* Storlek: Minst 50kvm (för att filtrera bort minitvåor)

För att statistiken skulle vara någorlunda relevant per mäklare filtrerade jag även bort mäklare som endast har sålt 1 objekt under perioden samt att jag segmenterade försäljningen per år för att minska effekten av den allmänna prisökningen av lägenheter.

Förenklingar som har gjorts är att inte ta hänsyn till vissa faktorer som kan påverka slutpriset, som bostadens skick, avgift, läge och föreningens ekonomi. Jag valde att hålla det enkelt och endast titta på de siffrorna som var lätttillgängliga.

**Statistik för 2017**

| Mäklare                               | Antal objekt | Slutpris/m2  | Slutpris/m2 jämfört med totalt snitt |
|---------------------------------------|--------------|--------------|--------------------------------------|
| Mäklarhuset                           | 4            | 49 828 kr/m2 | 103.81%                              |
| Notar                                 | 17           | 48 979 kr/m2 | 102.04%                              |
| Länsförsäkringar Fastighetsförmedling | 2            | 48 626 kr/m2 | 101.31%                              |
| Svenska Mäklarhuset                   | 3            | 46 723 kr/m2 | 97.34%                               |
| Fastighetsbyrån                       | 2            | 45 836 kr/m2 | 95.49%                               |

**Statistik för 2016**

| Mäklare                               | Antal objekt | Snittpris/m2 | Jämfört med totalt snitt |
|---------------------------------------|--------------|--------------|--------------------------|
| Svenska Mäklarhuset                   | 3            | 47 839 kr/m2 | 105.31%                  |
| Länsförsäkringar Fastighetsförmedling | 2            | 47 036 kr/m2 | 103.55%                  |
| Bjurfors                              | 4            | 46 579 kr/m2 | 102.54%                  |
| Notar                                 | 42           | 45 175 kr/m2 | 99.45%                   |
| Mäklarhuset                           | 2            | 44 871 kr/m2 | 98.78%                   |
| BOSTHLM                               | 3            | 43 757 kr/m2 | 96.33%                   |
| Fastighetsbyrån                       | 5            | 42 719 kr/m2 | 94.04%                   |

Om man använder den högst presterande mäklaren för 2017 för att sälja en typisk tvåa på 58kvm kan man i snitt räkna med ett slutpris på 2 890 024kr. Den lägst presterande mäklaren ger i snitt ett slutpris på 2 658 488kr, jämför man dessa två får man en mellanskillnad på 231 538kr.

Slutsatser man kan dra av detta är att valet av mäklare verkar spela en större roll vid försäljning än kostnadsskillnaden mellan mäklare (+/- 20 000kr). Notar har även en enorm marknadsdominans i området som tyvärr gör statistiken över andra mäklare opålitlig.

Jag kommer gå vidare med mitt ursprungliga val av Notar som mäklare för försäljningen av min bostad. De har presterat bra historiskt, gjort ett bra intryck på mig samt att de har en stor volym i området vilket borde innebära att de har koll på hur man säljer en lägenhet effektivt. Data kunde åtminstone indikera att jag inte gör ett felaktigt val.

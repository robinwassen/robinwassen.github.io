---
layout: post
title:  "Gas siphon surveillance"
date:   2018-05-15
image: "/img/raspberry-pi.jpg"
---

**Current status:** The components has been ordered

This blog post will explain the process of building a surveilance system using Raspberry Pi for when people steal gas from my car. I tried to limit the purchase of components to things that I will reuse in other places in my home when this issue has been resolved.

At three different occasions last year someone broke into the fuel tank of my car, siphoned the gas and threw away the cap. Back then I lived in a socioeconomic weaker area of Stockholm, so I hoped that I would avoid that problem when I moved to a better area this winter. But last weekend it happened again, so I decided to do something to mitigate it.

## Planning

The overall plan is to add a trigger on the gas lid that activates a Raspberry Pi, the RPI is located behind the head rest in the backseat to start record using a camera without an IR filter. Power will be drawn from the car battery.

### Surveilance laws in Sweden

In Sweden you need permission from the county council to perform surveillance in a public area. I called the Swedish police to ask about advice if my plan for surveilance was allowed, the response that I got was that it was kind of okay since the surveillance will be very limited (only trigged by someone actually stealing gas) and restricted to a small area of the parking lot outside my condo.

### The components

**Raspberry PI 3 Model B + Case + SD Card** - The Raspberry Pi will be placed in behind the back rest of the car

**Raspberry Pi PiNoir Camera Module V2** - The thefts usually happens at night, so it is better to get a camera without an IR filter.

**Nexa Magnet Contact Transmitter** - A magnetic contact that sends a 433 mhz signal when it is opened and closed. Usually used to control smart home lights when you open a door.

**433 Receiver Module** - Will be connected to the Raspberry Pi to trigger when the Nexa Magnet Contact signals open and close.

Total cost: 1115 SEK / 128 USD

### Battery life

I plan to power the Raspberry Pi using the car battery, the reason is that I do not have easy access to a power outlet where the car is located and that portable batteries for it are not powerful enough.

An Raspberry Pi 3 B consumes about 260mA in idle state
([source](https://www.pidramble.com/wiki/benchmarks/power-consumption)).

A car battery has about 60 000mAH capactity.

To calculate how long the battery will be able to power the RPI in idle I use the following equation:

```
60 000 mAH / 260 mA = 230,77h = 9,62 days
```

This is calculation is based on a random car battery I found on the web, my battery is old and these numbers are probably wishful thinking. So I will need to be very conservative with the energy usage if I don't want the battery to run out.

### Light

Nights in Sweden are pretty bright during the summer, there is also a lamp post where I park my car. So I hope that IR-lights are not required for the camera to get a good mugshot of the crook.

If the light turns out to not be enough I will add IR-LEDS that activate when the camera is trigged to be on.
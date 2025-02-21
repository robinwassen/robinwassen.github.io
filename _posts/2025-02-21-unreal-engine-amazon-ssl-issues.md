---
layout: post
title:  "Fixing Amazon SSL Issues in Unreal Engine"
date:   2025-02-21
---

# TLDR Version

Amazon changed how they issue SSL certificates in the end of 2024, when certificates renew some Win 10 players get issues calling the HTTPS APIssince they don't have the Root CA Cert. To fix this you can bundle the Amazon CA Root Cert with your game.

Only one root cert can be bundled with Unreal Engine games if you don't do engine modifications in `SslCertificateManager.cpp`, but we do not need that.

## How to fix

* Open Certificates in `mmc` on a computer where the game works
    1. Open Run and enter `mmc`
    2. Go to File -> Add/Remove Snap-in
    3. Add Certificates and press OK
* Export the needed certificate
    1. Go to Trusted Root Certification Authorities -> Certificates
    2. Right-click and export **Starfield Services Root Certificate Authority - G2** (the friendly name should say Amazon Services Root Certificate Authority -- G2), note that there is an incorrect Starfield cert too that you don't want to export.
    3. Export it as Base-64 encoded X.509 (.CER)
    4. Save it as `{YourUnrealProject}\Content\Certificates\wrongname.cer` (mmc don't allow us to save with correct file extension, so we need to rename manually)
    5. Open PowerShell and cd to the Certificate folder
    6. Change name of the certificate by running `mv wrongname.cer cacert.pem` (naming of the cert is super important)
* Ensure that the certificate is bundled with the game
    1. Open the Project Settings in Unreal Editor
    2. Go to Packaging
    3. Add an entry with the value `Certificates` to Additional Non-Asset Directories to Package

Done! Now Unreal Engine should load the cacert.pem as an additional CA Root Cert when starting up.

# Background

While developing [Blade Ball Arena](https://store.steampowered.com/app/2805120/Blade_Ball_Arena/) we noticed that some players running Windows 10 had issues to communicate with the backend APIs. 

Looking in the logs we found the following:


{% highlight plaintext %}
[2025.02.19-09.55.39:190][ 36]LogHttp: Warning: 0000022F906E28F0: request failed, libcurl error: 60 (SSL peer certificate or SSH remote key was not OK)
[2025.02.19-09.55.39:190][ 36]LogHttp: Warning: 0000022F906E28F0: libcurl info message cache 0 (Hostname a86igukp.api.lootlocker.com was found in DNS cache)
[2025.02.19-09.55.39:190][ 36]LogHttp: Warning: 0000022F906E28F0: libcurl info message cache 1 (  Trying 52.50.51.175:443...)
[2025.02.19-09.55.39:190][ 36]LogHttp: Warning: 0000022F906E28F0: libcurl info message cache 2 (Connected to a86igukp.api.lootlocker.com (52.50.51.175) port 443)
[2025.02.19-09.55.39:190][ 36]LogHttp: Warning: 0000022F906E28F0: libcurl info message cache 3 (ALPN: curl offers http/1.1)
[2025.02.19-09.55.39:190][ 36]LogHttp: Warning: 0000022F906E28F0: libcurl info message cache 4 (TLSv1.3 (OUT), TLS handshake, Client hello (1):)
[2025.02.19-09.55.39:190][ 36]LogHttp: Warning: 0000022F906E28F0: libcurl info message cache 5 (TLSv1.3 (IN), TLS handshake, Server hello (2):)
[2025.02.19-09.55.39:190][ 36]LogHttp: Warning: 0000022F906E28F0: libcurl info message cache 6 (TLSv1.2 (IN), TLS handshake, Certificate (11):)
[2025.02.19-09.55.39:190][ 36]LogHttp: Warning: 0000022F906E28F0: libcurl info message cache 7 (TLSv1.2 (OUT), TLS alert, unknown CA (560):)
[2025.02.19-09.55.39:190][ 36]LogHttp: Warning: 0000022F906E28F0: libcurl info message cache 8 (SSL certificate problem: unable to get local issuer certificate)
[2025.02.19-09.55.39:190][ 36]LogHttp: Warning: 0000022F906E28F0: libcurl info message cache 9 (Closing connection)
{% endhighlight %}

The interesting issue was that LootLocker's API failed in Unreal Engine, while our custom backend endpoints worked fine. Both APIs used Amazon-issued certificates and worked perfectly in browsers.

The key take away from the logs is: **TLS alert, unknown CA** which means that Unreal Engine cannot determined who issues this SSL certificate.

## The Root Cause

The key difference was in the certificate issuance dates:
- LootLocker: January 2025
- Our Backend: August 2024

It turns out Amazon changed their certificate signing chain in late 2024 ([see blog post](https://aws.amazon.com/blogs/security/acm-will-no-longer-cross-sign-certificates-with-starfield-class-2-starting-august-2024/)). The critical missing piece was the "Starfield Services Root Certificate Authority - G2" certificate in the Windows Trusted Root Certification Authorities Store.

## Investigation

We verified this by checking the certificate store using the Windows Certificate Manager (mmc + Certificates Snap-In). Machines that couldn't connect were missing this root certificate.

## The Browser vs Engine Difference

An important detail: browsers bundle their own root CA certificates. This explains why these endpoints worked in browsers but failed in Unreal Engine - the browser maintains its own certificate store to have control over which CA authorities that can be trusted.

## Remaining Questions

We're still investigating why some Windows 10 machines had the certificate while others didn't. Windows Update doesn't seem help, as fully updated machines did not have the certificate.

## Key Takeaway

When debugging HTTPS issues in Unreal Engine, remember that certificate verification depends on the OS certificate store, not the browser's. This can lead to situations where endpoints work in browsers but fail in your game code.
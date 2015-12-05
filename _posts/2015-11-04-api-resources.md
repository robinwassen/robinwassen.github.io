---
layout: post
title:  "Great REST API resources"
date:   2015-11-04
---

## 1. Introduction

A good way to start when building (or trying to repair) an RESTful API is to either find a well documented standard that you like or write your own standard document based on other peoples experience. The most imporant thing is that you settle for a standard that makes all your API resources consistent and easy to work with.

## 2. API design resources

* [Web API Design - Crafting Interfaces that Developers Love](https://pages.apigee.com/rs/apigee/images/api-design-ebook-2012-03.pdf), this is an 32 pages long e-book that is very pragmatic and straight to the point, it covers a lot of areas that are important when designing an RESTful API.

* [White House Web API Standards](https://github.com/WhiteHouse/api-standards), a good guideline document that can be used as a base or "as it is" for your own API standard docuemnt.

## 3. API documentation resources

API Blueprint is a trending format for documenting APIs. It is a format that is similar to markdown and is friendly both to humans and machines.

One piece of advice is to keep the documentation close to the code. Our approach is to have the documentation in the same version control repository as the code base for the API. This will make sure that the documentation is synchronized with the code.

* [API Blueprint website](https://apiblueprint.org/), introduction to API Blueprint.

* [API Blueprint @ Github](https://github.com/apiaryio/api-blueprint), contains great tutorials and specifications for API Blueprint.

* [aglia - api blueprint renderer](https://github.com/danielgtaylor/aglio), great node CLI tool to render API Blueprint as HTML. Can render either to file or serve directly with the built-in webserver.

* [apiary](https://apiary.io/), online tool to work with API Blueprints.

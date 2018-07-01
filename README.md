![Picture of Master Splinter](https://github.com/deadlysyn/splinter/blob/master/assets/splinter.jpg)

# Splinter: Cloud Foundry Service Smoke Tester

Inspired by prior art:

1. https://github.com/cloudfoundry/cf-smoke-tests
1. https://github.com/pivotal-cf/rabbit-labrat

Simple idea to extend the above into a more generic and customizable service
smoke test framework.

I've spoke to a couple customers who had a desire for smoke tests above and
beyond `cf-smoke-tests`. While an excellent (I'd add correct) place to start,
the next thing a platform team typically wants is an extended smoke test based
on a custom application leveraging shared services like MySQL, Redis, etc.

Splinter is an attempt to meet that need. The idea is to provide a single
application and sample Concourse pipeline allowing platform teams to easily
and selectively exercise shared services.

# Overview
For each service enabled in the configuration (see `config-sample.json`),
`splinter` will:

- Get the instance name from configuration
- Auto-discover service details from the environment (uri, password, etc)
- Configure a client and open a connection to the service
- Write test record to the service
- Read test record from the service
- Report success/fail and timing for each test

# Setup
TBD

# To-Do

- Simple node app to exercise shared services
    - ~~MongoDB~~
    - ~~MySQL~~
    - Postgres
    - ~~Redis~~
    - RabbitMQ
    - ~~Allow user to specify which services to test~~
    - ~~Auto-discover service details~~
    - ~~Write/read against service instance(s)~~
- JSON endpoint
    - Test status
    - Metrics useful for SLO
- Concourse pipeline to deploy/update
- Resilience / handle edge cases
- Documentation

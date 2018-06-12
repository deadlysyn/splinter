# Splinter: Cloud Foundry Smoke Tester

Based on prior art:

1. https://github.com/cloudfoundry/cf-smoke-tests
1. https://github.com/pivotal-cf/rabbit-labrat

Simple idea to extend `rabbit-labrat` into a more generic and customizable smoke
test framework for Cloud Foundry.

I've spoke to a couple customers who had a desire for smoke tests above and
beyond `cf-smoke-tests`. While an excellent (I'd add correct) place to start,
the next thing a platform team typically wants is an extended smoke test based
on a custom application leveraging shared services like MySQL, Redis and RabbitMQ.

Splinter is an attempt to meet that need. The idea is to provide a single
application and sample Concourse pipeline allowing platform teams to easily
and selectively exercise every part of the platform for which they are responsible.

# TODO

**NOTE: This project is still an early WIP!**

- Simple node app to exercise MySQL, Redis and RabbitMQ
    - Allow user to specify which services to test
    - Write/read against service instance(s)
- Concourse pipeline to deploy/update
    - Wings pipeline for internal CI/CD
- SLI/SLO integration
    - Logs/metrics to firehose (?)
- ...

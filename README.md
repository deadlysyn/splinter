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

# Wishlist

**NOTE: This project is still an early WIP!**

- Simple node app to exercise MySQL, Postgres, Redis and RabbitMQ
    - Allow user to specify which services to test
    - Write/read against service instance(s)
    - Report pass/fail and timing (support SLOs)
- Concourse pipeline to deploy/update
- Start with JSON, but consider other output formats

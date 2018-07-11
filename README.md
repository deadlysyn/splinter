![Picture of Master Splinter](https://github.com/deadlysyn/splinter/blob/master/assets/splinter.jpg)

# Splinter: Cloud Foundry Service Smoke Tester

Inspired by prior art:

- https://github.com/cloudfoundry/cf-smoke-tests
- https://github.com/pivotal-cf/rabbit-labrat

Simple idea to extend the above into a more generic and customizable service
smoke test framework.

I've spoke to a couple customers who had a desire for smoke tests above and
beyond `cf-smoke-tests`. While an excellent place to start, the next thing a
platform team typically wants is an extended smoke test based on a custom
application leveraging shared services like MySQL, Redis, etc.

Splinter is an attempt to meet that need. The idea is to provide a single
application and sample Concourse pipeline allowing platform teams to easily
and selectively exercise shared services.

# Overview
For each service enabled in the configuration (see `sample-config.json`):

- Get instance name from configuration
- Auto-discover service details from environment (uri, password, etc)
- Configure client and open connection to service
- Write test record to service
- Read test record from service
- Report success/fail and timing
- Respond in JSON
- Respond with appropriate HTTP code

Service binding has seen limited testing on [Pivotal Web Services](https://run.pivotal.io).
Some tuning may be required. Feel free to submit pull requests, or just use this
as a starting point.

## Example Output

```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

...

{
    "results": {
        "my-mongodb": {
            "message": "success",
            "seconds_elapsed": 0.526
        },
        "my-mysql": {
            "message": "success",
            "seconds_elapsed": 0.287
        },
        "my-postgres": {
            "message": "success",
            "seconds_elapsed": 0.208
        },
        "my-rabbitmq": {
            "message": "success",
            "seconds_elapsed": 0.341
        },
        "my-redis": {
            "message": "success",
            "seconds_elapsed": 0.029
        }
    },
    "timestamp": "2018-07-11T03:53:43.720Z"
}
```

# Setup

1. Clone this repo
1. Copy `sample-config.json` to `<your-config-name>.json`
1. Enable services to test (set to `true`)
1. Configure enabled service instance names (used to lookup credentials)
1. Copy `manifest.yml` to `<your-manifest-name>.yml`
1. Edit `<your-manifest-name>.yml`
    1. Adjust `buildpack` and `routes` as needed
    1. Update `services` to match your environment
    1. Update `CONF` to point to `<your-conig-name>.json`
1. `cf push`
1. ...

# To-Do

- Simple node app to exercise shared services
    - ~~MongoDB~~
    - ~~MySQL~~
    - ~~Postgres~~
    - ~~Redis~~
    - ~~RabbitMQ~~
    - ~~Allow user to specify which services to test~~
    - ~~Auto-discover service details~~
    - ~~Write/read against service instance(s)~~
- ~~JSON endpoint~~
    - ~~Test status~~
    - ~~Metrics useful for SLO~~
- Resilience / handle edge cases
- Concourse pipeline to deploy/update
- Documentation

# References

- https://run.pivotal.io
- https://www.npmjs.com/package/cfenv
- https://www.npmjs.com/package/redis
- https://www.npmjs.com/package/mongoose
- https://www.npmjs.com/package/mysql
- https://www.npmjs.com/package/pg
- https://www.npmjs.com/package/amqplib

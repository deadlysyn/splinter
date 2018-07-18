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
and selectively exercise shared services. `cf-smoke-tests` can continue
providing confidence in Cloud Foundry components while Splinter integrates
with external monitoring (directly polling the JSON endpoint, or having those
metrics polled internally and pushed to the cloud) to provide confidence
in shared services.

# Overview
For each service enabled in the configuration (see `sample-config.json`):

- Get instance name from configuration
- Auto-discover service details from environment (uri, password, etc)
- Configure client and open connection to service
- Prep (create table, queue, etc)
- Write test record to service
- Read test record from service
- Cleanup (drop table, etc)
- Report success/fail and timing in JSON
- Respond with appropriate HTTP code

Service binding has seen limited testing on [Pivotal Web Services](https://run.pivotal.io).
Full CRUD examples for each service type are included, but tuning may be required.
Feel free to submit pull requests, or just use this as a starting point!

## Errors and Example Output

Splinter returns `200 OK` on success and non-200 (mostly `500`) on error. On
failure, `seconds_elapsed` will also be set to `-255` and `message` will
capture the service error.

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

```
HTTP/1.1 500 Internal Server Error
Content-Type: application/json; charset=utf-8

...

{
    "results": {
        "my-rabbitmq": {
            "message": "Error: Operation failed: QueueDeclare; 405 (RESOURCE-LOCKED) with message \"RESOURCE_LOCKED - cannot obtain exclusive access to locked queue 'splinter' in vhost 'tzxcpwaz'\"",
            "seconds_elapsed": -255
        }
    },
    "timestamp": "2018-07-18T01:57:07.549Z"
}
```

# Setup

1. Clone this repo
1. Copy `sample-config.json` to `<your-config-name>.json`
1. Edit `<your-config-name>.json`
    1. Enable services to test (set to `true`)
    1. Configure enabled service instance names (used to lookup credentials)
1. Copy `manifest.yml` to `<your-manifest-name>.yml`
1. Edit `<your-manifest-name>.yml`
    1. Adjust `buildpack` and `routes` as needed
    1. Update `services` to match your environment
    1. Update `CONF` to point to `<your-conig-name>.json`
1. `cf push`

__A note on frequency...  running every minute or less frequently is usually fine,
but running too often may result in spurious errors from services under test.
Splinter tries to minimize collisions by generating random names for test
artifacts, but you may hit connection or other resource limits.__

# References

- https://run.pivotal.io
- https://www.npmjs.com/package/cfenv
- https://www.npmjs.com/package/redis
- https://www.npmjs.com/package/mongoose
- https://www.npmjs.com/package/mysql
- https://www.npmjs.com/package/pg
- https://www.npmjs.com/package/amqplib

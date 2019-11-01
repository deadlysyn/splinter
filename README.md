![Master Splinter](https://gitlab.com/deadlysyn/splinter/raw/ad90ab6ff95e50840ccd20916d97da4417e0a9c0/assets/splinter.jpg)

# Splinter: Cloud Foundry Service Instance Smoke Tester

Inspired by prior art:

- https://github.com/cloudfoundry/cf-smoke-tests
- https://github.com/pivotal-cf/rabbit-labrat

If you have no automated platform testing, [cf-smoke-tests](https://github.com/cloudfoundry/cf-smoke-tests) is an excellent place to start. The next thing a platform team typically wants is a "synthetic test suite" based on a custom application leveraging shared services such as MySQL or Redis to continuously validate user experience.

Splinter is an attempt to meet that need by providing a simple application allowing platform teams to easily and selectively exercise shared services. `cf-smoke-tests` can continue providing confidence in Cloud Foundry components while Splinter integrates with external monitoring to provide confidence in shared services.

## 2019 Refactor

Splinter underwent a major refactor as part of moving to the latest Node.js LTS release (12.13 as of writing):

- Bump all dependencies to latest stable versions
- Move to mysql2 (generally more performant)
- Move to ioredis vs redis+async-redis (fewer dependencies, better maintained, more resilient)
- Greatly simplify server and routing code
- Eliminate callback hell and use async/await in all tests
- Better separation of concerns (test harness middleware, connection logic)
- Cleanup each test to serve as better patterns
- Improve RabbitMQ test to be more real-world (leverage custom exchange and binding)
- More robust error handling and reporting (catch more edge cases)
- Move from JSON to YAML for configuration
- Added Prometheus instrumentation

# Overview

For each service enabled in the configuration (see `sample-config.yml`):

- Get instance name from configuration
- Auto-discover service details from environment (uri, password, etc)
- Configure client and open connection to service
- Prep (create table, queue, etc)
- Write test record to service
- Read test record from service
- Cleanup (drop table, etc)
- Report success/fail and timing in JSON
- Respond with appropriate HTTP code

Service binding has been thoroughly tested on [Pivotal Web Services](https://run.pivotal.io). Aside from acting as a service instance test harness, you can [browse src/testers](https://gitlab.com/deadlysyn/splinter/tree/master/src/testers) for full CRUD examples of included service types. This provides decent starter patterns for interacting with common service instances from Node. If you find bugs, think of useful tweaks or just know a better way, feel free to submit pull requests!

## Example Output

Splinter returns `200 OK` on success and `502 Bad Gateway` on error. On failure, `secondsElapsed` will not be set and `message` will capture the service error.

```bash
❯ http splinter.cfapps.io
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 257
Content-Type: application/json; charset=utf-8
Date: Tue, 29 Oct 2019 03:10:50 GMT
Etag: W/"101-230EI7yOerxmRVcdFMAl8XmzzV8"
X-Powered-By: Express
X-Vcap-Request-Id: 9f5ba2e0-ae78-4388-45b9-b0c74443ca1b

{
    "results": [
        {
            "instance": "my-mongodb",
            "message": "OK",
            "secondsElapsed": 0.122
        },
        {
            "instance": "my-mysql",
            "message": "OK",
            "secondsElapsed": 0.046
        },
        {
            "instance": "my-postgres",
            "message": "OK",
            "secondsElapsed": 0.036
        },
        {
            "instance": "my-rabbitmq",
            "message": "OK",
            "secondsElapsed": 0.037
        },
        {
            "instance": "my-redis",
            "message": "OK",
            "secondsElapsed": 0.042
        }
    ]
}
```

```bash
❯ http splinter.cfapps.io
HTTP/1.1 502 Bad Gateway
Connection: keep-alive
Content-Length: 369
Content-Type: application/json; charset=utf-8
Date: Wed, 30 Oct 2019 02:09:35 GMT
Etag: W/"171-D5Q3I7MJh3J+RLgPgeGMfKUqy/U"
X-Powered-By: Express
X-Vcap-Request-Id: 7594c180-2f4c-40eb-5eb8-0a7a1f24aa94

{
    "results": [
        {
            "instance": "my-mongodb",
            "message": "ERROR - test",
            "secondsElapsed": 0.133
        },
    ...
    ]
}
```

# Getting Started

Jumping into the configuration assumes you have already configured service instances you'd like to test. In Cloud Foundry this typically involves provisioning the services (either through the marketplace or manually), or pointing to existing instances. You will need to bind these services to an org and space used for testing. This might be an existing space such as system and pre-existing service instances (for tests closer to the real-world) or a dedicated space and services (for more safety).

I suggest taking the safer approach while you test drive Splinter, get comfortable with how the tests work, possibly refine them to better meet your needs (perhaps extending the simplistic test cases), and then better integrate them with your infrastructure. Even when ran in the simplest form, you will have increased confidence in your platform's shared services.

1. Clone this repo
1. Copy `sampleConfig.yml` to `$yourConfig.yml`
1. Edit `$yourConfig.yml`
   1. Enable services to test (set `enabled: true`)
   1. Configure enabled service `instance:` names (used to discover credentials)
1. Copy `manifest.yml` to `$yourManifest.yml`
1. Edit `$yourManifest.yml`
   1. Adjust `routes:` as needed
   1. Update `services:` to match your environment
   1. Update `CONFIG` to point to `$yourConig.yml`
1. `cf push -f $yourManifest.yml`

Running every minute or less is fine, but running too often may result in spurious errors from services under test. Splinter tries to minimize collisions by generating random names for test artifacts, but you may hit connection or other resource limits.

Ideally you integrate this with your monitoring solution. You can monitor the HTTP status code (if any tested service fails, you'll get a non-200 response), graph `secondsElapsed` (spot anomalies over time), etc. This could be done via direct polling (if you expose the endpoint) or via an internal process (perhaps a [Concourse](https://concourse-ci.org) pipeline) which periodically polls the endpoint, formats as needed, then submits upstream to Datadog or similar.

# Prometheus Support

The original workflow simply relied on scraping the root path and parsing JSON metrics (and HTTP response codes) to integrate with external monitoring. The 2019 refactor added Prometheus instrumentation. Each test exposes `*_tests_total` and `*_errors_total` counters as well as `*_latency_seconds` histograms via the `/metrics` endpoint which can be scraped with something like:

```yaml
global:
  scrape_interval: 10s
scrape_configs:
  - job_name: splinter
    static_configs:
      - targets:
          - splinter.cfapps.io:80
```

Example PromQL queries you might find useful:

- Error rate: `rate(splinter_mongodb_errors_total[5m]) / rate(splinter_mongodb_tests_total[5m])`
- 95th percentile latency: `histogram_quantile(0.95, rate(splinter_mongodb_latency_seconds_bucket[5m]))`

An example Grafana dashboard is also included in [prometheus/grafana_dashboard.json](https://gitlab.com/deadlysyn/splinter/tree/master/prometheus/grafana_dashboard.json).

![Sample Grafana Dashboard](https://gitlab.com/deadlysyn/splinter/raw/master/assets/grafana.jpg)

# References

- https://run.pivotal.io
- https://www.npmjs.com/package/cfenv
- https://www.npmjs.com/package/mongoose
- https://www.npmjs.com/package/mysql2
- https://www.npmjs.com/package/pg
- https://www.npmjs.com/package/amqplib
- https://www.npmjs.com/package/redis
- https://www.npmjs.com/package/async-redis
- http://www.squaremobius.net/amqp.node
- https://www.manifold.co/blog/asynchronous-microservices-with-rabbitmq-and-node-js
- https://prometheus.io/docs/introduction/overview
- https://github.com/siimon/prom-client
- https://grafana.com/docs

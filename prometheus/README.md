# Scraping & Browsing with Prometheus

Once you have Splinter running, you can test metric scraping and configure a dashboard...

To get a local [Prometheus](https://prometheus.io) scraping on MacOS:

```bash
brew install prometheus
vi promtheus.yml # edit as needed e.g. targets
./prometheus
```

You can then browse `http://localhost:9090` to use the expression browser. This is a good place to experiment with queries, though you'll need to generate some load to see anything interesting!

For dashboarding, fire up [Grafana](https://grafana.com) using Docker:

```bash
./grafana.sh start
```

Login to your local Grafana instance with default credentials (admin:admin), and import `grafana-dashboard.json` as a starting point. The dashboard only has two panels, `error rate` and `latency`. Queries are provided for all tests, so you will want to disable for tests you don't need and adjust as needed.

Enjoy!


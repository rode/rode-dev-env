# rode-dev-env

A local development and CI environment for Rode and its components.  

## Local

To start Rode, run `docker compose up`. This will stand up Open Policy Agent, Elasticsearch, Grafeas, and Rode.

To shut everything down, use `docker compose down`.

## GitHub Action

To run Rode in a CI environment

### Inputs

The only action inputs are for configuring service versions:

| Input                  | Description                                                         | Default  |
|------------------------|---------------------------------------------------------------------|----------|
| `rodeVersion`          | Rode version. Set this value to `local` to skip initializing Rode.  | `0.14`   |
| `elasticsearchVersion` | Elasticsearch Docker image tag.                                     | `7.10.0` |
| `grafeasVersion`       | Grafeas Elasticsearch Docker image tag.                             | `0.8`    |
| `opaVersion`           | Open Policy Agent Docker image tag.                                 | `0.24.0` |

### Outputs

The action outputs addresses for the running services:

| Output                     | Description                                       |
|----------------------------|---------------------------------------------------|
| `rodeHost`                 | Rode hostname and port. No protocol.              |
| `elasticsearchUrl`         | Elasticsearch URL.                                |
| `grafeasElasticsearchHost` | Grafeas Elasticsearch host and port. No protocol. |
| `opaUrl`                   | Open Policy Agent URL.                            |


### Example

```yaml
- name: Start Rode Environment
  uses: rode/rode-dev-env@v0.1.0
  id: rode
  with:
    opaVersion: 0.24.0
    elasticsearchVersion: 7.10.0
    grafeasVersion: 0.8.7
    rodeVersion: 0.14.9
- name: List Rode Policies
  run: |
    curl http://${{ steps.rode.outputs.rodeHost }}/v1alpha1/policies | jq
```

### Debugging

The action adds logs for each service as an attachment to the job. 

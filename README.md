docker-registry-container
=================

Recipe for creating an docker registry containers with
[nscale](http://github.com/nearform/nscale).

`system.json` example
---------------------
```json
{
  "name": "redisdemo",
  "namespace": "redisdemo",
  "id": "e1144711-47bb-5931-9117-94f01dd20f6f",
  "containerDefinitions": [
    {
      "type": "blank-container",
      "id": "85d99b2c-06d0-5485-9501-4d4ed429799c",
      "name": "root"
    },
    {
      "type": "docker-registry",
      "specific": {
        "slug": "redis",
        "execute": {
          "args": "",
          "exec": "redis-server"
        }
      },
      "id": "redis",
      "name": "redis",
      "version": "unspecified"
    }
  ],
  "topology": {
    "containers": {
      "root-16f4f95b": {
        "id": "root-16f4f95b",
        "containedBy": "root-16f4f95b",
        "containerDefinitionId": "85d99b2c-06d0-5485-9501-4d4ed429799c",
        "type": "blank-container",
        "contains": [
          "0dd1c63c-d34b-4312-b153-6502af4dec36"
        ],
        "specific": {
          "ipaddress": "localhost"
        }
      },
      "0dd1c63c-d34b-4312-b153-6502af4dec36": {
        "id": "0dd1c63c-d34b-4312-b153-6502af4dec36",
        "containedBy": "root-16f4f95b",
        "containerDefinitionId": "redis",
        "type": "docker-registry",
        "contains": [],
        "specific": {}
      }
    }
  }
}
```

License
-------

Artistic License 2.0

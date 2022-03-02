# Docma

## Deployment

The included Docker image runs the following software

- Node.js 16.14 LTS (via https://github.com/phusion/passenger-docker)
- Ruby 3.0.1 (via https://github.com/phusion/passenger-docker)
- Ubuntu Focal (via https://github.com/phusion/baseimage-docker)

The Docker image is based on https://github.com/phusion/passenger-docker, which in turn is based on https://github.com/phusion/baseimage-docker. Consult their documentation for instructions.

## Operation

The Docker container runs `docma build` every minute, looking for files in `/home/app/documents`, outputting the generated site in `/home/app/results`.

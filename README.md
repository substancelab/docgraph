# Docma

## Deployment

The included Docker image runs the following software

- Node.js 16.14 LTS (via https://github.com/phusion/passenger-docker)
- Ruby 3.0.1 (via https://github.com/phusion/passenger-docker)
- Ubuntu Focal (via https://github.com/phusion/baseimage-docker)

The Docker image is based on https://github.com/phusion/passenger-docker, which in turn is based on https://github.com/phusion/baseimage-docker. Consult their documentation for instructions.

## Operation

The Docker container runs `docma build` every minute, looking for files in `/home/app/documents`, outputting the generated site in `/home/app/results`.

### Assumptions

The examples here assume...

- That port 2222 is forwarded to port 22 on the container
- The private key is present at `docker/ssh/keys/app`
- The source documents are available in ~/source

### SSH access

SSH access is available for the app user. A default public key is installed, and using the corresponding private key SSH access can be gained:

    $ ssh app@localhost -p 2222 -i docker/ssh/keys/app

Every new build of the container includes a new, unique host key. Automated scripts need to take this into account and refresh their host key if it has changed.

### Synchronizing documents

Using rsync to keep the list of documents synchronized is recommended:

    $ rsync --archive --delete --recursive -e 'ssh -p 2222 -i docker/ssh/keys/app' ~/source/ app@localhost:~/documents/

This keeps the documents in the container synchronized with the documents in ~/source, deleting any files from the destination that may have been deleted on the source, uploading all updated files.

### Getting the generated website

The result website can be extracted from the container using scp:

    $ scp -i docker/ssh/keys/app -P 2222 app@localhost:~/results/\* html

This copies the generated files into a `html` directory, which is ready for being served as a static website on any webserver.

### Getting the logfile

Every run of docma in the container generates a logfile in `~/logs/docma.log`. A logfile from the internal cron daemon is also availabe in `~/logs/cron.log`. The logfiles can be copied from the container using scp:

    $ scp -i docker/ssh/keys/app -P 2222 app@localhost:~/logs/\* logs

FROM phusion/passenger-customizable:2.1.0

# Install Ruby 3.0
RUN /pd_build/ruby-3.0.*.sh

# Install NodeJS
RUN /pd_build/nodejs.sh

# Install RSync
RUN apt-get update
RUN apt-get install rsync

# Clean up APT when done.
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ENV HOME /root
WORKDIR /home/app/src

# Install serverside dependencies
COPY Gemfile Gemfile.lock ./
RUN gem install bundler:2.3.4 --conservative
RUN bundle config set --local deployment 'true'
RUN bundle install --without development test

# Install clientside dependencies
COPY package.json package-lock.json ./
RUN npm install

# create version file
RUN git log --oneline -n 10 > ./version.txt || true

# Enable keybased SSH user access
RUN rm -f /etc/service/sshd/down
COPY docker/ssh/sshd_config.d/* /etc/ssh/sshd_config.d/
RUN echo "Include /etc/ssh/sshd_config.d/*.conf" >> /etc/ssh/sshd_config

# Generate a SSH host keys.
RUN /etc/my_init.d/00_regen_ssh_host_keys.sh

# Allow SSH access for the app user
COPY docker/ssh/keys/app.pub /home/app/.ssh/app.pub
RUN cat /home/app/.ssh/app.pub >> /home/app/.ssh/authorized_keys
RUN chmod 0644 /home/app/.ssh/authorized_keys
RUN passwd --unlock app

# Make sure file exchange directories exist
RUN mkdir /home/app/documents
RUN mkdir /home/app/logs
RUN mkdir /home/app/results

# Install the application owned by app user
COPY --chown=app:app . /home/app/src
RUN chown --recursive app:app /home/app

# Set up crontab
RUN crontab -u app /home/app/src/docker/cron/crontab

# Use baseimage-docker's init process.
CMD ["/sbin/my_init"]

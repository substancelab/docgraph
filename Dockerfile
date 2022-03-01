FROM phusion/passenger-customizable:2.1.0

# Install Ruby 3.0
RUN /pd_build/ruby-3.0.*.sh

# Install NodeJS
RUN /pd_build/nodejs.sh

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

# Install the application
COPY --chown=app:app . /home/app/src

# create version file
RUN git log --oneline -n 10 > ./version.txt || true

# Use baseimage-docker's init process.
CMD ["/sbin/my_init"]

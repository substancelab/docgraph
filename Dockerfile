FROM ruby:3.1.1-bullseye

WORKDIR /usr/src/app

# Install Node.js
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get update && apt-get install -y nodejs

# Install serverside dependencies
COPY Gemfile Gemfile.lock ./
RUN gem install bundler:2.3.4 --conservative
RUN bundle config set --local deployment 'true'
RUN bundle install --without development test

# Install clientside dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy current directory to /usr/src/app
COPY . /usr/src/app

# create version file
RUN git log --oneline -n 10 > ./version.txt || true

CMD ["echo cmd"]
ENTRYPOINT ["bin/docma"]

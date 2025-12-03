FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    libcap-dev \
    libpq-dev \
    git \
    sudo \
    make -j$(nproc) install && \
    rm -rf /tmp/*
ENV BOX_ROOT /var/local/lib/isolate

# Install Ruby 2.7 (Required for Judge0 API)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ruby-full \
    zlib1g-dev \
    && \
    rm -rf /var/lib/apt/lists/*

# Install Compilers

# 1. GCC/G++ (C/C++)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    && \
    rm -rf /var/lib/apt/lists/*

# 2. Python 3
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-dev \
    && \
    rm -rf /var/lib/apt/lists/*

# 3. Java (OpenJDK 17)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    openjdk-17-jdk-headless \
    && \
    rm -rf /var/lib/apt/lists/*

# 4. Node.js (Latest LTS)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    rm -rf /var/lib/apt/lists/*

# Setup Judge0
WORKDIR /api

# Install Bundler
RUN gem install bundler:2.1.4

# Clone Judge0 Source Code (v1.13.0)
RUN git clone --branch v1.13.0 --depth 1 https://github.com/judge0/judge0.git .

# Install Dependencies
RUN bundle update mimemagic && \
    bundle config set --local deployment 'true' && \
    bundle config set --local without 'development test' && \
    bundle install

# Setup User and Permissions
RUN useradd -u 1000 -m -r judge0 && \
    echo "judge0 ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers && \
    mkdir -p /api/tmp && \
    chown -R judge0: /api/tmp

# Expose Port
EXPOSE 2358

# Entrypoint
ENTRYPOINT ["/api/docker-entrypoint.sh"]
CMD ["/api/scripts/server"]

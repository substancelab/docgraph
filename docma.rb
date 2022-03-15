#!/usr/bin/env ruby

require "thor"

require_relative "lib/commands/build"
require_relative "lib/commands/metadata"
require_relative "lib/commands/verify"

class DocmaCLI < Thor
  desc \
    "build",
    "Analyze documents in a source directory and generate a HTML file with " \
    "the visual graph of their relationships."
  method_option :source, aliases: "-s", default: "./"
  method_option :destination, aliases: "-s", default: "./build"
  method_option :logfile, aliases: "-l"
  method_option :verbose
  def build
    command = Build.new(options)
    command.call
  end

  desc \
    "metadata",
    "Analyze documents in a source directory and output the meta data tables " \
    "found in them."
  method_option :source, aliases: "-s", default: "./"
  def metadata
    command = Metadata.new(options)
    command.call
  end

  desc \
    "verify",
    "Analyze and verify documents in a source directory."
  method_option :source, aliases: "-s", default: "./"
  def verify
    command = Verify.new(options)
    command.call
  end

   default_task :build
end

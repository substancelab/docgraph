#!/usr/bin/env ruby

require "thor"

require_relative "lib/commands/build"
require_relative "lib/commands/metadata"

class DocmaCLI < Thor
  desc \
    "build",
    "Analyze documents in a source directory and generate a HTML file with " \
    "the visual graph of their relationships."
  method_option :source, aliases: "-s", default: "./"
  method_option :destination, aliases: "-s", default: "./build"
  def build
    p options
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

   default_task :build
end

#!/usr/bin/env ruby

require "thor"

class DocmaCLI < Thor
  desc \
    "build",
    "Analyze documents in a source directory and generate a HTML file with " \
    "the visual graph of their relationships."
  method_option :source, aliases: "-s", default: "./"
  method_option :destination, aliases: "-s", default: "./build"
  def build
    puts "build"
  end

   default_task :build
end

DocmaCLI.start(ARGV)

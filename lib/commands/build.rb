# frozen_string_literal: true

class Build
  attr_reader :options

  def call
    document_paths = collect_document_paths
    p document_paths
  end

  def destination
    @destination ||= options.fetch("destination")
  end

  def initialize(options)
    @options = options
  end

  def source
    @source ||= options.fetch("source")
  end

  private

  def collect_document_paths
    Dir.glob("*.docx", :base => source).map do |document|
      File.join(source, document)
    end
  end
end

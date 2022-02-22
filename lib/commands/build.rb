# frozen_string_literal: true

require_relative "../word_document_repository"

class Build
  attr_reader :options

  def call
    word_documents = WordDocumentRepository.from_path(source)
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
end

# frozen_string_literal: true

require "docx"
require "forwardable"

# A collection of Word documents collected from source directory
class WordDocumentRepository
  # Decorates Docx::Documents with extra methods and data that we need
  class WordDocument
    extend Forwardable
    def_delegators :document, :tables

    attr_reader :path

    def initialize(path)
      @path = path
    end

    def document
      @document ||= Docx::Document.open(path)
    end
  end

  extend Forwardable

  attr_reader :documents

  def_delegators :documents, :each, :map, :size

  class << self
    def from_path(path, logger: nil)
      word_documents = new(logger: logger)
      logger&.debug { "Collecting Word documents from #{path}" }

      document_paths = collect_document_paths(path)
      document_paths.each do |document_path|
        logger&.debug { "- Collecting #{document_path}" }
        word_documents.add_from_path(document_path)
      end

      word_documents
    end

    private

    def collect_document_paths(path)
      Dir.glob("*.docx", :base => path).map do |word_document|
        File.join(path, word_document)
      end
    end
  end

  def add_from_path(path)
    documents << WordDocument.new(path)
  end

  def initialize(logger: nil)
    @documents = []
    @logger = logger
  end
end

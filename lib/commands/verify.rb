# frozen_string_literal: true

require_relative "../word_document_repository"

class Verify
  class Result
    ERROR = :error.freeze
    OK = :ok.freeze

    attr_reader :level, :message

    def initialize(level, message)
      @level = level
      @message = message
    end
  end

  DOCUMENT_NAME_FORMAT = %r{^\w+\.\d+\..+$}.freeze

  attr_reader :options

  def call
    word_documents = WordDocumentRepository.from_path(source)

    documents = word_documents.map do |document|
      Document.new(document)
    end

    documents.each do |document|
      results = run_verifications(document)

      errors = results.select do |result|
        result.level == Result::ERROR
      end

      if errors.any?
        puts "#{document.title} (#{document.path})"
        errors.each do |error|
          puts format("[%-5s] %-70s", error.level.to_s.upcase, error.message)
        end
        puts
      end
    end
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

  def category_matches_known_categories(document)
    if category_matches_known_categories?(document)
      Result.new(Result::OK, "Document category is a known category")
    else
      Result.new(
        Result::ERROR,
        "Couldn't find document category (#{document.category}) in the list " \
        "of known categories."
      )
    end
  end

  def category_matches_known_categories?(document)
    category = document.category

    Document::LEVELS.keys.include?(category)
  end

  def document_has_metadata(document)
    if document.metadata?
      Result.new(Result::OK, "Document metadata found")
    else
      Result.new(Result::ERROR, "No metadata table found")
    end
  end

  def run_verifications(document)
    results = []
    results << document_has_metadata(document)
    results << name_matches_format(document)
    results << category_matches_known_categories(document)
    results
  end

  def name_matches_format(document)
    if name_matches_format?(document)
      Result.new(Result::OK, "Document name matches expected format")
    else
      Result.new(
        Result::ERROR,
        "Document name (#{document.name}) does not match the expected format"
      )
    end
  end

  def name_matches_format?(document)
    name = document.name
    name.match?(DOCUMENT_NAME_FORMAT)
  end
end

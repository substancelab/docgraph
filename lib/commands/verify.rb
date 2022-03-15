# frozen_string_literal: true

require_relative "../word_document_repository"

class Verify
  DOCUMENT_NAME_FORMAT = %r{^\w+\.\d+\..+$}.freeze

  attr_reader :options

  def call
    word_documents = WordDocumentRepository.from_path(source)

    documents = word_documents.map do |document|
      Document.new(document)
    end

    documents.each do |document|
      puts "#{document.title} (#{document.path})"
      run_verifications(document)
      puts
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

  def category_matches_known_categories?(document)
    category = document.category

    Document::LEVELS.keys.include?(category)
  end

  def run_verifications(document)
    puts "- Metadata table found: #{document.metadata?}"
    puts "- Name matches format: #{name_matches_format?(document)}"
    puts "- Category is known: #{category_matches_known_categories?(document)}"
  end

  def name_matches_format?(document)
    name = document.name
    name.match?(DOCUMENT_NAME_FORMAT)
  end
end

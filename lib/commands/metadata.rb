# frozen_string_literal: true

require_relative "../word_document_repository"

class Metadata
  attr_reader :options

  def call
    word_documents = WordDocumentRepository.from_path(source)

    word_documents.each do |word_document|
      output_tables(word_document)
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

  # Returns true if table is a metadata table, ie a table at the beginning of a
  # document containing the title, document id, name etc of the document.
  def metadata_table?(table)
    return false if table.rows.empty?
    return false unless table.rows.first.cells.size == 2

    expected_keys = ["Document ID", "Title"]
    keys = table.rows.map { |row| row.cells.first.text }

    expected_keys.all? { |expected_key| keys.include?(expected_key) }
  end

  def output_tables(word_document)
    word_document.tables.each do |table|
      # We need tables with 2 columns so we can form key/value pairs
      next unless metadata_table?(table)

      table.rows.each do |row|
        key = row.cells[0].text
        value = row.cells[1].text

        puts format("%-20s\t%-60s", key, value)
      end
      puts
    end
  end
end

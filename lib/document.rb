# frozen_string_literal: true

# Representation of a Document in the document structure.
#
# It has no contents but contains only metadata related to the actual Word
# document.
class Document
  class ParseError < RuntimeError; end

  attr_reader :word_document

  LEVELS = {
    "Strategy" => 1,
    "Charter" => 2,
    "KeyPolicy" => 3,
    "Guideline" => 4,
    "Process" => 5,
    "Procedure" => 6,
    "WorkInstruction" => 7
  }.freeze

  def category
    return nil if name.nil?

    name_without_parents = name
    parent_names.each do |parent_name|
      next unless name_without_parents.start_with?(parent_name)

      name_without_parents = name_without_parents.sub("#{parent_name}.", "")
    end
    name_without_parents.split(".").compact[0]
  end

  def initialize(word_document, metadata: nil)
    @metadata = metadata
    @word_document = word_document
  end

  def inspect
    "#<#{self.class}:#{object_id} name:#{name.inspect}>"
  end

  # Returns a key to use for this document. Keys are unique across the entire
  # graph and aren't meant for human consumption.
  def key
    name.tr(" ", "").downcase
  end

  def level
    LEVELS.fetch(category.tr(" ", ""))
  end

  def name
    metadata["Document name"]
  end

  def parent_names
    names = metadata["Parent policies"] || metadata["Parent(s)"] || ""
    names.split(",").map(&:strip)
  end

  def path
    word_document.path
  end

  def title
    metadata["Title"]
  end

  private

  def metadata
    return @metadata if @metadata

    table = metadata_table
    raise ParseError, "Could not find metadata in document #{path}" if table.nil?

    @metadata = table.rows.map do |row|
      [
        row.cells[0].text&.strip,
        row.cells[1].text&.strip
      ]
    end.to_h
  end

  def metadata_table
    word_document.tables.find { |table| metadata_table?(table) }
  end

  # Returns true if table is a metadata table, ie a table at the beginning of a
  # document containing the title, document id, name etc of the document.
  def metadata_table?(table)
    return false if table.rows.empty?
    return false unless table.rows.first.cells.size == 2

    expected_keys = ["Document ID", "Title"]
    keys = table.rows.map { |row| row.cells.first.text.strip }
    expected_keys.all? { |expected_key| keys.include?(expected_key) }
  end
end

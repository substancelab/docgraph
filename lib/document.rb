# frozen_string_literal: true

# Representation of a Document in the document structure.
#
# It has no contents but contains only metadata related to the actual Word
# document.
class Document
  attr_reader :word_document

  def initialize(word_document)
    @word_document = word_document
  end

  def inspect
    "#<#{self.class}:#{object_id} name:#{name.inspect}>"
  end

  def name
    metadata["Document name"]
  end

  def parent_names
    names = metadata["Parent policies"] || metadata["Parent(s)"] || ""
    names.split(",")
  end

  def title
    metadata["Title"]
  end

  private

  def metadata
    @metadata ||= metadata_table.rows.map do |row|
      [
        row.cells[0].text,
        row.cells[1].text
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
    keys = table.rows.map { |row| row.cells.first.text }
    expected_keys.all? { |expected_key| keys.include?(expected_key) }
  end
end

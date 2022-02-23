# frozen_string_literal: true

require_relative "../document"
require_relative "../graph"
require_relative "../word_document_repository"

class Build
  attr_reader :options

  def call
    word_documents = WordDocumentRepository.from_path(source)
    documents = word_documents.map do |word_document|
      Document.new(word_document)
    end
    graph = build_graph(documents)
    output(graph)
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

  def build_edges(documents, nodes)
    documents.flat_map do |document|
      name = document.name
      current_node = nodes.find { |node| node.data.name == name }

      document.parent_names.map do |parent_name|
        parent_node = nodes.find { |node| node.data.name == parent_name }
        Graph::Edge.new(current_node, parent_node)
      end
    end
  end

  def build_graph(documents)
    nodes = build_nodes(documents)
    build_edges(documents, nodes)
  end

  def build_nodes(documents)
    documents.map do |document|
      Graph::Node.new(document)
    end
  end

  def output(edges)
    roots = edges.select { |edge| edge.target.nil? }
    roots.each do |edge|
      output_tree(edge.source, edges)
    end
  end

  def output_tree(node, edges)
    document = node.data
    level = document.level.to_i
    indent = " " * (level - 1) * 8

    puts [indent, "#{level}: ", document.name].join
    child_edges = edges.select { |edge| edge.target == node }
    child_edges.each do |child_edge|
      child = child_edge.source
      output_tree(child, edges)
    end
  end
end

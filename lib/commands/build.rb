# frozen_string_literal: true

require_relative "../document"
require_relative "../graph"
require_relative "../generators/javascript"
require_relative "../word_document_repository"

class Build
  attr_reader :options

  def call
    word_documents = WordDocumentRepository.from_path(source)
    documents = word_documents.map do |word_document|
      Document.new(word_document)
    end
    graph = build_graph(documents)
    generate_javascript_file(graph)
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

  def build_edges(graph, documents)
    nodes = graph.nodes
    documents.flat_map do |document|
      name = document.name
      current_node = nodes.find { |node| node.data.name == name }

      document.parent_names.map do |parent_name|
        parent_node = nodes.find { |node| node.data.name == parent_name }
        graph.add_edge(current_node, parent_node)
      end
    end
  end

  def build_graph(documents)
    graph = Graph.new
    build_nodes(graph, documents)
    build_edges(graph, documents)
    graph
  end

  def build_nodes(graph, documents)
    documents.map do |document|
      graph.add_node(document)
    end
  end

  def generate_javascript_file(graph)
    Generators::Javascript.new(graph).call
  end
end

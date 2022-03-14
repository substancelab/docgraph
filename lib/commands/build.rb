# frozen_string_literal: true

require "fileutils"
require "logging"

require_relative "../document"
require_relative "../graph"
require_relative "../generators/javascript"
require_relative "../generators/json"
require_relative "../word_document_repository"

class Build
  attr_reader :options

  def call
    word_documents = WordDocumentRepository.from_path(source)

    logger.info { "Parsing #{word_documents.size} Word documents" }

    documents = word_documents.map do |word_document|
      Document.new(word_document)
    end
    graph = build_graph(documents)
    # generate_javascript_file(graph)
    generate_json_file(graph)
    build_html_site
    copy_html_site_to_destination
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

  def build_html_site
    logger.info { "Building HTML results" }
    `npx parcel build`
  end

  def copy_html_site_to_destination
    logger.info { "Moving HTML results to destination" }

    FileUtils.mkdir_p(destination) unless File.exist?(destination)

    files = Dir.glob("./dist/*")
    FileUtils.cp(files, destination)
  end

  def generate_javascript_file(graph)
    javascript = Generators::Javascript.new(graph).call
    File.write("./html/elements.js", javascript)
  end

  def generate_json_file(graph)
    logger.info { "Generating JSON output" }
    json = Generators::Json.new(graph).call
    File.write("./data/elements.json", json)
  end

  def logger
    return @logger if @logger

    @logger = Logging.logger["log"]
    @logger.level = :info
    @logger.level = :debug if options[:verbose]

    if options[:logfile]
      @logger.add_appenders(
        Logging.appenders.file(options[:logfile])
      )
    end

    @logger
  end
end

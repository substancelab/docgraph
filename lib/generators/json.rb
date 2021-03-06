# frozen_string_literal: true

require "erb"
require "json"

module Generators
  # {
  #   "nodes":[
  #     {"id":"keypolicy.02.aml.guideline.09.transactionmonitoring","name":"Transaction monitoring","group":"09"}
  #     ,{"id":"keypolicy.02.aml","name":"AML","group":"02"}
  #     ,{"id":"procedure.04.customerriskassessment&duediligence","name":"Customer Risk Assessment & Due Diligence","group":"04"}
  #     ,{"id":"procedure.08.complaints","name":"Complaints","group":"08"}
  #     ,{"id":"process.03.customerongoingduediligence.prac","name":"Customer Ongoing Due Diligence","group":"03"}
  #     ,{"id":"process.03.customerongoingduediligence","name":"Customer Ongoing Due Diligence","group":"03"}
  #     ,{"id":"workinstruction.02.compliancechecklistreview","name":"Compliance check list review","group":"02"}
  #   ],
  #   "links":[
  #     {"source":0, "target": 1},
  #     {"source":0, "target": 2},
  #     {"source":0, "target": 4},
  #     {"source":0, "target": 5}
  #   ]
  # }
  class Json
    attr_reader :graph

    def initialize(graph)
      @graph = graph
    end

    def call
      results = {
        "nodes" => nodes,
        "links" => links,
        "groups" => groups
      }.to_json
    end

    private

    def categories
      @categories ||= graph.nodes.map { |node| node.data.category }.uniq
    end

    def links
      edges = graph.edges.select { |edge| edge.source && edge.target }
      edges.map { |edge|
        {
          "source" => nodes.index { |node| node["id"] == edge.source.data.key },
          "target" => nodes.index { |node| node["id"] == edge.target.data.key }
        }
      }
    end

    def groups
      groups = categories.map do |category|
        leaves = nodes_in_category(category).map { |node| node_index(node) }
        level = Document::LEVELS.fetch(category, 0)

        {
          "leaves" => leaves,
          "level" => level,
          "name" => category
        }
      end
      groups.sort_by { |group| group["level"] }
    end

    # Returns the index of node in list of nodes, nil if not found
    def node_index(node)
      nodes.index { |candidate| candidate["id"] == node.data.key }
    end

    def nodes
      graph.
        nodes.
        sort_by { |node| node.data.level }.
        map do |node|
          {
            "group" => node.data.level,
            "id" => node.data.key,
            "name" => node.data.title,
          }
        end
    end

    def nodes_in_category(category)
      graph.nodes.select do |node|
        node.data.category == category
      end
    end
  end
end

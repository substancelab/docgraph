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
        "links" => links
      }.to_json
    end

    private

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
      graph.nodes.map { |node| node.data.level }.uniq
    end

    def nodes
      graph.nodes.map { |node|
        {
          "group" => node.data.level,
          "id" => node.data.key,
          "name" => node.data.name,
        }
      }
    end
  end
end

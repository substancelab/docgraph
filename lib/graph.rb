# frozen_string_literal: true

# Representation of a directed acyclical graph
class Graph
  # A connection between two nodes in the graph
  class Edge
    attr_accessor :source, :target

    def initialize(source, target)
      @source = source
      @target = target
    end
  end

  # A node in the graph
  class Node
    attr_accessor :data

    def initialize(data)
      @data = data
    end
  end
end

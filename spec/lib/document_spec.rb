require "spec_helper"

require_relative "../../lib/document"

RSpec.describe Document do
  describe "#category" do
    it "returns the first element of the Document Name" do
      metadata = {
        "Document name" => "Procedure.08.Complaints"
      }
      document = Document.new(:word_document, metadata: metadata)
      expect(document.category).to eq("Procedure")
    end

    it "returns nil when Document Name is not present" do
      metadata = {
        "Document name" => nil
      }
      document = Document.new(:word_document, metadata: metadata)
      expect(document.category).to be(nil)
    end

    it "removes parent names from the Document name before analyzing" do
      metadata = {
        "Document name" => "KeyPolicy.02.AML.Guideline.09.Monitoring",
        "Parent(s)" => "Something.01.Else, KeyPolicy.02.AML",
      }
      document = Document.new(:word_document, metadata: metadata)
      expect(document.category).to eq("Guideline")
    end
  end
end

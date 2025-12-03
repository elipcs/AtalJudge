import { Card } from "@/components/ui/card";
import { Question } from "@/types";
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface QuestionProblemProps {
  question: Question;
}

export default function QuestionProblem({ question }: QuestionProblemProps) {
  return (
    <div className="space-y-6">
      {}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Problema</h2>
        <div className="bg-slate-50 rounded-lg p-4">
          <MarkdownRenderer content={question.text} />
        </div>
      </Card>

      {}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Exemplos</h2>
        <div className="space-y-4">
          {question.examples.map((example, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Exemplo {index + 1}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Entrada:</span>
                  <pre className="mt-1 text-sm bg-gray-50 p-2 rounded border font-mono">
                    {example.input}
                  </pre>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Saída:</span>
                  <pre className="mt-1 text-sm bg-gray-50 p-2 rounded border font-mono">
                    {example.output}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

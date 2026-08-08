import React from "react";
import {
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Edit,
} from "lucide-react";

export interface Question {
  _id: string;
  questionNumber: number;
  question: string;
  options: string[];
  correctAnswer: string;
  ansNumber: string;
  questionType: string;
  chapter: string;
  subject: string;
  status: string;
  isPublished: boolean;
  aiVerified: boolean;
  aiStatus: string;
}

interface Props {
  questions: Question[];
  refresh: () => void;
}

const QuestionTable: React.FC<Props> = ({
  questions,
  refresh,
}) => {

  return (

    <div className="bg-white rounded-xl shadow overflow-hidden">

      <table className="w-full">

        <thead className="bg-gray-100">

          <tr>

            <th className="p-4 text-left">
              No
            </th>

            <th className="p-4 text-left">
              Question
            </th>

            <th className="p-4 text-left">
              Subject
            </th>

            <th className="p-4 text-left">
              Chapter
            </th>

            <th className="p-4 text-left">
              AI
            </th>

            <th className="p-4 text-left">
              Publish
            </th>

            <th className="p-4 text-center">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {questions.map((q) => (

            <tr
              key={q._id}
              className="border-t hover:bg-gray-50"
            >

              <td className="p-4">
                {q.questionNumber}
              </td>

              <td className="p-4">

                <div className="font-medium">

                  {q.question}

                </div>

              </td>

              <td className="p-4">

                {q.subject}

              </td>

              <td className="p-4">

                {q.chapter}

              </td>
                            {/* AI Status */}

              <td className="p-4">

                {q.aiVerified ? (

                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">

                    <CheckCircle size={14} />

                    Verified

                  </span>

                ) : (

                  <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">

                    <XCircle size={14} />

                    Pending

                  </span>

                )}

              </td>

              {/* Publish Status */}

              <td className="p-4">

                {q.isPublished ? (

                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">

                    Published

                  </span>

                ) : (

                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">

                    Draft

                  </span>

                )}

              </td>

              {/* Actions */}

              <td className="p-4">

                <div className="flex justify-center gap-2">

                  <button
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                    title="View"
                  >
                    <Eye size={18} />
                  </button>

                  <button
                    className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>

                  <button
                    className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>

                </div>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

      {/* Continue Part 3... */}
            {/* Empty State */}

      {questions.length === 0 && (
        <div className="py-16 text-center">

          <h2 className="text-xl font-semibold text-gray-700">
            No Questions Found
          </h2>

          <p className="text-gray-500 mt-2">
            Upload a PDF or create questions manually.
          </p>

        </div>
      )}

    </div>

  );

};

export default QuestionTable;
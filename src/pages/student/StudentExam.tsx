import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

interface Question {

  questionId: string;

  questionNumber: number;

  question: string;

  options: string[];

}

interface ExamInfo {

  id: string;

  title: string;

  subject: string;

  duration: number;

  totalQuestions: number;

}

const StudentExam: React.FC = () => {

  const [loading, setLoading] = useState(false);

  const [exam, setExam] = useState<ExamInfo | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);

  const [answers, setAnswers] = useState<any>({});

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [sessionId, setSessionId] = useState("");

  const startExam = async () => {

    try {

      setLoading(true);

      const token = localStorage.getItem("token");

      const studentId = localStorage.getItem("studentId");

      const examId = localStorage.getItem("examId");

      const res = await axios.post(

        `${API}/exam/start`,

        {

          studentId,

          examId

        },

        {

          headers:{

            Authorization:`Bearer ${token}`

          }

        }

      );

      setSessionId(res.data.sessionId);

      setExam(res.data.exam);

      setQuestions(res.data.questions);

    }

    catch(error){

      console.log(error);

    }

    finally{

      setLoading(false);

    }

  };

  useEffect(()=>{

    startExam();

  },[]);
    const current = questions[currentQuestion];

  const selectAnswer = (
    answer: string
  ) => {

    setAnswers({

      ...answers,

      [current.questionId]: answer

    });

  };

  if (loading) {

    return (

      <div className="flex justify-center items-center h-screen">

        <h2 className="text-2xl font-bold">

          Loading Exam...

        </h2>

      </div>

    );

  }

  return (

    <div className="max-w-6xl mx-auto p-6">

      <div className="bg-white rounded-xl shadow p-6 mb-5">

        <h1 className="text-3xl font-bold">

          {exam?.title}

        </h1>

        <p className="text-gray-500 mt-2">

          {exam?.subject}

        </p>

      </div>

      {

        current && (

          <div className="bg-white rounded-xl shadow p-6">

            <h2 className="text-xl font-semibold mb-5">

              Question {currentQuestion + 1}

            </h2>

            <p className="text-lg mb-6">

              {current.question}

            </p>

            <div className="space-y-3">

              {

                current.options.map(

                  (option, index) => (

                    <button

                      key={index}

                      onClick={() =>

                        selectAnswer(option)

                      }

                      className={`

                        w-full

                        text-left

                        border

                        rounded-lg

                        p-4

                        transition

                        ${

                          answers[current.questionId] === option

                          ?

                          "bg-blue-600 text-white"

                          :

                          "hover:bg-gray-100"

                        }

                      `}

                    >

                      {option}

                    </button>

                  )

                )

              }

            </div>

            <div className="flex justify-between mt-8">

              <button

                disabled={currentQuestion===0}

                onClick={()=>

                  setCurrentQuestion(

                    currentQuestion-1

                  )

                }

                className="border rounded-lg px-5 py-2 disabled:opacity-50"

              >

                Previous

              </button>

              <button

                disabled={

                  currentQuestion===questions.length-1

                }

                onClick={()=>

                  setCurrentQuestion(

                    currentQuestion+1

                  )

                }

                className="bg-blue-600 text-white rounded-lg px-5 py-2"

              >

                Next

              </button>

            </div>

          </div>

        )

      }

      {/* Continue Part 3 */}
            <div className="mt-6 flex justify-center">

        <button

          onClick={submitExam}

          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold"

        >

          Submit Exam

        </button>

      </div>

    </div>

  );

  async function submitExam() {

    try {

      const token = localStorage.getItem("token");

      const studentId = localStorage.getItem("studentId");

      const studentName = localStorage.getItem("studentName");

      const payload = {

        studentId,

        studentName,

        sessionId,

        warnings: 0,

        timeTaken: exam?.duration || 0,

        answers: questions.map((q) => ({

          questionId: q.questionId,

          answer: answers[q.questionId] || ""

        }))

      };

      const res = await axios.post(

        `${API}/exam/submit`,

        payload,

        {

          headers: {

            Authorization: `Bearer ${token}`

          }

        }

      );

      alert("Exam Submitted Successfully");

      console.log(res.data);

      // Store result for Result page

      localStorage.setItem(

        "examResult",

        JSON.stringify(res.data.result)

      );

      // Redirect

      window.location.href = "/student/result";

    }

    catch (error) {

      console.log(error);

      alert("Failed to submit exam");

    }

  }

};

export default StudentExam;
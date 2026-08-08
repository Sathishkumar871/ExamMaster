import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Search, Eye, Rocket, Trash2 } from "lucide-react";

import CreateExamModal from "../components/questionBank/CreateExamModal";

const API = "https://exammaster-backend-up1y.onrender.com/api";

interface Exam {

  _id: string;

  title: string;

  subject: string;

  duration: number;

  status: string;

  createdAt: string;

}

const ExamManagement: React.FC = () => {

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [openCreate, setOpenCreate] = useState(false);

  const [exams, setExams] = useState<Exam[]>([]);

  const loadExams = async () => {

    try {

      setLoading(true);

      const token = localStorage.getItem("token");

      const teacherId = localStorage.getItem("teacherId");

      const res = await axios.get(

        `${API}/exam/teacher?teacherId=${teacherId}`,

        {

          headers:{

            Authorization:`Bearer ${token}`

          }

        }

      );

      setExams(res.data.exams);

    }

    catch(error){

      console.log(error);

    }

    finally{

      setLoading(false);

    }

  };

  useEffect(()=>{

    loadExams();

  },[]);

  const filtered = exams.filter(

    exam=>

      exam.title

      .toLowerCase()

      .includes(

        search.toLowerCase()

      )

  );

  return(

    <div className="p-6">

      <div className="flex justify-between items-center mb-6">

        <div>

          <h1 className="text-3xl font-bold">

            Exam Management

          </h1>

          <p className="text-gray-500">

            Create and publish exams

          </p>

        </div>

        <button

          onClick={()=>setOpenCreate(true)}

          className="bg-blue-600 text-white px-5 py-3 rounded-lg flex items-center gap-2"

        >

          <Plus size={18}/>

          Create Exam

        </button>

      </div>

      <div className="bg-white rounded-xl shadow p-4 mb-5">

        <div className="flex items-center border rounded-lg px-3">

          <Search size={18}/>

          <input

            className="flex-1 p-3 outline-none"

            placeholder="Search Exams"

            value={search}

            onChange={(e)=>setSearch(e.target.value)}

          />

        </div>

      </div>
            <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-4 text-left">
                Exam
              </th>

              <th className="p-4 text-left">
                Subject
              </th>

              <th className="p-4 text-left">
                Duration
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              <th className="p-4 text-left">
                Created
              </th>

              <th className="p-4 text-center">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {

              loading ?

              (

                <tr>

                  <td
                    colSpan={6}
                    className="text-center p-10"
                  >

                    Loading...

                  </td>

                </tr>

              )

              :

              filtered.map((exam)=>(

                <tr
                  key={exam._id}
                  className="border-t hover:bg-gray-50"
                >

                  <td className="p-4 font-medium">

                    {exam.title}

                  </td>

                  <td className="p-4">

                    {exam.subject}

                  </td>

                  <td className="p-4">

                    {exam.duration} Minutes

                  </td>

                  <td className="p-4">

                    {

                      exam.status==="published"

                      ?

                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">

                        Published

                      </span>

                      :

                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">

                        Draft

                      </span>

                    }

                  </td>

                  <td className="p-4">

                    {

                      new Date(

                        exam.createdAt

                      ).toLocaleDateString()

                    }

                  </td>

                  <td className="p-4">

                    <div className="flex justify-center gap-2">

                      <button

                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"

                        title="View"

                      >

                        <Eye size={18}/>

                      </button>

                      <button

                        className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-700"

                        title="Publish"

                      >

                        <Rocket size={18}/>

                      </button>

                      <button

                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700"

                        title="Delete"

                      >

                        <Trash2 size={18}/>

                      </button>

                    </div>

                  </td>

                </tr>

              ))

            }

          </tbody>

        </table>
                {filtered.length === 0 && !loading && (

          <div className="py-16 text-center">

            <h2 className="text-xl font-semibold text-gray-700">

              No Exams Found

            </h2>

            <p className="text-gray-500 mt-2">

              Click "Create Exam" to create your first exam.

            </p>

          </div>

        )}

      </div>

      <CreateExamModal

        open={openCreate}

        onClose={() => setOpenCreate(false)}

        refresh={loadExams}

      />

    </div>

  );

};

export default ExamManagement;
import React, { useState } from "react";
import axios from "axios";

interface Props {
  open: boolean;
  onClose: () => void;
  refresh: () => void;
}

const API = "https://exammaster-backend-up1y.onrender.com/api";
const PublishQuestionsModal: React.FC<Props> = ({
  open,
  onClose,
  refresh,
}) => {

  const [loading, setLoading] = useState(false);

  const publishQuestions = async () => {

    try {

      setLoading(true);

      const token = localStorage.getItem("token");

      await axios.post(

        `${API}/publish-questions`,

        {},

        {

          headers:{

            Authorization:`Bearer ${token}`

          }

        }

      );

      refresh();

      onClose();

    }

    catch(error){

      console.log(error);

      alert("Publish Failed");

    }

    finally{

      setLoading(false);

    }

  };

  if(!open) return null;

  return(

    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl w-[500px] p-6">

        <h2 className="text-2xl font-bold">

          Publish Questions

        </h2>

        <p className="mt-3 text-gray-500">

          All AI verified questions will be published
          and available for creating exams.

        </p>

        <div className="flex justify-end gap-3 mt-8">

          <button

            onClick={onClose}

            className="border rounded-lg px-5 py-2"

          >

            Cancel

          </button>

          <button

            onClick={publishQuestions}

            disabled={loading}

            className="bg-blue-600 text-white rounded-lg px-5 py-2"

          >

            {

              loading

              ?

              "Publishing..."

              :

              "Publish"

            }

          </button>

        </div>

      </div>

    </div>

  );

};

export default PublishQuestionsModal;
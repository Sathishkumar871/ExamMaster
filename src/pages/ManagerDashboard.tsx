import { useEffect, useState } from "react";
import axios from "axios";


export default function ManagerDashboard() {


  const [feedback, setFeedback] = useState<any[]>([]);


  const token =
    localStorage.getItem("token");



  useEffect(()=>{

    getManagerData();

  },[]);



  const getManagerData = async()=>{

    try{


      const res = await axios.get(

        "http://localhost:5000/api/manager/dashboard",

        {
          headers:{
            Authorization:
            `Bearer ${token}`
          }
        }

      );


      setFeedback(
        res.data.feedback || []
      );


    }
    catch(error){

      console.log(
        "Manager Dashboard Error",
        error
      );

    }

  };



  return (

    <div>


      <h1>
        Manager Dashboard
      </h1>


      <h2>
        Department Reports
      </h2>



      {
        feedback.map((item,index)=>(

          <div key={index}>


            <h3>
              {item.studentName}
            </h3>


            <p>
              Student ID:
              {item.studentId}
            </p>


            <p>
              Department:
              {item.department}
            </p>


            <p>
              Feedback:
              {item.feedback}
            </p>


            <p>
              Updated By:
              {item.updatedByRole}
            </p>


            <hr/>


          </div>

        ))
      }


    </div>

  );

}
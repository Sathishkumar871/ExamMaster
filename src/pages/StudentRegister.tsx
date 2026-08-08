import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function StudentRegister() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [classId, setClassId] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);


  // Sections based on class
  const getSections = () => {

  if (classId === "INTER-FIRST-YEAR") {
    return [
      "J1",
      "J2",
      "J3",
      "J4",
      "J5",
      "J6",
      "J7",
      "J8",
      "J9",
      "J10",
    ];
  }


  if (classId === "INTER-SECOND-YEAR") {
    return [
      "S1",
      "S2",
      "S3",
      "S4",
      "S5",
      "S6",
      "S7",
      "S8",
      "S9",
      "S10",
     
    ];
  }


  return [];

};
  const registerStudent = async (e: React.FormEvent) => {
    e.preventDefault();


    if (
      !name ||
      !studentId ||
      !email ||
      !password ||
      !classId ||
       !year ||
      !section
    ) {
      alert("Please fill all details including section");
      return;
    }


    try {
      setLoading(true);


      const response = await fetch(
        "http://localhost:5000/api/student/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name,
            studentId,
            email,
            password,
            classId,
             year,
             className,
            section,
          }),
        }
      );


      const data = await response.json();

      console.log("REGISTER RESPONSE:", data);


      if (data.success) {
        alert("Registration Successful");
        navigate("/login");
      } else {
        alert(data.message || "Registration Failed");
      }


    } catch (error) {
      console.log(error);
      alert("Server Error");

    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="auth-page">

      <form
        className="auth-card"
        onSubmit={registerStudent}
      >

        <h1>👨‍🎓 Student Register</h1>

        <p>Create your account</p>


        <input
          type="text"
          placeholder="Student Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />


        <input
          type="text"
          placeholder="Student ID"
          value={studentId}
          onChange={(e)=>setStudentId(e.target.value)}
        />


        <input
          type="email"
          placeholder="Gmail"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />


        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />



        {/* CLASS */}

        <select
          value={classId}

          onChange={(e)=>{

            const value = e.target.value;

            setClassId(value);
            setSection("");


            if(value==="INTER-FIRST-YEAR"){
              setClassName("1st PUC");
              setYear("1");
            }

            else if(value==="INTER-SECOND-YEAR"){
              setClassName("2nd PUC");
              setYear("2");
            }

            else{
              setClassName("");
               setYear("");
            }

          }}

        >

          <option value="">
            Select Class
          </option>

          <option value="INTER-FIRST-YEAR">
            1st PUC
          </option>


          <option value="INTER-SECOND-YEAR">
            2nd PUC
          </option>

        </select>



        {/* SECTION */}

        {
          classId && (

            <select
              value={section}

              onChange={(e)=>setSection(e.target.value)}

            >

              <option value="">
                Select Section
              </option>


              {
                getSections().map((sec)=>(

                  <option
                    key={sec}
                    value={sec}
                  >
                    {sec}
                  </option>

                ))
              }


            </select>

          )
        }



        <button
          type="submit"
          disabled={loading}
        >

          {
            loading
            ? "Registering..."
            : "Register"
          }

        </button>



        <p>
          Already have account?

          <span
            onClick={()=>navigate("/login")}
            style={{
              cursor:"pointer",
              color:"blue",
              marginLeft:"5px"
            }}
          >
            Login Here
          </span>

        </p>


      </form>

    </div>
  );
}
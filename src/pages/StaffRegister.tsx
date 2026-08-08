import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./StaffRegister.css";

export default function StaffRegister() {

  const navigate = useNavigate();


  const [name,setName] = useState("");
  const [mobile,setMobile] = useState("");
  const [email,setEmail] = useState("");

  const [department,setDepartment] = useState("");
  const [deptSearch,setDeptSearch] = useState("");
  const [showDeptList,setShowDeptList] = useState(false);


  const [role,setRole] = useState("mentor");
  const [roleSearch,setRoleSearch] = useState("Mentor");
  const [showRoleList,setShowRoleList] = useState(false);


  const [classId,setClassId] = useState("");
  const [section,setSection] = useState("");

  const [loading,setLoading] = useState(false);
  const [message,setMessage] = useState("");



  const deptRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);



  const departmentsList = [
     "Kannada",
     "English",
      "Hindi",
    "Biology",
         "Chemistry",
           "Physics",
               "Mathematics",
       "Computer Science",
    "Physical Education (PET)"

  ];



  const rolesList = [
     "Head",
    "Mentor",
    "PET",
    "Parent"
  ];



  const getSections = () => {


    if(classId==="INTER-FIRST-YEAR"){

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
        "J10"
      ];

    }


    if(classId==="INTER-SECOND-YEAR"){

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
        "S10"

      ];

    }


    return [];

  };




  const filteredDepartments =
  departmentsList.filter((dept)=>
    dept.toLowerCase()
    .includes(
      deptSearch.toLowerCase()
    )
  );



  const filteredRoles =
  rolesList.filter((r)=>
    r.toLowerCase()
    .includes(
      roleSearch.toLowerCase()
    )
  );





  useEffect(()=>{


    const close = (event:MouseEvent)=>{


      if(
        deptRef.current &&
        !deptRef.current.contains(event.target as Node)
      ){

        setShowDeptList(false);

      }



      if(
        roleRef.current &&
        !roleRef.current.contains(event.target as Node)
      ){

        setShowRoleList(false);

      }

    };


    document.addEventListener(
      "mousedown",
      close
    );


    return()=>{

      document.removeEventListener(
        "mousedown",
        close
      );

    };


  },[]);





  const registerStaff = async(
    e:React.FormEvent
  )=>{


    e.preventDefault();


    const isMentor =
    role.toLowerCase()==="mentor";



    if(
      !name ||
      !email ||
      !mobile ||
      !role ||
      (
        isMentor &&
        (
          !department ||
          !classId ||
          !section
        )
      )
    ){

      setMessage(
        "Please fill all fields"
      );

      return;

    }




    try{


      setLoading(true);



      const response =
      await fetch(
        "http://localhost:5000/api/staff/register",
        {

          method:"POST",

          headers:{
            "Content-Type":"application/json"
          },


          body:JSON.stringify({

            name,

            mobile,

            email,


            department:
            isMentor
            ? department
            : "",


            role:
            role.toLowerCase(),


            classId:
            isMentor
            ? classId
            : "",


            section:
            isMentor
            ? section
            : ""

          })

        }
      );




      const data =
      await response.json();




      if(data.success){


        setMessage(
          "Registration sent. Wait for Head approval."
        );


        setTimeout(()=>{

          navigate("/teacher/login");

        },2000);


      }

      else{


        setMessage(
          data.message ||
          "Registration failed"
        );

      }



    }

    catch(error){

      console.log(error);

      setMessage(
        "Server Error"
      );

    }

    finally{

      setLoading(false);

    }


  };







return (

<div className="staff-register-page">


<form
className="staff-register-card"
onSubmit={registerStaff}
>


<h1>
Staff Registration
</h1>


<p>
Faculty Access Registration
</p>



<input
type="text"
placeholder="Full Name"
value={name}
onChange={(e)=>setName(e.target.value)}
/>



<input
type="email"
placeholder="Gmail Address"
value={email}
onChange={(e)=>setEmail(e.target.value)}
/>



<input
type="text"
placeholder="Mobile Number"
value={mobile}
onChange={(e)=>setMobile(e.target.value)}
/>





<div
className="searchable-dropdown-container"
ref={roleRef}
>


<input

type="text"

value={roleSearch}

placeholder="Select Role"

onFocus={()=>
setShowRoleList(true)
}

onChange={(e)=>{

setRoleSearch(e.target.value);

setRole(e.target.value);

setShowRoleList(true);

}}

/>


{
showRoleList &&

<div className="dropdown-list">

{
filteredRoles.map((r)=>(

<div

className="dropdown-item"

key={r}

onClick={()=>{

setRole(
r.toLowerCase()
);

setRoleSearch(r);

setShowRoleList(false);

}}

>

{r}

</div>

))
}

</div>

}


</div>





{
role==="mentor" &&

<>


<select

value={classId}

onChange={(e)=>{

setClassId(e.target.value);

setSection("");

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





<div
className="searchable-dropdown-container"
ref={deptRef}
>


<input

type="text"

placeholder="Select Department"

value={deptSearch}

onFocus={()=>
setShowDeptList(true)
}

onChange={(e)=>{

setDeptSearch(e.target.value);

setDepartment(e.target.value);

setShowDeptList(true);

}}

/>



{
showDeptList &&

<div className="dropdown-list">


{
filteredDepartments.map((d)=>(


<div

key={d}

className="dropdown-item"

onClick={()=>{

setDepartment(d);

setDeptSearch(d);

setShowDeptList(false);

}}

>

{d}

</div>


))
}


</div>

}


</div>





<select

value={section}

onChange={(e)=>
setSection(e.target.value)
}

>

<option value="">
Choose Section
</option>


{
getSections().map((s)=>(

<option
key={s}
value={s}
>

{s}

</option>

))
}


</select>


</>

}





{
message &&
<p>
{message}
</p>
}



<button disabled={loading}>

{
loading
?
"Submitting..."
:
"Register"
}

</button>


</form>


</div>

);


}
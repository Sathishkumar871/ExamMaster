import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./MentorDashboard.css";


interface Student {

  studentId:string;

  name:string;

  className:string;

  section:string;

  classId?:string;

}



export default function MentorDashboard(){


const [students,setStudents] = 
useState<Student[]>([]);


const [mentor,setMentor] =
useState<any>({});


const [search,setSearch] =
useState("");



const navigate = useNavigate();




// STAFF TOKEN

const token =
localStorage.getItem("staffToken");





// ======================================
// GET MENTOR SECTION STUDENTS
// ======================================

const getStudents = async()=>{


try{


if(!token){

console.log(
"Staff Token not found"
);

return;

}




const response = await axios.get(


"http://localhost:5000/api/mentor/dashboard",


{


headers:{


Authorization:

`Bearer ${token}`


}


}


);





console.log(
"Mentor Dashboard Response:",
response.data
);






setMentor(

response.data.mentor || {}

);





let data =

response.data.students || [];







data.sort(

(a:Student,b:Student)=>

a.name.localeCompare(
b.name
)

);







setStudents(data);





}

catch(error:any){


console.log(

"Mentor Dashboard Error:",

error.response?.data ||
error.message

);


}


};







useEffect(()=>{


getStudents();


},[]);









// ======================================
// SEARCH STUDENTS
// ======================================


const filteredStudents =

students.filter((student)=>


student.name

.toLowerCase()

.includes(

search.toLowerCase()

)


);









return(



<div className="mentor-container">






{/* HEADER */}



<div className="mentor-header">


<h1>

👨‍🏫

{mentor.name ||

"Mentor Dashboard"

}

</h1>




<p>

📚 Section:

{

mentor.section ||

"N/A"

}

</p>




<p>

👥 Total Students:

{

students.length

}

</p>



</div>









{/* SEARCH */}



<div className="mentor-search-box">


<input


type="text"


placeholder="Search Student Name"


value={search}


onChange={(e)=>

setSearch(
e.target.value
)

}


/>


</div>









<h2>

My Section Students

</h2>









<div className="mentor-student-grid">





{

filteredStudents.length===0 ?



(


<h3>

No Students Found

</h3>


)





:






filteredStudents.map((student)=>(




<div


key={student.studentId}


className="mentor-student-card"



onClick={()=>


navigate(

`/mentor/student/${student.studentId}`

)


}



>




<h3>

👤 {student.name}

</h3>





<p>

🆔 Student ID:

{student.studentId}

</p>





<p>

🏫 Class:

{student.className}

</p>





<p>

📌 Section:

{student.section}

</p>








<button>


View Profile


</button>





</div>




))


}






</div>







</div>



);



}
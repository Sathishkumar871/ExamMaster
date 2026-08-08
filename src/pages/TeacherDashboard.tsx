import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherDashboard.css";


interface Student {

  studentId:string;

  name:string;

  className:string;

  totalExams:number;

  average:number;

  highestMarks:number;

  correctAnswers:number;

  wrongAnswers:number;

  pass:number;

  fail:number;

}



interface Staff {

  _id:string;

  name:string;

  mobile:string;

  role:string;

  department?:string;

  section?:string;

}



export default function TeacherDashboard(){


const navigate = useNavigate();



const [students,setStudents] =
useState<Student[]>([]);


const [pendingStaff,setPendingStaff] =
useState<Staff[]>([]);



const [loading,setLoading] =
useState(true);


const [search,setSearch] =
useState("");



const teacher =
JSON.parse(
localStorage.getItem("teacher") || "{}"
);



const staff =
JSON.parse(
localStorage.getItem("staff") || "{}"
);




// ==============================
// LOAD DATA
// ==============================

useEffect(()=>{

fetchStudents();

loadPendingStaff();


},[]);





// ==============================
// STUDENTS
// ==============================
const fetchStudents = async()=>{

try{

const token =
localStorage.getItem("teacherToken");


console.log(
"Teacher Token:",
token
);


if(!token){

console.log(
"Token not found"
);

return;

}


const response =
await fetch(

"https://exammaster-backend-up1y.onrender.com/api/teacher/students",

{
headers:{

"Content-Type":"application/json",

Authorization:
`Bearer ${token}`

}

}

);



const data =
await response.json();


console.log(
"Students Response:",
data
);



if(data.success){

setStudents(
data.students || []
);

}
else{

console.log(
data.message
);

}


}

catch(error){

console.log(
error
);

}

finally{

setLoading(false);

}

};





// ==============================
// STAFF APPROVAL
// ==============================


const loadPendingStaff = async()=>{


try{


const response =
await fetch(

"https://exammaster-backend-up1y.onrender.com/api/head/pending-staff",

{

headers:{

Authorization:

`Bearer ${
localStorage.getItem("staffToken")
}`

}

}

);



const data =
await response.json();



if(data.success){

setPendingStaff(
data.staff || []
);

}


}

catch(error){

console.log(error);

}


};







const approveStaff =
async(id:string)=>{


try{


await fetch(

`https://exammaster-backend-up1y.onrender.com/api/head/approve/${id}`,

{

method:"PUT",

headers:{

Authorization:

`Bearer ${
localStorage.getItem("staffToken")
}`

}

}

);



loadPendingStaff();


}

catch(error){

console.log(error);

}


};








const rejectStaff =
async(id:string)=>{


try{


await fetch(

`https://exammaster-backend-up1y.onrender.com/api/head/reject/${id}`,

{

method:"DELETE",

headers:{

Authorization:

`Bearer ${
localStorage.getItem("staffToken")
}`

}

}

);



loadPendingStaff();


}

catch(error){

console.log(error);

}


};







const filteredStudents =
students.filter((student)=>

student.name
.toLowerCase()
.includes(
search.toLowerCase()
)

);






if(loading){

return(

<div className="teacher-loading">

Loading Dashboard...

</div>

);

}







return(


<div className="teacher-container">





{/* HEADER */}


<div className="teacher-header">


<h1>

👨‍🏫 
{
teacher.name ||
staff.name ||
"Teacher"
}

</h1>



<p>

Class:
{
teacher.className ||
"N/A"
}

</p>



<p>

Subject:
{
teacher.subject ||
"N/A"
}

</p>


</div>








{/* BUTTONS */}


<div className="teacher-actions">



<button
className="question-btn"
onClick={()=>
navigate("/teacher/questions")
}
>

📚 Question Bank

</button>





<button
className="create-exam-btn"
onClick={()=>
navigate("/teacher/exams/create")
}
>

➕ Create Exam

</button>





<button
className="complaint-btn"
onClick={()=>
navigate("/teacher/complaints")
}
>

📢 Student Complaints & Needs

</button>





<button
className="student-btn"
onClick={()=>
navigate("/teacher/students")
}
>

👥 Student Mentoring Reports

</button>





<button
className="result-btn"
onClick={()=>
navigate("/teacher/results")
}
>

📊 Results

</button>



</div>








{/* STAFF APPROVAL */}


{

staff.role === "head" &&


<div className="head-card">


<h2>

👥 Staff Approval

</h2>



{

pendingStaff.length===0 ?


<p>
No Pending Requests
</p>


:


pendingStaff.map((item)=>(


<div
key={item._id}
className="staff-request"
>


<h3>

{item.name}

</h3>


<p>
Role: {item.role}
</p>


<p>
Mobile: {item.mobile}
</p>


<p>
Department:
{item.department || "N/A"}
</p>


<p>
Section:
{item.section || "N/A"}
</p>





<button
onClick={()=>
approveStaff(item._id)
}
>

Accept

</button>





<button
onClick={()=>
rejectStaff(item._id)
}
>

Reject

</button>



</div>


))


}



</div>


}










{/* SEARCH */}


<div className="search-box">


<input

placeholder="Search Student..."

value={search}

onChange={(e)=>
setSearch(e.target.value)
}

/>


</div>










{/* STUDENTS */}



<div className="student-grid">


{

filteredStudents.length===0 ?


<div>

<h2>
No Students Found
</h2>


</div>


:


filteredStudents.map((student)=>(


<div

className="student-card"

key={student.studentId}

>


<h2>

👤 {student.name}

</h2>



<p>

🆔 Student ID:
{student.studentId}

</p>



<p>

🏫 Class:
{student.className}

</p>



<hr/>





<div className="performance">


<p>
📝 Exams:
{student.totalExams}
</p>



<p>
📊 Average:
{student.average}%
</p>



<p>
🏆 Highest:
{student.highestMarks}
</p>



<p>
✅ Pass:
{student.pass}
</p>



<p>
❌ Fail:
{student.fail}
</p>



<p>
✔ Correct:
{student.correctAnswers}
</p>



<p>
✖ Wrong:
{student.wrongAnswers}
</p>



</div>



</div>


))


}



</div>






</div>


);


}
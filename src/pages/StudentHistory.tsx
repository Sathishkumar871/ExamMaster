import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";


export default function StudentHistory(){


  const { studentId } = useParams();

  const navigate = useNavigate();


  const [student,setStudent] = useState<any>(null);

  const [results,setResults] = useState<any[]>([]);


  const token =
  localStorage.getItem("token");




  const getStudentHistory = async()=>{

    try{


      const res = await axios.get(

        `https://exammaster-backend-up1y.onrender.com/api/mentor/student/${studentId}`,

        {
          headers:{
            Authorization:
            `Bearer ${token}`
          }
        }

      );


      setStudent(
        res.data.student
      );


      setResults(
        res.data.results || []
      );


    }
    catch(error){

      console.log(
        "History Error",
        error
      );

    }

  };




  useEffect(()=>{

    getStudentHistory();

  },[]);





  if(!student){

    return (

      <h2>
        Loading Student Data...
      </h2>

    );

  }





  const average =

  results.length > 0

  ?

  (

    results.reduce(

      (sum:any,item:any)=>

      sum + (item.percentage || 0),

      0

    )

    /

    results.length

  ).toFixed(2)

  :

  0;







return(


<div>



<h1>
Student History
</h1>



<hr/>



{/* STUDENT DETAILS */}

<div>


<h2>
{student.name}
</h2>


<p>
Student ID : {student.studentId}
</p>


<p>
Class : {student.className}
</p>


<p>
Section : {student.section}
</p>


</div>




<hr/>





{/* PROGRESS CARD */}


<h2>
Progress Card
</h2>


<div>


<p>
Total Exams :
{results.length}
</p>



<p>
Average :
{average} %
</p>


<p>
Total Marks :

{

results.reduce(

(sum:any,item:any)=>

sum + (item.marks || 0),

0

)

}

</p>


</div>






<hr/>





{/* RESULTS */}


<h2>
Exam Results
</h2>



{

results.length === 0

?

<h3>
No Results Found
</h3>


:

results.map((result,index)=>(


<div

key={index}

>


<p>
Exam :
{result.examName}
</p>


<p>
Marks :
{result.marks}
</p>


<p>
Percentage :
{result.percentage}%
</p>



<hr/>


</div>


))


}







<hr/>







{/* MENTOR EVALUATION BUTTONS */}


<h2>
Mentor Evaluation
</h2>



<button

onClick={()=>


navigate(

`/mentor/evaluation/${student.studentId}/health`

)

}

>

Health & Wellbeing

</button>





<button

onClick={()=>


navigate(

`/mentor/evaluation/${student.studentId}/food`

)

}

>

Food & Nutrition

</button>





<button

onClick={()=>


navigate(

`/mentor/evaluation/${student.studentId}/hostel`

)

}

>

Hostel

</button>





<button

onClick={()=>


navigate(

`/mentor/evaluation/${student.studentId}/academic`

)

}

>

Academics

</button>





<button

onClick={()=>


navigate(

`/mentor/evaluation/${student.studentId}/action`

)

}

>

Mentor Action Plan

</button>





</div>


);


}
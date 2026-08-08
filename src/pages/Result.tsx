import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Result.css";


interface Review {

questionId:string;

question:string;

selectedAnswer:string;

correctAnswer:string;

isCorrect:boolean;

}



interface ResultData {


examName:string;

subject:string;

totalQuestions:number;

attemptedQuestions:number;

unansweredQuestions:number;

correctAnswers:number;

wrongAnswers:number;

marks:number;

percentage:number;

grade:string;

status:string;

timeTaken:number;

warnings:number;

review:Review[];

}




export default function Result(){



const navigate = useNavigate();


const { id } = useParams();




const [loading,setLoading]=useState(true);


const [result,setResult]=

useState<ResultData | null>(null);








useEffect(()=>{


fetchResult();


},[]);








const fetchResult = async()=>{


try{



const response = await fetch(

`https://exammaster-backend-up1y.onrender.com/api/result/${id}`

);





const data =
await response.json();






if(data.success){


setResult(data.result);


}



}

catch(error){


console.log(error);


}

finally{


setLoading(false);


}



};









if(loading){


return(

<div className="loading">

Loading Result...

</div>

);


}








if(!result){


return(

<div className="loading">

Result Not Found

</div>

);


}








return(



<div className="result-container">





<div className="result-card">





<h1>

🎉 Exam Completed

</h1>






<h2>

{result.examName}

</h2>





<p>

Subject :

<strong>

{result.subject}

</strong>

</p>









<div className="score-box">



<div>

<h3>

Marks

</h3>

<p>

{result.marks}

</p>

</div>







<div>

<h3>

Percentage

</h3>

<p>

{result.percentage}%

</p>

</div>








<div>

<h3>

Grade

</h3>

<p>

{result.grade}

</p>

</div>






</div>









<div className="result-grid">



<div className="result-item">

<h4>

✅ Correct

</h4>

<p>

{result.correctAnswers}

</p>

</div>






<div className="result-item">

<h4>

❌ Wrong

</h4>

<p>

{result.wrongAnswers}

</p>

</div>







<div className="result-item">

<h4>

📝 Attempted

</h4>

<p>

{result.attemptedQuestions}

</p>

</div>







<div className="result-item">

<h4>

📄 Skipped

</h4>

<p>

{result.unansweredQuestions}

</p>

</div>







<div className="result-item">

<h4>

⏱ Time

</h4>

<p>

{result.timeTaken} sec

</p>

</div>






<div className="result-item">

<h4>

⚠ Warnings

</h4>

<p>

{result.warnings}

</p>

</div>






</div>









<div

className={

result.status==="PASS"

?

"status pass"

:

"status fail"

}

>


{result.status}


</div>









<div className="button-group">



<button

className="profile-btn"

onClick={()=>navigate("/profile")}

>

👤 My Profile

</button>







<button

className="review-btn"

onClick={()=>navigate(`/review/${id}`)}

>

📖 Review Answers

</button>







<button

className="dashboard-btn"

onClick={()=>navigate("/")}

>

🏠 Dashboard

</button>






</div>









</div>





</div>



);


}
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Review.css";


interface ReviewData {

question:string;

selectedAnswer:string;

correctAnswer:string;

isCorrect:boolean;

explanation?:string;

}




export default function Review(){



const { id } = useParams();



const [reviews,setReviews] =

useState<ReviewData[]>([]);



const [loading,setLoading] =

useState(true);








useEffect(()=>{


fetchReview();


},[]);








const fetchReview = async()=>{


try{



const response = await fetch(

`https://exammaster-backend-up1y.onrender.com/api/result/${id}`

);





const data = await response.json();





if(data.success){


setReviews(

data.result.review

);


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

<h2>

Loading Review...

</h2>

);


}









return(



<div className="review-page">





<h1>

📖 Answer Review

</h1>







{

reviews.length === 0 ?



<h2>

No Review Available

</h2>



:

reviews.map((item,index)=>(



<div

className={

item.isCorrect

?

"review-card correct"

:

"review-card wrong"

}

key={index}

>





<h3>

Q{index+1}. {item.question}

</h3>







<p>

Your Answer :

<span>

{item.selectedAnswer}

</span>

</p>







<p>

Correct Answer :

<span>

{item.correctAnswer}

</span>

</p>








<h4>

{

item.isCorrect

?

"✅ Correct"

:

"❌ Wrong"

}

</h4>








{

item.explanation &&

<p className="explanation">

💡 Explanation:

<br/>

{item.explanation}

</p>

}





</div>



))


}





</div>



);



}
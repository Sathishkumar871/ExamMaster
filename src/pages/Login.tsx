import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  loginStudent
} from "../services/api";

import "./Auth.css";



export default function Login(){


const navigate = useNavigate();



const [email,setEmail] = useState("");

const [password,setPassword] = useState("");





const submit = async(e:any)=>{


e.preventDefault();



try{


const data = await loginStudent({

email,

password

});





console.log(
"LOGIN RESPONSE:",
data
);





if(data.success && data.token){



// Save Token

localStorage.setItem(

"token",

data.token

);





// Save Student Data

localStorage.setItem(

"student",

JSON.stringify(

data.student

)

);






// Save Student ID

localStorage.setItem(

"studentId",

data.student.studentId

);







navigate("/dashboard");



}

else{


alert(

data.message || "Login Failed"

);


}



}

catch(error){


console.log(error);


alert(
"Login Error"
);


}



};







return(


<div className="auth-page">



<form

className="auth-card"

onSubmit={submit}

>



<h1>

Student Login

</h1>







<input

type="email"

placeholder="Gmail"

value={email}

onChange={(e)=>

setEmail(e.target.value)

}

/>







<input

type="password"

placeholder="Password"

value={password}

onChange={(e)=>

setPassword(e.target.value)

}

/>








<button type="submit">

Login

</button>






<p>

New Student?

{" "}

<span

onClick={()=>navigate("/student/register")}

style={{
cursor:"pointer"
}}

>

Register

</span>


</p>







</form>



</div>


);


}
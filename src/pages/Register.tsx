import {useState} from "react";
import {useNavigate} from "react-router-dom";

import {
 registerStudent
}
from "../services/api";


import "./Auth.css";



export default function Register(){


const navigate = useNavigate();



const [form,setForm]=useState({

name:"",

email:"",

password:"",

classId:"",

className:""

});






const handleChange=(e:any)=>{


setForm({

...form,

[e.target.name]:e.target.value

});


};








const submit=async(e:any)=>{


e.preventDefault();





try{


const data = await registerStudent(form);




alert(data.message);





if(data.success){


navigate("/login");


}



}

catch(error){


console.log(error);


alert(
"Register Error"
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

Create Account

</h1>







<input

name="name"

placeholder="Full Name"

value={form.name}

onChange={handleChange}

/>








<input

name="email"

type="email"

placeholder="Gmail"

value={form.email}

onChange={handleChange}

/>








<input

name="password"

type="password"

placeholder="Password"

value={form.password}

onChange={handleChange}

/>










<select

name="classId"

value={form.classId}

onChange={(e)=>{


const value = e.target.value;


const text =

e.target.options[
e.target.selectedIndex
].text;



setForm({

...form,

classId:value,

className:text

});


}}

>


<option value="">

Select Class

</option>




<option value="INTER-FIRST-YEAR">

Inter First Year

</option>





<option value="INTER-SECOND-YEAR">

Inter Second Year

</option>



</select>










<button type="submit">

Register

</button>








</form>



</div>


);


}
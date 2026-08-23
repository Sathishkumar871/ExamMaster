import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Building2,
  Home,
  Users,
  Sparkles,
  Droplets,
  Utensils,
  ShieldCheck,
  BookOpen,
  FileText,
  Calendar,
  ArrowRight,
  Loader2,
  CheckCircle2
} from "lucide-react";

import "./Evaluation.css";


export default function HostelEvaluation(){

const {studentId}=useParams();

const navigate=useNavigate();


const token=localStorage.getItem("staffToken");


const [loading,setLoading]=useState(false);



const currentDate =
new Date().toISOString().split("T")[0];





const [hostelData,setHostelData]=useState({

hostelAdjustment:"",

roomEnvironment:"",

roommateRelationship:"",

cleanliness:"",

food:"",

water:"",

bathroom:"",

safety:"",

studyEnvironment:"",

complaints:[] as string[],

mentorRemarks:""

});







const updateField=(

key:string,

value:string

)=>{


setHostelData({

...hostelData,

[key]:value

});


};







const toggleComplaint=(item:string)=>{


if(hostelData.complaints.includes(item)){


setHostelData({

...hostelData,

complaints:

hostelData.complaints.filter(

(x)=>x!==item

)

});


}

else{


setHostelData({

...hostelData,

complaints:[

...hostelData.complaints,

item

]

});


}


};






const completedFields=[

hostelData.hostelAdjustment,

hostelData.roomEnvironment,

hostelData.roommateRelationship,

hostelData.cleanliness,
hostelData.food,
hostelData.water,
hostelData.safety

].filter(Boolean).length;



const saveHostel=async()=>{


try{


setLoading(true);



await axios.put(

"https://exammaster-backend-up1y.onrender.com/api/mentor/weekly-feedback",

{

studentId,

hostel:hostelData

},

{

headers:{

Authorization:

`Bearer ${token}`

}

}

);



navigate(

`/mentor/evaluation/${studentId}/academic`

);



}

catch(error:any){


console.log(

error.response?.data ||

error.message

);


alert("Hostel Update Failed");


}

finally{


setLoading(false);


}



};







return(

<div className="evaluation-page-wrapper">


<div className="evaluation-container">





{/* HEADER */}

<div className="evaluation-header">


<div className="header-left">


<div className="header-icon-wrapper">

<Building2 size={28}/>

</div>


<div>

<h1>
Hostel & Accommodation Evaluation
</h1>


<p className="sub-title">

Student ID:

<span>

{studentId}

</span>

</p>


</div>


</div>




<div className="header-right">


<div className="progress-pill">



{completedFields}/7 Completed

</div>



<div className="date-badge">

<Calendar size={14}/>

{currentDate}

</div>


</div>


</div>







{/* HOSTEL ADJUSTMENT */}

<div className="evaluation-card">


<h2>

<Home size={17}/>

 Hostel Adjustment

</h2>



<div className="option-grid">


{

[

"Very Comfortable",

"Comfortable",

"Adjusting",

"Difficult"

].map(item=>(


<button

key={item}

className={

hostelData.hostelAdjustment===item

?

"active-option"

:

"option"

}


onClick={()=>


updateField(

"hostelAdjustment",

item

)

}

>


{

hostelData.hostelAdjustment===item &&

<CheckCircle2 size={14}/>

}


{item}


</button>


))


}


</div>


</div>







{/* ROOM ENVIRONMENT */}


<div className="evaluation-card">


<h2>

<Building2 size={17}/>

 Room Environment

</h2>



<div className="option-grid">


{

[

"Excellent",

"Good",

"Average",

"Poor"

].map(item=>(


<button

key={item}

className={

hostelData.roomEnvironment===item

?

"active-option"

:

"option"

}


onClick={()=>


updateField(

"roomEnvironment",

item

)

}


>


{

hostelData.roomEnvironment===item &&

<CheckCircle2 size={14}/>

}


{item}


</button>


))


}


</div>


</div>
{/* ROOMMATE RELATIONSHIP */}

<div className="evaluation-card">


<h2>

<Users size={17}/>

 Roommate Relationship

</h2>


<div className="option-grid">


{

[

"Excellent",

"Good",

"Average",

"Poor"

].map(item=>(


<button

key={item}

className={

hostelData.roommateRelationship===item

?

"active-option"

:

"option"

}


onClick={()=>


updateField(

"roommateRelationship",

item

)

}


>


{

hostelData.roommateRelationship===item &&

<CheckCircle2 size={14}/>

}


{item}


</button>


))


}


</div>


</div>







{/* ROOM CLEANLINESS */}


<div className="evaluation-card">


<h2>

<Sparkles size={17}/>

 Room Cleanliness

</h2>



<div className="option-grid">


{

[

"Excellent",

"Good",

"Average",

"Poor"

].map(item=>(


<button

key={item}

className={

hostelData.cleanliness===item

?

"active-option"

:

"option"

}


onClick={()=>


updateField(

"cleanliness",

item

)

}


>


{

hostelData.cleanliness===item &&

<CheckCircle2 size={14}/>

}


{item}


</button>


))


}


</div>


</div>








{/* HOSTEL FOOD */}


<div className="evaluation-card">


<h2>

<Utensils size={17}/>

 Hostel Food Quality

</h2>



<div className="option-grid">


{

[

"Excellent",

"Good",

"Average",

"Poor"

].map(item=>(


<button

key={item}

className={

hostelData.food===item

?

"active-option"

:

"option"

}


onClick={()=>


updateField(

"food",

item

)

}


>


{

hostelData.food===item &&

<CheckCircle2 size={14}/>

}


{item}


</button>


))


}


</div>


</div>







{/* WATER QUALITY */}


<div className="evaluation-card">


<h2>

<Droplets size={17}/>

 Drinking Water

</h2>



<div className="option-grid">


{

[

"Excellent",

"Good",

"Average",

"Poor"

].map(item=>(


<button

key={item}

className={

hostelData.water===item

?

"active-option"

:

"option"

}


onClick={()=>


updateField(

"water",

item

)

}


>


{

hostelData.water===item &&

<CheckCircle2 size={14}/>

}


{item}


</button>


))


}


</div>


</div>








{/* BATHROOM HYGIENE */}


<div className="evaluation-card">


<h2>

<Sparkles size={17}/>

 Bathroom Hygiene

</h2>



<div className="option-grid">


{

[

"Excellent",

"Good",

"Average",

"Poor"

].map(item=>(


<button

key={item}

className={

hostelData.bathroom===item

?

"active-option"

:

"option"

}


onClick={()=>


updateField(

"bathroom",

item

)

}


>


{

hostelData.bathroom===item &&

<CheckCircle2 size={14}/>

}


{item}


</button>


))


}


</div>


</div>







{/* SAFETY */}


<div className="evaluation-card">


<h2>

<ShieldCheck size={17}/>

 Safety & Security

</h2>



<div className="option-grid">


{

[

"Excellent",

"Good",

"Average",

"Poor"

].map(item=>(


<button

key={item}

className={

hostelData.safety===item

?

"active-option"

:

"option"

}


onClick={()=>


updateField(

"safety",

item

)

}


>


{

hostelData.safety===item &&

<CheckCircle2 size={14}/>

}


{item}


</button>


))


}


</div>


</div>







{/* STUDY ENVIRONMENT */}


<div className="evaluation-card">


<h2>

<BookOpen size={17}/>

 Study Environment

</h2>



<div className="option-grid">


{

[

"Excellent",

"Good",

"Average",

"Poor"

].map(item=>(


<button

key={item}

className={

hostelData.studyEnvironment===item

?

"active-option"

:

"option"

}


onClick={()=>


updateField(

"studyEnvironment",

item

)

}


>


{

hostelData.studyEnvironment===item &&

<CheckCircle2 size={14}/>

}


{item}


</button>


))


}


</div>


</div>
{/* COMPLAINTS SECTION */}

<div className="evaluation-card full-width-card">


<h2>

<FileText size={17}/>

 Hostel Issues / Complaints

</h2>



<div className="complaint-grid">


{

[

"Water Supply ",

"Food Quality ",

"Room Cleaning ",

"Roommate ",

"Telephone ",

"No Complaints"

].map(item=>(


<label

key={item}

className="checkbox-item"

>


<input

type="checkbox"

checked={

hostelData.complaints.includes(item)

}


onChange={()=>


toggleComplaint(item)

}


/>


<span>

{item}

</span>


</label>


))


}


</div>


</div>









{/* MENTOR REMARKS */}


<div className="evaluation-card full-width-card">


<h2>

<FileText size={17}/>

 Mentor Remarks

</h2>



<textarea


placeholder="Write hostel observations, issues and suggestions..."

value={hostelData.mentorRemarks}


onChange={(e)=>

updateField(

"mentorRemarks",

e.target.value

)

}


/>


</div>









{/* ACTION BAR */}


<div className="sticky-action-bar">


<div className="action-bar-info">


<span>

Ready to continue?

</span>


<p>

Hostel evaluation will be saved in student progress card.

</p>


</div>





<button


className="save-btn"


disabled={loading}


onClick={saveHostel}


>


{

loading ?


<>

<Loader2

size={16}

className="animate-spin"

/>

Saving...

</>


:

<>

Save & Continue Academic

<ArrowRight size={16}/>

</>


}



</button>


</div>






</div>


</div>


);


}
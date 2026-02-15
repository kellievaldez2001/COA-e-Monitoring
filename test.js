
let users=[
{username:"admin",password:"1234",role:"admin"},
{username:"accounting",password:"1111",role:"unit"},
{username:"planning",password:"2222",role:"unit"},
{username:"construction",password:"3333",role:"unit"}
];

let reports=JSON.parse(localStorage.getItem("reports"))||[];
let messages=JSON.parse(localStorage.getItem("messages"))||[];
let audit=JSON.parse(localStorage.getItem("audit"))||[];

let currentUser="",role="";

function save(){
localStorage.setItem("reports",JSON.stringify(reports));
localStorage.setItem("messages",JSON.stringify(messages));
localStorage.setItem("audit",JSON.stringify(audit));
}

function logAction(text){
audit.push({text,date:new Date().toLocaleString()});
save();
}

function login(){
let u=document.getElementById("username").value;
let p=document.getElementById("password").value;
let found=users.find(x=>x.username===u && x.password===p);
if(found){
currentUser=u;
role=found.role;
document.getElementById("loginPage").style.display="none";
document.getElementById("dashboard").style.display="block";
document.getElementById("userLabel").innerText=currentUser;
if(role==="admin")document.getElementById("adminPanel").style.display="block";
render();
}else alert("Invalid login");
}

function logout(){location.reload();}

function addReport(){
let unit=prompt("Enter Unit (accounting/planning/construction)");
let date=prompt("Enter Due Date (YYYY-MM-DD)");
if(unit && date){
let today=new Date();
let due=new Date(date);
let status=today<=due?"On Time":"Late";
reports.push({unit,date,status,file:null});
logAction("Admin added report for "+unit);
save();
render();
}
}

function sendReminder(){
let unit=prompt("Enter Unit to remind:");
if(unit){
messages.push({to:unit,text:"Reminder: Please process your report immediately.",date:new Date().toLocaleString()});
logAction("Admin sent reminder to "+unit);
save();
render();
}
}

function submit(i){
reports[i].status="Submitted";
logAction(currentUser+" submitted report");
save();
render();
}

function uploadFile(i,input){
reports[i].file=input.files[0]?.name||null;
logAction(currentUser+" uploaded file "+reports[i].file);
save();
render();
}

function render(){
let table=document.getElementById("table");

table.innerHTML=`
<tr>
<th>Unit</th>
<th>Due Date</th>
<th>Status</th>
<th>Upload</th>
<th>Action</th>
</tr>`;

reports.forEach((r,i)=>{
if(role==="admin"||r.unit===currentUser){

let uploadCell = (role==="unit" && r.unit===currentUser)
? `<input type="file" onchange="uploadFile(${i},this)">`
: (r.file || "-");

let actionCell = (role==="unit" && r.unit===currentUser && r.status!=="Submitted")
? `<button onclick="submit(${i})">Submit</button>`
: "";

table.innerHTML+=`
<tr>
<td>${r.unit}</td>
<td>${r.date}</td>
<td class="${r.status==='Late'?'late':r.status==='On Time'?'on-time':'submitted'}">${r.status}</td>
<td>${uploadCell}</td>
<td>${actionCell}</td>
</tr>`;
}
});

renderInbox();
renderAudit();
updateNotif();
}

function renderInbox(){
let box=document.getElementById("inbox");
box.innerHTML="";
messages.filter(m=>m.to===currentUser).forEach(m=>{
box.innerHTML+=`<div class="message">${m.text}<br><small>${m.date}</small></div>`;
});
}

function renderAudit(){
let box=document.getElementById("auditLog");
box.innerHTML="";
audit.slice(-10).reverse().forEach(a=>{
box.innerHTML+=`<div class="audit">${a.text}<br><small>${a.date}</small></div>`;
});
}

function updateNotif(){
let count=messages.filter(m=>m.to===currentUser).length;
document.getElementById("notifCount").innerText=count;
}

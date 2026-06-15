/**
 * The hosted-form runtime — the *only* executable script the served page ships.
 *
 * It is intentionally CONSTANT: per-form data (conditional rules, the
 * conversational flag) is read from a non-executable
 * `<script type="application/json" data-sf-config>` island, so this script's
 * bytes never change and the runtime can publish a single stable
 * `script-src 'sha256-…'` CSP allowance for it.
 *
 * It is pure progressive enhancement. With scripts disabled the form is fully
 * usable: every question shows, native `required`/validation works, and submit
 * is a native POST. This script adds conditional reveal, conversational
 * stepping, step-level validation, and — when the form has a file question —
 * presigned attachment upload before submit (config arrives via the island's
 * `upload` block, so the script bytes stay constant for CSP hashing).
 *
 * No backticks or `${}` appear in the body so it survives being embedded in a
 * template literal verbatim.
 */
export const FORM_RUNTIME_SCRIPT = `(function(){"use strict";
var scope=document.querySelector(".sf-scope");if(!scope)return;
var form=scope.querySelector("form.sf-form");if(!form)return;
var dataEl=scope.querySelector("script[data-sf-config]");
var cfg={};try{cfg=JSON.parse((dataEl&&dataEl.textContent)||"{}")}catch(e){cfg={}}
var rules=cfg.showIf||{};var conv=!!cfg.conversational;
var fields=Array.prototype.slice.call(form.querySelectorAll(".sf-field"));
function fieldById(id){for(var i=0;i<fields.length;i++){if(fields[i].getAttribute("data-qid")===id)return fields[i]}return null}
function answerValue(qid){var f=fieldById(qid);if(!f)return null;
var boxes=f.querySelectorAll("input[type=checkbox]:checked");
if(boxes.length){var arr=[];for(var b=0;b<boxes.length;b++)arr.push(boxes[b].value);return arr.length>1?arr:arr[0]}
var radio=f.querySelector("input[type=radio]:checked");if(radio)return radio.value;
var input=f.querySelector("input,textarea,select");return input?input.value:null}
function cmp(op,a,b){var na=parseFloat(a),nb=parseFloat(b);var numeric=!isNaN(na)&&!isNaN(nb);
switch(op){case "eq":return String(a)===String(b);case "neq":return String(a)!==String(b);
case "gt":return numeric&&na>nb;case "lt":return numeric&&na<nb;case "gte":return numeric&&na>=nb;
case "lte":return numeric&&na<=nb;case "includes":return Array.isArray(a)?a.indexOf(String(b))>-1:String(a).indexOf(String(b))>-1;
default:return true}}
function visibleByRule(field){var qid=field.getAttribute("data-qid");var rule=rules[qid];if(!rule)return true;
var v=answerValue(rule.questionId);if(v==null||v==="")return false;return cmp(rule.op,v,rule.value)}
function setFieldShown(field,shown){field.hidden=!shown;
var ctrls=field.querySelectorAll("input,textarea,select");for(var i=0;i<ctrls.length;i++)ctrls[i].disabled=!shown}
var stepIndex=0,progressBar,countEl,backBtn,nextBtn,submitBtn;
function activeFields(){var out=[];for(var i=0;i<fields.length;i++)if(!fields[i].hidden)out.push(fields[i]);return out}
function layoutSteps(){var act=activeFields();if(stepIndex>=act.length)stepIndex=Math.max(0,act.length-1);
for(var i=0;i<act.length;i++){if(i===stepIndex)act[i].setAttribute("data-conv-active","");else act[i].removeAttribute("data-conv-active")}
var atLast=stepIndex>=act.length-1;
if(progressBar)progressBar.style.width=(act.length?((stepIndex+1)/act.length*100):0)+"%";
if(countEl)countEl.textContent=(stepIndex+1)+" / "+act.length;
if(backBtn)backBtn.style.visibility=stepIndex>0?"visible":"hidden";
if(nextBtn)nextBtn.style.display=atLast?"none":"inline-flex";
if(submitBtn)submitBtn.style.display=atLast?"inline-flex":"none";
var cur=act[stepIndex];if(cur){var fi=cur.querySelector("input,textarea,select");if(fi)try{fi.focus()}catch(e){}}}
function currentValid(){var act=activeFields(),cur=act[stepIndex];if(!cur)return true;
if(!requiredChecksValid(cur,true))return false;
var ctrls=cur.querySelectorAll("input,textarea,select");
for(var i=0;i<ctrls.length;i++){if(!ctrls[i].disabled&&!ctrls[i].checkValidity()){ctrls[i].reportValidity();return false}}return true}
function go(delta){if(delta>0&&!currentValid())return;var act=activeFields();
stepIndex=Math.min(Math.max(0,stepIndex+delta),Math.max(0,act.length-1));layoutSteps()}
function applyShowIf(){for(var i=0;i<fields.length;i++)setFieldShown(fields[i],visibleByRule(fields[i]));if(conv)layoutSteps()}
function requiredChecksValid(root,report){var groups=root.querySelectorAll("[data-required-checkbox]");for(var g=0;g<groups.length;g++){
var boxes=groups[g].querySelectorAll("input[type=checkbox]");if(!boxes.length)continue;var checked=false;
for(var b=0;b<boxes.length;b++){if(boxes[b].checked){checked=true;break}}
boxes[0].setCustomValidity(checked?"":"Please select at least one option.");if(!checked){if(report)boxes[0].reportValidity();return false}}return true}
function clearRequiredChecks(){var groups=form.querySelectorAll("[data-required-checkbox]");for(var g=0;g<groups.length;g++){
var boxes=groups[g].querySelectorAll("input[type=checkbox]");if(!boxes.length)continue;for(var b=0;b<boxes.length;b++){if(boxes[b].checked){boxes[0].setCustomValidity("");break}}}}
if(conv){scope.setAttribute("data-conv","");
var fieldsWrap=form.querySelector(".sf-fields"),actions=form.querySelector(".sf-actions");
var prog=document.createElement("div");prog.className="sf-conv-progress";
progressBar=document.createElement("span");prog.appendChild(progressBar);
if(fieldsWrap&&fieldsWrap.parentNode)fieldsWrap.parentNode.insertBefore(prog,fieldsWrap);
submitBtn=form.querySelector(".sf-submit");
backBtn=document.createElement("button");backBtn.type="button";backBtn.className="sf-submit sf-submit-outline sf-conv-back";backBtn.textContent="Back";
nextBtn=document.createElement("button");nextBtn.type="button";nextBtn.className="sf-submit";nextBtn.textContent="Next";
countEl=document.createElement("span");countEl.className="sf-conv-count";
if(actions){actions.insertBefore(backBtn,actions.firstChild);actions.appendChild(nextBtn);actions.appendChild(countEl)}
backBtn.addEventListener("click",function(){go(-1)});
nextBtn.addEventListener("click",function(){go(1)});
form.addEventListener("keydown",function(e){if(e.key==="Enter"&&e.target&&e.target.tagName!=="TEXTAREA"){var act=activeFields();if(stepIndex<act.length-1){e.preventDefault();go(1)}}})}
form.addEventListener("input",function(){clearRequiredChecks();applyShowIf()});form.addEventListener("change",function(){clearRequiredChecks();applyShowIf()});
applyShowIf();if(conv)layoutSteps();
var up=cfg.upload;
function addHidden(name,val){var h=document.createElement("input");h.type="hidden";h.name=name;h.value=val;form.appendChild(h)}
function qidOf(input){var m=(input.name||"").match(/^answers\\[(.+)\\]$/);return m?m[1]:input.id}
function statusEl(input){var f=input.closest?input.closest(".sf-field"):null;return f?f.querySelector("[data-sf-file-status]"):null}
function setStatus(input,msg,err){var s=statusEl(input);if(!s)return;if(msg){s.hidden=false;s.textContent=msg;if(err)s.setAttribute("data-error","1");else s.removeAttribute("data-error")}else{s.hidden=true;s.textContent=""}}
function pendingFiles(){var all=form.querySelectorAll("input[type=file]");var out=[];for(var i=0;i<all.length;i++){var fi=all[i];if(!fi.disabled&&fi.files&&fi.files.length>0)out.push(fi)}return out}
function uploadOne(input){var file=input.files[0];
if(up.maxBytes&&file.size>up.maxBytes){return Promise.reject(new Error("too-large"))}
setStatus(input,"Uploading "+(file.name||"file")+"\\u2026",false);
return fetch(up.url,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({contentType:file.type||"application/octet-stream",byteSize:file.size})})
.then(function(r){if(!r.ok)throw new Error("intent");return r.json()})
.then(function(intent){if(!intent||!intent.uploadUrl||!intent.assetId)throw new Error("intent");
return fetch(intent.uploadUrl,{method:"PUT",headers:intent.requiredHeaders||{},body:file}).then(function(pr){if(!pr.ok)throw new Error("put");return intent.assetId})})
.then(function(assetId){var qid=qidOf(input);addHidden("answers["+qid+"]",assetId);addHidden("mediaAssetIds[]",assetId);input.disabled=true;setStatus(input,(file.name||"File")+" attached",false)})
.catch(function(e){setStatus(input,e&&e.message==="too-large"?"This file is too large.":"Upload failed \\u2014 please try again.",true);throw e})}
form.addEventListener("submit",function(e){if(!requiredChecksValid(form,true))e.preventDefault()});
if(up&&up.url){var submitBtn2=form.querySelector("button[type=submit]");
form.addEventListener("submit",function(e){
if(e.defaultPrevented)return;
var list=pendingFiles();if(!list.length)return;
e.preventDefault();
if(form.getAttribute("data-sf-uploading")==="1")return;
form.setAttribute("data-sf-uploading","1");
if(submitBtn2)submitBtn2.disabled=true;
var chain=Promise.resolve();
for(var i=0;i<list.length;i++){(function(inp){chain=chain.then(function(){return uploadOne(inp)})})(list[i])}
chain.then(function(){if(submitBtn2)submitBtn2.disabled=false;form.removeAttribute("data-sf-uploading");form.submit()})
.catch(function(){if(submitBtn2)submitBtn2.disabled=false;form.removeAttribute("data-sf-uploading")})})}
})();`;

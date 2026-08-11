export const questions=[
 {q:'When starting an improvement project, how confident are you in defining a clear measure linked to the improvement aim?',o:['Not yet confident','Somewhat confident','Confident and can do this independently']},
 {q:'Can you distinguish outcome, process and balancing measures in a practical healthcare example?',o:['Not reliably','With some support','Yes, reliably']},
 {q:'Can you construct and correctly label a basic run chart from time-ordered data?',o:['Not yet','With guidance','Yes, independently']},
 {q:'Can you interpret common non-random signals in a run chart without treating every rise or fall as meaningful?',o:['Not yet','Partly','Yes']},
 {q:'Can you create an operational definition that different staff members would measure consistently?',o:['Not yet','With support','Yes']},
 {q:'When faced with a quality problem, can you decide what data to collect before choosing an analytical or QI tool?',o:['Usually not','Sometimes','Usually yes']},
 {q:'Do you have a real healthcare quality or patient-safety problem you could use for applied practice?',o:['Not currently','Possibly','Yes']},
 {q:'How comfortable are you moving from data display to an improvement decision or next test of change?',o:['Not comfortable yet','Somewhat comfortable','Comfortable']}
];
export function renderQuestions(host){host.innerHTML=questions.map((x,i)=>`<div class="question"><div class="question-title">${i+1}. ${x.q}</div><div class="options">${x.o.map((o,j)=>`<label class="option"><input type="radio" name="q${i}" value="${j}" required><span>${o}</span></label>`).join('')}</div></div>`).join('')}
export function answersFromForm(form){return questions.map((_,i)=>Number(new FormData(form).get(`q${i}`)))}
export const routeCopy={
 part2:{tag:'Part 2 pathway',title:'Part 2 is the recommended next step',body:'You have completed Part 1 and your responses suggest enough foundation to continue. Any weaker areas can be handled through targeted refreshers rather than blocking progression.',cta:'Register Part 2 interest',route:'enrol'},
 alumni_refresher:{tag:'Supported progression',title:'Refresher + Part 2 pathway',body:'You are already a Part 1 graduate. A few foundational areas should be refreshed before or alongside Part 2. This is a support route, not a rejection.',cta:'Register Part 2 interest',route:'enrol'},
 equivalency:{tag:'Direct-entry review',title:'Your existing foundation may be equivalent',body:'You did not attend DFQI Part 1, but your responses suggest enough foundational capability to be considered for Part 2 through an equivalency review or short proof task.',cta:'Request direct-entry review',route:'lead'},
 foundation_bridge:{tag:'Foundation Bridge',title:'Close a few gaps, then progress',body:'You appear to have some prerequisite capability, but a short preparatory Bridge is likely to make Part 2 more useful and reduce the risk of being left behind.',cta:'Join the Foundation Bridge',route:'bridge'},
 part1:{tag:'Foundation first',title:'Build the full foundation, then return to Part 2',body:'Your Part 2 interest is still valuable. The best next step is DFQI Part 1; once the foundation is completed, the system can bring you back into the Part 2 pathway.',cta:'Join the Part 1 pathway',route:'bridge'}
};

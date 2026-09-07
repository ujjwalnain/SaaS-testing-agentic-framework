import {checkOrigin,fail,getRun,saveRun} from '@/lib/storage';
import {auditStep} from '@/lib/audit';
import {event} from '@/lib/model';
export async function POST(r:Request,{params}:{params:Promise<{id:string}>}){try{checkOrigin(r);const run=await getRun((await params).id);if(!run)return Response.json({error:'Run not found'},{status:404});if(run.mode!=='audit')throw new Error('This run uses a browser agent.');if(run.status!=='Running')return Response.json({run});const revision=run.revision;try{await auditStep(run)}catch(e){run.status='Failed';run.error=e instanceof Error?e.message:'The scan failed.';run.events.push(event('Audit stopped',run.error,'error'))}await saveRun(run,revision);return Response.json({run})}catch(e){return fail(e)}}

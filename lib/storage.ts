import { env } from 'cloudflare:workers';
import type { Run } from './model';
export async function listRuns():Promise<Run[]>{const r=await env.DB.prepare('SELECT data FROM runs ORDER BY updated_at DESC LIMIT 100').all<{data:string}>();return r.results.map(x=>JSON.parse(x.data));}
export async function getRun(id:string):Promise<Run|null>{const r=await env.DB.prepare('SELECT data FROM runs WHERE id = ?').bind(id).first<{data:string}>();return r?JSON.parse(r.data):null;}
export async function insertRun(run:Run){await env.DB.prepare('INSERT INTO runs (id, data, updated_at, revision) VALUES (?, ?, ?, 0)').bind(run.id,JSON.stringify(run),run.updatedAt).run();}
export async function saveRun(run:Run,previous:number){run.updatedAt=new Date().toISOString();run.revision=previous+1;const r=await env.DB.prepare('UPDATE runs SET data = ?, updated_at = ?, revision = ? WHERE id = ? AND revision = ?').bind(JSON.stringify(run),run.updatedAt,run.revision,run.id,previous).run();if(!r.meta.changes)throw new Error('This run changed in another session. Refresh and try again.');}
export function checkOrigin(request:Request){const origin=request.headers.get('origin');const target=new URL(request.url).origin;if(origin&&origin!==target)throw new Error('Cross-origin changes are not allowed.');if(request.headers.get('sec-fetch-site')==='cross-site')throw new Error('Cross-origin changes are not allowed.');}
export const fail=(e:unknown,status=400)=>Response.json({error:e instanceof Error?e.message:'Request failed. Please retry.'},{status});

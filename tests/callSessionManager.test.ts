import { describe, it, expect } from 'vitest';
import { CallSessionManager } from '../src/services/callSessionManager.js';
import { AdminPolicy, CallMetadata, StructuredNote } from '../src/shared-types/types.js';

const call: CallMetadata = { callId:'c1', direction:'inbound', state:'connected', remoteName:'A', remoteNumber:'1', employeeExtension:null, employeeUserId:null, startedAt:new Date().toISOString(), connectedAt:new Date().toISOString(), endedAt:null, source:'mock', rawProviderPayload:null };

function mk() {
  const callbacks: Record<string, (c: CallMetadata)=>void> = {};
  const provider = { initialize: async()=>{}, shutdown: async()=>{}, getCapabilities:()=>[], getCurrentCallState:()=> 'idle', getCurrentCallMetadata:()=>null,
    onIncomingCall:(cb:any)=>callbacks.in=cb,onOutgoingCall:(cb:any)=>callbacks.out=cb,onCallRinging:()=>{},onCallAnswered:()=>{},onCallConnected:(cb:any)=>callbacks.conn=cb,onCallHeld:()=>{},onCallResumed:()=>{},onCallEnded:(cb:any)=>callbacks.end=cb,onCallFailed:()=>{} };
  let startCount=0;
  const audio={ initialize:async()=>{},requestPermissions:async()=>true,listInputDevices:async()=>[],listOutputDevices:async()=>[],startCapture:async()=>{startCount++;},stopCapture:async()=>{},pauseCapture:async()=>{},resumeCapture:async()=>{},getCaptureStatus:()=> 'idle' as const};
  const tr={ initialize:async()=>{},startStreamingSession:async()=> 's1',sendAudioChunk:async()=>{},onPartialTranscript:()=>{},onFinalTranscript:()=>{},stopStreamingSession:async()=>{},transcribeFile:async()=>[],getCapabilities:()=>[]};
  const note:StructuredNote={noteId:'n1',callId:'c1',status:'draft',direction:'inbound',startedAt:'',connectedAt:null,endedAt:'',durationSeconds:0,participants:[],transcript:[],notes:{},review:{required:true,reviewedBy:null,reviewedAt:null,employeeEdits:false},crm:{exportStatus:'not_exported',crmProvider:null,crmObjectType:'unknown',crmObjectId:null,lastExportedAt:null},source:{callingApp:'Zultys ZAC',callProvider:'mock',transcriptionProvider:'mock',noteProvider:'mock'}};
  const ng={ initialize:async()=>{},generateNotes:async()=>note,regenerateNotes:async()=>note,summarizeLive:async()=>'',getCapabilities:()=>[]};
  const crm={ initialize:async()=>{},testConnection:async()=>true,searchContactByPhone:async()=>null,createOrUpdateCallActivity:async()=> '1',attachTranscript:async()=>{},attachRecordingReference:async()=>{},updateCRMObject:async()=>{},getCapabilities:()=>[]};
  const policy:AdminPolicy={autoInboundNotesEnabled:true,outboundAutoNotesEnabled:true,outboundBehavior:'auto_start',requireReviewBeforeExport:true,allowManualTranscription:true,allowTranscriptExport:true};
  const settings={ getPolicy:async()=>policy, savePolicy:async()=>{} };
  const audit={ log:async()=>{} };
  return { mgr:new CallSessionManager(provider as any,audio as any,tr as any,ng as any,crm as any,settings as any,audit as any), callbacks, getStartCount:()=>startCount };
}

describe('CallSessionManager', ()=>{
  it('starts only on connected', async()=>{
    const {mgr, callbacks, getStartCount}=mk(); await mgr.initialize();
    callbacks.in({...call,state:'incoming_ringing'});
    expect(getStartCount()).toBe(0);
    await callbacks.conn(call);
    expect(getStartCount()).toBe(1);
  });
});

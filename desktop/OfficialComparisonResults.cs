using System.IO;
using System.Text.Json;
namespace CoE5Workbench;

// Official API journal only. Close observations and private visual restoration are separate facts.
internal static class OfficialComparisonResults
{
    static void Require(bool value,string message) { if(!value)throw new InvalidDataException(message); }
    static void Keys(Dictionary<string,string> row,string list) { var keys=list.Split(' ');Require(row.Count==keys.Length&&keys.All(row.ContainsKey),"Comparison receipt fields differ."); }
    static int Number(Dictionary<string,string> row,string key,int lo,int hi) { int v=TestExchange.SignedInteger(row,key);Require(v>=lo&&v<=hi,"Invalid comparison "+key);return v; }
    internal static object Read(string folder,IsolatedTests.Session s,TestCandidate c)
    {
        var roster=c.Roster!;var baseline=c.ComparisonBaseline!;
        var context=new{sessionId=s.Id,sourceRevision=s.Revision,run=s.ResultRun??"",modId=c.ModId,spellName=c.SpellName,
            weaponName=c.SpellName["weapon ".Length..],mode=c.Mode,source=c.Source,baseline,roster,areaCode=c.AreaCode,
            visualCatalog=2,resultSchema=5,legacy=false,stale=s.Stale,runtime=GameRuntime.LabelFor(c.ExtenderVersion),runtimeVersion=c.ExtenderVersion,groupApi="official-group-1"};
        try {
            Require(c.OfficialMixedComparison&&c.ExtenderVersion=="3.2.2"&&c.WeaponEditing&&s.Status=="exited"&&s.Id.Length==32&&
                s.ModId==c.ModId&&s.Spell==c.SpellName&&s.Revision==GameRuntime.TextHash("c5m\0"+c.Source)&&(s.Roster??[]).SequenceEqual(roster),"Comparison session/source association differs.");
            string run=TestExchange.Run(s.ResultRun),area=TestExchange.Area(folder,c.ModId);
            var ctx=TestExchange.Parse(LocalFiles.ReadText(Path.Combine(area,"workbench-session.ini"),16384))["session"];
            Keys(ctx,"schema id revision run mod");Require(ctx["schema"]=="wb-session-1"&&ctx["id"]==s.Id&&ctx["revision"]==s.Revision&&ctx["run"]==run&&ctx["mod"]==c.ModId,"Comparison launch binding differs.");
            var data=TestExchange.Parse(LocalFiles.ReadText(TestExchange.ResultPath(folder,s),1024*1024));var meta=data["meta"];
            Keys(meta,"schema session revision run mod count status message visualsrestored");
            Require(meta["schema"]=="wb-official-ranged-mixed-results-1"&&meta["session"]==s.Id&&meta["revision"]==s.Revision&&meta["run"]==run&&meta["mod"]==c.ModId,"Comparison journal binding differs.");
            int count=Number(meta,"count",0,8),visualsRestored=Number(meta,"visualsrestored",0,1);
            Require(meta["status"] is "active" or "finished" or "error" && meta["message"].Length<=300,"Comparison journal status differs.");
            Require(meta["status"]=="error"||meta["message"]=="","Unexpected message on a non-error comparison journal.");
            Require(meta["status"]!="finished"||visualsRestored==1,"Private visual restore was not confirmed.");
            Require(meta["status"]!="active"||visualsRestored==0,"Active journal has an impossible final restoration.");
            int total=roster.Sum(g=>g.count),sections=1,previous=0;
            using var manifest=JsonDocument.Parse(c.Files["manifest.json"]);string payload=manifest.RootElement.GetProperty("payload").GetString()!;
            int range=int.Parse(c.Source.Replace("\r","").Split('\n').Single(l=>l.StartsWith("range "))[6..],System.Globalization.CultureInfo.InvariantCulture);
            var expected=roster.SelectMany(g=>Enumerable.Repeat(g,g.count)).ToArray();var attempts=new List<object>();var samples=new List<object>();
            Dictionary<string,int>? last=null;
            for(int index=1;index<=count;index++) {
                var m=data["attempt"+index];sections++;
                Keys(m,"schema mod session revision run attempt parameter readback flymode flylook look range area dmgtype payload total verified returned battles stopped opened closeattempted closereturned menuafterclose inactive carrier weapon carrierunit unitsbefore commandersbefore status message phase");
                Require(m["schema"]=="wb-official-compare-field-1"&&m["session"]==s.Id&&m["revision"]==s.Revision&&m["run"]==run&&m["mod"]==c.ModId&&Number(m,"attempt",1,8)==index,"Attempt association differs.");
                Require(Number(m,"range",2,9)==range&&Number(m,"area",0,5)==c.AreaCode&&Number(m,"dmgtype",1,6)==c.DamageType&&m["payload"]==payload&&Number(m,"total",2,200)==total,"Attempt configuration differs.");
                int parameter=Number(m,"parameter",previous,1000000),mode=Number(m,"flymode",1,2),flight=Number(m,"flylook",0,299),impact=Number(m,"look",-1,299);
                Require(MeleeCandidate.HasVisual(mode==1?"sprite":"particle",m["flylook"])&&(MeleeCandidate.HasVisual("impact",m["look"])||impact==-1&&baseline["look"]==""),"Unsupported visual identity.");
                var values=new Dictionary<string,int>{{"flymode",mode},{"flylook",flight},{"look",impact}};
                Require(parameter!=0||values.All(v=>v.Value.ToString()==(baseline[v.Key]==""?"-1":baseline[v.Key])),"Attempt baseline differs.");
                Require(last==null||parameter!=previous||values.All(v=>v.Value==last[v.Key]),"One applied revision has conflicting values.");previous=parameter;last=values;
                int verified=Number(m,"verified",0,total),returned=Number(m,"returned",-1,200),battles=Number(m,"battles",0,1),stopped=Number(m,"stopped",0,1),
                    opened=Number(m,"opened",0,1),attempted=Number(m,"closeattempted",0,1),closed=Number(m,"closereturned",0,1),menu=Number(m,"menuafterclose",0,1),readback=Number(m,"readback",0,1);
                int carrier=Number(m,"carrier",2000,6998),weapon=Number(m,"weapon",1200,6998),carrierUnit=Number(m,"carrierunit",-1,98999);
                int? inactive=m["inactive"]=="unavailable"?null:Number(m,"inactive",0,verified+1),unitsBefore=m["unitsbefore"]=="unavailable"?null:Number(m,"unitsbefore",-1,98999),
                    commandersBefore=m["commandersbefore"]=="unavailable"?null:Number(m,"commandersbefore",-1,9989);
                Require(m["status"] is "closed" or "cancelled" or "error" or "opened" or "battle-returned" && m["message"].Length<=300&&m["phase"] is "setup" or "before-close" or "after-battle-return","Invalid attempt lifecycle.");
                Require(closed<=attempted&&battles<=opened&&(verified==0||opened==1)&&(battles==0||verified==total&&returned==total&&carrierUnit>=0)&&readback<=battles,"Inconsistent attempt counters.");
                Require(opened==0||unitsBefore.HasValue&&unitsBefore<=98998-total&&commandersBefore.HasValue&&commandersBefore<=9988,"Field capacity reading missing or insufficient.");
                Require(m["status"]=="error"||opened==1&&verified==total&&returned==total&&carrierUnit>=0,"Incomplete roster presented as valid.");
                Require(m["status"] is not ("closed" or "cancelled")||closed==1&&menu==1&&inactive==total+1,"Continued field closure was not fully observed.");
                Require(m["status"]!="closed"||battles==1&&stopped==0&&readback==1&&m["phase"]=="after-battle-return","Incomplete attempt is not returnable.");
                Require(m["status"]!="cancelled"||(battles==0?stopped==0&&m["phase"]=="before-close":stopped==1&&m["phase"]=="after-battle-return"),"Cancellation phase differs.");
                Require(m["status"]!="opened"||battles==0&&m["phase"]=="setup","Open phase differs.");
                Require(m["status"]!="battle-returned"||battles==1&&m["phase"]=="after-battle-return","Battle-return phase differs.");
                Require(index==count||m["status"] is "closed" or "cancelled","Another attempt followed an uncertain field.");
                Require(meta["status"]!="finished"||m["status"] is "closed" or "cancelled","Finished journal contains an incomplete attempt.");
                var units=new List<object>();var seen=new HashSet<int>();if(carrierUnit>=0)seen.Add(carrierUnit);
                object? Position(Dictionary<string,string> r,string prefix) { if(r[prefix+"x"]=="unavailable"&&r[prefix+"y"]=="unavailable")return null;return new{x=Number(r,prefix+"x",0,1535),y=Number(r,prefix+"y",0,19)}; }
                for(int n=1;n<=verified;n++) {
                    var r=data["a"+index+"unit"+n];sections++;Keys(r,"instance monster name beforehp afterhp resistance setupx setupy endx endy");var g=expected[n-1];int unit=Number(r,"instance",0,98999);
                    Require(seen.Add(unit)&&Number(r,"monster",0,1999)==g.id&&r["name"]==g.name,"Defender identity/order differs.");
                    int? resistance=r["resistance"]=="unavailable"?null:TestExchange.SignedInteger(r,"resistance");Require(c.DamageType>=4||resistance==null,"Unexpected physical resistance reading.");
                    units.Add(new{unit,monster=g.id,name=g.name,beforeHp=Number(r,"beforehp",1,int.MaxValue),afterHp=r["afterhp"]=="unavailable"?(int?)null:TestExchange.SignedInteger(r,"afterhp"),resistance,setupPosition=Position(r,"setup"),endPosition=Position(r,"end")});
                }
                var facts=new{sessionId=s.Id,provenance="official-group-1",areaCode=c.AreaCode,element=c.DamageType switch{4=>"fire",5=>"cold",6=>"shock",_=>null},units,
                    battleReturns=battles,closed=closed==1,restored=(bool?)null,status=m["status"],message=m["message"],phase=m["phase"],requested=total,returned,stopped=stopped==1,
                    closeAttempted=attempted==1,mainMenuAfterClose=menu==1,trackedInactive=inactive,carrierUnit,unitsBefore,commandersBefore};
                attempts.Add(new{attemptIndex=index,parameterRevision=parameter,readBackConfirmed=readback==1,values,mixedReading=facts});
                if(m["status"]=="closed")samples.Add(new{index=samples.Count+1,attemptIndex=index,parameterRevision=parameter,kind=parameter==0?"baseline":"applied",battleCount=1,readBackConfirmed=true,areaCode=c.AreaCode,values,mixedReading=facts});
            }
            Require(data.Count==sections,"Unexpected or missing journal sections.");
            string? error=meta["status"]=="finished"?null:meta["status"]=="active"?"Comparison did not finish; closure is established only for individually closed attempts.":"Comparison ended with an error: "+meta["message"];
            if(samples.Count==0)error=(error==null?"":error+" ")+"No returned, closed AI battle with visual readback is available. Inspect the attempt history; no values can be returned.";
            return new{context,samples,attempts,comparisonStatus=meta["status"],privateVisualsRestored=visualsRestored==1,comparisonMessage=meta["message"],areaCode=c.AreaCode,resistanceElement=c.DamageType switch{4=>"fire",5=>"cold",6=>"shock",_=>null},error};
        } catch(Exception e) when(e is IOException or InvalidDataException or System.Text.DecoderFallbackException or KeyNotFoundException or FormatException or OverflowException) {
            return new{context,samples=Array.Empty<object>(),attempts=Array.Empty<object>(),comparisonStatus="error",privateVisualsRestored=false,comparisonMessage=e.Message,areaCode=c.AreaCode,resistanceElement=c.DamageType switch{4=>"fire",5=>"cold",6=>"shock",_=>null},error=e.Message+" No values were changed."};
        }
    }
}

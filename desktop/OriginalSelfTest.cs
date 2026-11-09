using System.IO;
using System.Text.Json;
using System.Runtime.InteropServices;

namespace CoE5Workbench;

internal static class OriginalSelfTest
{
    [UnmanagedFunctionPointer(CallingConvention.Cdecl)] private delegate int LuaRun([MarshalAs(UnmanagedType.LPUTF8Str)] string source);
    [UnmanagedFunctionPointer(CallingConvention.Cdecl)] private delegate IntPtr LuaError();
    internal static void Run(string report,Action<string,Action> check)
    {
        string folder=Path.GetDirectoryName(Path.GetFullPath(report))!;
        void Require(bool v){if(!v)throw new Exception("Assertion failed");}
        void Refused(Action action){try{action();}catch{return;}throw new Exception("Expected refusal");}
        string input=Path.Combine(folder,"installed-catalog-input.json");
        if(File.Exists(input))check("Verified local 5.43 catalog: 1029 spells, 936 named native weapons; duplicates and metadata, no game writes",()=>{
            using var doc=JsonDocument.Parse(File.ReadAllText(input));string path=doc.RootElement.GetProperty("path").GetString()!,before=GameRuntime.Hash(path);
            var catalog=JsonSerializer.SerializeToElement(VanillaCatalog.Read(path));var rows=catalog.GetProperty("entries").EnumerateArray().ToArray();
            Require(rows.Count(x=>x.GetProperty("type").GetString()=="spell")==1029 && rows.Count(x=>x.GetProperty("type").GetString()=="weapon")==936);
            Require(rows.Count(x=>x.GetProperty("name").GetString()=="Banish" && x.GetProperty("type").GetString()=="spell")>1);
            Require(catalog.GetProperty("completeNames").GetBoolean()&&!catalog.GetProperty("completeDefinitions").GetBoolean());
            Require(before==GameRuntime.Hash(path));File.WriteAllText(Path.Combine(folder,"installed-catalog-packet.json"),catalog.GetRawText());
        });
        check("Static catalog refuses unsupported fingerprints and malformed PE bounds",()=>{
            string bad=Path.Combine(folder,"unverified-CoE5.exe");File.WriteAllBytes(bad,new byte[300]);Refused(()=>VanillaCatalog.Read(bad));
            Refused(()=>VanillaCatalog.Decode(new byte[20]));var bytes=new byte[512];bytes[0]=0x4d;bytes[1]=0x5a;BitConverter.GetBytes(uint.MaxValue).CopyTo(bytes,0x3c);Refused(()=>VanillaCatalog.Decode(bytes));
        });
        string luaInput=Path.Combine(folder,"original-lua-cases.json");
        check("Original summary binds identity/run, keeps unknown hits and rejects malformed or inconsistent packets",()=>{
            var s=new IsolatedTests.Session{Id=new string('a',32),Revision=new string('b',64),ResultRun=new string('c',32),ModId="WB_Observe",ExitCode=0};
            var c=new TestCandidate(s.ModId,"spell #445 Fireball","{\"type\":\"spell\",\"id\":445,\"name\":\"Fireball\",\"sourceKind\":\"installed\"}","c5m",[],false){OriginalRecord=true};
            string ini="[meta]\nschema=wb-original-1\nsession="+s.Id+"\nrevision="+s.Revision+"\nrun="+s.ResultRun+"\nmod="+s.ModId+"\nkind=spell\nrequested=Fireball\nrequestedid=445\nforcedcasts=0\nstage=closed\nbattles=1\nstops=0\nselected=445\nspell=445\nweapon=54\nweaponname=Fireball\ncaster=55\ncastername=Pyromancer\nknownunchanged=1\n";
            var summary=JsonSerializer.SerializeToElement(OriginalResults.Decode(ini,s,c));Require(summary.GetProperty("battles").GetInt32()==1&&summary.GetProperty("facts").GetProperty("caster").GetString()=="55");Require(summary.GetProperty("limitation").GetString()!.Contains("do not count AI casts"));
            foreach(string bad in new[]{ini.Replace("run="+s.ResultRun,"run="+new string('d',32)),ini.Replace("requestedid=445","requestedid=446"),ini.Replace("selected=445","selected=446"),ini.Replace("spell=445","spell=444"),ini.Replace("forcedcasts=0","forcedcasts=1"),ini.Replace("battles=1","battles=-1"),ini.Replace("stops=0","stops=2"),ini.Replace("caster=55","caster=2000"),ini.Replace("stage=closed","stage=success"),ini+"battles=1\n",ini+"\0"})Refused(()=>OriginalResults.Decode(bad,s,c));
            string cancelled=ini[..ini.IndexOf("selected=445",StringComparison.Ordinal)].Replace("stage=closed","stage=cancelled").Replace("battles=1","battles=0");Require(JsonSerializer.SerializeToElement(OriginalResults.Decode(cancelled,s,c)).GetProperty("facts").EnumerateObject().Count()==0);Refused(()=>OriginalResults.Decode(cancelled.Replace("stage=cancelled","stage=closed"),s,c));
        });
        string realInput=Path.Combine(folder,"original-review-input.json");
        if(File.Exists(realInput))check("Read-only original observation review of retained real sessions; no changes to retained files",()=>{
            using var inputDoc=JsonDocument.Parse(File.ReadAllText(realInput));var inputData=inputDoc.RootElement;string root=inputData.GetProperty("root").GetString()!;
            var before=Directory.GetFiles(root,"*",SearchOption.AllDirectories).ToDictionary(p=>p,p=>GameRuntime.Hash(p));
            var manager=new IsolatedTests(root);var output=new List<object>();
            foreach(var id in inputData.GetProperty("sessions").EnumerateArray())output.Add(manager.OriginalObservation(id.GetString()!));
            foreach(var f in before)Require(File.Exists(f.Key)&&GameRuntime.Hash(f.Key)==f.Value);Require(Directory.GetFiles(root,"*",SearchOption.AllDirectories).Length==before.Count);
            Require(output.Count>0);File.WriteAllText(Path.Combine(folder,"original-review-output.json"),JsonSerializer.Serialize(output));
        });
        if(File.Exists(luaInput)){
            using var doc=JsonDocument.Parse(File.ReadAllText(luaInput));var data=doc.RootElement;
            string dll=data.GetProperty("dll").GetString()!;Require(GameRuntime.Hash(dll)==data.GetProperty("sha256").GetString());
            IntPtr handle=NativeLibrary.Load(dll);
            try{
                var run=Marshal.GetDelegateForFunctionPointer<LuaRun>(NativeLibrary.GetExport(handle,"luaTestRun"));var error=Marshal.GetDelegateForFunctionPointer<LuaError>(NativeLibrary.GetExport(handle,"luaTestError"));
                foreach(var c in data.GetProperty("cases").EnumerateArray())check("Mock Lua original observation: "+c.GetProperty("name").GetString(),()=>{if(run(c.GetProperty("source").GetString()!)!=0)throw new Exception(Marshal.PtrToStringUTF8(error()));});
            }finally{NativeLibrary.Free(handle);}
        }
    }
}
